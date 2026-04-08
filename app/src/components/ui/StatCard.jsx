import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

export default function StatCard({ label, value, trend, trendValue, prefix = '', suffix = '', className }) {
  const animatedValue = useAnimatedNumber(typeof value === 'number' ? value : 0);
  const displayValue = typeof value === 'number' ? animatedValue : value;

  return (
    <div className={clsx('bg-bg-secondary border border-border rounded-none p-4', className)}>
      <p className="text-xs text-text-tertiary uppercase tracking-wider font-body mb-1">{label}</p>
      <p className="text-2xl font-mono font-semibold text-text-primary">
        {prefix}{typeof value === 'number' ? displayValue.toLocaleString() : displayValue}{suffix}
      </p>
      {trend !== undefined && (
        <div className={clsx('flex items-center gap-1 mt-1 text-xs font-mono',
          trend === 'up' ? 'text-accent-sage' : trend === 'down' ? 'text-accent-rose' : 'text-text-tertiary'
        )}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
           trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
           <Minus className="w-3 h-3" />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
