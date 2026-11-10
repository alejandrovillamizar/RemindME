import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../config/database';
import { env } from '../config/env';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(190).transform(value => value.toLowerCase()),
  password: z.string().min(8).max(72)
});
const loginSchema = z.object({
  email: z.string().trim().email().max(190).transform(value => value.toLowerCase()),
  password: z.string().min(1).max(72)
});

function createToken(userId: number): string {
  return jwt.sign({}, env.JWT_SECRET, { subject: String(userId), expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Revisa los datos del registro.', errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const { name, email, password } = parsed.data;
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if ((existing as Array<{ id: number }>).length) {
      res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    const userId = (result as { insertId: number }).insertId;
    res.status(201).json({
      message: 'Cuenta creada correctamente.',
      token: createToken(userId),
      user: { id: userId, name, email }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Correo o contraseña con formato inválido.' });
      return;
    }
    const [rows] = await pool.execute(
      'SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1',
      [parsed.data.email]
    );
    const user = (rows as Array<{ id: number; name: string; email: string; password_hash: string }>)[0];
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password_hash))) {
      res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
      return;
    }
    res.json({
      message: 'Sesión iniciada correctamente.',
      token: createToken(user.id),
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1',
      [req.userId!]
    );
    const user = (rows as Array<Record<string, unknown>>)[0];
    if (!user) {
      res.status(404).json({ message: 'No se encontró el usuario.' });
      return;
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;