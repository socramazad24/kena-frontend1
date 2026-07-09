import { useState, useEffect } from 'react';
import reportsService, {
  type DashboardData,
  type DailySales,
  type PaidPrizes,
  type CashierBalance,
  type BranchReport,
} from '../../services/reports.service';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

type Tab = 'dashboard' | 'sales' | 'prizes' | 'cashiers' | 'branches';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [sales, setSales] = useState<DailySales | null>(null);
  const [prizes, setPrizes] = useState<PaidPrizes | null>(null);
  const [cashierBalances, setCashierBalances] = useState<CashierBalance[]>(
    [],
  );
  const [branchReports, setBranchReports] = useState<BranchReport[]>([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, activeTab]);

  async function loadData() {
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const data = await reportsService.getDashboard(date);
        setDashboard(data);
      } else if (activeTab === 'sales') {
        const data = await reportsService.getDailySales(date);
        setSales(data);
      } else if (activeTab === 'prizes') {
        const data = await reportsService.getPaidPrizes(date);
        setPrizes(data);
      } else if (activeTab === 'cashiers') {
        const data = await reportsService.getBalanceByCashier(
          undefined,
          date,
        );
        setCashierBalances(data);
      } else if (activeTab === 'branches') {
        const data = await reportsService.getByBranch(undefined, date);
        setBranchReports(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'sales', label: 'Ventas', icon: '💰' },
    { id: 'prizes', label: 'Premios', icon: '🏆' },
    { id: 'cashiers', label: 'Cajeros', icon: '👤' },
    { id: 'branches', label: 'Sucursales', icon: '🏢' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 mt-1">
            Estadísticas y reportes del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Fecha:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-2 font-medium text-sm transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && dashboard && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <p className="text-sm text-gray-500">Total Ventas</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    ${dashboard.sales.totalSales.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dashboard.sales.totalTickets} tickets
                  </p>
                </Card>
                <Card>
                  <p className="text-sm text-gray-500">Premios Pagados</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    ${dashboard.prizes.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dashboard.prizes.totalPaid} premios
                  </p>
                </Card>
                <Card>
                  <p className="text-sm text-gray-500">Ganancia</p>
                  <p
                    className={`text-3xl font-bold mt-1 ${
                      dashboard.profit.profit >= 0
                        ? 'text-primary-600'
                        : 'text-red-600'
                    }`}
                  >
                    ${dashboard.profit.profit.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Margen: {dashboard.profit.margin.toFixed(1)}%
                  </p>
                </Card>
                <Card>
                  <p className="text-sm text-gray-500">Ticket Promedio</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    ${dashboard.sales.averageTicket.toFixed(2)}
                  </p>
                </Card>
              </div>

              <Card title="Ventas por Sucursal">
                <Table
                  headers={[
                    'Sucursal',
                    'Tickets',
                    'Ventas',
                    'Premios',
                    'Ganancia',
                  ]}
                >
                  {dashboard.byBranch.map((b) => (
                    <tr key={b.branchId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-gray-900">
                          {b.branchName}
                        </p>
                        <p className="text-xs text-gray-500">{b.branchCode}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {b.totalTickets}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium">
                        ${b.totalSales.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium">
                        ${b.totalPrizes.toFixed(2)}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-bold ${
                          b.profit >= 0
                            ? 'text-primary-600'
                            : 'text-red-600'
                        }`}
                      >
                        ${b.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </Table>
              </Card>
            </div>
          )}

          {activeTab === 'sales' && sales && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <p className="text-sm text-gray-500">Total Ventas</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  ${sales.totalSales.toFixed(2)}
                </p>
              </Card>
              <Card>
                <p className="text-sm text-gray-500">Cantidad de Tickets</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {sales.totalTickets}
                </p>
              </Card>
              <Card>
                <p className="text-sm text-gray-500">Ticket Promedio</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  ${sales.averageTicket.toFixed(2)}
                </p>
              </Card>
            </div>
          )}

          {activeTab === 'prizes' && prizes && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <p className="text-sm text-gray-500">Tickets Pagados</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {prizes.totalPaid}
                </p>
              </Card>
              <Card>
                <p className="text-sm text-gray-500">Total Pagado</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  ${prizes.totalAmount.toFixed(2)}
                </p>
              </Card>
            </div>
          )}

          {activeTab === 'cashiers' && (
            <Card title="Balance por Cajero">
              <Table
                headers={[
                  'Cajero',
                  'Usuario',
                  'Inicial',
                  'Ventas',
                  'Premios',
                  'Balance',
                  'Estado',
                ]}
                loading={loading}
                emptyMessage="No hay sesiones de caja en esta fecha"
              >
                {cashierBalances.map((c) => (
                  <tr key={c.sessionId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {c.cashierName}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      @{c.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${c.initialAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      +${c.totalSales.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">
                      -${c.totalPrizes.toFixed(2)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-bold ${
                        c.currentBalance >= 0
                          ? 'text-primary-600'
                          : 'text-red-600'
                      }`}
                    >
                      ${c.currentBalance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={c.status === 'open' ? 'success' : 'neutral'}
                      >
                        {c.status === 'open' ? 'Abierta' : 'Cerrada'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {activeTab === 'branches' && (
            <Card title="Reporte por Sucursal">
              <Table
                headers={[
                  'Sucursal',
                  'Tickets',
                  'Ventas',
                  'Premios',
                  'Ganancia',
                ]}
                loading={loading}
                emptyMessage="No hay ventas en esta fecha"
              >
                {branchReports.map((b) => (
                  <tr key={b.branchId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium text-gray-900">
                        {b.branchName}
                      </p>
                      <p className="text-xs text-gray-500">{b.branchCode}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {b.totalTickets}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      ${b.totalSales.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">
                      ${b.totalPrizes.toFixed(2)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-bold ${
                        b.profit >= 0
                          ? 'text-primary-600'
                          : 'text-red-600'
                      }`}
                    >
                      ${b.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
