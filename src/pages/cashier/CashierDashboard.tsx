import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import roundsService from '../../services/rounds.service';
import betsService from '../../services/bets.service';
import cashService from '../../services/cash.service';
import cashiersService from '../../services/cashiers.service';
import settingsService from '../../services/settings.service';
import { useRoundSocket } from '../../hooks/useRoundSocket';
import { getSocket } from '../../socket/socket';
import type {
  Round,
  Ticket,
  SoldNumber,
  Cashier,
  Setting,
  CashSession,
  CashBalance,
} from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DrawModal from '../../components/draw/DrawModal';
import TicketModal from '../../components/ui/tickets/TicketModal';

export default function CashierDashboard() {
  const { user } = useAuth();
  const [myCashier, setMyCashier] = useState<Cashier | null>(null);
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [balance, setBalance] = useState<CashBalance | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [soldNumbers, setSoldNumbers] = useState<SoldNumber[]>([]);
  const [settings, setSettings] = useState<Setting | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState<number>(500);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const { currentRound, isConnected } = useRoundSocket();

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    function onTicketCreated() {
      loadSoldNumbers();
    }
    socket.on('ticket:created', onTicketCreated);
    return () => {
      socket.off('ticket:created', onTicketCreated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round?.id]);

  async function loadInitialData() {
    try {
      const cfg = await settingsService.getSettings();
      setSettings(cfg);
      setSelectedValue(Number(cfg.defaultBetValue));

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

      try {
        const currentRound = await roundsService.getCurrent();
        setRound(currentRound);
        await loadSoldNumbers();
      } catch (err) {
        console.log('Esperando primera ronda...');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    }
  }

  async function loadSoldNumbers() {
    try {
      const r = round || (await roundsService.getCurrent());
      if (r) {
        const sold = await betsService.getSoldNumbers(r.id);
        setSoldNumbers(sold);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const toggleNumber = useCallback(
    (num: string) => {
      if (!currentRound || currentRound.status !== 'open') return;
      if (!settings) return;

      setSelectedNumbers((prev) => {
        if (prev.includes(num)) {
          return prev.filter((n) => n !== num);
        }
        if (prev.length >= settings.maxNumbersPerBet) {
          setError(`Máximo ${settings.maxNumbersPerBet} números por apuesta`);
          setTimeout(() => setError(''), 3000);
          return prev;
        }
        return [...prev, num].sort();
      });
    },
    [currentRound, settings],
  );

  const isNumberSold = (num: string): boolean => {
    return soldNumbers.some((s) => s.number === num);
  };

  const totalAmount = selectedNumbers.length * selectedValue;

  async function handleSell(e: FormEvent) {
    e.preventDefault();
    if (!myCashier || !round || !user) return;
    if (selectedNumbers.length === 0) {
      setError('Selecciona al menos un número');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const ticket = await betsService.createTicket({
        cashierId: myCashier.id,
        branchId: myCashier.branchId,
        items: selectedNumbers.map((n) => ({
          number: n,
          amount: selectedValue,
        })),
      });
      setLastTicket(ticket);
      setSelectedNumbers([]);
      setShowTicketModal(true);

      if (activeSession) {
        const bal = await cashService.getBalance(activeSession.id);
        setBalance(bal);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear ticket');
    } finally {
      setSubmitting(false);
    }
  }

  const remainingSeconds = currentRound?.remainingSeconds ?? 0;
  const isOpen = currentRound?.status === 'open';

  const numbers = Array.from({ length: 100 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );

  if (!activeSession) {
    return (
      <div className="p-8">
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💼</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No tienes una caja abierta
            </h2>
            <p className="text-gray-600 mb-6">
              Para empezar a vender necesitas abrir tu caja
            </p>
            <Button
              onClick={() => (window.location.href = '/cashier/cash')}
              className="mx-auto"
            >
              Abrir Caja
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Modal de sorteo animado */}
      <DrawModal
        jackpot={
          settings
            ? {
                id: '',
                currentAmount: Number(settings.initialJackpot),
                baseAmount: Number(settings.initialJackpot),
                incrementPercent: settings.jackpotIncrementPercent,
                winningNumbersCount: 3,
                roundsWithoutWinner: 0,
                createdAt: '',
                updatedAt: '',
              }
            : null
        }
      />

      {/* Modal del ticket con barcode */}
      <TicketModal
        ticket={lastTicket}
        settings={settings}
        roundNumber={round?.number || null}
        cashierName={user?.username || ''}
        onClose={() => {
          setShowTicketModal(false);
          setLastTicket(null);
        }}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Columna izquierda - Cuadrícula */}
        <div className="xl:col-span-2">
          <Card
            title="Selecciona los números"
            action={
              <Badge variant={isOpen ? 'success' : 'danger'}>
                {isOpen ? 'Ventas Abiertas' : 'Ventas Cerradas'}
              </Badge>
            }
          >
            {!isOpen && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                ⚠️ Las ventas están cerradas. Esperando sorteo...
              </div>
            )}

            <div className="grid grid-cols-10 gap-1.5">
              {numbers.map((num) => {
                const isSelected = selectedNumbers.includes(num);
                const isSold = isNumberSold(num);
                return (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    disabled={!isOpen}
                    className={`
                      aspect-square text-sm font-bold rounded-lg transition-all
                      ${isSelected
                        ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white scale-105 shadow-lg ring-2 ring-primary-300'
                        : isSold
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                      }
                      ${!isOpen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></span>
                Disponible
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></span>
                Vendido
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded"></span>
                Seleccionado
              </span>
            </div>
          </Card>
        </div>

        {/* Columna derecha - Venta y Balance */}
        <div className="space-y-6">
          {/* Balance rápido */}
          <div className="grid grid-cols-2 gap-3">
            <Card padding={false}>
              <div className="p-4">
                <p className="text-xs text-gray-500">Mi Caja</p>
                <p className="text-2xl font-display font-bold text-green-600">
                  ${balance?.current.toFixed(2) || '0.00'}
                </p>
              </div>
            </Card>
            <Card padding={false}>
              <div className="p-4">
                <p className="text-xs text-gray-500">Ventas</p>
                <p className="text-2xl font-display font-bold text-primary-600">
                  ${balance?.sales.toFixed(2) || '0.00'}
                </p>
              </div>
            </Card>
          </div>

          {/* Panel de venta */}
          <Card title="Nueva Apuesta">
            <form onSubmit={handleSell} className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Números seleccionados
                </p>
                <div className="min-h-[50px] p-3 bg-gray-50 rounded-xl border border-gray-200">
                  {selectedNumbers.length === 0 ? (
                    <p className="text-gray-400 text-sm">Ninguno</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNumbers.map((n) => (
                        <span
                          key={n}
                          className="px-2.5 py-1 bg-primary-600 text-white rounded-md text-xs font-mono font-bold"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Valor por número
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {settings?.allowedBetValues.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedValue(Number(v))}
                      className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                        selectedValue === Number(v)
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Cantidad</p>
                  <p className="font-bold text-gray-800 text-lg">
                    {selectedNumbers.length}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Valor c/u</p>
                  <p className="font-bold text-gray-800 text-lg">
                    ${selectedValue}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total a pagar</span>
                  <span className="text-2xl font-display font-bold">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  submitting || !isOpen || selectedNumbers.length === 0
                }
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Procesando...' : '🎫 Generar Ticket'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
