import { Router } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { pool } from '../config/database';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

const reminderSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().default(''),
  dueAt: z.string().datetime().nullable().optional().refine(value => value == null || new Date(value).getTime() > Date.now(), 'La fecha y hora deben ser futuras.'),
  priority: z.enum(['Alta', 'Media', 'Baja']).default('Media')
});
const updateSchema = reminderSchema.partial().extend({
  completed: z.boolean().optional()
});

interface ReminderRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  due_at: string | null;
  priority: 'Alta' | 'Media' | 'Baja';
  completed: number;
  created_at: string;
}

function serialize(row: ReminderRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    dueAt: row.due_at,
    priority: row.priority,
    completed: Boolean(row.completed),
    createdAt: row.created_at
  };
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute<ReminderRow[]>(
      'SELECT id, title, description, due_at, priority, completed, created_at FROM reminders WHERE user_id = ? ORDER BY completed ASC, due_at IS NULL, due_at ASC, created_at DESC',
      [req.userId!]
    );
    res.json({ reminders: rows.map(serialize) });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = reminderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Datos del recordatorio inválidos.', errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const { title, description, dueAt, priority } = parsed.data;
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO reminders (user_id, title, description, due_at, priority) VALUES (?, ?, ?, ?, ?)',
      [req.userId!, title, description, dueAt ? new Date(dueAt).toISOString().slice(0, 19).replace('T', ' ') : null, priority]
    );
    const [rows] = await pool.execute<ReminderRow[]>(
      'SELECT id, title, description, due_at, priority, completed, created_at FROM reminders WHERE id = ? AND user_id = ?',
      [result.insertId, req.userId!]
    );
    res.status(201).json({ reminder: serialize(rows[0]) });
  } catch (error) { next(error); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({ message: 'Identificador inválido.' });
      return;
    }
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
      res.status(400).json({ message: 'No hay cambios válidos para guardar.' });
      return;
    }
    const fields = parsed.data;
    const assignments: string[] = [];
    const values: Array<string | number | boolean | null> = [];
    if (fields.title !== undefined) { assignments.push('title = ?'); values.push(fields.title); }
    if (fields.description !== undefined) { assignments.push('description = ?'); values.push(fields.description); }
    if (fields.dueAt !== undefined) {
      assignments.push('due_at = ?');
      values.push(fields.dueAt ? new Date(fields.dueAt).toISOString().slice(0, 19).replace('T', ' ') : null);
    }
    if (fields.priority !== undefined) { assignments.push('priority = ?'); values.push(fields.priority); }
    if (fields.completed !== undefined) { assignments.push('completed = ?'); values.push(fields.completed); }
    values.push(id, req.userId!);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE reminders SET ${assignments.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    if (!result.affectedRows) {
      res.status(404).json({ message: 'No se encontró el recordatorio.' });
      return;
    }
    const [rows] = await pool.execute<ReminderRow[]>(
      'SELECT id, title, description, due_at, priority, completed, created_at FROM reminders WHERE id = ? AND user_id = ?',
      [id, req.userId!]
    );
    res.json({ reminder: serialize(rows[0]) });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({ message: 'Identificador inválido.' });
      return;
    }
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM reminders WHERE id = ? AND user_id = ?',
      [id, req.userId!]
    );
    if (!result.affectedRows) {
      res.status(404).json({ message: 'No se encontró el recordatorio.' });
      return;
    }
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;