import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import branchesService from '../../services/branches.service';
import cashiersService from '../../services/cashiers.service';
import usersService from '../../services/users.service';
import roundsService from '../../services/rounds.service';
import jackpotService from '../../services/jackpot.service';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBranches: 0,
    activeBranches: 0,
    totalCashiers: 0,
    totalUsers: 0,
    currentRound: '-',
    roundStatus: 'unknown',
    jackpot: 0,
  });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    try {
      const [branches, cashiers, users, currentRound, jackpot] =
        await Promise.all([
          branchesService.findAll().catch(() => []),
          cashiersService.findAll().catch(() => []),
          usersService.findAll().catch(() => []),
          roundsService.getCurrent().catch(() => null),
          jackpotService.getCurrent().catch(() => null),
        ]);

      setStats({
        totalBranches: branches.length,
        activeBranches: branches.filter((b) => b.isActive).length,
        totalCashiers: cashiers.length,
        totalUsers: users.length,
        currentRound: currentRound ? String(currentRound.number) : '-',
        roundStatus: currentRound?.status || 'unknown',
        jackpot: Number(jackpot?.currentAmount || 0),
      });
    } catch (err) {
      console.error('Error cargando stats:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading text="Cargando dashboard..." />;
  }

  const cards = [
    {
      title: 'Sucursales',
      value: stats.activeBranches,
      subtitle: `${stats.totalBranches} totales`,
      icon: '🏢',
      color: 'from-blue-500 to-blue-700',
      link: '/admin/branches',
    },
    {
      title: 'Cajeros',
      value: stats.totalCashiers,
      subtitle: 'Activos',
      icon: '👤',
      color: 'from-purple-500 to-purple-700',
      link: '/admin/cashiers',
    },
    {
      title: 'Usuarios',
      value: stats.totalUsers,
      subtitle: 'Registrados',
      icon: '👥',
      color: 'from-pink-500 to-pink-700',
      link: null,
    },
    {
      title: 'Ronda Actual',
      value: `#${stats.currentRound}`,
      subtitle: stats.roundStatus === 'open' ? '🟢 En curso' : stats.roundStatus === 'closed' ? '🟡 Cerrada' : '—',
      icon: '🎯',
      color: 'from-green-500 to-green-700',
      link: null,
    },
  ];

  const quickLinks = [
    { label: 'Reglas de Premios', icon: '🏆', link: '/admin/prizes' },
    { label: 'Jackpot', icon: '💎', link: '/admin/jackpot' },
    { label: 'Reportes', icon: '📊', link: '/admin/reports' },
    { label: 'Configuración', icon: '⚙️', link: '/admin/settings' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Resumen general del sistema
        </p>
      </div>

      {/* Jackpot destacado */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-100 uppercase tracking-wider font-semibold">
              💎 Jackpot Actual
            </p>
            <p className="text-5xl font-display font-extrabold mt-2">
              ${stats.jackpot.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="text-7xl opacity-30">💎</div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={() => card.link && navigate(card.link)}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-lg ${
              card.link ? 'cursor-pointer hover:scale-105' : ''
            } transition-transform`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 uppercase tracking-wider font-medium">
                  {card.title}
                </p>
                <p className="text-3xl font-display font-extrabold mt-2">
                  {card.value}
                </p>
                <p className="text-xs text-white/70 mt-1">{card.subtitle}</p>
              </div>
              <div className="text-4xl opacity-80">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <Card title="Accesos Rápidos">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.link)}
              className="p-6 bg-gray-50 hover:bg-primary-50 rounded-xl transition text-center group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition">
                {link.icon}
              </div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-primary-700">
                {link.label}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Panel Cajero */}
      <Card className="mt-6" title="Vista Rápida del Cajero">
        <p className="text-gray-600 mb-4">
          Accede al panel del cajero para probar ventas o ver el sistema desde
          la perspectiva del operador.
        </p>
        <button
          onClick={() => navigate('/admin/cashier')}
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition shadow-md"
        >
          🎮 Ir al Panel del Cajero
        </button>
      </Card>
    </div>
  );
}
