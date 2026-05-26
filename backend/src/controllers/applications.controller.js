import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function list(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*, jobs(id, title, url, source, company_name)')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw new AppError(500, error.message);
    res.json({ applications: data });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { jobId, status = 'saved', notes } = req.body;

    const { data, error } = await supabaseAdmin
      .from('applications')
      .upsert(
        {
          user_id: req.user.id,
          job_id: jobId,
          status,
          notes,
        },
        { onConflict: 'user_id,job_id' }
      )
      .select('*, jobs(*)')
      .single();

    if (error) throw new AppError(400, error.message);
    res.status(201).json({ application: data });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const allowed = ['status', 'notes', 'follow_up_at', 'proposal_id', 'applied_at'];
    const patch = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }

    if (patch.status === 'applied' && !patch.applied_at) {
      patch.applied_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .update(patch)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*, jobs(*)')
      .single();

    if (error || !data) throw new AppError(404, 'Application not found');
    res.json({ application: data });
  } catch (err) {
    next(err);
  }
}
