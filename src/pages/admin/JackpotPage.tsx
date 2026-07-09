import { useState, useEffect, type FormEvent } from 'react';
import jackpotService, { type Jackpot, type JackpotHistoryEntry } from '../../services/jackpot.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validators } from '../../utils/validators';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

export default function JackpotPage() {
  const [jackpot, setJackpot] = useState<Jackpot | null>(null);
  const [history, setHistory] = useState<JackpotHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const form = useFormValidation(
    {
      baseAmount: '0',
      incrementPercent: '5',
      winningNumbersCount: '3',
    },
    {
      baseAmount: { required: true, custom: validators.decimal },
      incrementPercent: { required: true, custom: validators.decimal },
      winningNumbersCount: { required: true, custom: validators.onlyNumbers },
    },
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [jackpotData, historyData] = await Promise.all([
        jackpotService.getCurrent(),
        jackpotService.getHistory(50),
      ]);
      setJackpot(jackpotData);
      setHistory(historyData);
      form.setValues({
        baseAmount: String(jackpotData.baseAmount),
        incrementPercent: String(jackpotData.incrementPercent),
        winningNumbersCount: String(jackpotData.winningNumbersCount),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.validateAll()) return;
    setSaving(true);
    setMessage('');
    try {
      await jackpotService.updateConfig({
        baseAmount: Number(form.values.baseAmount),
        incrementPercent: Number(form.values.incrementPercent),
        winningNumbersCount: Number(form.values.winningNumbersCount),
      });
      setMessage('✅ Configuración guardada');
      await loadData();
    } catch (err: any) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  }

  const movementVariants: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
    increment: 'success',
    won: 'danger',
    reset: 'warning',
    manual: 'info',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Jackpot</h1>
        <p className="text-gray-500 mt-1">
          Configuración y seguimiento del jackpot acumulativo
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500">💎 Jackpot Actual</p>
          <p className="text-4xl font-bold text-yellow-600 mt-1">
            ${Number(jackpot?.currentAmount || 0).toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Monto Base</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            ${Number(jackpot?.baseAmount || 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Se resetea a este valor</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Incremento por ronda</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {Number(jackpot?.incrementPercent || 0).toFixed(2)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">de las ventas</p>
        </Card>
      </div>

      {/* Configuración */}
      <Card title="Configuración" className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Monto base"
              type="number"
              value={form.values.baseAmount}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur('baseAmount')}
              error={
                form.touched.baseAmount ? form.errors.baseAmount : undefined
              }
              required
              min="0"
              step="0.01"
            />
            <Input
              label="% Incremento por ronda"
              type="number"
              value={form.values.incrementPercent}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur('incrementPercent')}
              error={
                form.touched.incrementPercent
                  ? form.errors.incrementPercent
                  : undefined
              }
              required
              min="0"
              step="0.1"
            />
            <Input
              label="Números ganadores por sorteo"
              type="number"
              value={form.values.winningNumbersCount}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur('winningNumbersCount')}
              error={
                form.touched.winningNumbersCount
                  ? form.errors.winningNumbersCount
                  : undefined
              }
              required
              min="1"
              max="10"
            />
          </div>

          {message && (
            <div
              className={`px-4 py-3 rounded-lg text-sm ${
                message.startsWith('✅')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Historial */}
      <Card title="Historial de Movimientos">
        <Table
          headers={['Fecha', 'Tipo', 'Monto', 'Anterior', 'Nuevo', 'Descripción']}
          loading={false}
        >
          {history.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(entry.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4">
                <Badge variant={movementVariants[entry.type]}>
                  {entry.type === 'increment' && '⬆️ Incremento'}
                  {entry.type === 'won' && '🏆 Ganado'}
                  {entry.type === 'reset' && '🔄 Reset'}
                  {entry.type === 'manual' && '✏️ Manual'}
                </Badge>
              </td>
              <td
                className={`px-6 py-4 text-sm font-bold ${
                  Number(entry.amount) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {Number(entry.amount) >= 0 ? '+' : ''}
                ${Number(entry.amount).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                ${Number(entry.previousAmount).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm font-bold text-gray-800">
                ${Number(entry.newAmount).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {entry.description}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
