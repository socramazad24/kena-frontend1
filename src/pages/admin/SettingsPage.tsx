import { useState, useEffect, type FormEvent } from 'react';
import settingsService from '../../services/settings.service';
import type { Setting } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SettingsPage() {
  const [, setSettings] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    systemName: '',
    roundDurationSeconds: 240,
    minNumbersPerBet: 1,
    maxNumbersPerBet: 10,
    defaultBetValue: 500,
    allowedBetValues: '500,1000,2000,5000',
    initialJackpot: 10000,
    jackpotIncrementPercent: 5,
    receiptHeader: '',
    receiptFooter: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setFormData({
        systemName: data.systemName,
        roundDurationSeconds: data.roundDurationSeconds,
        minNumbersPerBet: data.minNumbersPerBet,
        maxNumbersPerBet: data.maxNumbersPerBet,
        defaultBetValue: Number(data.defaultBetValue),
        allowedBetValues: Array.isArray(data.allowedBetValues)
          ? data.allowedBetValues.join(',')
          : data.allowedBetValues,
        initialJackpot: Number(data.initialJackpot),
        jackpotIncrementPercent: Number(data.jackpotIncrementPercent),
        receiptHeader: data.receiptHeader || '',
        receiptFooter: data.receiptFooter || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        ...formData,
        allowedBetValues: formData.allowedBetValues
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v !== ''),
      };
      await settingsService.update(payload);
      setMessage('✅ Configuración guardada correctamente');
      await loadSettings();
    } catch (err: any) {
      setMessage(
        '❌ ' + (err.response?.data?.message || 'Error al guardar'),
      );
    } finally {
      setSaving(false);
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-800">Configuración</h1>
        <p className="text-gray-500 mt-1">
          Configuración general del sistema
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="General">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del sistema"
              value={formData.systemName}
              onChange={(e) =>
                setFormData({ ...formData, systemName: e.target.value })
              }
              required
            />
          </div>
        </Card>

        <Card title="Configuración del Juego">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Duración de la ronda (segundos)"
              type="number"
              value={formData.roundDurationSeconds}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  roundDurationSeconds: Number(e.target.value),
                })
              }
              required
              min="60"
              helperText="Mínimo 60 segundos"
            />
            <Input
              label="Jackpot inicial"
              type="number"
              value={formData.initialJackpot}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  initialJackpot: Number(e.target.value),
                })
              }
              required
              min="0"
            />
            <Input
              label="Incremento del jackpot (%)"
              type="number"
              value={formData.jackpotIncrementPercent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jackpotIncrementPercent: Number(e.target.value),
                })
              }
              required
              min="0"
              step="0.1"
            />
            <Input
              label="Mínimo de números por apuesta"
              type="number"
              value={formData.minNumbersPerBet}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minNumbersPerBet: Number(e.target.value),
                })
              }
              required
              min="1"
            />
            <Input
              label="Máximo de números por apuesta"
              type="number"
              value={formData.maxNumbersPerBet}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxNumbersPerBet: Number(e.target.value),
                })
              }
              required
              min="1"
            />
            <Input
              label="Valor por defecto de apuesta"
              type="number"
              value={formData.defaultBetValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultBetValue: Number(e.target.value),
                })
              }
              required
              min="0"
            />
          </div>
          <div className="mt-4">
            <Input
              label="Valores permitidos de apuesta (separados por coma)"
              value={formData.allowedBetValues}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allowedBetValues: e.target.value,
                })
              }
              required
              helperText="Ejemplo: 500,1000,2000,5000"
            />
          </div>
        </Card>

        <Card title="Ticket / Recibo">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encabezado del ticket
              </label>
              <textarea
                value={formData.receiptHeader}
                onChange={(e) =>
                  setFormData({ ...formData, receiptHeader: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Texto que aparece arriba del ticket"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pie del ticket
              </label>
              <textarea
                value={formData.receiptFooter}
                onChange={(e) =>
                  setFormData({ ...formData, receiptFooter: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Texto que aparece al final del ticket"
              />
            </div>
          </div>
        </Card>

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
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </form>
    </div>
  );
}
