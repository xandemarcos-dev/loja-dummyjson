import { api, parseResponse } from './api';
import { loginResponseSchema, userSchema, type LoginFormValues, type LoginResponse, type User } from '../schemas/auth';

export async function login(credentials: LoginFormValues): Promise<LoginResponse> {
  const { data } = await api.post('/auth/login', { ...credentials, expiresInMins: 60 });
  return parseResponse(loginResponseSchema, data);
}

/** Valida o token salvo: GET /auth/me só responde 200 com um JWT válido. */
export async function fetchCurrentUser(signal?: AbortSignal): Promise<User> {
  const { data } = await api.get('/auth/me', { signal });
  return parseResponse(userSchema, data);
}
