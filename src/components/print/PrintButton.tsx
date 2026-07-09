import { usePrint } from '../../hooks/usePrint';
import type { PrintData, PrintOptions } from '../../types/print.types';

interface PrintButtonProps {
  data: PrintData;
  options?: PrintOptions;
  variant?: 'primary' | 'secondary' | 'ghost';
  children?: React.ReactNode;
  className?: string;
}

export default function PrintButton({
  data,
  options,
  variant = 'primary',
  children = '🖨️ Imprimir',
  className = '',
}: PrintButtonProps) {
  const { print, loading, error } = usePrint();

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary:
      'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  async function handlePrint() {
    const job = await print(data, { autoDownload: true, ...options });
    if (job) {
      console.log('✅ Impresión exitosa:', job.id);
    }
  }

  async function handlePreview() {
    const html = await import('../../services/print/print.service').then(
      (m) => m.printService.preview(data),
    );
    const w = window.open('', '_blank', 'width=400,height=700');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <div className="flex gap-2">
        <button
          onClick={handlePrint}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 ${variants[variant]} ${className}`}
        >
          {loading ? '⏳ Imprimiendo...' : children}
        </button>
        <button
          onClick={handlePreview}
          className="px-3 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
          title="Vista previa"
        >
          👁️
        </button>
      </div>
      {error && <p className="text-xs text-red-600">⚠️ {error}</p>}
    </div>
  );
}
