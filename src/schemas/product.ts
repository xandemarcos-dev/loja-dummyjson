import { z } from 'zod';

/** Produto como a DummyJSON devolve (só os campos que a aplicação usa; o resto é descartado). */
export const productSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number(),
  discountPercentage: z.number().optional().default(0),
  rating: z.number().optional().default(0),
  stock: z.number().int().optional().default(0),
  brand: z.string().optional(),
  thumbnail: z.string().optional().default(''),
  images: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

export type Product = z.infer<typeof productSchema>;

export const productListSchema = z.object({
  products: z.array(productSchema),
  total: z.number().int(),
  skip: z.number().int(),
  limit: z.number().int(),
});

export type ProductList = z.infer<typeof productListSchema>;

export const categorySchema = z.object({
  slug: z.string(),
  name: z.string(),
});

export const categoryListSchema = z.array(categorySchema);

export type Category = z.infer<typeof categorySchema>;

/** Resposta de DELETE /products/:id */
export const deletedProductSchema = productSchema.extend({
  isDeleted: z.boolean(),
});

/** Dados do formulário de cadastro/edição na área administrativa. */
export const productFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'O nome precisa ter pelo menos 3 caracteres')
    .max(80, 'O nome pode ter no máximo 80 caracteres'),
  description: z.string().trim().min(10, 'Descreva o produto com pelo menos 10 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
  brand: z.string().trim().max(40, 'A marca pode ter no máximo 40 caracteres'),
  price: z
    .number({ invalid_type_error: 'Informe o preço', required_error: 'Informe o preço' })
    .positive('O preço deve ser maior que zero'),
  stock: z
    .number({ invalid_type_error: 'Informe o estoque', required_error: 'Informe o estoque' })
    .int('O estoque deve ser um número inteiro')
    .min(0, 'O estoque não pode ser negativo'),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
