import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, parseResponse, UNAUTHORIZED_EVENT } from './api';
import { tokenStorage } from './tokenStorage';
import { userSchema } from '../schemas/auth';

const originalAdapter = api.defaults.adapter;

afterEach(() => {
  api.defaults.adapter = originalAdapter;
});

describe('api (Axios)', () => {
  it('usa a baseURL da DummyJSON', () => {
    expect(api.defaults.baseURL).toBe('https://dummyjson.com');
  });

  it('injeta o JWT salvo no cabeçalho Authorization', async () => {
    tokenStorage.set('meu-token');
    let captured: InternalAxiosRequestConfig | undefined;
    api.defaults.adapter = async (config) => {
      captured = config;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };

    await api.get('/auth/me');
    expect(captured?.headers.get('Authorization')).toBe('Bearer meu-token');
  });

  it('não envia Authorization sem sessão', async () => {
    let captured: InternalAxiosRequestConfig | undefined;
    api.defaults.adapter = async (config) => {
      captured = config;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };

    await api.get('/products');
    expect(captured?.headers.get('Authorization')).toBeUndefined();
  });

  it('converte 401 em ApiError e avisa a aplicação para encerrar a sessão', async () => {
    let unauthorizedFired = false;
    const listener = () => {
      unauthorizedFired = true;
    };
    window.addEventListener(UNAUTHORIZED_EVENT, listener);
    api.defaults.adapter = async (config) => {
      const response = { status: 401, data: { message: 'Token Expired!' }, statusText: 'Unauthorized', headers: {}, config };
      throw new AxiosError('Request failed with status code 401', AxiosError.ERR_BAD_REQUEST, config, null, response);
    };

    await expect(api.get('/auth/me')).rejects.toBeInstanceOf(ApiError);
    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
    expect(unauthorizedFired).toBe(true);
  });

  it('parseResponse rejeita dados fora do schema com mensagem amigável', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => parseResponse(userSchema, { id: 'x' })).toThrow('A API devolveu dados em um formato inesperado.');
  });
});
