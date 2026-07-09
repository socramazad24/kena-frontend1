import { useState, useEffect, type FormEvent } from 'react';
import prizesService, { type PrizeRule } from '../../services/prizes.service';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validators } from '../../utils/validators';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

interface FormData {
  name: string;
  numbersPlayed: string;
  hitsRequired: string;
  prizeType: 'multiplier' | 'fixed' | 'jackpot';
  multiplier: string;
  fixedAmount: string;
  priority: string;
}

const emptyForm: FormData = {
  name: '',
  numbersPlayed: '1',
  hitsRequired: '1',
  prizeType: 'multiplier',
  multiplier: '3',
  fixedAmount: '0',
  priority: '0',
};

export default function PrizesPage() {
  const [rules, setRules] = useState<PrizeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const form = useFormValidation<FormData>(emptyForm, {
    name: {
      required: true,
      minLength: 3,
      maxLength: 60,
      custom: validators.onlyLetters,
      message: 'Solo letras (3-60 caracteres)',
    },
    numbersPlayed: {
      required: true,
      custom: validators.onlyNumbers,
      message: 'Solo números',
    },
    hitsRequired: {
      required: true,
      custom: validators.onlyNumbers,
      message: 'Solo números',
    },
    multiplier: {
      custom: validators.decimal,
      message: 'Número inválido',
    },
    fixedAmount: {
      custom: validators.decimal,
      message: 'Número inválido',
    },
  });

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      setLoading(true);
      const data = await prizesService.findAll();
      setRules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    form.resetForm();
    setEditingId(null);
    setError('');
    setModalOpen(true);
  }

  function openEdit(rule: PrizeRule) {
    form.setValues({
      name: rule.name,
      numbersPlayed: String(rule.numbersPlayed),
      hitsRequired: String(rule.hitsRequired),
      prizeType: rule.prizeType,
      multiplier: String(rule.multiplier),
      fixedAmount: String(rule.fixedAmount),
      priority: String(rule.priority),
    });
    setEditingId(rule.id);
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.validateAll()) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.values.name,
        numbersPlayed: Number(form.values.numbersPlayed),
        hitsRequired: Number(form.values.hitsRequired),
        prizeType: form.values.prizeType,
        multiplier: Number(form.values.multiplier) || 0,
        fixedAmount: Number(form.values.fixedAmount) || 0,
        priority: Number(form.values.priority) || 0,
      };
      if (editingId) {
        await prizesService.update(editingId, payload);
      } else {
        await prizesService.create(payload);
      }
      setModalOpen(false);
      form.resetForm();
      await loadRules();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta regla?')) return;
    try {
      await prizesService.remove(id);
      await loadRules();
    } catch (err) {
      console.error(err);
    }
  }

  const prizeTypeLabels: Record<string, string> = {
    multiplier: 'Multiplicador',
    fixed: 'Monto Fijo',
    jackpot: 'Jackpot',
  };

  const prizeTypeVariants: Record<string, 'info' | 'success' | 'warning'> = {
    multiplier: 'info',
    fixed: 'success',
    jackpot: 'warning',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Reglas de Premios
          </h1>
          <p className="text-gray-500 mt-1">
            Configura cómo se calculan los premios
          </p>
        </div>
        <Button onClick={openCreate}>+ Nueva Regla</Button>
      </div>

      <Card>
        <Table
          headers={['Nombre', 'Números', 'Aciertos', 'Tipo', 'Valor', 'Prioridad', 'Acciones']}
          loading={loading}
        >
          {rules.map((rule) => (
            <tr key={rule.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">
                {rule.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {rule.numbersPlayed}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {rule.hitsRequired}
              </td>
              <td className="px-6 py-4">
                <Badge variant={prizeTypeVariants[rule.prizeType]}>
                  {prizeTypeLabels[rule.prizeType]}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                {rule.prizeType === 'multiplier' &&
                  `${rule.multiplier}x`}
                {rule.prizeType === 'fixed' &&
                  `$${Number(rule.fixedAmount).toFixed(2)}`}
                {rule.prizeType === 'jackpot' && '💎 Jackpot actual'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {rule.priority}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(rule)}>
                    ✏️
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(rule.id)}
                    className="text-red-600"
                  >
                    🗑️
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Regla' : 'Nueva Regla'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button form="prize-form" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="prize-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la regla"
            name="name"
            value={form.values.name}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur('name')}
            error={form.touched.name ? form.errors.name : undefined}
            restriction="letters"
            required
            placeholder="Ej: 1 número - 1 acierto"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Números jugados"
              name="numbersPlayed"
              type="number"
              value={form.values.numbersPlayed}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur('numbersPlayed')}
              error={
                form.touched.numbersPlayed
                  ? form.errors.numbersPlayed
                  : undefined
              }
              required
              min="1"
              max="10"
            />
            <Input
              label="Aciertos requeridos"
              name="hitsRequired"
              type="number"
              value={form.values.hitsRequired}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur('hitsRequired')}
              error={
                form.touched.hitsRequired
                  ? form.errors.hitsRequired
                  : undefined
              }
              required
              min="1"
              max="10"
            />
          </div>

          <Select
            label="Tipo de premio"
            name="prizeType"
            value={form.values.prizeType}
            onChange={form.handleChange}
            required
          >
            <option value="multiplier">Multiplicador (del valor apostado)</option>
            <option value="fixed">Monto Fijo</option>
            <option value="jackpot">Jackpot (gana todo el acumulado)</option>
          </Select>

          {form.values.prizeType === 'multiplier' && (
            <Input
              label="Multiplicador (ej: 3, 10, 50)"
              name="multiplier"
              type="number"
              value={form.values.multiplier}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur('multiplier')}
              error={
                form.touched.multiplier ? form.errors.multiplier : undefined
              }
              required
              min="0"
              step="0.1"
              helperText="Premio = valor apostado × multiplicador"
            />
          )}

          {form.values.prizeType === 'fixed' && (
            <Input
              label="Monto fijo del premio"
              name="fixedAmount"
              type="number"
              value={form.values.fixedAmount}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur('fixedAmount')}
              error={
                form.touched.fixedAmount ? form.errors.fixedAmount : undefined
              }
              required
              min="0"
              step="0.01"
            />
          )}

          <Input
            label="Prioridad (menor = más prioritario)"
            name="priority"
            type="number"
            value={form.values.priority}
            onChange={form.handleChange}
            min="0"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
