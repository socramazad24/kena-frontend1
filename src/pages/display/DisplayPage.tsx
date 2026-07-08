import { useState, useEffect, useRef } from 'react';
import { connectSocket, getSocket } from '../../socket/socket';
import roundsService from '../../services/rounds.service';
import betsService from '../../services/bets.service';
import settingsService, { type Setting } from '../../services/settings.service';
import jackpotService, { type Jackpot } from '../../services/jackpot.service';
import type { Ticket, SoldNumber, Round, RoundStatus } from '../../types';

interface RecentWin {
  round: string;
  ticket: string;
  numbers: string;
  amount: number;
}

export default function DisplayPage() {
  const [settings, setSettings] = useState<Setting | null>(null);
  const [jackpot, setJackpot] = useState<Jackpot | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [soldNumbers, setSoldNumbers] = useState<SoldNumber[]>([]);
  const [recentBets, setRecentBets] = useState<Ticket[]>([]);
  const [topWins, setTopWins] = useState<RecentWin[]>([]);
  const [now, setNow] = useState(new Date());
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [drawPhase, setDrawPhase] = useState<
    'idle' | 'closed' | 'drawing' | 'finished'
  >('idle');
  const [revealedNumbers, setRevealedNumbers] = useState<string[]>([]);
  const [winningNumbers, setWinningNumbers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const initialized = useRef(false);
  const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Efecto principal de inicialización
  useEffect(() => {
    connectSocket();
    if (!initialized.current) {
      initialized.current = true;
      loadInitialData();
    }

    // Reloj
    const clockInterval = setInterval(() => setNow(new Date()), 1000);

    // Actualizar tiempo restante cada segundo
    tickInterval.current = setInterval(updateRemainingTime, 1000);

    return () => {
      clearInterval(clockInterval);
      if (tickInterval.current) clearInterval(tickInterval.current);
    };
  }, []);

  // Efecto para escuchar Socket.IO
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function onConnect() {
      console.log('📺 Display conectado a Socket.IO');
      setIsConnected(true);
    }
    function onDisconnect() {
      console.log('📺 Display desconectado');
      setIsConnected(false);
    }

    function onTicketCreated(ticket: Ticket) {
      console.log('📺 Nuevo ticket:', ticket.code);
      // Actualizar números vendidos
      loadSoldNumbers();
      // Agregar a la lista
      setRecentBets((prev) => {
        if (prev.some((t) => t.id === ticket.id)) return prev;
        return [ticket, ...prev].slice(0, 12);
      });
    }

    function onRoundStats(data: any) {
      console.log('📊 Stats:', data);
    }

    function onRoundNew(data: any) {
      console.log('🆕 Nueva ronda:', data?.number);
      setRound(data);
      setSoldNumbers([]);
      setRecentBets([]);
      setRevealedNumbers([]);
      setWinningNumbers([]);
      setDrawPhase('idle');
      setRemainingSeconds(data?.durationSeconds || 240);
    }

    function onRoundClosed(data: any) {
      console.log('🔒 Ronda cerrada:', data?.number);
      setDrawPhase('closed');
    }

    function onRoundDrawing(data: any) {
      console.log('🎰 Sorteando...');
      setDrawPhase('drawing');
    }

    function onNumberRevealed(data: {
      roundId: string;
      number: string;
      position: number;
      total: number;
    }) {
      console.log('🎯 Número revelado:', data.number);
      setRevealedNumbers((prev) => [...prev, data.number]);
    }

    function onRoundFinished(data: any) {
      console.log('🏁 Ronda finalizada. Ganadores:', data.winningNumbers);
      setDrawPhase('finished');
      setWinningNumbers(data.winningNumbers || []);
      setRemainingSeconds(0);
      // Recargar ganadores para TOP WINS
      setTimeout(() => loadWinners(), 1000);
    }

    function onRoundTick(data: any) {
      if (data.roundId === round?.id) {
        setRemainingSeconds(data.remainingSeconds || 0);
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('ticket:created', onTicketCreated);
    socket.on('round:stats', onRoundStats);
    socket.on('round:new', onRoundNew);
    socket.on('round:closed', onRoundClosed);
    socket.on('round:drawing', onRoundDrawing);
    socket.on('round:number-revealed', onNumberRevealed);
    socket.on('round:finished', onRoundFinished);
    socket.on('round:tick', onRoundTick);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('ticket:created', onTicketCreated);
      socket.off('round:stats', onRoundStats);
      socket.off('round:new', onRoundNew);
      socket.off('round:closed', onRoundClosed);
      socket.off('round:drawing', onRoundDrawing);
      socket.off('round:number-revealed', onNumberRevealed);
      socket.off('round:finished', onRoundFinished);
      socket.off('round:tick', onRoundTick);
    };
  }, [round?.id]);

  // Actualizar tiempo restante basado en endTime
  function updateRemainingTime() {
    if (round && round.status === 'open' && round.endTime) {
      const end = new Date(round.endTime).getTime();
      const nowMs = Date.now();
      const diff = Math.max(0, Math.floor((end - nowMs) / 1000));
      setRemainingSeconds(diff);
    }
  }

  async function loadInitialData() {
    try {
      const [cfg, jp] = await Promise.all([
        settingsService.getSettings(),
        jackpotService.getCurrent(),
      ]);

      setSettings(cfg);
      setJackpot(jp);

      // Cargar ronda actual
      await loadCurrentRound();
      // Cargar ganadores históricos
      await loadWinners();

      // Polling cada 5 segundos para datos que no llegan por socket
      const pollInterval = setInterval(async () => {
        await loadCurrentRound();
        await loadJackpot();
      }, 5000);

      // Guardar el interval para limpieza
      return () => clearInterval(pollInterval);
    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
    }
  }

  async function loadCurrentRound() {
    try {
      const currentRound = await roundsService.getCurrent();
      if (currentRound) {
        setRound((prev) => {
          // Solo actualizar si cambió el número de ronda
          if (prev?.id !== currentRound.id) {
            setSoldNumbers([]);
            setRecentBets([]);
            return currentRound;
          }
          return currentRound;
        });
        // Calcular tiempo restante inicial
        if (currentRound.endTime) {
          const end = new Date(currentRound.endTime).getTime();
          const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
          setRemainingSeconds(diff);
        }
        // Cargar números vendidos
        const sold = await betsService.getSoldNumbers(currentRound.id);
        setSoldNumbers(sold);
      } else {
        setRound(null);
      }
    } catch {
      setRound(null);
    }
  }

  async function loadSoldNumbers() {
    try {
      if (round) {
        const sold = await betsService.getSoldNumbers(round.id);
        setSoldNumbers(sold);
      }
    } catch (err) {
      console.error('Error cargando números vendidos:', err);
    }
  }

  async function loadJackpot() {
    try {
      const jp = await jackpotService.getCurrent();
      setJackpot(jp);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadWinners() {
    try {
      const rounds = await roundsService.findAll();
      const finished = rounds
        .filter((r) => r.status === 'finished' && r.winningNumbers)
        .slice(0, 5);

      const wins: RecentWin[] = [];
      for (const r of finished) {
        try {
          const winners = await betsService.getWinnersByRound(r.id);
          winners.slice(0, 2).forEach((w) => {
            wins.push({
              round: String(r.number),
              ticket: w.code.split('-').pop() || w.code,
              numbers: w.numbers.map((n) => n.number).join(' '),
              amount: Number(w.prizeAmount),
            });
          });
        } catch {
          // continuar
        }
      }
      setTopWins(wins.slice(0, 8));
    } catch (err) {
      console.error('Error cargando ganadores:', err);
    }
  }

  const numbers = Array.from({ length: 100 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );

  const isNumberSold = (num: string) =>
    soldNumbers.some((s) => s.number === num);

  const isOpen = round?.status === 'open';
  const displayWinning =
    winningNumbers.length > 0 ? winningNumbers : revealedNumbers;

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden flex flex-col">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-purple-800 via-purple-900 to-indigo-900 border-b-4 border-yellow-400 shadow-2xl flex-shrink-0">
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-white">N</span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">
                {settings?.systemName || 'NUMERIX'}
              </h1>
              <p className="text-purple-200 text-xs">Tu juego, tu suerte</p>
            </div>
          </div>

          {/* Jackpot - Centro */}
          <div className="text-center bg-black/30 rounded-2xl px-8 py-2 border border-yellow-400/50">
            <p className="text-yellow-300 text-xs uppercase tracking-widest font-bold">
              💎 JACKPOT
            </p>
            <p className="text-4xl font-black text-yellow-400 font-mono leading-none mt-1">
              $
              {Number(
                jackpot?.currentAmount ?? settings?.initialJackpot ?? 0,
              ).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Estado + Cronómetro - Derecha */}
          <div className="text-right">
            <div
              className={`px-4 py-1.5 rounded-full font-bold text-sm inline-block ${
                isOpen
                  ? 'bg-green-500 text-white animate-pulse'
                  : drawPhase === 'drawing'
                    ? 'bg-yellow-500 text-white animate-pulse'
                    : drawPhase === 'finished'
                      ? 'bg-blue-500 text-white'
                      : 'bg-red-500 text-white'
              }`}
            >
              {isOpen && '● EN CURSO'}
              {drawPhase === 'closed' && '⏸ CERRADA'}
              {drawPhase === 'drawing' && '🎰 SORTEANDO'}
              {drawPhase === 'finished' && '✅ FINALIZADA'}
              {drawPhase === 'idle' && !isOpen && '○ CERRADA'}
            </div>
            <div className="mt-1.5 flex items-center gap-3 justify-end">
              <p className="text-purple-200 text-xs uppercase tracking-widest font-bold">
                RONDA
              </p>
              <p className="text-3xl font-black text-white">
                #{round?.number ?? '-'}
              </p>
              <span className="text-purple-500">|</span>
              <p
                className={`text-4xl font-mono font-black ${
                  remainingSeconds <= 30 && isOpen
                    ? 'text-red-400 animate-pulse'
                    : 'text-white'
                }`}
              >
                {Math.floor(remainingSeconds / 60)}:
                {(remainingSeconds % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-3 min-h-0">
        {/* IZQUIERDA: Cuadrícula */}
        <div className="col-span-7 bg-slate-800/40 rounded-2xl p-3 border border-purple-700/30 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h2 className="text-lg font-bold text-purple-200">
              🎯 Números Disponibles
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-slate-700 rounded"></span>
                Libre
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-yellow-500 rounded"></span>
                Vendido
              </span>
              {displayWinning.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-green-500 rounded"></span>
                  Ganador
                </span>
              )}
            </div>
          </div>

          {/* Cuadrícula 10x10 */}
          <div className="grid grid-cols-10 gap-1.5 flex-1 min-h-0">
            {numbers.map((num) => {
              const sold = isNumberSold(num);
              const isWinner =
                displayWinning.length > 0 && displayWinning.includes(num);
              return (
                <div
                  key={num}
                  className={`
                    flex items-center justify-center
                    rounded-md font-black text-3xl transition-all
                    ${
                      isWinner
                        ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-lg ring-2 ring-green-300 animate-pulse'
                        : sold
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md'
                          : 'bg-slate-700/50 text-slate-300'
                    }
                  `}
                >
                  {num}
                </div>
              );
            })}
          </div>

          {/* Sorteo en curso */}
          {drawPhase === 'drawing' && (
            <div className="mt-2 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl p-3 text-center flex-shrink-0">
              <p className="text-yellow-300 text-xs uppercase tracking-widest font-bold mb-1">
                🎰 Sorteo en curso
              </p>
              <div className="flex justify-center gap-3">
                {Array.from({ length: 3 }).map((_, idx) => {
                  const n = revealedNumbers[idx];
                  return (
                    <div
                      key={idx}
                      className={`
                        w-16 h-16 rounded-lg flex items-center justify-center text-3xl font-black
                        ${
                          n
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg'
                            : 'bg-slate-800 text-slate-600 animate-pulse'
                        }
                      `}
                    >
                      {n || '?'}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ganadores */}
          {drawPhase === 'finished' && winningNumbers.length > 0 && (
            <div className="mt-2 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-3 text-center flex-shrink-0">
              <p className="text-yellow-300 text-xs uppercase tracking-widest font-bold mb-1">
                🏆 Números Ganadores
              </p>
              <div className="flex justify-center gap-3">
                {winningNumbers.map((n, idx) => (
                  <div
                    key={idx}
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl font-black bg-gradient-to-br from-yellow-300 to-orange-500 text-white shadow-lg"
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DERECHA */}
        <div className="col-span-5 flex flex-col gap-3 min-h-0">
          {/* Apuestas recientes */}
          <div className="flex-1 bg-slate-800/40 rounded-2xl p-3 border border-purple-700/30 flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-purple-200 mb-2 flex-shrink-0">
              📋 Últimas Apuestas
              <span className="ml-2 text-sm text-yellow-400 font-bold">
                ({recentBets.length})
              </span>
            </h2>
            <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
              {recentBets.length === 0 ? (
                <p className="text-slate-400 text-center py-12 text-sm">
                  Esperando apuestas...
                </p>
              ) : (
                recentBets.map((bet) => (
                  <div
                    key={bet.id}
                    className="bg-slate-700/60 rounded-lg p-2 flex items-center gap-2 animate-fade-in"
                  >
                    <div className="text-xs text-yellow-400 font-bold w-12 flex-shrink-0">
                      R{String(bet.roundId?.slice(0, 4) || round?.number || '').padStart(4, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1">
                        {bet.numbers.map((n) => (
                          <span
                            key={n.id}
                            className="px-1.5 py-0.5 bg-purple-600 text-white rounded text-xs font-mono font-bold"
                          >
                            {n.number}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-slate-300 font-mono flex-shrink-0">
                      {bet.code.split('-').pop()}
                    </div>
                    <div className="text-sm text-green-400 font-bold flex-shrink-0">
                      ${Number(bet.totalAmount).toFixed(0)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TOP WINS */}
          <div className="flex-shrink-0 h-1/3 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-2xl p-3 border border-yellow-600/30 flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-yellow-400 mb-2 flex-shrink-0">
              🏆 TOP WINS
            </h2>
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
              {topWins.length === 0 ? (
                <p className="text-slate-400 text-center py-4 text-sm">
                  Esperando ganadores...
                </p>
              ) : (
                topWins.map((win, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/60 rounded p-1.5 flex items-center gap-2 text-xs"
                  >
                    <div className="w-14 text-yellow-400 font-bold">
                      R{win.round.padStart(4, '0')}
                    </div>
                    <div className="font-mono text-slate-300 truncate w-16">
                      {win.ticket}
                    </div>
                    <div className="flex-1 font-mono text-slate-400 truncate text-[10px]">
                      {win.numbers}
                    </div>
                    <div className="text-green-400 font-bold">
                      ${win.amount.toLocaleString('en-US')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900/95 border-t border-purple-700/50 px-6 py-1.5 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            } animate-pulse`}
          ></span>
          <span>{isConnected ? '🟢 Conectado en vivo' : '🔴 Desconectado'}</span>
        </div>
        <div className="text-center">
          📺 Sorteo cada{' '}
          {Math.floor((settings?.roundDurationSeconds || 240) / 60)} minutos
        </div>
        <div className="font-mono">{now.toLocaleString('es')}</div>
      </footer>
    </div>
  );
}
