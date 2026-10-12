import { expect, test } from '@playwright/test';

test.describe('Área administrativa', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('login');
    await page.getByLabel('Usuário').fill('emilys');
    await page.getByLabel('Senha').fill('emilyspass');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('heading', { name: 'Gerenciar produtos' })).toBeVisible();
  });

  test('cadastra um novo produto com validação do formulário', async ({ page }) => {
    const table = page.getByRole('table', { name: 'Produtos cadastrados' });
    await expect(table.getByRole('row').nth(1)).toBeVisible();

    await page.getByRole('button', { name: 'Novo produto' }).click();
    const dialog = page.getByRole('dialog', { name: 'Novo produto' });
    await expect(dialog).toBeVisible();

    // Envio vazio dispara as mensagens do schema Zod.
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(dialog.getByText('O nome precisa ter pelo menos 3 caracteres')).toBeVisible();

    await dialog.getByLabel('Nome do produto').fill('Teclado Mecânico E2E');
    await dialog.getByLabel('Descrição').fill('Teclado com switches azuis e RGB');
    await dialog.getByRole('textbox', { name: 'Categoria' }).click();
    await page.getByRole('option').first().click();
    await dialog.getByLabel('Preço (US$)').fill('199.90');
    await dialog.getByLabel('Estoque').fill('7');
    await dialog.getByRole('button', { name: 'Salvar' }).click();

    await expect(dialog).toBeHidden();
    await expect(table.getByRole('row', { name: /Teclado Mecânico E2E/ })).toBeVisible();
  });
});
