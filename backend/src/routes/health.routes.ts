import { Router } from 'express';
import { checkDatabase } from '../config/database';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    await checkDatabase();
    res.json({ status: 'ok', service: 'RemindME API', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', service: 'RemindME API', database: 'disconnected' });
  }
});

export default router;