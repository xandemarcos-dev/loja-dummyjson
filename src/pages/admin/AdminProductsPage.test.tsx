import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../test/fixtures';
import { loggedUser, renderWithProviders } from '../../test/utils';
import * as productService from '../../services/productService';
import { AdminProductsPage } from './AdminProductsPage';

vi.mock('../../services/productService');
const mocked = vi.mocked(productService);

const auth = { status: 'authenticated' as const, isAuthenticated: true, user: loggedUser, token: 'jwt' };

describe('<AdminProductsPage />', () => {
  beforeEach(() => {
    mocked.fetchCategories.mockResolvedValue([{ slug: 'beauty', name: 'Beauty' }]);
    mocked.fetchProducts.mockResolvedValue({ products: [makeProduct({ id: 1, title: 'Mascara' })], total: 1, skip: 0, limit: 10 });
    mocked.createProduct.mockImplementation(async (values) => makeProduct({ ...values, id: 195 }));
    mocked.deleteProduct.mockResolvedValue(true);
  });

  it('valida o formulário e cadastra um produto novo na tabela', async () => {
    const { user } = renderWithProviders(<AdminProductsPage />, { auth });
    const table = await screen.findByRole('table', { name: 'Produtos cadastrados' });
    await within(table).findByText('Mascara');

    await user.click(screen.getByRole('button', { name: 'Novo produto' }));
    const dialog = await screen.findByRole('dialog', { name: 'Novo produto' });

    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));
    expect(await within(dialog).findByText('O nome precisa ter pelo menos 3 caracteres')).toBeInTheDocument();
    expect(mocked.createProduct).not.toHaveBeenCalled();

    await user.type(within(dialog).getByLabelText(/Nome do produto/), 'Teclado Mecânico');
    await user.type(within(dialog).getByLabelText(/Descrição/), 'Switches azuis e RGB');
    await user.click(within(dialog).getByRole('textbox', { name: /Categoria/ }));
    await user.click(await screen.findByRole('option', { name: 'Beauty' }));
    await user.clear(within(dialog).getByLabelText(/Preço/));
    await user.type(within(dialog).getByLabelText(/Preço/), '199.9');
    await user.type(within(dialog).getByLabelText(/Estoque/), '5');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    expect(await within(table).findByText('Teclado Mecânico')).toBeInTheDocument();
    expect(mocked.createProduct).toHaveBeenCalledWith(expect.objectContaining({ title: 'Teclado Mecânico', category: 'beauty' }));
  });

  it('exclui um produto após confirmação', async () => {
    const { user } = renderWithProviders(<AdminProductsPage />, { auth });
    await screen.findByText('Mascara');

    await user.click(screen.getByRole('button', { name: 'Excluir Mascara' }));
    const dialog = await screen.findByRole('dialog', { name: 'Excluir produto' });
    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

    expect(mocked.deleteProduct).toHaveBeenCalledWith(1);
    await vi.waitFor(() => expect(screen.queryByText('Mascara')).not.toBeInTheDocument());
  });
});
