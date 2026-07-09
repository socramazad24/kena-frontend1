import { useState, useEffect, type FormEvent } from 'react';
import cashiersService from '../../services/cashiers.service';
import branchesService from '../../services/branches.service';
import type { Cashier, Branch } from '../../types';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validators, errorMessages } from '../../utils/validators';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

interface FormData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  branchId: string;
  initialBalance: string;
}

const emptyForm: FormData = {
  username: '',
  email: '',
  fullName: '',
  password: '',
  branchId: '',
  initialBalance: '0',
};

export default function CashiersPage() {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const form = useFormValidation<FormData>(emptyForm, {
    username: {
      required: true,
      custom: validators.username,
      message: errorMessages.username,
    },
    email: {
      required: true,
      custom: validators.email,
      message: errorMessages.email,
    },
    fullName: {
      required: true,
      minLength: 3,
      maxLength: 60,
      custom: validators.onlyLetters,
      message: errorMessages.onlyLetters,
    },
    password: {
      required: true,
      minLength: 6,
      message: errorMessages.passwordMin,
    },
    branchId: {
      required: true,
      message: 'Selecciona una sucursal',
    },
    initialBalance: {
      required: true,
      custom: validators.decimal,
      message: errorMessages.decimal,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [cashiersData, branchesData] = await Promise.all([
        cashiersService.findAll(),
        branchesService.findActive(),
      ]);
      setCashiers(cashiersData);
      setBranches(branchesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    form.resetForm();
    setEditingId(null);
    setSubmitError('');
    setModalOpen(true);
  }

  function openEdit(cashier: Cashier) {
    form.setValues({
      username: cashier.user.username,
      email: cashier.user.email,
      fullName: cashier.user.fullName,
      password: '',
      branchId: cashier.branchId,
      initialBalance: String(cashier.initialBalance),
    });
    setEditingId(cashier.id);
    setSubmitError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError('');

    if (!form.validateAll()) return;

    setSaving(true);
    try {
      if (editingId) {
        await cashiersService.update(editingId, {
          branchId: form.values.branchId,
          initialBalance: Number(form.values.initialBalance),
        });
      } else {
        await cashiersService.create({
          username: form.values.username,
          email: form.values.email,
          fullName: form.values.fullName,
          password: form.values.password,
          branchId: form.values.branchId,
          initialBalance: Number(form.values.initialBalance),
        });
      }
      setModalOpen(false);
      form.resetForm();
      await loadData();
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || 'Error al guardar el cajero',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string) {
    if (!confirm('¿Cambiar el estado de este cajero?')) return;
    try {
      await cashiersService.toggleActive(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cajeros</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los cajeros del sistema
          </p>
        </div>
        <Button onClick={openCreate}>+ Nuevo Cajero</Button>
      </div>

      <Card>
        <Table
          headers={[
            'Usuario',
            'Nombre',
            'Email',
            'Sucursal',
            'Saldo Inicial',
            'Estado',
            'Acciones',
          ]}
          loading={loading}
          emptyMessage="No hay cajeros registrados. Crea el primero con el botón + Nuevo Cajero"
        >
          {cashiers.map((cashier) => (
            <tr key={cashier.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-mono text-gray-800">
                @{cashier.user.username}
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                {cashier.user.fullName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {cashier.user.email}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {cashier.branch.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                ${Number(cashier.initialBalance).toFixed(2)}
              </td>
              <td className="px-6 py-4">
                <Badge variant={cashier.isActive ? 'success' : 'neutral'}>
                  {cashier.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(cashier)}
                  >
                    ✏️ Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(cashier.id)}
                  >
                    {cashier.isActive ? '🔴 Desactivar' : '🟢 Activar'}
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
        title={editingId ? 'Editar Cajero' : 'Nuevo Cajero'}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button form="cashier-form" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="cashier-form" onSubmit={handleSubmit} className="space-y-4">
          {!editingId && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Usuario"
                  name="username"
                  value={form.values.username}
                  onChange={form.handleChange}
                  onBlur={() => form.handleBlur('username')}
                  error={
                    form.touched.username ? form.errors.username : undefined
                  }
                  restriction="alphanumeric"
                  transform="lowercase"
                  required
                  placeholder="cajero1"
                  helperText="Solo letras, números y guión bajo"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.values.email}
                  onChange={form.handleChange}
                  onBlur={() => form.handleBlur('email')}
                  error={form.touched.email ? form.errors.email : undefined}
                  required
                  placeholder="cajero@ejemplo.com"
                />
              </div>
              <Input
                label="Nombre completo"
                name="fullName"
                value={form.values.fullName}
                onChange={form.handleChange}
                onBlur={() => form.handleBlur('fullName')}
                error={
                  form.touched.fullName ? form.errors.fullName : undefined
                }
                restriction="letters"
                required
                placeholder="Juan Pérez"
              />
              <Input
                label="Contraseña"
                name="password"
                type="password"
                value={form.values.password}
                onChange={form.handleChange}
                onBlur={() => form.handleBlur('password')}
                error={
                  form.touched.password ? form.errors.password : undefined
                }
                required
                minLength={6}
                helperText="Mínimo 6 caracteres"
              />
            </>
          )}

          <Select
            label="Sucursal"
            name="branchId"
            value={form.values.branchId}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur('branchId')}
            error={form.touched.branchId ? form.errors.branchId : undefined}
            required
          >
            <option value="">Seleccionar sucursal</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} - {b.name}
              </option>
            ))}
          </Select>

          <Input
            label="Saldo inicial"
            name="initialBalance"
            type="number"
            value={form.values.initialBalance}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur('initialBalance')}
            error={
              form.touched.initialBalance
                ? form.errors.initialBalance
                : undefined
            }
            required
            min="0"
            step="0.01"
            helperText="Saldo con el que inicia la caja"
          />

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ {submitError}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
