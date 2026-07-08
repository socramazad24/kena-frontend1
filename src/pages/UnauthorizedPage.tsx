import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-red-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
        <div className="text-7xl mb-4">🚫</div>
        <h1 className="text-3xl font-display font-extrabold text-gray-800 mb-2">
          Acceso Denegado
        </h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta página.
        </p>
        <Button onClick={handleLogout} className="w-full">
          Volver al Login
        </Button>
      </div>
    </div>
  );
}
