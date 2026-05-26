import clsx from 'clsx';

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  secondary: 'bg-white/5 hover:bg-white/10 text-slate-200 border border-[var(--color-surface-border)]',
  ghost: 'hover:bg-white/5 text-slate-300',
};

export function Button({ variant = 'primary', className, children, ...props }) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
