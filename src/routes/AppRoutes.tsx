import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { CartPage } from '../pages/CartPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductsPage } from '../pages/ProductsPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { ProtectedRoute } from './ProtectedRoute';

/** Rotas declarativas. Tudo fica dentro do AppLayout; /admin passa pela guarda de autenticação. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Área pública */}
        <Route index element={<ProductsPage />} />
        <Route path="produtos/:id" element={<ProductDetailPage />} />
        <Route path="carrinho" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />

        {/* Área administrativa protegida */}
        <Route path="admin" element={<ProtectedRoute />}>
          <Route index element={<AdminProductsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
