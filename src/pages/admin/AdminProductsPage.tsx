import { useMemo, useState } from 'react';
import { ActionIcon, Alert, Avatar, Box, Button, Card, Center, Group, LoadingOverlay, Modal, Pagination, SimpleGrid, Stack, Table, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { ErrorState } from '../../components/ErrorState';
import { PageSection } from '../../components/PageSection';
import { formatPrice } from '../../components/Price';
import { ProductFormModal } from '../../components/ProductFormModal';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import type { Product, ProductFormValues } from '../../schemas/product';
import { errorMessage } from '../../services/api';
import { createProduct, deleteProduct, fetchCategories, fetchProducts, updateProduct } from '../../services/productService';

const PAGE_SIZE = 10;

type EditorState = { mode: 'create' } | { mode: 'edit'; product: Product } | null;

function toFormValues(product: Product): ProductFormValues {
  return {
    title: product.title,
    description: product.description,
    category: product.category,
    brand: product.brand ?? '',
    price: product.price,
    stock: product.stock,
  };
}

/**
 * A DummyJSON simula POST/PUT/DELETE sem persistir. Para a interface refletir as ações,
 * guardamos as alterações em três estados locais e os combinamos com a página vinda da API.
 */
export function AdminProductsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [created, setCreated] = useState<Product[]>([]);
  const [edited, setEdited] = useState<Record<number, Product>>({});
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [editor, setEditor] = useState<EditorState>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const remote = useAsync((signal) => fetchProducts({ page, pageSize: PAGE_SIZE }, signal), [page]);
  const categories = useAsync((signal) => fetchCategories(signal), []);

  const createdIds = useMemo(() => new Set(created.map((product) => product.id)), [created]);

  const rows = useMemo(() => {
    const base = remote.data?.products ?? [];
    const merged = page === 1 ? [...created, ...base] : base;
    return merged.filter((product) => !deletedIds.includes(product.id)).map((product) => edited[product.id] ?? product);
  }, [remote.data, page, created, edited, deletedIds]);

  const totalRemote = remote.data?.total ?? 0;
  const totalProducts = totalRemote + created.length - deletedIds.filter((id) => !createdIds.has(id)).length;
  const totalPages = Math.max(1, Math.ceil(totalRemote / PAGE_SIZE));

  const editorInitialValues = useMemo(
    () => (editor?.mode === 'edit' ? toFormValues(editor.product) : undefined),
    [editor],
  );

  const handleSave = async (values: ProductFormValues) => {
    try {
      if (editor?.mode === 'edit') {
        const { product } = editor;
        // Itens criados nesta sessão não existem na API (PUT devolveria 404): atualiza só localmente.
        if (!createdIds.has(product.id)) {
          await updateProduct(product.id, values);
        }
        const updated: Product = { ...product, ...values };
        if (createdIds.has(product.id)) {
          setCreated((current) => current.map((item) => (item.id === product.id ? updated : item)));
        } else {
          setEdited((current) => ({ ...current, [product.id]: updated }));
        }
        notifications.show({ title: 'Produto atualizado', message: updated.title, color: 'teal' });
      } else {
        const response = await createProduct(values);
        // A API sempre devolve o id total+1; geramos ids únicos para não colidir entre cadastros.
        const nextId = Math.max(response.id, totalRemote, ...created.map((item) => item.id)) + 1;
        const newProduct: Product = { ...response, ...values, id: nextId };
        setCreated((current) => [newProduct, ...current]);
        setPage(1);
        notifications.show({ title: 'Produto cadastrado', message: newProduct.title, color: 'teal' });
      }
      setEditor(null);
    } catch (error) {
      notifications.show({ title: 'Não foi possível salvar', message: errorMessage(error), color: 'red' });
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      if (!createdIds.has(toDelete.id)) {
        await deleteProduct(toDelete.id);
      }
      setCreated((current) => current.filter((item) => item.id !== toDelete.id));
      setDeletedIds((current) => [...current, toDelete.id]);
      notifications.show({ title: 'Produto excluído', message: toDelete.title, color: 'teal' });
      setToDelete(null);
    } catch (error) {
      notifications.show({ title: 'Não foi possível excluir', message: errorMessage(error), color: 'red' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageSection
      title="Gerenciar produtos"
      description={user ? `Conectado como ${user.firstName} ${user.lastName} (@${user.username})` : undefined}
      actions={
        <Button leftSection={<IconPlus size={16} />} onClick={() => setEditor({ mode: 'create' })}>
          Novo produto
        </Button>
      }
    >
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card withBorder radius="md">
          <Text size="sm" c="dimmed">Produtos no catálogo</Text>
          <Text fw={700} size="xl">{totalProducts}</Text>
        </Card>
        <Card withBorder radius="md">
          <Text size="sm" c="dimmed">Cadastrados nesta sessão</Text>
          <Text fw={700} size="xl">{created.length}</Text>
        </Card>
        <Card withBorder radius="md">
          <Text size="sm" c="dimmed">Editados / excluídos</Text>
          <Text fw={700} size="xl">
            {Object.keys(edited).length} / {deletedIds.length}
          </Text>
        </Card>
      </SimpleGrid>

      <Alert variant="light" color="gray" icon={<IconInfoCircle size={18} />} role="note">
        A DummyJSON simula cadastro, edição e exclusão sem gravar de fato. As mudanças aparecem aqui e somem ao recarregar a página.
      </Alert>

      {remote.status === 'error' && <ErrorState message={remote.error} onRetry={remote.reload} />}

      <Box pos="relative" aria-busy={remote.status === 'loading'}>
        <LoadingOverlay visible={remote.status === 'loading'} zIndex={10} overlayProps={{ blur: 2 }} />
        <Table.ScrollContainer minWidth={640}>
          <Table striped highlightOnHover verticalSpacing="sm" aria-label="Produtos cadastrados">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Produto</Table.Th>
                <Table.Th>Categoria</Table.Th>
                <Table.Th ta="right">Preço</Table.Th>
                <Table.Th ta="right">Estoque</Table.Th>
                <Table.Th ta="right">Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((product) => (
                <Table.Tr key={product.id}>
                  <Table.Td>{product.id}</Table.Td>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar src={product.thumbnail || null} radius="sm" size="md" alt="">
                        {product.title.charAt(0)}
                      </Avatar>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {product.title}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{product.category}</Table.Td>
                  <Table.Td ta="right">{formatPrice(product.price)}</Table.Td>
                  <Table.Td ta="right">{product.stock}</Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <Tooltip label="Editar">
                        <ActionIcon variant="subtle" onClick={() => setEditor({ mode: 'edit', product })} aria-label={`Editar ${product.title}`}>
                          <IconPencil size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Excluir">
                        <ActionIcon variant="subtle" color="red" onClick={() => setToDelete(product)} aria-label={`Excluir ${product.title}`}>
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {remote.status === 'success' && rows.length === 0 && (
          <Center py="lg">
            <Text c="dimmed">Nenhum produto nesta página.</Text>
          </Center>
        )}
      </Box>

      {totalPages > 1 && (
        <Center>
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </Center>
      )}

      <ProductFormModal
        opened={editor !== null}
        title={editor?.mode === 'edit' ? 'Editar produto' : 'Novo produto'}
        categories={categories.data ?? []}
        initialValues={editorInitialValues}
        onClose={() => setEditor(null)}
        onSubmit={handleSave}
      />

      <Modal opened={toDelete !== null} onClose={() => setToDelete(null)} title="Excluir produto" centered>
        <Stack>
          <Text>
            Tem certeza que deseja excluir <strong>{toDelete?.title}</strong>?
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setToDelete(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleting}>
              Excluir
            </Button>
          </Group>
        </Stack>
      </Modal>
    </PageSection>
  );
}
