import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import FloatingNumbers from '../../components/auth/FloatingNumbers';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const form = useFormValidation(
    { username: '', password: '' },
    {
      username: {
        required: true,
        minLength: 3,
        message: 'Ingresa tu usuario',
      },
      password: {
        required: true,
        minLength: 6,
        message: 'La contraseña debe tener mínimo 6 caracteres',
      },
    },
  );

  useEffect(() => {
    document.title = 'NUMERIX - Iniciar sesión';
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.validateAll()) return;

    setSubmitting(true);
    try {
      await login({
        username: form.values.username,
        password: form.values.password,
      });
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al iniciar sesión. Verifica tus credenciales.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 overflow-hidden p-4"
      style={{ isolation: 'isolate' }}
    >
      <FloatingNumbers />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-2xl mb-4 animate-pulse-slow">
            <span className="text-4xl font-display font-bold text-white">
              N
            </span>
          </div>
          <h1 className="text-5xl font-display font-extrabold text-white tracking-tight mb-2">
            NUMERIX
          </h1>
          <p className="text-primary-200 text-sm font-medium">
            Tu juego, tu suerte
          </p>
        </div>

        {/* Card de login */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-1 text-center font-display">
            Inicia sesión para continuar
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                name="username"
                value={form.values.username}
                onChange={form.handleChange}
                onBlur={() => form.handleBlur('username')}
                required
                autoComplete="username"
                autoFocus
                disabled={submitting}
                placeholder="admin"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition disabled:bg-slate-100 text-slate-900 ${
                  form.touched.username && form.errors.username
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-300'
                }`}
              />
              {form.touched.username && form.errors.username && (
                <p className="mt-1 text-sm text-rose-600">
                  ⚠️ {form.errors.username}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.values.password}
                onChange={form.handleChange}
                onBlur={() => form.handleBlur('password')}
                required
                autoComplete="current-password"
                disabled={submitting}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition disabled:bg-slate-100 text-slate-900 ${
                  form.touched.password && form.errors.password
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-300'
                }`}
              />
              {form.touched.password && form.errors.password && (
                <p className="mt-1 text-sm text-rose-600">
                  ⚠️ {form.errors.password}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Ingresando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert(
                'Contacta al administrador del sistema para restablecer tu contraseña.',
              );
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <p className="text-center text-primary-300 text-xs mt-8">
          © 2026 NUMERIX. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
