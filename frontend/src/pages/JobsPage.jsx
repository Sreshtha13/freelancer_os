import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, RefreshCw, Link2 } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { ProposalModal } from '../components/jobs/ProposalModal';

export function JobsPage() {
  const qc = useQueryClient();
  const [selectedJob, setSelectedJob] = useState(null);
  const [importUrl, setImportUrl] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api('/api/jobs'),
  });

  const sync = useMutation({
    mutationFn: () => api('/api/jobs/sync', { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });

  const importJob = useMutation({
    mutationFn: (url) =>
      api('/api/jobs/import', { method: 'POST', body: JSON.stringify({ url }) }),
    onSuccess: () => {
      setImportUrl('');
      qc.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const saveApplication = useMutation({
    mutationFn: (jobId) =>
      api('/api/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId, status: 'saved' }),
      }),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-slate-500">Public APIs & manual imports only</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => sync.mutate()} disabled={sync.isPending}>
            <RefreshCw size={16} className={sync.isPending ? 'animate-spin' : ''} />
            Sync jobs
          </Button>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <input
          type="url"
          placeholder="Paste job URL to import…"
          value={importUrl}
          onChange={(e) => setImportUrl(e.target.value)}
          className="flex-1 rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-4 py-2 text-sm"
        />
        <Button
          variant="secondary"
          onClick={() => importJob.mutate(importUrl)}
          disabled={!importUrl || importJob.isPending}
        >
          <Link2 size={16} />
          Import
        </Button>
      </div>

      {isLoading ? (
        <p className="mt-8 text-slate-500">Loading jobs…</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--color-surface-border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface)] text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.jobs ?? []).map((job) => (
                <tr key={job.id} className="border-t border-[var(--color-surface-border)]">
                  <td className="px-4 py-3 font-medium">{job.title}</td>
                  <td className="px-4 py-3 capitalize text-slate-400">{job.source}</td>
                  <td className="px-4 py-3 text-slate-400">{job.budget || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => saveApplication.mutate(job.id)}>
                        Save
                      </Button>
                      <Button onClick={() => setSelectedJob(job)}>
                        <Sparkles size={14} />
                        Proposal
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.jobs?.length && (
            <p className="p-8 text-center text-slate-500">
              No jobs yet. Click Sync or import a URL.
            </p>
          )}
        </div>
      )}

      <ProposalModal
        job={selectedJob}
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
