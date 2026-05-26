import { supabaseAdmin } from '../config/supabase.js';
import { generateProposal } from '../services/proposal.service.js';
import { AppError } from '../utils/AppError.js';

export async function generate(req, res, next) {
  try {
    const { jobId, tone, length, templateId } = req.validated.body;
    const result = await generateProposal(req.user.id, { jobId, tone, length, templateId });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('proposals')
      .select('*, jobs(title, url)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new AppError(500, error.message);
    res.json({ proposals: data });
  } catch (err) {
    next(err);
  }
}
