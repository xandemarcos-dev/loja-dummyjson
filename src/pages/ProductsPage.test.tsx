import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';
import * as productService from '../services/productService';
import { ProductsPage } from './ProductsPage';

vi.mock('../services/productService');
const mocked = vi.mocked(productService);

describe('<ProductsPage />', () => {
  beforeEach(() => {
    mocked.fetchCategories.mockResolvedValue([{ slug: 'beauty', name: 'Beauty' }]);
    mocked.fetchProducts.mockImplementation(async (query) => ({
      products: query.search
        ? [makeProduct({ id: 2, title: 'iPhone 9' })]
        : [makeProduct({ id: 1, title: 'Mascara' }), makeProduct({ id: 3, title: 'Perfume' })],
      total: 2,
      skip: 0,
      limit: 12,
    }));
  });

  it('carrega e exibe os produtos da API', async () => {
    renderWithProviders(<ProductsPage />);
    expect(await screen.findByRole('link', { name: 'Mascara' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Perfume' })).toBeInTheDocument();
  });

  it('busca pelo texto digitado (com debounce)', async () => {
    const { user } = renderWithProviders(<ProductsPage />);
    await screen.findByRole('link', { name: 'Mascara' });

    await user.type(screen.getByRole('searchbox', { name: 'Buscar produtos' }), 'phone');

    expect(await screen.findByRole('link', { name: 'iPhone 9' })).toBeInTheDocument();
    await waitFor(() =>
      expect(mocked.fetchProducts).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'phone', page: 1 }), expect.any(AbortSignal)),
    );
    expect(screen.queryByRole('link', { name: 'Mascara' })).not.toBeInTheDocument();
  });

  it('mostra o erro e permite tentar de novo', async () => {
    mocked.fetchProducts.mockRejectedValueOnce(new Error('Não foi possível conectar ao servidor.'));
    const { user } = renderWithProviders(<ProductsPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar ao servidor.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('link', { name: 'Mascara' })).toBeInTheDocument();
  });
});
