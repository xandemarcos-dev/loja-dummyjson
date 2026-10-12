import { z } from 'zod';

export const loginFormSchema = z.object({
  username: z.string().trim().min(1, 'Informe o usuário'),
  password: z.string().min(1, 'Informe a senha'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const userSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  image: z.string().optional().default(''),
});

export type User = z.infer<typeof userSchema>;

/** Resposta de POST /auth/login: dados do usuário + tokens JWT. */
export const loginResponseSchema = userSchema.extend({
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
