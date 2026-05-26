import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export const projectsRouter = Router();

projectsRouter.use(authMiddleware);

projectsRouter.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*, clients(name)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw new AppError(500, error.message);
    res.json({ projects: data });
  } catch (e) {
    next(e);
  }
});

projectsRouter.post('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({ ...req.body, user_id: req.user.id })
      .select('*, clients(name)')
      .single();
    if (error) throw new AppError(400, error.message);
    res.status(201).json({ project: data });
  } catch (e) {
    next(e);
  }
});

projectsRouter.patch('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*, clients(name)')
      .single();
    if (error || !data) throw new AppError(404, 'Project not found');
    res.json({ project: data });
  } catch (e) {
    next(e);
  }
});
