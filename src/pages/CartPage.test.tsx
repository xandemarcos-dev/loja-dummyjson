import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { CartPage } from './CartPage';

const items = [
  { id: 1, title: 'Mascara', price: 10, thumbnail: '', quantity: 2 },
  { id: 2, title: 'Perfume', price: 50, thumbnail: '', quantity: 1 },
];

function TestRoutes() {
  return (
    <Routes>
      <Route path="/carrinho" element={<CartPage />} />
      <Route path="/login" element={<h1>Tela de login</h1>} />
    </Routes>
  );
}

describe('<CartPage />', () => {
  it('lista os itens e remove um deles', async () => {
    const { user } = renderWithProviders(<TestRoutes />, { route: '/carrinho', cartItems: items });

    expect(screen.getByText('3 itens')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remover Perfume' }));

    expect(screen.queryByText('Perfume')).not.toBeInTheDocument();
    expect(screen.getByText('2 itens')).toBeInTheDocument();
  });

  it('pede login antes de finalizar a compra', async () => {
    const { user } = renderWithProviders(<TestRoutes />, { route: '/carrinho', cartItems: items });

    await user.click(screen.getByRole('button', { name: 'Entrar para finalizar' }));
    expect(screen.getByRole('heading', { name: 'Tela de login' })).toBeInTheDocument();
  });

  it('mostra estado vazio', () => {
    renderWithProviders(<TestRoutes />, { route: '/carrinho' });
    expect(screen.getByText('Seu carrinho está vazio.')).toBeInTheDocument();
  });
});
