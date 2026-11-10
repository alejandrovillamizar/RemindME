import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().default('http://localhost:8081'),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('remindme'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12)
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Configuración inválida:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;