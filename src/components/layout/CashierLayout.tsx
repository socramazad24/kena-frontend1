import { type ReactNode, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRoundSocket } from '../../hooks/useRoundSocket';
import { jackpotService, type Jackpot } from '../../services/jackpot.service';
import { settingsService, type Setting } from '../../services/settings.service';

interface CashierLayoutProps {
  children: ReactNode;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CashierLayout({ children }: CashierLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { currentRound, isConnected } = useRoundSocket();
  const [settings, setSettings] = useState<Setting | null>(null);
  const [jackpot, setJackpot] = useState<Jackpot | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadJackpot, 10000); // Actualizar jackpot cada 10s
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [cfg, jp] = await Promise.all([
        settingsService.getSettings(),
        jackpotService.getCurrent(),
      ]);
      setSettings(cfg);
      setJackpot(jp);
    } catch (err) {
      console.error(err);
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

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const remainingSeconds = currentRound?.remainingSeconds ?? 0;
  const isOpen = currentRound?.status === 'open';

  const menuItems = [
    { to: '/cashier', label: 'Inicio', icon: '🏠', end: true },
    { to: '/cashier/new-bet', label: 'Nueva Apuesta', icon: '🎮' },
    { to: '/cashier/search', label: 'Buscar Ticket', icon: '🔍' },
    { to: '/cashier/my-bets', label: 'Mis Apuestas', icon: '💰' },
    { to: '/cashier/pay', label: 'Pagar Premio', icon: '🏆' },
    { to: '/cashier/cash', label: 'Caja', icon: '💼' },
    { to: '/cashier/reports', label: 'Reportes', icon: '📊' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
              <span className="text-white font-display font-bold text-lg">
                N
              </span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-gray-800">
                {settings?.systemName || 'NUMERIX'}
              </h1>
              <p className="text-xs text-gray-500">Panel Cajero</p>
            </div>
          </div>
        </div>

        {/* Menú */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Usuario y logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
            <p className="text-xs text-gray-500">@{user?.username}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              Cajero
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <span>🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col">
        {/* Header morado */}
        <header className="bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 text-white shadow-lg">
          <div className="px-8 py-4 flex items-center justify-between">
            {/* Info ronda */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-primary-200 text-xs uppercase tracking-wider">
                  Ronda actual
                </p>
                <p className="text-2xl font-display font-bold">
                  #{currentRound?.roundNumber || '-'}
                </p>
              </div>

              <div className="h-10 w-px bg-primary-500/30"></div>

              <div>
                <p className="text-primary-200 text-xs uppercase tracking-wider">
                  Estado
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    isOpen
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {isOpen ? '● En curso' : '○ Cerrada'}
                </span>
              </div>

              <div className="h-10 w-px bg-primary-500/30"></div>

              <div>
                <p className="text-primary-200 text-xs uppercase tracking-wider">
                  Tiempo restante
                </p>
                <p
                  className={`text-2xl font-mono font-bold ${
                    remainingSeconds <= 30 ? 'text-red-300' : 'text-white'
                  }`}
                >
                  {formatTime(remainingSeconds)}
                </p>
              </div>

              <div className="h-10 w-px bg-primary-500/30"></div>

              <div>
                <p className="text-primary-200 text-xs uppercase tracking-wider">
                  Jackpot actual
                </p>
                <p className="text-2xl font-display font-bold text-yellow-300">
                  $
                  {(jackpot?.currentAmount ?? settings?.initialJackpot ?? 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* Estado de conexión */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
              ></span>
              <span className="text-xs text-primary-200">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
