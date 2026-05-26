import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const statusColors = {
  draft: 'text-slate-400',
  pending: 'text-amber-400',
  paid: 'text-emerald-400',
  overdue: 'text-red-400',
};

export function InvoicesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api('/api/invoices'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Invoices</h1>
      <div className="mt-8 overflow-hidden rounded-xl border border-[var(--color-surface-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)] text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {(data?.invoices ?? []).map((inv) => (
              <tr key={inv.id} className="border-t border-[var(--color-surface-border)]">
                <td className="px-4 py-3">{inv.invoice_number}</td>
                <td className="px-4 py-3">{inv.clients?.name}</td>
                <td className="px-4 py-3">
                  {inv.currency} {Number(inv.total).toFixed(2)}
                </td>
                <td className={`px-4 py-3 capitalize ${statusColors[inv.status]}`}>
                  {inv.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
