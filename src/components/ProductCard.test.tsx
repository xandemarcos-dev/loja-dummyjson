import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';
import { ProductCard } from './ProductCard';

describe('<ProductCard />', () => {
  it('mostra os dados do produto e o link para a página de detalhes', () => {
    renderWithProviders(<ProductCard product={makeProduct({ id: 42, title: 'iPhone 9' })} onAddToCart={vi.fn()} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'iPhone 9' })).toHaveAttribute('href', '/produtos/42');
    expect(screen.getByRole('img', { name: 'iPhone 9' })).toBeInTheDocument();
  });

  it('chama onAddToCart com o produto ao clicar no botão', async () => {
    const onAddToCart = vi.fn();
    const product = makeProduct({ title: 'iPhone 9' });
    const { user } = renderWithProviders(<ProductCard product={product} onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole('button', { name: 'Adicionar iPhone 9 ao carrinho' }));
    expect(onAddToCart).toHaveBeenCalledWith(product);
  });
});
