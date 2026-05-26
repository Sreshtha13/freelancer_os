import clsx from 'clsx';

const COLUMNS = [
  { id: 'saved', label: 'Saved', color: 'border-slate-500' },
  { id: 'applied', label: 'Applied', color: 'border-blue-500' },
  { id: 'interview', label: 'Interview', color: 'border-amber-500' },
  { id: 'won', label: 'Won', color: 'border-emerald-500' },
  { id: 'lost', label: 'Lost', color: 'border-red-500' },
];

export function KanbanBoard({ applications, onStatusChange }) {
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = applications.filter((a) => a.status === col.id);
    return acc;
  }, {});

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => (
        <div
          key={col.id}
          className="min-w-[240px] flex-1 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)]"
        >
          <div className={clsx('border-t-4 px-4 py-3 rounded-t-xl', col.color)}>
            <h3 className="font-medium text-sm">
              {col.label}
              <span className="ml-2 text-slate-500">({grouped[col.id]?.length || 0})</span>
            </h3>
          </div>
          <div className="space-y-2 p-3 min-h-[200px]">
            {grouped[col.id]?.map((app) => (
              <div
                key={app.id}
                className="rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-card)] p-3"
              >
                <p className="font-medium text-sm line-clamp-2">{app.jobs?.title}</p>
                <p className="mt-1 text-xs text-slate-500">{app.jobs?.source}</p>
                <select
                  value={app.status}
                  onChange={(e) => onStatusChange(app.id, e.target.value)}
                  className="mt-2 w-full rounded border border-[var(--color-surface-border)] bg-black/30 px-2 py-1 text-xs"
                >
                  {COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
