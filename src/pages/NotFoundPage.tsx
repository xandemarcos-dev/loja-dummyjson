import { Button, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Stack align="center" py="xl" gap="sm">
      <Title order={1}>Página não encontrada</Title>
      <Text c="dimmed">O endereço acessado não existe.</Text>
      <Button component={Link} to="/">
        Ir para o catálogo
      </Button>
    </Stack>
  );
}
