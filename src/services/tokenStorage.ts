/**
 * Único ponto da aplicação que lê/escreve o JWT no navegador.
 * O interceptor do Axios e o AuthContext usam estas funções, então trocar
 * localStorage por sessionStorage é uma mudança de uma linha.
 */
export const TOKEN_KEY = 'loja.token';

export const tokenStorage = {
  get(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // navegação privada com storage bloqueado: a sessão vale só até recarregar
    }
  },
  clear(): void {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // idem
    }
  },
};
