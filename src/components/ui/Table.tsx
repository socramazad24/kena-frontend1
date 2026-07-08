import type { ReactNode } from 'react';

interface TableProps {
  headers: string[];
  children: ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

export default function Table({
  headers,
  children,
  loading,
  emptyMessage = 'No hay datos para mostrar',
}: TableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {children}
        </tbody>
      </table>
      {Array.isArray(children) && children.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
