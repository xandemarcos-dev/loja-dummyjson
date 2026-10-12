import type { ReactElement, ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../contexts/AuthContext';
import { CartProvider, type CartItem } from '../contexts/CartContext';
import { theme } from '../theme';

/** Sessão falsa em memória: os testes controlam a autenticação sem tocar na API nem no localStorage. */
export function createAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    user: null,
    token: null,
    status: 'anonymous',
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  };
}

export const loggedUser = {
  id: 1,
  username: 'emilys',
  email: 'emily@x.dummyjson.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  image: '',
};

interface WrapperOptions {
  route?: string;
  auth?: Partial<AuthContextValue>;
  cartItems?: CartItem[];
}

export function renderWithProviders(ui: ReactElement, { route = '/', auth, cartItems = [] }: WrapperOptions = {}, options?: RenderOptions) {
  const authValue = createAuthValue(auth);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MantineProvider theme={theme} env="test">
        <MemoryRouter initialEntries={[route]}>
          <AuthContext.Provider value={authValue}>
            <CartProvider initialItems={cartItems}>{children}</CartProvider>
          </AuthContext.Provider>
        </MemoryRouter>
      </MantineProvider>
    );
  }

  return { user: userEvent.setup(), authValue, ...render(ui, { wrapper: Wrapper, ...options }) };
}
