import { useState, useEffect, type FormEvent } from 'react';
import branchesService from '../../services/branches.service';
import type { Branch } from '../../types';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validators } from '../../utils/validators';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

interface FormData {
  code: string;
  name: string;
  address: string;
  phone: string;
  [key: string]: string;
}

const emptyForm: FormData = { code: '', name: '', address: '', phone: '' };

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const form = useFormValidation<FormData>(emptyForm, {
    code: { required: true, minLength: 2, maxLength: 10 },
    name: { required: true, minLength: 3, custom: validators.onlyLetters },
    address: { maxLength: 100 },
    phone: { custom: validators.phone },
  });

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    try {
      setLoading(true);
      const data = await branchesService.findAll();
      setBranches(data);
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

  function openEdit(branch: Branch) {
    form.setValues({
      code: branch.code,
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
    });
    setEditingId(branch.id);
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.validateAll()) return;
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await branchesService.update(editingId, form.values);
      } else {
        await branchesService.create(form.values);
      }
      setModalOpen(false);
      form.resetForm();
      await loadBranches();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la sucursal');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string) {
    if (!confirm('¿Cambiar el estado de esta sucursal?')) return;
    try {
      await branchesService.toggleActive(id);
      await loadBranches();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta sucursal? Esta acción no se puede deshacer.'))
      return;
    try {
      await branchesService.remove(id);
      await loadBranches();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sucursales</h1>
          <p className="text-gray-500 mt-1">
            Gestiona las ubicaciones del sistema
          </p>
        </div>
        <Button onClick={openCreate}>+ Nueva Sucursal</Button>
      </div>

      <Card>
        <Table
          headers={['Código', 'Nombre', 'Dirección', 'Teléfono', 'Estado', 'Acciones']}
          loading={loading}
          emptyMessage="No hay sucursales registradas"
        >
          {branches.map((branch) => (
            <tr key={branch.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">
                {branch.code}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {branch.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {branch.address || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {branch.phone || '-'}
              </td>
              <td className="px-6 py-4">
                <Badge variant={branch.isActive ? 'success' : 'neutral'}>
                  {branch.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(branch)}
                  >
                    ✏️ Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(branch.id)}
                  >
                    {branch.isActive ? '🔴' : '🟢'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(branch.id)}
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
        title={editingId ? 'Editar Sucursal' : 'Nueva Sucursal'}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button form="branch-form" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form
          id="branch-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Input
            label="Código"
            name="code"
            value={form.values.code}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur('code')}
            error={form.touched.code ? form.errors.code : undefined}
            restriction="alphanumeric"
            transform="uppercase"
            required
            placeholder="Ej: SUC001"
          />
          <Input
            label="Nombre"
            name="name"
            value={form.values.name}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur('name')}
            error={form.touched.name ? form.errors.name : undefined}
            restriction="letters"
            required
            placeholder="Sucursal Principal"
          />
          <Input
            label="Dirección"
            name="address"
            value={form.values.address}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur('address')}
            error={form.touched.address ? form.errors.address : undefined}
            placeholder="Av. Principal #123"
          />
          <Input
            label="Teléfono"
            name="phone"
            value={form.values.phone}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur('phone')}
            error={form.touched.phone ? form.errors.phone : undefined}
            placeholder="555-1234"
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
