import { describe, expect, it } from 'vitest';
import { loginFormSchema, loginResponseSchema } from './auth';
import { productFormSchema, productListSchema } from './product';

describe('schemas Zod', () => {
  it('rejeita login sem usuário e senha com mensagens em português', () => {
    const result = loginFormSchema.safeParse({ username: '  ', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain('Informe o usuário');
      expect(messages).toContain('Informe a senha');
    }
  });

  it('aceita a resposta de login da DummyJSON e descarta campos extras', () => {
    const result = loginResponseSchema.safeParse({
      id: 1,
      username: 'emilys',
      email: 'emily@x.dummyjson.com',
      firstName: 'Emily',
      lastName: 'Johnson',
      gender: 'female',
      image: 'https://dummyjson.com/icon/emilys/128',
      accessToken: 'jwt.token.aqui',
      refreshToken: 'refresh',
    });
    expect(result.success).toBe(true);
    expect(result.success && 'gender' in result.data).toBe(false);
  });

  it('falha quando a listagem vem sem o array de produtos', () => {
    expect(productListSchema.safeParse({ total: 0, skip: 0, limit: 10 }).success).toBe(false);
  });

  it('valida as regras do formulário de produto', () => {
    const invalid = productFormSchema.safeParse({ title: 'TV', description: 'curta', category: '', brand: '', price: 0, stock: -1 });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(Object.keys(invalid.error.flatten().fieldErrors).sort()).toEqual(['category', 'description', 'price', 'stock', 'title']);
    }

    const valid = productFormSchema.safeParse({ title: '  Smart TV 50"  ', description: 'Tela 4K com HDR10', category: 'smartphones', brand: '', price: 1999.9, stock: 3 });
    expect(valid.success && valid.data.title).toBe('Smart TV 50"');
  });
});
