import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './routes/AppRoutes';

// basename = `base` do vite.config.ts (ex.: /loja-dummyjson/), sem a barra final.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

// useTransitions={false}: o React Router 7 faz a navegação dentro de startTransition (baixa prioridade).
// No logout feito a partir de /admin isso deixava a ProtectedRoute renderizar antes da troca de rota,
// já sem sessão, redirecionando para /login em vez do catálogo. Navegação síncrona elimina a corrida.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename} useTransitions={false}>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
);
