import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';

export function ProfilePage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['profile'], queryFn: () => api('/api/profile') });
  const [form, setForm] = useState({});

  useEffect(() => {
    if (data?.profile) {
      setForm({
        display_name: data.profile.display_name || '',
        bio: data.profile.bio || '',
        skills: (data.profile.skills || []).join(', '),
        experience_level: data.profile.experience_level || 'mid',
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      api('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-slate-500">Used by AI to personalize proposals</p>
      <div className="mt-8 space-y-4">
        <input
          placeholder="Display name"
          value={form.display_name || ''}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          className="w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-4 py-3"
        />
        <select
          value={form.experience_level || 'mid'}
          onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
          className="w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-4 py-3"
        >
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
        </select>
        <input
          placeholder="Skills (comma-separated)"
          value={form.skills || ''}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          className="w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-4 py-3"
        />
        <textarea
          placeholder="Bio (100+ chars recommended for AI)"
          value={form.bio || ''}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={5}
          className="w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-4 py-3"
        />
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </div>
  );
}
