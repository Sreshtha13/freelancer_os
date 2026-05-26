import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function getProfile(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw new AppError(404, 'Profile not found');
    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const allowed = [
      'display_name',
      'bio',
      'skills',
      'experience_level',
      'portfolio_links',
      'hourly_rate',
      'currency',
      'avatar_url',
    ];
    const patch = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(patch)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
}
