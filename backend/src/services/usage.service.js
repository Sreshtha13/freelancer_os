import { supabaseAdmin } from '../config/supabase.js';

const PROPOSAL_COUNTER = 'proposals_generated';

export async function checkProposalQuota(userId, plan) {
  if (plan === 'pro') return { allowed: true, remaining: Infinity };

  const periodStart = new Date();
  periodStart.setUTCDate(1);
  periodStart.setUTCHours(0, 0, 0, 0);
  const periodKey = periodStart.toISOString().slice(0, 10);

  const { data } = await supabaseAdmin
    .from('usage_counters')
    .select('count')
    .eq('user_id', userId)
    .eq('counter_key', PROPOSAL_COUNTER)
    .eq('period_start', periodKey)
    .maybeSingle();

  const count = data?.count ?? 0;
  const limit = 5;

  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count),
    used: count,
    limit,
  };
}

export async function incrementProposalUsage(userId) {
  const periodStart = new Date();
  periodStart.setUTCDate(1);
  periodStart.setUTCHours(0, 0, 0, 0);
  const periodKey = periodStart.toISOString().slice(0, 10);

  const { data: existing } = await supabaseAdmin
    .from('usage_counters')
    .select('id, count')
    .eq('user_id', userId)
    .eq('counter_key', PROPOSAL_COUNTER)
    .eq('period_start', periodKey)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from('usage_counters')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id);
  } else {
    await supabaseAdmin.from('usage_counters').insert({
      user_id: userId,
      counter_key: PROPOSAL_COUNTER,
      period_start: periodKey,
      count: 1,
    });
  }
}
