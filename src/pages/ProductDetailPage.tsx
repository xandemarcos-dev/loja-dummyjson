import { useState } from 'react';
import { Anchor, Badge, Box, Button, Center, Grid, Group, Image, Loader, NumberInput, Rating, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconShoppingCartPlus } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '../components/ErrorState';
import { Price } from '../components/Price';
import { useAsync } from '../hooks/useAsync';
import { useCart } from '../hooks/useCart';
import { fetchProduct } from '../services/productService';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const isValidId = Number.isInteger(productId) && productId > 0;
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const product = useAsync(
    (signal) => (isValidId ? fetchProduct(productId, signal) : Promise.reject(new Error('Produto inválido.'))),
    [productId],
  );

  const goBack = () => {
    // Se o usuário chegou por link direto não há histórico; volta para a listagem.
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  if (product.status === 'loading' && !product.data) {
    return (
      <Center py="xl">
        <Loader aria-label="Carregando produto" />
      </Center>
    );
  }

  if (product.status === 'error' || !product.data) {
    return (
      <Stack>
        <ErrorState message={product.error ?? 'Produto não encontrado.'} onRetry={isValidId ? product.reload : undefined} />
        <Anchor component="button" onClick={() => navigate('/')}>
          Voltar para o catálogo
        </Anchor>
      </Stack>
    );
  }

  const item = product.data;
  const mainImage = selectedImage ?? item.images[0] ?? item.thumbnail;

  const handleAdd = () => {
    addItem(item, quantity);
    notifications.show({ title: 'Adicionado ao carrinho', message: `${quantity}× ${item.title}`, color: 'teal' });
  };

  return (
    <Stack gap="lg">
      <Group>
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={goBack} px={0}>
          Voltar
        </Button>
      </Group>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Box bg="var(--mantine-color-default-hover)" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
            <Image src={mainImage} alt={item.title} h={360} fit="contain" />
          </Box>
          {item.images.length > 1 && (
            <SimpleGrid cols={5} mt="sm">
              {item.images.map((src, index) => (
                <Box
                  key={src}
                  component="button"
                  type="button"
                  onClick={() => setSelectedImage(src)}
                  aria-label={`Ver imagem ${index + 1}`}
                  style={{ border: src === mainImage ? '2px solid var(--mantine-color-blue-filled)' : '1px solid var(--mantine-color-default-border)', borderRadius: 8, background: 'none', padding: 2, cursor: 'pointer' }}
                >
                  <Image src={src} alt="" h={56} fit="contain" />
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="sm">
            <Group gap="xs">
              <Badge variant="light">{item.category}</Badge>
              {item.brand && <Badge variant="outline">{item.brand}</Badge>}
            </Group>
            <Title order={1} size="h2">
              {item.title}
            </Title>
            <Group gap="xs">
              <Rating value={item.rating} fractions={10} readOnly aria-label={`Nota ${item.rating}`} />
              <Text size="sm" c="dimmed">
                {item.rating.toFixed(1)}
              </Text>
            </Group>
            <Group align="baseline" gap="sm">
              <Price value={item.price} size="xl" />
              {item.discountPercentage > 0 && (
                <Badge color="green" variant="light">
                  -{item.discountPercentage.toFixed(0)}%
                </Badge>
              )}
            </Group>
            <Text>{item.description}</Text>
            <Text size="sm" c={item.stock > 0 ? 'dimmed' : 'red'}>
              {item.stock > 0 ? `${item.stock} unidades em estoque` : 'Sem estoque'}
            </Text>

            <Group align="flex-end" mt="md">
              <NumberInput
                label="Quantidade"
                value={quantity}
                onChange={(value) => setQuantity(typeof value === 'number' ? value : 1)}
                min={1}
                max={Math.max(1, item.stock)}
                w={120}
                clampBehavior="strict"
              />
              <Button leftSection={<IconShoppingCartPlus size={18} />} onClick={handleAdd} disabled={item.stock === 0}>
                Adicionar ao carrinho
              </Button>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
