# Loja DummyJSON

**Aplicação no ar:** https://xandemarcos-dev.github.io/loja-dummyjson/
**Repositório:** https://github.com/xandemarcos-dev/loja-dummyjson

[![CI](https://github.com/xandemarcos-dev/loja-dummyjson/actions/workflows/ci.yml/badge.svg)](https://github.com/xandemarcos-dev/loja-dummyjson/actions/workflows/ci.yml)
[![Deploy](https://github.com/xandemarcos-dev/loja-dummyjson/actions/workflows/deploy.yml/badge.svg)](https://github.com/xandemarcos-dev/loja-dummyjson/actions/workflows/deploy.yml)

## Tema escolhido

**Catálogo e compras (`/products`)** da [DummyJSON](https://dummyjson.com).

- **Área pública:** catálogo com busca, filtro por categoria e paginação, página de detalhes (`/produtos/:id`) e carrinho de compras simulado.
- **Área administrativa (protegida por login JWT):** tabela paginada de produtos com cadastro, edição e exclusão.

> **Login de teste:** usuário `emilys`, senha `emilyspass` (credenciais públicas da DummyJSON).
>
> **Importante:** a DummyJSON **simula** `POST/PUT/DELETE` (responde como se tivesse salvo, mas não grava). Por isso o painel administrativo mantém as alterações no estado local: elas aparecem na tabela e somem ao recarregar a página.

## Rotas

| Rota | Área | Conteúdo |
|---|---|---|
| `/` | pública | catálogo com busca, filtro por categoria e paginação |
| `/produtos/:id` | pública | detalhes do produto (rota dinâmica) |
| `/carrinho` | pública | carrinho; finalizar a compra exige login |
| `/login` | pública | login JWT (`POST /auth/login`) |
| `/admin` | **protegida** | gestão de produtos: cadastrar, editar, excluir |

Experimente direto em produção: [catálogo](https://xandemarcos-dev.github.io/loja-dummyjson/) · [produto 1](https://xandemarcos-dev.github.io/loja-dummyjson/produtos/1) · [admin (redireciona para o login)](https://xandemarcos-dev.github.io/loja-dummyjson/admin)

## Como executar localmente

Pré-requisitos: Node.js 20+ e Yarn 1.x (`npm i -g yarn`).

```bash
yarn install --frozen-lockfile
yarn dev            # http://localhost:5173/loja-dummyjson/
```

| Comando | O que faz |
|---|---|
| `yarn dev` | servidor de desenvolvimento |
| `yarn build` | typecheck + build de produção em `dist/` + gera `dist/404.html` |
| `yarn preview` | serve o build de produção |
| `yarn test` | testes unitários e de componentes (Vitest + RTL) |
| `yarn test:e2e` | testes ponta a ponta (Playwright, headless). Na primeira vez: `npx playwright install chromium` |
| `yarn lint` / `yarn typecheck` | ESLint / TypeScript |

## Estrutura

```
src/
├── components/      # componentes de UI reutilizáveis (ProductCard, NavItem, PageSection, ProductFormModal...)
├── contexts/        # AuthContext e CartContext (Context API)
├── hooks/           # useAuth, useCart, useAsync, useDebouncedValue
├── layouts/         # AppLayout (cabeçalho + navegação persistentes + <Outlet />)
├── pages/           # páginas públicas e pages/admin
├── routes/          # rotas declarativas e ProtectedRoute
├── schemas/         # schemas Zod + tipos inferidos
├── services/        # api.ts (Axios + interceptors), authService, productService
└── test/            # setup do Vitest e wrappers de contexto em memória
e2e/                 # testes Playwright
.github/workflows/   # CI e deploy
```

## Checklist dos 10 requisitos

### 1. Estrutura de componentes e tipagem com TypeScript
- Projeto Vite no template React + TypeScript, com `strict: true` e **nenhum `any`** (a regra `@typescript-eslint/no-explicit-any` está como erro no ESLint e roda no CI).
- Componentes funcionais desacoplados com props tipadas por `interface` (ex.: `ProductCard`, `NavItem`, `ErrorState`).
- Composição com `children`: `PageSection` (moldura de página que recebe o conteúdo e ações), `AppProviders`, `ErrorState`.
- Estilos com **Mantine UI** e **CSS Modules** (`NavItem.module.css`, `ProductCard.module.css`).

### 2. Estado reativo, imutabilidade e ciclo de vida
- `useState` em todas as telas (busca, categoria, página, quantidade, estado do modal, alterações do admin).
- Atualizações imutáveis com spread, `map` e `filter`: `CartContext` (`[...current, novo]`, `{ ...item, quantity }`) e `AdminProductsPage` (`setEdited((c) => ({ ...c, [id]: produto }))`, `setDeletedIds((c) => [...c, id])`). Há teste confirmando que o array anterior do carrinho não é alterado.
- `useEffect` com dependências precisas e **cleanup**:
  - `useDebouncedValue`: `clearTimeout` do timer da busca;
  - `useAsync`: `AbortController.abort()` cancela a requisição anterior (evita condição de corrida na busca);
  - `AuthContext`: remove os ouvintes `storage` (logout em outra aba) e `auth:unauthorized` (401 vindo do interceptor), e aborta a validação do token.

### 3. Estado global com Context API e Custom Hooks
- `AuthContext` (sessão: usuário, token, status, login, logout) e `CartContext` (itens, totais, ações; persistido no `localStorage`).
- Consumo via `useAuth()` e `useCart()`, que lançam erro claro se usados fora do Provider (`"useCart deve ser usado dentro de <CartProvider>."`). Coberto por teste.

### 4. Roteamento e layouts com React Router
- Rotas declarativas em `routes/AppRoutes.tsx` (`<Routes>/<Route>`), com rota de layout e rota aninhada protegida.
- `AppLayout` com cabeçalho e navegação persistentes (AppShell do Mantine, com menu hambúrguer no mobile) e páginas renderizadas no `<Outlet />`.
- `<NavLink>` com indicação de rota ativa (classe `active` do CSS Module + `aria-current="page"`).
- `useNavigate()` no login (volta para a rota de origem), logout, carrinho e botão "Voltar".
- Rota dinâmica `/produtos/:id` lida com `useParams()`.

### 5. Interface gráfica e formulários com Mantine UI
- `<MantineProvider>` com tema próprio (`theme.ts`) e alternância claro/escuro.
- Layout responsivo com `AppShell`, `SimpleGrid` e `Grid` com breakpoints (`base/xs/md/lg`).
- Formulários com `@mantine/form`: login e cadastro/edição de produto (em modal).
- Listagens com `Pagination`: grade de produtos (12 por página) e `Table` do admin (10 por página).
- Feedback de carregamento: `LoadingOverlay`, `Loader`, botões com `loading` e notificações (`@mantine/notifications`).

### 6. Fluxo de autenticação JWT e rotas protegidas
- `LoginPage` chama `POST /auth/login` (via `authService`).
- O `accessToken` é salvo no `localStorage` (`services/tokenStorage.ts`) e refletido no `AuthContext`.
- Ao abrir o app com token salvo, `GET /auth/me` confirma se ele ainda vale; se não, a sessão é encerrada.
- `ProtectedRoute` bloqueia `/admin`: mostra loader enquanto valida o token e redireciona visitantes para `/login`, guardando a rota de origem.
- Login/logout sincronizam entre abas pelo evento `storage`.

### 7. Consumo de API REST, interceptors e validação com Zod
- Axios centralizado em `src/services/api.ts` com `baseURL: 'https://dummyjson.com'`.
- **Interceptor de requisição:** injeta `Authorization: Bearer <token>`.
- **Interceptor de resposta:** converte qualquer falha em `ApiError`; falha de rede, timeout e erro 5xx exibem notificação amigável; 401 dispara o evento que encerra a sessão.
- Estados de carregamento, sucesso e erro explícitos no hook `useAsync` (`status: 'loading' | 'success' | 'error'`), com tela de erro e botão "Tentar novamente".
- Schemas `z.object` em `src/schemas/`, tipos com `z.infer` e **toda resposta** validada com `.safeParse()` (`parseResponse` em `api.ts`).
- Formulários integrados com `zodResolver` (`mantine-form-zod-resolver`) usando `loginFormSchema` e `productFormSchema`.

### 8. Testes automatizados com Vitest e RTL
30 testes em 9 arquivos (`yarn test`):
- Schemas Zod, interceptors do Axios (token no header e 401), hooks (`useCart`, `useDebouncedValue`, erro fora do Provider).
- Componentes e páginas: `ProductCard`, `ProtectedRoute`, `LoginPage` (validação, sucesso com redirecionamento, credencial inválida), `CartPage`, `ProductsPage` (listagem, busca com debounce, erro + retry) e `AdminProductsPage` (cadastro com validação no modal e exclusão).
- Consultas acessíveis (`getByRole`, `getByLabelText`, `getByText`) e interações com `@testing-library/user-event`.
- Dependências isoladas: serviços mockados com `vi.mock` e **wrappers de contexto em memória** (`src/test/utils.tsx` fornece um `AuthContext` falso, `CartProvider` com itens iniciais e `MemoryRouter`).

### 9. Testes ponta a ponta com Playwright
4 testes em navegador real (Chromium, headless), rodando contra o **build de produção** com o mesmo base path do GitHub Pages:
1. **Autenticação:** `/admin` sem login redireciona para `/login`; senha errada mostra erro; login correto volta para `/admin`; sessão sobrevive ao F5; logout bloqueia o admin de novo.
2. **Busca → detalhes → carrinho:** busca "iphone", abre o produto (`/produtos/:id`), adiciona ao carrinho e confere o carrinho.
3. **Link direto** para `/produtos/1` (valida o fallback de SPA).
4. **Cadastro no admin:** validação do formulário e novo produto na tabela.

Somente localizadores semânticos (`getByRole`, `getByLabel`).

Os testes já se pagaram: o fluxo de autenticação encontrou um bug real. No React Router 7 a navegação roda em `startTransition`, então o logout feito em `/admin` atualizava a sessão antes da troca de rota, e a `ProtectedRoute` redirecionava para `/login` em vez do catálogo. A correção (`useTransitions={false}` no `BrowserRouter`, em `src/main.tsx`) foi validada pelo próprio teste no CI.

### 10. Pipeline de CI/CD e deploy em produção
- **CI** (`.github/workflows/ci.yml`), em todo push e pull request: checkout → setup do Node 22 → `yarn install --frozen-lockfile` → typecheck → lint → Vitest → instalação do Chromium → Playwright. O relatório do Playwright é anexado ao run.
- **CD** (`.github/workflows/deploy.yml`), em push na `main`: build de produção e deploy no GitHub Pages pelas actions oficiais.
- `base` em `vite.config.ts` (`/loja-dummyjson/`, sobrescrito no deploy pelo nome real do repositório) e `basename` do `BrowserRouter` lido de `import.meta.env.BASE_URL`.
- Fallback de SPA: `scripts/copy-404.mjs` copia `index.html` para `404.html` no build. Links diretos e F5 em qualquer rota carregam o app e o React Router resolve a URL.
- **Proteção da branch `main`:** regra que exige pull request e o check **"Testes (Vitest + Playwright)"** aprovado antes do merge (ver configuração abaixo).

#### Configuração feita no GitHub
1. *Settings → Pages → Source:* **GitHub Actions**.
2. *Settings → Branches → Add branch ruleset* (ou *Add classic branch protection rule*) para `main`:
   - **Require a pull request before merging**;
   - **Require status checks to pass** → check `Testes (Vitest + Playwright)`;
   - **Block force pushes**.

## Uso de Inteligência Artificial

Usei o **Claude (Anthropic)** como assistente de desenvolvimento para:
- montar a estrutura inicial de pastas, configs (Vite, Vitest, Playwright, ESLint) e workflows;
- escrever os schemas Zod a partir do formato real das respostas da DummyJSON;
- propor casos de teste de borda (credencial inválida, busca com debounce, retry após erro de rede, 401 no interceptor, link direto);
- revisar acessibilidade dos componentes (rótulos, `role`, `aria-label`) para que os testes usem consultas semânticas.

Revisei e rodei todo o código gerado: typecheck, lint, testes unitários e build. As decisões de arquitetura (estado local para simular a persistência do admin, validação de toda resposta com Zod, evento global para o 401, um único `tokenStorage`) foram discutidas e ajustadas por mim antes da entrega.
