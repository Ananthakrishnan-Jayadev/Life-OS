import { clsx } from 'clsx';

const colorMap = {
  sage: 'bg-accent-sage/20 text-accent-sage',
  amber: 'bg-accent-amber/20 text-accent-amber',
  rose: 'bg-accent-rose/20 text-accent-rose',
  slate: 'bg-accent-slate/20 text-accent-slate',
  cream: 'bg-accent-cream/20 text-accent-cream',
  default: 'bg-bg-tertiary text-text-secondary',
};

export default function Badge({ children, color = 'default', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded-none',
        colorMap[color] || colorMap.default,
        className
      )}
    >
      {children}
    </span>
  );
}
