import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import betsService from '../../services/bets.service';
import type { Ticket } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useFormValidation } from '../../hooks/useFormValidation';
import Badge from '../../components/ui/Badge';
import TicketModal from '../../components/ui/tickets/TicketModal';
import settingsService, { type Setting } from '../../services/settings.service';

function getBackPath(): string {
  return window.location.pathname.startsWith('/admin')
    ? '/admin/cashier'
    : '/cashier';
}

export default function SearchTicketPage() {
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [settings, setSettings] = useState<Setting | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const form = useFormValidation(
    { code: '' },
    {
      code: {
        required: true,
        minLength: 3,
        message: 'Ingresa el código del ticket',
      },
    },
  );

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!form.validateAll()) return;
    setSearching(true);
    setError('');
    setTicket(null);
    try {
      const [result, cfg] = await Promise.all([
        betsService.findByCode(form.values.code),
        settingsService.getSettings().catch(() => null),
      ]);
      setTicket(result);
      if (cfg) setSettings(cfg);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ticket no encontrado');
    } finally {
      setSearching(false);
    }
  }

  const statusVariants: Record<
    string,
    'success' | 'danger' | 'warning' | 'gray' | 'info'
  > = {
    active: 'info',
    won: 'success',
    lost: 'danger',
    paid: 'success',
    cancelled: 'gray',
  };

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    won: 'Ganador',
    lost: 'Perdedor',
    paid: 'Pagado',
    cancelled: 'Cancelado',
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            🔍 Buscar Ticket
          </h1>
          <p className="text-gray-500 mt-1">
            Encuentra un ticket por su código
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate(getBackPath())}>
          ← Volver
        </Button>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Buscador */}
        <Card>
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              label="Código del ticket"
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
              {searching ? 'Buscando...' : '🔍 Buscar'}
            </Button>
          </form>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {ticket && (
          <Card>
            <div className="space-y-4">
              {/* Header con código y estado */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Código</p>
                  <p className="font-mono text-lg font-bold text-primary-600">
                    {ticket.code}
                  </p>
                </div>
                <Badge variant={statusVariants[ticket.status]}>
                  {statusLabels[ticket.status]}
                </Badge>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Ronda</p>
                  <p className="text-gray-800 font-medium">
                    #{ticket.round?.number || '-'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Cantidad</p>
                  <p className="text-gray-800 font-medium">
                    {ticket.numbersCount} números
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Valor c/u</p>
                  <p className="text-gray-800 font-medium">
                    ${Number(ticket.unitValue).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Números */}
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
                  Números apostados
                </p>
                <div className="flex flex-wrap gap-2">
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

              {/* Total */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-xl">
                <p className="text-xs text-primary-200 uppercase">Total</p>
                <p className="text-3xl font-display font-extrabold">
                  ${Number(ticket.totalAmount).toFixed(2)}
                </p>
              </div>

              {/* Premio si tiene */}
              {ticket.prizeAmount > 0 && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl">
                  <p className="text-xs text-green-100 uppercase">Premio</p>
                  <p className="text-3xl font-display font-extrabold">
                    ${Number(ticket.prizeAmount).toFixed(2)}
                  </p>
                  <p className="text-xs text-green-100 mt-1">
                    Aciertos: {ticket.hits} de {ticket.numbersCount}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(true)}
                  className="flex-1"
                >
                  🖨️ Ver Ticket
                </Button>
                {ticket.status === 'won' && (
                  <Button
                    onClick={() =>
                      (window.location.href = '/cashier/pay')
                    }
                    className="flex-1"
                  >
                    💰 Pagar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modal del ticket */}
      <TicketModal
        ticket={showModal ? ticket : null}
        settings={settings}
        roundNumber={ticket?.round?.number || null}
        cashierName=""
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
