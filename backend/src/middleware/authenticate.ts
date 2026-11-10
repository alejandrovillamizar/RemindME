import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload extends jwt.JwtPayload {
  sub: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: 'Debes iniciar sesión para continuar.' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      res.status(401).json({ message: 'La sesión no es válida.' });
      return;
    }
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ message: 'La sesión expiró o no es válida.' });
  }
}