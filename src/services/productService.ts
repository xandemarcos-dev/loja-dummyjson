import { api, parseResponse } from './api';
import {
  categoryListSchema,
  deletedProductSchema,
  productListSchema,
  productSchema,
  type Category,
  type Product,
  type ProductFormValues,
  type ProductList,
} from '../schemas/product';

export interface ProductQuery {
  page: number;
  pageSize: number;
  search?: string;
  category?: string | null;
}

/**
 * A DummyJSON tem três endpoints de listagem (geral, busca e por categoria),
 * todos paginados com limit/skip. Esta função escolhe o certo a partir dos filtros.
 */
export async function fetchProducts(query: ProductQuery, signal?: AbortSignal): Promise<ProductList> {
  const params = { limit: query.pageSize, skip: (query.page - 1) * query.pageSize };
  const search = query.search?.trim();

  let url = '/products';
  if (search) {
    url = '/products/search';
    Object.assign(params, { q: search });
  } else if (query.category) {
    url = `/products/category/${encodeURIComponent(query.category)}`;
  }

  const { data } = await api.get(url, { params, signal });
  return parseResponse(productListSchema, data);
}

export async function fetchProduct(id: number, signal?: AbortSignal): Promise<Product> {
  const { data } = await api.get(`/products/${id}`, { signal });
  return parseResponse(productSchema, data);
}

export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const { data } = await api.get('/products/categories', { signal });
  return parseResponse(categoryListSchema, data);
}

// As escritas abaixo são simuladas pela DummyJSON: ela responde como se tivesse salvo,
// mas não persiste nada. Por isso a área administrativa mantém as alterações no estado local.

export async function createProduct(values: ProductFormValues): Promise<Product> {
  const { data } = await api.post('/products/add', values);
  return parseResponse(productSchema, data);
}

export async function updateProduct(id: number, values: ProductFormValues): Promise<Product> {
  const { data } = await api.put(`/products/${id}`, values);
  return parseResponse(productSchema, data);
}

export async function deleteProduct(id: number): Promise<boolean> {
  const { data } = await api.delete(`/products/${id}`);
  return parseResponse(deletedProductSchema, data).isDeleted;
}
