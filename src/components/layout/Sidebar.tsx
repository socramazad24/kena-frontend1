import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';

interface MenuItem {
  to: string;
  label: string;
  icon: string;
  divider?: boolean;
  external?: boolean;
}

const menuItems: MenuItem[] = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/branches', label: 'Sucursales', icon: 'branch' },
  { to: '/admin/cashiers', label: 'Cajeros', icon: 'cashier' },
  { to: '/admin/prizes', label: 'Premios', icon: 'prize' },
  { to: '/admin/jackpot', label: 'Jackpot', icon: 'jackpot' },
  { to: '/admin/reports', label: 'Reportes', icon: 'report' },
  { to: '/admin/settings', label: 'Configuración', icon: 'settings' },
  { to: '/display', label: 'Pantalla TV', icon: 'tv', external: true },
  { to: '/admin/cashier', label: 'Panel Cajero', icon: 'play', divider: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">
          N
        </div>
        <span className="ml-2.5 font-semibold text-slate-900">Numerix</span>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const content = (
            <NavLink
              to={item.to}
              end={item.to === '/admin'}
              onClick={(e) => {
                if (item.external) {
                  e.preventDefault();
                  window.open(item.to, '_blank');
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm font-medium transition ${
                  isActive && !item.external
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon name={item.icon} size={18} />
              <span className="flex-1">{item.label}</span>
              {item.external && <Icon name="arrow" size={12} className="opacity-50" />}
            </NavLink>
          );

          if (item.divider) {
            return (
              <div key={item.to}>
                <div className="border-t border-slate-200 my-2" />
                {content}
              </div>
            );
          }
          return <div key={item.to}>{content}</div>;
        })}
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
  );
}
