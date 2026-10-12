import { useState } from 'react';
import { Box, Center, CloseButton, Group, LoadingOverlay, Pagination, Select, SimpleGrid, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { ErrorState } from '../components/ErrorState';
import { PageSection } from '../components/PageSection';
import { ProductCard } from '../components/ProductCard';
import { useAsync } from '../hooks/useAsync';
import { useCart } from '../hooks/useCart';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { Product } from '../schemas/product';
import { fetchCategories, fetchProducts } from '../services/productService';

const PAGE_SIZE = 12;

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const { addItem } = useCart();

  const products = useAsync(
    (signal) => fetchProducts({ page, pageSize: PAGE_SIZE, search: debouncedSearch, category }, signal),
    [page, debouncedSearch, category],
  );
  const categories = useAsync((signal) => fetchCategories(signal), []);

  // A DummyJSON não combina busca textual com filtro de categoria; escolher um limpa o outro.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCategory(null);
    setPage(1);
  };

  const handleCategoryChange = (value: string | null) => {
    setCategory(value);
    setSearch('');
    setPage(1);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
    notifications.show({ title: 'Adicionado ao carrinho', message: product.title, color: 'teal' });
  };

  const totalPages = products.data ? Math.max(1, Math.ceil(products.data.total / PAGE_SIZE)) : 1;
  const isEmpty = products.status === 'success' && products.data.products.length === 0;

  return (
    <PageSection title="Catálogo de produtos" description="Busque, filtre por categoria e adicione itens ao carrinho.">
      <Group grow align="flex-end" wrap="wrap" preventGrowOverflow={false}>
        <TextInput
          type="search"
          label="Buscar produtos"
          placeholder="Ex.: phone, perfume, laptop"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => handleSearchChange(event.currentTarget.value)}
          rightSection={search ? <CloseButton aria-label="Limpar busca" onClick={() => handleSearchChange('')} /> : null}
          miw={220}
        />
        <Select
          label="Categoria"
          placeholder="Todas as categorias"
          data={(categories.data ?? []).map((item) => ({ value: item.slug, label: item.name }))}
          value={category}
          onChange={handleCategoryChange}
          clearable
          searchable
          disabled={categories.status === 'loading'}
          nothingFoundMessage="Nenhuma categoria"
          miw={220}
        />
      </Group>

      {products.status === 'error' && <ErrorState message={products.error} onRetry={products.reload} />}

      <Box pos="relative" mih={200} aria-busy={products.status === 'loading'}>
        <LoadingOverlay visible={products.status === 'loading'} zIndex={10} overlayProps={{ blur: 2 }} />

        {isEmpty && (
          <Center py="xl">
            <Text c="dimmed">Nenhum produto encontrado para “{debouncedSearch}”.</Text>
          </Center>
        )}

        <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing="md" aria-label="Lista de produtos">
          {products.data?.products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </SimpleGrid>
      </Box>

      {products.data && products.data.total > PAGE_SIZE && (
        <Center>
          <Pagination
            total={totalPages}
            value={page}
            onChange={(value) => {
              setPage(value);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            getControlProps={(control) => {
              if (control === 'next') return { 'aria-label': 'Próxima página' };
              if (control === 'previous') return { 'aria-label': 'Página anterior' };
              return {};
            }}
          />
        </Center>
      )}
    </PageSection>
  );
}
