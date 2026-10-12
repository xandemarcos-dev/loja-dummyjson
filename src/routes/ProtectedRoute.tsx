import { Center, Loader } from '@mantine/core';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Guarda das rotas administrativas. Enquanto o token salvo é validado mostra um loader;
 * sem sessão, redireciona para /login guardando a rota de origem para voltar depois.
 */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <Center py="xl">
        <Loader aria-label="Verificando sessão" />
      </Center>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
