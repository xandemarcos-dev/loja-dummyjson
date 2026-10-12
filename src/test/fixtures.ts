import type { Product } from '../schemas/product';

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: 'Essence Mascara Lash Princess',
    description: 'Máscara de cílios popular.',
    category: 'beauty',
    price: 9.99,
    discountPercentage: 7,
    rating: 4.9,
    stock: 5,
    brand: 'Essence',
    thumbnail: 'https://cdn.dummyjson.com/thumb.png',
    images: [],
    tags: [],
    ...overrides,
  };
}
