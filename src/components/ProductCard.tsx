import { Badge, Button, Card, Group, Image, Stack, Text } from '@mantine/core';
import { IconShoppingCartPlus, IconStarFilled } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { Product } from '../schemas/product';
import { Price } from './Price';
import classes from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card withBorder radius="md" padding="md" className={classes.card} component="article">
      <Card.Section className={classes.image}>
        <Image src={product.thumbnail} alt={product.title} h={180} fit="contain" loading="lazy" />
      </Card.Section>

      <Stack gap={6} mt="md" style={{ flex: 1 }}>
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <Badge variant="light" size="sm">
            {product.category}
          </Badge>
          <Group gap={4} wrap="nowrap">
            <IconStarFilled size={14} color="var(--mantine-color-yellow-6)" aria-hidden />
            <Text size="xs" c="dimmed">
              {product.rating.toFixed(1)}
            </Text>
          </Group>
        </Group>

        <Text fw={600} lineClamp={2} component={Link} to={`/produtos/${product.id}`} className={classes.title}>
          {product.title}
        </Text>

        <Price value={product.price} size="lg" mt="auto" />
      </Stack>

      <Button
        mt="md"
        fullWidth
        variant="light"
        leftSection={<IconShoppingCartPlus size={16} />}
        onClick={() => onAddToCart(product)}
        aria-label={`Adicionar ${product.title} ao carrinho`}
      >
        Adicionar ao carrinho
      </Button>
    </Card>
  );
}
