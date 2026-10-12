import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { loggedUser, renderWithProviders } from '../test/utils';
import { ProtectedRoute } from './ProtectedRoute';

function TestRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<h1>Tela de login</h1>} />
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route index element={<h1>Painel admin</h1>} />
      </Route>
    </Routes>
  );
}

describe('<ProtectedRoute />', () => {
  it('redireciona visitantes para o login', () => {
    renderWithProviders(<TestRoutes />, { route: '/admin' });
    expect(screen.getByRole('heading', { name: 'Tela de login' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Painel admin' })).not.toBeInTheDocument();
  });

  it('libera a área administrativa para quem está autenticado', () => {
    renderWithProviders(<TestRoutes />, {
      route: '/admin',
      auth: { status: 'authenticated', isAuthenticated: true, user: loggedUser, token: 'jwt' },
    });
    expect(screen.getByRole('heading', { name: 'Painel admin' })).toBeInTheDocument();
  });

  it('mostra carregamento enquanto o token salvo é validado', () => {
    renderWithProviders(<TestRoutes />, { route: '/admin', auth: { status: 'checking', token: 'jwt' } });
    expect(screen.getByLabelText('Verificando sessão')).toBeInTheDocument();
  });
});
