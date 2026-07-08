import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  padding?: boolean;
}

export default function Card({
  children,
  className = '',
  title,
  action,
  padding = true,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}
    >
      {(title || action) && (
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          {title && (
            <h3 className="text-lg font-bold text-gray-800 font-display">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
    </div>
  );
}
