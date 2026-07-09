import { type ReactNode, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { connectSocket } from '../../socket/socket';
import { useRoundSocket } from '../../hooks/useRoundSocket';
import Icon from '../ui/Icon';

interface Props {
  children: ReactNode;
}

const items = [
  { to: '/cashier', label: 'Inicio', icon: 'home', end: true },
  { to: '/cashier/new-bet', label: 'Nueva apuesta', icon: 'ticket' },
  { to: '/cashier/search', label: 'Buscar ticket', icon: 'search' },
  { to: '/cashier/my-bets', label: 'Mis apuestas', icon: 'dollar' },
  { to: '/cashier/pay', label: 'Pagar premio', icon: 'prize' },
  { to: '/cashier/cash', label: 'Caja', icon: 'cashier' },
  { to: '/cashier/reports', label: 'Reportes', icon: 'report' },
];

export default function CashierLayout({ children }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useRoundSocket();

  useEffect(() => {
    connectSocket();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">
            N
          </div>
          <span className="ml-2.5 font-semibold text-slate-900">Numerix</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200 space-y-2">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-slate-500 truncate">@{user?.username}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            <Icon name="logout" size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
