interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand';
  size?: 'sm' | 'md';
}

export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
}: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    danger: 'bg-rose-50 text-rose-700 ring-rose-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    info: 'bg-sky-50 text-sky-700 ring-sky-200',
    brand: 'bg-brand-50 text-brand-700 ring-brand-200',
    neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md ring-1 ring-inset ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}
