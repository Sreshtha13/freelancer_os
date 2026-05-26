import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { KanbanBoard } from '../components/applications/KanbanBoard';
import { Button } from '../components/ui/Button';

export function ApplicationsPage() {
  const [view, setView] = useState('kanban');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => api('/api/applications'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) =>
      api(`/api/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });

  const applications = data?.applications ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-slate-500">Track your job pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === 'kanban' ? 'primary' : 'secondary'} onClick={() => setView('kanban')}>
            Kanban
          </Button>
          <Button variant={view === 'table' ? 'primary' : 'secondary'} onClick={() => setView('table')}>
            Table
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-8 text-slate-500">Loading…</p>
      ) : view === 'kanban' ? (
        <div className="mt-8">
          <KanbanBoard
            applications={applications}
            onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--color-surface-border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface)] text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-t border-[var(--color-surface-border)]">
                  <td className="px-4 py-3">{app.jobs?.title}</td>
                  <td className="px-4 py-3 capitalize">{app.status}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {app.follow_up_at ? new Date(app.follow_up_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
