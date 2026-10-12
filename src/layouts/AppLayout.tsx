import { AppShell, Avatar, Badge, Burger, Button, Container, Group, Menu, Stack, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBuildingStore, IconLogin, IconLogout, IconSettings, IconShoppingCart } from '@tabler/icons-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle';
import { NavItem } from '../components/NavItem';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

/** Layout persistente: cabeçalho com navegação fica fixo e as páginas trocam no <Outlet />. */
export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    close();
    navigate('/', { replace: true });
  };

  const links = (block: boolean) => (
    <>
      <NavItem to="/" end block={block} onClick={close} icon={<IconBuildingStore size={16} />}>
        Produtos
      </NavItem>
      <NavItem to="/carrinho" block={block} onClick={close} icon={<IconShoppingCart size={16} />}>
        Carrinho
        {totalItems > 0 && (
          <Badge size="sm" circle aria-label={`${totalItems} itens no carrinho`}>
            {totalItems}
          </Badge>
        )}
      </NavItem>
      {isAuthenticated && (
        <NavItem to="/admin" block={block} onClick={close} icon={<IconSettings size={16} />}>
          Administração
        </NavItem>
      )}
    </>
  );

  return (
    <AppShell header={{ height: 64 }} navbar={{ width: 260, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Abrir menu" />
              <Text component={Link} to="/" fw={800} size="lg" style={{ textDecoration: 'none', color: 'inherit' }}>
                Loja<Text span c="blue" inherit>Dummy</Text>
              </Text>
            </Group>

            <Group gap={4} visibleFrom="sm" component="nav" aria-label="Navegação principal">
              {links(false)}
            </Group>

            <Group gap="xs" wrap="nowrap">
              <ColorSchemeToggle />
              {isAuthenticated && user ? (
                <Menu position="bottom-end" withinPortal>
                  <Menu.Target>
                    <UnstyledButton aria-label={`Conta de ${user.firstName}`}>
                      <Avatar src={user.image} alt={user.firstName} radius="xl" size="md" />
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>
                      {user.firstName} {user.lastName}
                    </Menu.Label>
                    <Menu.Item leftSection={<IconSettings size={14} />} component={Link} to="/admin">
                      Administração
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                      Sair
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Button component={Link} to="/login" variant="filled" size="sm" leftSection={<IconLogin size={16} />} visibleFrom="xs">
                  Entrar
                </Button>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar p="md" aria-label="Menu">
        <Stack gap={4}>
          {links(true)}
          {isAuthenticated ? (
            <Button variant="subtle" color="red" justify="flex-start" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
              Sair
            </Button>
          ) : (
            <NavItem to="/login" block onClick={close} icon={<IconLogin size={16} />}>
              Entrar
            </NavItem>
          )}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="lg" py="md">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
