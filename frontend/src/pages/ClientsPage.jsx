import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';

export function ClientsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api('/api/clients'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Clients</h1>
      <p className="mt-1 text-slate-500">Manage client relationships</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-slate-500">Loading…</p>}
        {(data?.clients ?? []).map((client) => (
          <Card key={client.id}>
            <h3 className="font-semibold">{client.name}</h3>
            {client.company && <p className="text-sm text-slate-400">{client.company}</p>}
            {client.email && <p className="mt-2 text-sm text-indigo-300">{client.email}</p>}
          </Card>
        ))}
        {!isLoading && !data?.clients?.length && (
          <p className="col-span-full text-slate-500">No clients yet. Create via API or add UI form.</p>
        )}
      </div>
    </div>
  );
}
