import { useState } from 'react';
import { Alert, Button, Code, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle, IconLock } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginFormSchema, type LoginFormValues } from '../schemas/auth';
import { ApiError, errorMessage } from '../services/api';

interface LocationState {
  from?: string;
}

function readFrom(state: unknown): string {
  const from = (state as LocationState | null)?.from;
  return typeof from === 'string' && from.startsWith('/') && from !== '/login' ? from : '/admin';
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const redirectTo = readFrom(location.state);

  const form = useForm<LoginFormValues>({
    mode: 'controlled',
    initialValues: { username: '', password: '' },
    validate: zodResolver(loginFormSchema),
  });

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setSubmitError(
        error instanceof ApiError && (error.status === 400 || error.status === 401)
          ? 'Usuário ou senha inválidos.'
          : errorMessage(error),
      );
    }
  };

  return (
    <Stack align="center" py="xl">
      <Paper withBorder shadow="sm" radius="md" p="xl" w="100%" maw={420}>
        <Stack gap="md">
          <div>
            <Title order={1} size="h2">
              Entrar
            </Title>
            <Text c="dimmed" size="sm">
              Acesse a área administrativa da loja.
            </Text>
          </div>

          <Alert variant="light" color="blue" icon={<IconInfoCircle size={18} />} role="note">
            Usuário de teste da DummyJSON: <Code>emilys</Code> / <Code>emilyspass</Code>
          </Alert>

          {submitError && (
            <Alert color="red" variant="light" role="alert">
              {submitError}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
            <Stack gap="sm">
              <TextInput label="Usuário" autoComplete="username" withAsterisk {...form.getInputProps('username')} />
              <PasswordInput label="Senha" autoComplete="current-password" withAsterisk {...form.getInputProps('password')} />
              <Button type="submit" leftSection={<IconLock size={16} />} loading={form.submitting} mt="sm">
                Entrar
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Stack>
  );
}
