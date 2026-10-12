import { expect, test } from '@playwright/test';

test.describe('Catálogo', () => {
  test('busca um produto, abre os detalhes e adiciona ao carrinho', async ({ page }) => {
    await page.goto('');
    await expect(page.getByRole('heading', { name: 'Catálogo de produtos' })).toBeVisible();
    await expect(page.getByRole('article').first()).toBeVisible();

    await page.getByRole('searchbox', { name: 'Buscar produtos' }).fill('iphone');
    const firstResult = page.getByRole('article').first().getByRole('link');
    await expect(firstResult).toContainText(/iphone/i);

    const title = (await firstResult.textContent())?.trim() ?? '';
    await firstResult.click();

    // Rota dinâmica /produtos/:id
    await expect(page).toHaveURL(/\/produtos\/\d+$/);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();

    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

    const nav = page.getByRole('navigation', { name: 'Navegação principal' });
    await expect(nav.getByLabel('1 itens no carrinho')).toBeVisible();
    await nav.getByRole('link', { name: /Carrinho/ }).click();

    await expect(page).toHaveURL(/\/carrinho$/);
    await expect(page.getByRole('link', { name: title })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar para finalizar' })).toBeVisible();
  });

  test('link direto para um produto funciona (fallback de SPA)', async ({ page }) => {
    await page.goto('produtos/1');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeVisible();
  });
});
