import axios, { AxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import type { ZodType, ZodTypeDef } from 'zod';
import { tokenStorage } from './tokenStorage';

/** Evento disparado quando a API recusa o token (401). O AuthProvider escuta e encerra a sessão. */
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

/** Erro normalizado: as telas só precisam de uma mensagem legível e, às vezes, do status HTTP. */
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de requisição: injeta o JWT em todas as chamadas quando houver sessão.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

function messageFromBody(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const { message } = data as { message: unknown };
    if (typeof message === 'string') return message;
  }
  return undefined;
}

// Interceptor de resposta: transforma qualquer falha em ApiError e avisa o usuário
// quando o problema é de rede/servidor (erros de validação ficam para a própria tela).
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error instanceof AxiosError) {
      if (!error.response) {
        const message =
          error.code === AxiosError.ECONNABORTED
            ? 'O servidor demorou demais para responder. Tente novamente.'
            : 'Não foi possível conectar ao servidor. Verifique sua internet.';
        notifications.show({ id: 'network-error', title: 'Falha de conexão', message, color: 'red' });
        return Promise.reject(new ApiError(message));
      }

      const { status, data } = error.response;

      if (status === 401) {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }

      if (status >= 500) {
        notifications.show({
          id: 'server-error',
          title: 'Erro no servidor',
          message: 'A API está instável no momento. Tente de novo em instantes.',
          color: 'red',
        });
      }

      return Promise.reject(new ApiError(messageFromBody(data) ?? `Erro ${status} na requisição.`, status));
    }

    return Promise.reject(new ApiError('Erro inesperado.'));
  },
);

/** Valida o corpo da resposta com Zod. Se a API mudar o formato, a tela recebe um erro claro em vez de quebrar. */
export function parseResponse<Out, In>(schema: ZodType<Out, ZodTypeDef, In>, data: unknown): Out {
  const result = schema.safeParse(data);
  if (!result.success) {
    if (import.meta.env.DEV) {
      console.error('Resposta fora do formato esperado', result.error.flatten());
    }
    throw new ApiError('A API devolveu dados em um formato inesperado.');
  }
  return result.data;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro inesperado.';
}
