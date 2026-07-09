import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import betsService from '../../services/bets.service';
import cashService from '../../services/cash.service';
import cashiersService from '../../services/cashiers.service';
import type { Ticket, Cashier, CashSession } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useFormValidation } from '../../hooks/useFormValidation';
import Badge from '../../components/ui/Badge';

function getBackPath(): string {
  return window.location.pathname.startsWith('/admin')
    ? '/admin/cashier'
    : '/cashier';
}

export default function PayPrizePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [myCashier, setMyCashier] = useState<Cashier | null>(null);
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [searching, setSearching] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const form = useFormValidation(
    { code: '' },
    {
      code: {
        required: true,
        minLength: 3,
        message: 'Ingresa el código',
      },
    },
  );

  useEffect(() => {
    loadCashierData();
  }, []);

  async function loadCashierData() {
    try {
      const cashiers = await cashiersService.findAll();
      const mine = cashiers.find((c) => c.userId === user?.id);
      if (mine) {
        setMyCashier(mine);
        const session = await cashService.getMyActive();
        setActiveSession(session);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!form.validateAll()) return;
    setSearching(true);
    setError('');
    setSuccess('');
    setTicket(null);
    try {
      const result = await betsService.findByCode(form.values.code);
      if (result.prizeAmount <= 0) {
        setError('Este ticket no tiene premio para pagar');
        return;
      }
      if (result.status === 'paid') {
        setError('Este premio ya fue pagado');
        return;
      }
      setTicket(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ticket no encontrado');
    } finally {
      setSearching(false);
    }
  }

  async function handlePay() {
    if (!ticket || !activeSession) {
      setError('Necesitas tener una caja abierta');
      return;
    }
    if (!confirm(`¿Confirmar pago de $${Number(ticket.prizeAmount).toFixed(2)}?`)) {
      return;
    }
    setPaying(true);
    setError('');
    try {
      await betsService.payTicket(ticket.id);
      setSuccess(
        `✅ Premio de $${Number(ticket.prizeAmount).toFixed(2)} pagado correctamente`,
      );
      setTicket(null);
      form.resetForm();
      await loadCashierData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al pagar premio');
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            💰 Pagar Premio
          </h1>
          <p className="text-gray-500 mt-1">
            Busca un ticket ganador y paga el premio
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate(getBackPath())}>
          ← Volver
        </Button>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {!activeSession && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl">
            ⚠️ No tienes una caja abierta. Abre caja antes de pagar premios.
          </div>
        )}

        {/* Buscador */}
        <Card>
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              label="Código del ticket ganador"
              name="code"
              value={form.values.code}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur('code')}
              error={form.touched.code ? form.errors.code : undefined}
              placeholder="T-XXXXX-XXXX"
              required
              restriction="alphanumeric"
              transform="uppercase"
            />
            <Button type="submit" disabled={searching} className="w-full">
              {searching ? 'Buscando...' : '🔍 Buscar Ticket'}
            </Button>
          </form>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {ticket && (
          <Card>
            <div className="text-center">
              <div className="text-5xl mb-3">🏆</div>
              <p className="text-sm text-gray-500">Ticket ganador</p>
              <p className="font-mono text-lg font-bold text-primary-600">
                {ticket.code}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6 text-left">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Ronda</p>
                  <p className="text-sm font-medium">
                    #{ticket.round?.number || '-'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Aciertos</p>
                  <Badge variant="success">
                    {ticket.hits} de {ticket.numbersCount}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2 mt-4 uppercase tracking-wider">
                  Números
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {ticket.numbers.map((b) => (
                    <span
                      key={b.id}
                      className="px-3 py-1.5 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg font-mono font-bold"
                    >
                      {b.number}
                    </span>
                  ))}
                </div>
              </div>

              {/* Premio destacado */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-2xl mt-6">
                <p className="text-sm text-yellow-100 uppercase tracking-wider">
                  Premio a pagar
                </p>
                <p className="text-5xl font-display font-extrabold mt-1">
                  ${Number(ticket.prizeAmount).toFixed(2)}
                </p>
              </div>

              <Button
                size="lg"
                onClick={handlePay}
                disabled={paying || !activeSession}
                className="w-full mt-6"
              >
                {paying ? 'Procesando...' : '💰 PAGAR PREMIO'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
