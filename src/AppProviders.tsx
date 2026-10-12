import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { theme } from './theme';

interface AppProvidersProps {
  children: ReactNode;
}

/** Composição de todos os providers globais em um só lugar (reaproveitado nos testes). */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-right" />
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
