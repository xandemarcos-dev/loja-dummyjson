import { expect, test } from '@playwright/test';

// Credenciais públicas de teste da DummyJSON.
const USERNAME = 'emilys';
const PASSWORD = 'emilyspass';

test.describe('Autenticação', () => {
  test('bloqueia o admin, faz login, redireciona e faz logout', async ({ page }) => {
    // Visitante tentando abrir a área protegida é mandado para o login.
    await page.goto('admin');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();

    // Credenciais erradas mostram erro e não saem da tela.
    await page.getByLabel('Usuário').fill(USERNAME);
    await page.getByLabel('Senha').fill('senha-errada');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('alert')).toContainText('Usuário ou senha inválidos.');

    // Login correto volta para a rota que o usuário queria (/admin).
    await page.getByLabel('Senha').fill(PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: 'Gerenciar produtos' })).toBeVisible();
    await expect(page.getByRole('table', { name: 'Produtos cadastrados' }).getByRole('row')).not.toHaveCount(1);

    // A sessão sobrevive ao recarregar (token no localStorage + fallback de SPA).
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Gerenciar produtos' })).toBeVisible();

    // Logout encerra a sessão e o admin volta a ficar bloqueado.
    await page.getByRole('button', { name: /Conta de/ }).click();
    await page.getByRole('menuitem', { name: 'Sair' }).click();
    await expect(page.getByRole('heading', { name: 'Catálogo de produtos' })).toBeVisible();
    await page.goto('admin');
    await expect(page).toHaveURL(/\/login$/);
  });
});
