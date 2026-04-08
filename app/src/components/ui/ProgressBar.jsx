import { clsx } from 'clsx';

const colorMap = {
  sage: 'bg-accent-sage',
  amber: 'bg-accent-amber',
  rose: 'bg-accent-rose',
  slate: 'bg-accent-slate',
  cream: 'bg-accent-cream',
};

export default function ProgressBar({ value = 0, max = 100, color = 'sage', className, showLabel = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={clsx('w-full', className)}>
      <div className="w-full h-2 bg-bg-input rounded-none overflow-hidden">
        <div
          className={clsx('h-full rounded-none transition-all duration-700 ease-out', colorMap[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-text-secondary mt-1 inline-block">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
