import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Copy, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function ProposalModal({ job, open, onClose }) {
  const [proposal, setProposal] = useState(null);
  const [tone, setTone] = useState('friendly');
  const [length, setLength] = useState('medium');
  const [copied, setCopied] = useState(false);

  const generate = useMutation({
    mutationFn: () =>
      api('/api/proposals/generate', {
        method: 'POST',
        body: JSON.stringify({ jobId: job.id, tone, length }),
      }),
    onSuccess: (data) => setProposal(data.proposal),
  });

  const copyProposal = async () => {
    if (!proposal?.content) return;
    await navigator.clipboard.writeText(proposal.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyNow = () => {
    if (job?.url) window.open(job.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal open={open} onClose={onClose} title={`Proposal — ${job?.title}`}>
      <div className="mb-4 flex gap-4">
        <label className="text-sm text-slate-400">
          Tone
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2"
          >
            <option value="formal">Formal</option>
            <option value="friendly">Friendly</option>
            <option value="confident">Confident</option>
          </select>
        </label>
        <label className="text-sm text-slate-400">
          Length
          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-[var(--color-surface-border)] bg-black/30 px-3 py-2"
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </label>
      </div>

      <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
        {generate.isPending ? 'Generating…' : 'Generate with AI'}
      </Button>

      {generate.error && (
        <p className="mt-3 text-sm text-red-400">{generate.error.message}</p>
      )}

      {proposal?.content && (
        <div className="mt-6">
          <textarea
            readOnly
            value={proposal.content}
            className="h-64 w-full resize-none rounded-lg border border-[var(--color-surface-border)] bg-black/20 p-4 text-sm leading-relaxed text-slate-200"
          />
          <div className="mt-4 flex gap-3">
            <Button onClick={copyProposal}>
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy proposal'}
            </Button>
            <Button variant="secondary" onClick={applyNow}>
              <ExternalLink size={16} />
              Apply now (open job)
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Apply Assistant: copy your proposal, then paste on the job site manually. No auto-apply.
          </p>
        </div>
      )}
    </Modal>
  );
}
