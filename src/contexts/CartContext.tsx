import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../schemas/product';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
}

export interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: Pick<Product, 'id' | 'title' | 'price' | 'thumbnail'>, quantity?: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clear: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export const CART_STORAGE_KEY = 'loja.cart';

function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

interface CartProviderProps {
  children: ReactNode;
  /** Permite iniciar o carrinho com itens (útil em testes). */
  initialItems?: CartItem[];
}

export function CartProvider({ children, initialItems }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(() => initialItems ?? readStoredCart());

  // Persiste o carrinho sempre que ele mudar.
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage indisponível: o carrinho continua funcionando em memória
    }
  }, [items]);

  // Todas as atualizações criam arrays/objetos novos (spread) em vez de mutar o estado.
  const addItem = useCallback<CartContextValue['addItem']>((product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [
        ...current,
        { id: product.id, title: product.title, price: product.price, thumbnail: product.thumbnail, quantity },
      ];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.id !== id)
        : current.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    return { items, totalItems, totalPrice, addItem, updateQuantity, removeItem, clear };
  }, [items, addItem, updateQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
