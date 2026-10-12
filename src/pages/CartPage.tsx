import { ActionIcon, Button, Card, Center, Group, Image, NumberInput, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageSection } from '../components/PageSection';
import { Price, formatPrice } from '../components/Price';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/carrinho' } });
      return;
    }
    // Compra simulada: a DummyJSON não processa pedidos de verdade.
    notifications.show({ title: 'Pedido realizado!', message: `Total de ${formatPrice(totalPrice)}. (simulação)`, color: 'teal' });
    clear();
    navigate('/');
  };

  if (items.length === 0) {
    return (
      <PageSection title="Carrinho">
        <Center py="xl">
          <Stack align="center" gap="sm">
            <Text c="dimmed">Seu carrinho está vazio.</Text>
            <Button component={Link} to="/">
              Ver produtos
            </Button>
          </Stack>
        </Center>
      </PageSection>
    );
  }

  return (
    <PageSection title="Carrinho" description={`${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}>
      <Stack gap="sm">
        {items.map((item) => (
          <Card key={item.id} withBorder radius="md" padding="sm">
            <Group wrap="nowrap" align="center">
              <Image src={item.thumbnail} alt="" w={64} h={64} fit="contain" />
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={600} component={Link} to={`/produtos/${item.id}`} lineClamp={1} style={{ color: 'inherit' }}>
                  {item.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {formatPrice(item.price)} cada
                </Text>
              </Stack>
              <NumberInput
                aria-label={`Quantidade de ${item.title}`}
                value={item.quantity}
                onChange={(value) => updateQuantity(item.id, typeof value === 'number' ? value : 1)}
                min={1}
                w={90}
              />
              <Price value={item.price * item.quantity} w={100} ta="right" visibleFrom="xs" />
              <ActionIcon variant="subtle" color="red" onClick={() => removeItem(item.id)} aria-label={`Remover ${item.title}`}>
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
          </Card>
        ))}
      </Stack>

      <Card withBorder radius="md">
        <Group justify="space-between">
          <div>
            <Text c="dimmed" size="sm">
              Total
            </Text>
            <Price value={totalPrice} size="xl" />
          </div>
          <Group>
            <Button variant="default" onClick={clear}>
              Esvaziar
            </Button>
            <Button onClick={handleCheckout}>{isAuthenticated ? 'Finalizar compra' : 'Entrar para finalizar'}</Button>
          </Group>
        </Group>
      </Card>
    </PageSection>
  );
}
