import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CartProvider } from '../contexts/CartContext';
import { makeProduct } from '../test/fixtures';
import { useAuth } from './useAuth';
import { useCart } from './useCart';
import { useDebouncedValue } from './useDebouncedValue';

const cartWrapper = ({ children }: { children: ReactNode }) => <CartProvider initialItems={[]}>{children}</CartProvider>;

describe('custom hooks de contexto', () => {
  it('useCart avisa quando usado fora do CartProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow('useCart deve ser usado dentro de <CartProvider>.');
  });

  it('useAuth avisa quando usado fora do AuthProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow('useAuth deve ser usado dentro de <AuthProvider>.');
  });
});

describe('useCart', () => {
  it('soma quantidades do mesmo produto sem mutar o array anterior', () => {
    const { result } = renderHook(() => useCart(), { wrapper: cartWrapper });
    const product = makeProduct({ id: 7, price: 10 });

    act(() => result.current.addItem(product));
    const firstItems = result.current.items;

    act(() => result.current.addItem(product, 2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalPrice).toBe(30);
    // imutabilidade: o array e o objeto antigos não foram alterados
    expect(firstItems).not.toBe(result.current.items);
    expect(firstItems[0].quantity).toBe(1);
  });

  it('remove o item quando a quantidade chega a zero e persiste no localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper: cartWrapper });
    act(() => result.current.addItem(makeProduct({ id: 1 })));
    act(() => result.current.addItem(makeProduct({ id: 2 })));
    act(() => result.current.updateQuantity(1, 0));

    expect(result.current.items.map((item) => item.id)).toEqual([2]);
    expect(JSON.parse(window.localStorage.getItem('loja.cart') ?? '[]')).toHaveLength(1);
  });
});

describe('useDebouncedValue', () => {
  it('só propaga o valor depois do atraso e cancela o timer anterior', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), { initialProps: { value: 'a' } });

    rerender({ value: 'ab' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'abc' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('abc');
    vi.useRealTimers();
  });
});
