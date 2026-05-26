import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function ProjectsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api('/api/projects'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Projects</h1>
      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-slate-500">Loading…</p>}
        {(data?.projects ?? []).map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-card)] p-4"
          >
            <div className="flex justify-between">
              <h3 className="font-semibold">{p.name}</h3>
              <span className="text-xs capitalize text-indigo-400">{p.status}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{p.clients?.name}</p>
            {p.deadline && (
              <p className="mt-2 text-xs text-slate-500">
                Due {new Date(p.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
