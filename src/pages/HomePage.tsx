import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (user?.role === 'cashier') {
      navigate('/cashier', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-2xl mb-4 animate-pulse">
          <span className="text-4xl font-display font-bold text-white">N</span>
        </div>
        <h1 className="text-3xl font-display font-extrabold text-white mb-2">
          NUMERIX
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mt-4"></div>
        <p className="text-primary-200 text-sm mt-3">Cargando...</p>
      </div>
    </div>
  );
}
