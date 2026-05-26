import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { StatCard } from '../components/ui/Card';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api('/api/profile/dashboard'),
  });

  const stats = data?.stats;

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-slate-500">Your freelance command center</p>

      {isLoading ? (
        <p className="mt-8 text-slate-500">Loading stats…</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total applications" value={stats?.applications?.total ?? 0} />
          <StatCard label="Jobs applied" value={stats?.jobsApplied ?? 0} />
          <StatCard
            label="Conversion rate"
            value={`${stats?.conversionRate ?? 0}%`}
            sub="Won / Applied"
          />
          <StatCard
            label="Earnings"
            value={`$${(stats?.earnings ?? 0).toLocaleString()}`}
            sub="All recorded payments"
          />
        </div>
      )}

      <div className="mt-8 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-card)] p-6">
        <h2 className="font-semibold">Pipeline snapshot</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {Object.entries(stats?.applications?.byStatus ?? {}).map(([status, count]) => (
            <div key={status} className="rounded-lg bg-white/5 px-4 py-2 text-sm capitalize">
              {status}: <span className="font-semibold text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
