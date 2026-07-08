import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import cashiersService from '../../services/cashiers.service';
import cashService from '../../services/cash.service';
import type { CashSession, Cashier, CashBalance } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validators } from '../../utils/validators';
import Badge from '../../components/ui/Badge';

function getDashboardPath(): string {
  return window.location.pathname.startsWith('/admin')
    ? '/admin/cashier'
    : '/cashier';
}

export default function CashPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [balance, setBalance] = useState<CashBalance | null>(null);
  const [myCashier, setMyCashier] = useState<Cashier | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const openForm = useFormValidation(
    { initialAmount: '1000' },
    {
      initialAmount: {
        required: true,
        custom: validators.decimal,
        message: 'Ingrese un monto válido',
      },
    },
  );

  const closeForm = useFormValidation(
    { finalAmount: '' },
    {
      finalAmount: {
        required: true,
        custom: validators.decimal,
        message: 'Ingrese un monto válido',
      },
    },
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const cashiers = await cashiersService.findAll();
      const mine = cashiers.find((c) => c.userId === user?.id);
      if (mine) {
        setMyCashier(mine);
        const session = await cashService.getMyActive();
        setActiveSession(session);
        if (session) {
          const bal = await cashService.getBalance(session.id);
          setBalance(bal);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  async function handleOpen(e: FormEvent) {
    e.preventDefault();
    if (!myCashier) return;
    if (!openForm.validateAll()) return;
    setSubmitting(true);
    setError('');
    try {
      await cashService.open({
        cashierId: myCashier.id,
        initialAmount: Number(openForm.values.initialAmount),
      });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al abrir caja');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClose(e: FormEvent) {
    e.preventDefault();
    if (!activeSession) return;
    if (!closeForm.validateAll()) return;
    if (!confirm('¿Estás seguro de cerrar la caja?')) return;
    setSubmitting(true);
    setError('');
    try {
      await cashService.close(activeSession.id, {
        finalAmount: Number(closeForm.values.finalAmount),
      });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cerrar caja');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!myCashier) {
    return (
      <div className="p-8">
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No tienes un perfil de cajero
            </h2>
            <p className="text-gray-600 mb-6">
              Contacta al administrador para que te asigne como cajero.
            </p>
            <Button onClick={() => navigate(getDashboardPath())}>
              ← Volver
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // CAJA ABIERTA - Mostrar balance y opción de cerrar
  if (activeSession && balance) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-800">
              Mi Caja
            </h1>
            <p className="text-gray-500 mt-1">
              Sesión abierta desde:{' '}
              {new Date(activeSession.openedAt).toLocaleString()}
            </p>
          </div>
          <Badge variant="success">● Abierta</Badge>
        </div>

        {/* Cards de balance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Saldo Inicial</p>
            <p className="text-2xl font-display font-bold text-gray-800 mt-1">
              ${balance.initial.toFixed(2)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Ventas</p>
            <p className="text-2xl font-display font-bold text-green-600 mt-1">
              +${balance.sales.toFixed(2)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Premios Pagados</p>
            <p className="text-2xl font-display font-bold text-red-600 mt-1">
              -${balance.prizes.toFixed(2)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Balance Actual</p>
            <p className="text-2xl font-display font-bold text-primary-600 mt-1">
              ${balance.current.toFixed(2)}
            </p>
          </Card>
        </div>

        {/* Cerrar caja */}
        <Card title="Cerrar Caja">
          <form onSubmit={handleClose} className="space-y-4 max-w-md">
            <Input
              label="Monto final en caja"
              name="finalAmount"
              type="number"
              value={closeForm.values.finalAmount}
              onChange={closeForm.handleChange}
              onBlur={() => closeForm.handleBlur('finalAmount')}
              error={
                closeForm.touched.finalAmount
                  ? closeForm.errors.finalAmount
                  : undefined
              }
              helperText={`Balance esperado: $${balance.current.toFixed(2)}`}
              required
              min="0"
              step="0.01"
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                ⚠️ {error}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="submit" variant="danger" disabled={submitting}>
                {submitting ? 'Cerrando...' : '🔒 Cerrar Caja'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(getDashboardPath())}
              >
                Volver
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // CAJA CERRADA - Mostrar opción de abrir
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Abrir Caja
        </h1>
        <p className="text-gray-500 mt-1">
          Ingresa el saldo inicial para comenzar a trabajar
        </p>
      </div>

      <div className="max-w-md">
        <Card>
          <form onSubmit={handleOpen} className="space-y-4">
            <Input
              label="Saldo inicial"
              name="initialAmount"
              type="number"
              value={openForm.values.initialAmount}
              onChange={openForm.handleChange}
              onBlur={() => openForm.handleBlur('initialAmount')}
              error={
                openForm.touched.initialAmount
                  ? openForm.errors.initialAmount
                  : undefined
              }
              required
              min="0"
              step="0.01"
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                ⚠️ {error}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Abriendo...' : '🔓 Abrir Caja'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(getDashboardPath())}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
