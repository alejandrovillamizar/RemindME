import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ message: 'El cuerpo de la solicitud contiene JSON inválido.' });
    return;
  }
  res.status(500).json({ message: 'Ocurrió un error interno. Inténtalo de nuevo.' });
};