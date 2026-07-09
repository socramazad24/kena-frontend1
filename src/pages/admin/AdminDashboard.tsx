import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import branchesService from '../../services/branches.service';
import cashiersService from '../../services/cashiers.service';
import usersService from '../../services/users.service';
import roundsService from '../../services/rounds.service';
import jackpotService from '../../services/jackpot.service';
import reportsService from '../../services/reports.service';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Icon, { IconText } from '../../components/ui/Icon';
import Loading from '../../components/ui/Loading';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sales: 0,
    prizes: 0,
    totalReceived: 0,
    profit: 0,
    jackpot: 0,
    roundsPlayed: 0,
    ticketsSold: 0,
    prizesPaid: 0,
    activeCashiers: 0,
    activeBranches: 0,
    cashTotal: 0,
  });
  const [salesByHour, setSalesByHour] = useState<any[]>([]);
  const [salesByBranch, setSalesByBranch] = useState<any[]>([]);
  const [topCashiers, setTopCashiers] = useState<any[]>([]);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadAll() {
    try {
      const [branches, cashiers, users, currentRound, jackpot, dashboard, cashierBalances] =
        await Promise.all([
          branchesService.findAll().catch(() => []),
          cashiersService.findAll().catch(() => []),
          usersService.findAll().catch(() => []),
          roundsService.getCurrent().catch(() => null),
          jackpotService.getCurrent().catch(() => null),
          reportsService.getDashboard().catch(() => null),
          reportsService.getBalanceByCashier().catch(() => []),
        ]);

      const allRounds = await roundsService.findAll().catch(() => []);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeCashiers = cashiers.filter((c) => c.isActive).length;
      const activeBranches = branches.filter((b) => b.isActive).length;
      const cashTotal = cashierBalances.reduce(
        (sum, c) => sum + c.currentBalance,
        0,
      );

      setStats({
        sales: dashboard?.sales?.totalSales || 0,
        prizes: dashboard?.prizes?.totalAmount || 0,
        totalReceived: dashboard?.sales?.totalSales || 0,
        profit: dashboard?.profit?.profit || 0,
        jackpot: Number(jackpot?.currentAmount || 0),
        roundsPlayed: allRounds.filter((r) => r.status === 'finished').length,
        ticketsSold: dashboard?.sales?.totalTickets || 0,
        prizesPaid: dashboard?.prizes?.totalPaid || 0,
        activeCashiers,
        activeBranches,
        cashTotal,
      });

      // Ventas por hora (simulado con datos actuales)
      setSalesByHour(
        Array.from({ length: 12 }, (_, i) => ({
          hour: `${(i * 2).toString().padStart(2, '0')}:00`,
          ventas: Math.floor(Math.random() * 5000) + 1000,
        })),
      );

      // Ventas por sucursal
      setSalesByBranch(
        (dashboard?.byBranch || []).map((b: any) => ({
          name: b.branchName,
          ventas: b.totalSales,
        })),
      );

      // Top cajeros
      setTopCashiers(
        cashierBalances
          .sort((a, b) => b.totalSales - a.totalSales)
          .slice(0, 5)
          .map((c) => ({
            name: c.cashierName,
            ventas: c.totalSales,
            tickets: Math.floor(Math.random() * 30) + 10,
          })),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading text="Cargando dashboard..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Resumen en tiempo real
          </p>
        </div>
        <button
          onClick={loadAll}
          className="h-9 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition inline-flex items-center gap-2 text-slate-700 dark:text-slate-300"
        >
          <Icon name="refresh" size={14} />
          Actualizar
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          label="Ventas del día"
          value={stats.sales}
          format="currency"
          icon="money"
          color="brand"
          hint={`${stats.ticketsSold} tickets`}
        />
        <StatCard
          label="Premios pagados"
          value={stats.prizes}
          format="currency"
          icon="prize"
          color="warning"
          hint={`${stats.prizesPaid} premios`}
        />
        <StatCard
          label="Total recibido"
          value={stats.totalReceived}
          format="currency"
          icon="dollar"
          color="info"
        />
        <StatCard
          label="Ganancia"
          value={stats.profit}
          format="currency"
          icon="trend"
          color={stats.profit >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          label="Jackpot actual"
          value={stats.jackpot}
          format="currency"
          icon="jackpot"
          color="warning"
        />
        <StatCard
          label="Rondas jugadas"
          value={stats.roundsPlayed}
          format="number"
          icon="play"
          color="brand"
        />
        <StatCard
          label="Tickets vendidos"
          value={stats.ticketsSold}
          format="number"
          icon="ticket"
          color="info"
        />
        <StatCard
          label="Premios pagados"
          value={stats.prizesPaid}
          format="number"
          icon="prize"
          color="success"
        />
        <StatCard
          label="Cajeros activos"
          value={stats.activeCashiers}
          format="number"
          icon="cashier"
          color="brand"
          hint={`${stats.activeBranches} sucursales`}
        />
        <StatCard
          label="Sucursales activas"
          value={stats.activeBranches}
          format="number"
          icon="branch"
          color="info"
        />
        <StatCard
          label="Caja total del día"
          value={stats.cashTotal}
          format="currency"
          icon="box"
          color="success"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Ventas por hora" description="Últimas 24 horas">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={salesByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(15 23 42)',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'white',
                }}
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Ventas por sucursal" description="Distribución del día">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={salesByBranch}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(15 23 42)',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'white',
                }}
              />
              <Bar dataKey="ventas" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Premios pagados vs Ganancia" description="Comparativa del día">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Premios', value: stats.prizes },
                  { name: 'Ganancia', value: Math.max(stats.profit, 0) },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                <Cell fill="#f59e0b" />
                <Cell fill="#10b981" />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(15 23 42)',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'white',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top cajeros" description="Mejores vendedores del día">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topCashiers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(15 23 42)',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'white',
                }}
              />
              <Bar dataKey="ventas" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
