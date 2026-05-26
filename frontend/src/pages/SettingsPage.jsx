import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function SettingsPage() {
  const checkout = useMutation({
    mutationFn: () => api('/api/billing/checkout', { method: 'POST' }),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card className="mt-8">
        <h2 className="font-semibold">Billing</h2>
        <p className="mt-2 text-sm text-slate-500">
          Free: 5 AI proposals/month. Pro: unlimited proposals + priority sync.
        </p>
        <Button className="mt-4" onClick={() => checkout.mutate()} disabled={checkout.isPending}>
          Upgrade to Pro
        </Button>
        {checkout.error && (
          <p className="mt-2 text-sm text-red-400">{checkout.error.message}</p>
        )}
      </Card>
    </div>
  );
}
