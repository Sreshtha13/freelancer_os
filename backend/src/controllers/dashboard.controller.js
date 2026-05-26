import { supabaseAdmin } from '../config/supabase.js';

export async function getStats(userId) {
  const [apps, clients, payments, proposals] = await Promise.all([
    supabaseAdmin.from('applications').select('status').eq('user_id', userId),
    supabaseAdmin.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabaseAdmin.from('payments').select('amount').eq('user_id', userId),
    supabaseAdmin
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'applied'),
  ]);

  const byStatus = (apps.data || []).reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const applied = byStatus.applied || 0;
  const won = byStatus.won || 0;
  const total = (apps.data || []).length;
  const conversionRate = applied > 0 ? Math.round((won / applied) * 100) : 0;

  const earnings = (payments.data || []).reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    applications: { total, byStatus },
    activeClients: clients.count ?? 0,
    jobsApplied: proposals.count ?? 0,
    conversionRate,
    earnings,
  };
}
