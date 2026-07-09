import { useState, useEffect } from 'react';
import { printService } from '../../services/print/print.service';
import { PrintAdapterFactory, type AdapterType } from '../../services/print/print-adapter.factory';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function PrintersPage() {
  const [history, setHistory] = useState(printService.getHistory());
  const [availableAdapters, setAvailableAdapters] = useState<AdapterType[]>([]);

  useEffect(() => {
    setHistory(printService.getHistory());
  }, []);

  async function checkAdapters() {
    const types = PrintAdapterFactory.getAvailableTypes();
    setAvailableAdapters(types);
  }

  useEffect(() => {
    checkAdapters();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Impresoras</h1>
        <p className="text-gray-500 mt-1">
          Configuración de impresoras del sistema
        </p>
      </div>

      {/* Adapters disponibles */}
      <Card title="Adaptadores de Impresión" className="mb-6">
        <div className="space-y-3">
          {PrintAdapterFactory.getAvailableTypes().map((type) => (
            <div
              key={type}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {type === 'pdf' ? '📄 Generador PDF' : '🖨️ Impresora Térmica'}
                </p>
                <p className="text-sm text-gray-500">
                  {type === 'pdf'
                    ? 'Genera un PDF descargable. Funciona en todos los navegadores.'
                    : 'Conexión directa con impresora física. Requiere configuración.'}
                </p>
              </div>
              <Badge variant={type === 'pdf' ? 'success' : 'warning'}>
                {type === 'pdf' ? 'Activo' : 'No configurado'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Historial */}
      <Card title="Historial de Impresiones">
        {history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No hay impresiones recientes
          </p>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 20).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{job.type}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(job.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={job.status === 'printed' ? 'success' : 'danger'}
                  >
                    {job.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => printService.reprint(job.id)}
                  >
                    🔄
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => printService.downloadPdf(job)}
                  >
                    📥
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
