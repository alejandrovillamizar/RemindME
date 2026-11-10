import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import reminderRoutes from './routes/reminders.routes';
import { errorHandler } from './middleware/error-handler';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_ORIGIN.split(',').map(value => value.trim()),
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/', (_req, res) => res.json({ name: 'RemindME API', version: '1.0.0' }));
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reminders', reminderRoutes);
app.use((_req, res) => res.status(404).json({ message: 'Recurso no encontrado.' }));
app.use(errorHandler);

export default app;