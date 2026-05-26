import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export const clientsRouter = Router();

clientsRouter.use(authMiddleware);

clientsRouter.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('user_id', req.user.id)
      .order('name');
    if (error) throw new AppError(500, error.message);
    res.json({ clients: data });
  } catch (e) {
    next(e);
  }
});

clientsRouter.post('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({ ...req.body, user_id: req.user.id })
      .select()
      .single();
    if (error) throw new AppError(400, error.message);
    res.status(201).json({ client: data });
  } catch (e) {
    next(e);
  }
});

clientsRouter.patch('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error || !data) throw new AppError(404, 'Client not found');
    res.json({ client: data });
  } catch (e) {
    next(e);
  }
});
