import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface MenuItem {
  to: string;
  label: string;
  icon: string;
  divider?: boolean;
  onClick?: () => void;
}

const menuItems: MenuItem[] = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/branches', label: 'Sucursales', icon: '🏢' },
  { to: '/admin/cashiers', label: 'Cajeros', icon: '👤' },
  { to: '/admin/prizes', label: 'Reglas de Premios', icon: '🏆' },
  { to: '/admin/jackpot', label: 'Jackpot', icon: '💎' },
  { to: '/admin/reports', label: 'Reportes', icon: '📈' },
  { to: '/admin/settings', label: 'Configuración', icon: '⚙️' },
  {
    to: '/display',
    label: 'Pantalla TV',
    icon: '📺',
    onClick: () => window.open('/display', '_blank'),
  },
  { to: '/admin/cashier', label: 'Panel Cajero', icon: '🎮', divider: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
            <span className="text-white font-display font-bold text-lg">
              N
            </span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-gray-800">
              NUMERIX
            </h1>
            <p className="text-xs text-gray-500">Panel Administrador</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.to}>
            {item.divider && (
              <div className="border-t border-gray-200 my-3"></div>
            )}
            <NavLink
              to={item.to}
              end={item.to === '/admin'}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
              }}
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
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="px-4 py-2 mb-2">
          <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
          <p className="text-xs text-gray-500">@{user?.username}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
            Administrador
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
  );
}
