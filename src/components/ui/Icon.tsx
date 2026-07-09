import type { ReactNode } from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

// Usaremos emojis estilizados como iconos (sin dependencias externas)
const icons: Record<string, string> = {
  dashboard: '📊',
  branch: '🏢',
  user: '👤',
  cashier: '💼',
  settings: '⚙️',
  prize: '🏆',
  jackpot: '💎',
  report: '📈',
  ticket: '🎫',
  money: '💰',
  search: '🔍',
  play: '▶️',
  plus: '➕',
  edit: '✏️',
  trash: '🗑️',
  check: '✓',
  cross: '✕',
  arrow: '→',
  sun: '☀️',
  moon: '🌙',
  download: '⬇️',
  filter: '🔽',
  sort: '↕️',
  tv: '📺',
  home: '🏠',
  logout: '🚪',
  warning: '⚠️',
  info: 'ℹ️',
  refresh: '🔄',
  eye: '👁️',
  dollar: '💵',
  trend: '📈',
  calendar: '📅',
  box: '📦',
  star: '⭐',
  fire: '🔥',
  bell: '🔔',
  chart: '📉',
};

export default function Icon({
  name,
  size = 20,
  className = '',
}: IconProps) {
  const emoji = icons[name] || '•';
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      {emoji}
    </span>
  );
}

export function IconText({
  name,
  children,
  size = 16,
}: {
  name: string;
  children: ReactNode;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon name={name} size={size} />
      {children}
    </span>
  );
}
