import { supabaseAdmin } from '../config/supabase.js';
import { syncJobsForUser, importManualJob } from '../services/jobAggregator.service.js';
import { AppError } from '../utils/AppError.js';

export async function listJobs(req, res, next) {
  try {
    const { source, search, limit, offset } = req.validated.query;
    let query = supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .eq('is_archived', false)
      .order('posted_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (source) query = query.eq('source', source);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw new AppError(500, error.message);

    res.json({ jobs: data, total: count });
  } catch (err) {
    next(err);
  }
}

export async function getJob(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) throw new AppError(404, 'Job not found');
    res.json({ job: data });
  } catch (err) {
    next(err);
  }
}

export async function syncJobs(req, res, next) {
  try {
    const results = await syncJobsForUser(req.user.id);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function importJob(req, res, next) {
  try {
    const job = await importManualJob(req.user.id, req.validated.body);
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
}
