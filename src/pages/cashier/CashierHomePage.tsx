import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRoundSocket } from '../../hooks/useRoundSocket';
import { connectSocket, getSocket } from '../../socket/socket';
import cashService from '../../services/cash.service';
import cashiersService from '../../services/cashiers.service';
import betsService from '../../services/bets.service';
import settingsService, { type Setting } from '../../services/settings.service';
import jackpotService, { type Jackpot } from '../../services/jackpot.service';
import type { CashSession, CashBalance, Ticket } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Badge from '../../components/ui/Badge';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CashierHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentRound, isConnected } = useRoundSocket();
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [balance, setBalance] = useState<CashBalance | null>(null);
  const [settings, setSettings] = useState<Setting | null>(null);
  const [jackpot, setJackpot] = useState<Jackpot | null>(null);
  const [recentBets, setRecentBets] = useState<Ticket[]>([]);

  useEffect(() => {
    connectSocket();
    loadData();

    const socket = getSocket();
    if (socket) {
      function onTicketCreated(t: Ticket) {
        setRecentBets((prev) => [t, ...prev].slice(0, 5));
        if (activeSession) {
          cashService.getBalance(activeSession.id).then(setBalance).catch(() => {});
        }
      }
      socket.on('ticket:created', onTicketCreated);
      return () => {
        socket.off('ticket:created', onTicketCreated);
      };
    }
  }, []);

  async function loadData() {
    try {
      const [cfg, jp, cashiers] = await Promise.all([
        settingsService.getSettings(),
        jackpotService.getCurrent(),
        cashiersService.findAll(),
      ]);
      setSettings(cfg);
      setJackpot(jp);

      const mine = cashiers.find((c) => c.userId === user?.id);
      if (mine) {
        const session = await cashService.getMyActive();
        setActiveSession(session);
        if (session) {
          const bal = await cashService.getBalance(session.id);
          setBalance(bal);
          const tickets = await betsService.findAll({});
          const mine2 = tickets
            .filter((t) => t.cashierId === mine.id)
            .slice(0, 5);
          setRecentBets(mine2);
        } else {
          navigate('/cashier/cash');
        }
      } else {
        navigate('/cashier/cash');
      }
    } catch (err) {
      console.error(err);
    }
  }

  const remainingSeconds = currentRound?.remainingSeconds ?? 0;
  const isOpen = currentRound?.status === 'open';

  if (!activeSession) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <Icon name="warning" size={32} className="text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Caja cerrada
            </h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Debes abrir tu caja para empezar a vender
            </p>
            <Button onClick={() => navigate('/cashier/cash')}>Abrir caja</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding={false}>
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ronda</p>
            <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums">
              #{currentRound?.roundNumber ?? '-'}
            </p>
            <div className="mt-2">
              <Badge variant={isOpen ? 'success' : 'danger'}>
                {isOpen ? 'En curso' : 'Cerrada'}
              </Badge>
            </div>
          </div>
        </Card>

        <Card padding={false}>
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tiempo</p>
            <p
              className={`mt-1 text-3xl font-mono font-bold tabular-nums ${
                remainingSeconds <= 30 && isOpen ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {formatTime(remainingSeconds)}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-slate-500">{isConnected ? 'Conectado' : 'Sin conexión'}</span>
            </div>
          </div>
        </Card>

        <Card padding={false}>
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jackpot</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 tabular-nums">
              ${Number(jackpot?.currentAmount ?? settings?.initialJackpot ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">💎 Acumulado</p>
          </div>
        </Card>

        <Card padding={false}>
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mi caja</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 tabular-nums">
              ${balance?.current.toFixed(2) ?? '0.00'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Ventas: ${balance?.sales.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </Card>
      </div>

      {/* Botones rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/cashier/new-bet')}
          className="h-20 flex-col bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800"
          disabled={!isOpen}
        >
          <Icon name="ticket" size={24} />
          <span className="font-semibold">Nueva apuesta</span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/cashier/search')}
          className="h-20 flex-col"
        >
          <Icon name="search" size={24} />
          <span className="font-semibold">Buscar ticket</span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/cashier/pay')}
          className="h-20 flex-col"
        >
          <Icon name="prize" size={24} />
          <span className="font-semibold">Pagar premio</span>
        </Button>
      </div>

      {/* Apuestas recientes */}
      <Card title="Apuestas recientes" description="Últimas 5 ventas">
        {recentBets.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500">
            Aún no has vendido tickets
          </div>
        ) : (
          <div className="space-y-2">
            {recentBets.map((bet) => (
              <div
                key={bet.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <div className="font-mono text-xs text-slate-500">
                  {bet.code.split('-').pop()}
                </div>
                <div className="flex-1 flex flex-wrap gap-1">
                  {bet.numbers.map((n) => (
                    <span
                      key={n.id}
                      className="px-2 py-0.5 bg-primary-100 text-primary-800 rounded text-xs font-mono font-bold"
                    >
                      {n.number}
                    </span>
                  ))}
                </div>
                <div className="text-sm font-semibold text-emerald-600 tabular-nums">
                  ${Number(bet.totalAmount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
