import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../services/api';
import { loggedUser, renderWithProviders } from '../test/utils';
import { LoginPage } from './LoginPage';

function TestRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<h1>Painel admin</h1>} />
      <Route path="/carrinho" element={<h1>Carrinho</h1>} />
    </Routes>
  );
}

describe('<LoginPage />', () => {
  it('exibe as mensagens de validação do Zod ao enviar vazio', async () => {
    const login = vi.fn();
    const { user } = renderWithProviders(<TestRoutes />, { route: '/login', auth: { login } });

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe o usuário')).toBeInTheDocument();
    expect(screen.getByText('Informe a senha')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('faz login e redireciona para a área administrativa', async () => {
    const login = vi.fn().mockResolvedValue(loggedUser);
    const { user } = renderWithProviders(<TestRoutes />, { route: '/login', auth: { login } });

    await user.type(screen.getByLabelText(/Usuário/), 'emilys');
    await user.type(screen.getByLabelText(/Senha/), 'emilyspass');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(login).toHaveBeenCalledWith({ username: 'emilys', password: 'emilyspass' });
    expect(await screen.findByRole('heading', { name: 'Painel admin' })).toBeInTheDocument();
  });

  it('mostra erro amigável quando as credenciais são inválidas', async () => {
    const login = vi.fn().mockRejectedValue(new ApiError('Invalid credentials', 400));
    const { user } = renderWithProviders(<TestRoutes />, { route: '/login', auth: { login } });

    await user.type(screen.getByLabelText(/Usuário/), 'emilys');
    await user.type(screen.getByLabelText(/Senha/), 'errada');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuário ou senha inválidos.');
    expect(screen.queryByRole('heading', { name: 'Painel admin' })).not.toBeInTheDocument();
  });
});
