import Icon from './Icon';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { value: number; positive: boolean };
  icon?: string;
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
  format?: 'currency' | 'number' | 'percent' | 'none';
}

const colorMap = {
  brand: 'bg-brand-50 text-brand-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-rose-50 text-rose-600',
  info: 'bg-sky-50 text-sky-600',
};

export default function StatCard({
  label,
  value,
  hint,
  trend,
  icon,
  color = 'brand',
  format = 'none',
}: StatCardProps) {
  const displayValue =
    format === 'currency' && typeof value === 'number'
      ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : typeof value === 'number' && format === 'number'
        ? value.toLocaleString('en-US')
        : value;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900 tabular-nums">
            {displayValue}
          </p>
          {(hint || trend) && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {trend && (
                <span
                  className={`inline-flex items-center font-medium ${
                    trend.positive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
              {hint && <span className="text-slate-500">{hint}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}
          >
            <Icon name={icon} size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
