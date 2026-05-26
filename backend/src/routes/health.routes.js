import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  let db = 'unknown';
  try {
    const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);
    db = error ? 'error' : 'ok';
  } catch {
    db = 'error';
  }

  res.json({
    status: 'ok',
    service: 'freelancer-os-api',
    database: db,
    timestamp: new Date().toISOString(),
  });
});
