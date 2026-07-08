import { useState, useEffect } from 'react';
import reportsService, {
  type DailySales,
  type PaidPrizes,
  type CashierBalance,
} from '../../services/reports.service';
import { useAuth } from '../../context/AuthContext';
import cashiersService from '../../services/cashiers.service';
import type { Cashier } from '../../types';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

export default function CashierReportsPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sales, setSales] = useState<DailySales | null>(null);
  const [prizes, setPrizes] = useState<PaidPrizes | null>(null);
  const [myBalance, setMyBalance] = useState<CashierBalance[]>([]);
  const [myCashier, setMyCashier] = useState<Cashier | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function loadData() {
    try {
      setLoading(true);
      const cashiers = await cashiersService.findAll();
      const mine = cashiers.find((c) => c.userId === user?.id);
      if (!mine) return;

      setMyCashier(mine);

      const [salesData, prizesData, balanceData] = await Promise.all([
        reportsService.getDailySales(date),
        reportsService.getPaidPrizes(date),
        reportsService.getBalanceByCashier(mine.id, date),
      ]);

      setSales(salesData);
      setPrizes(prizesData);
      setMyBalance(balanceData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Mis Reportes
          </h1>
          <p className="text-gray-500 mt-1">
            Tus ventas y balance del día
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Fecha:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl"
          />
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <p className="text-sm text-gray-500">Mis Ventas</p>
          <p className="text-3xl font-display font-bold text-green-600 mt-1">
            ${sales?.totalSales.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {sales?.totalTickets || 0} tickets
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">Premios Pagados</p>
          <p className="text-3xl font-display font-bold text-red-600 mt-1">
            ${prizes?.totalAmount.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {prizes?.totalPaid || 0} tickets
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">Ticket Promedio</p>
          <p className="text-3xl font-display font-bold text-primary-600 mt-1">
            ${sales?.averageTicket.toFixed(2) || '0.00'}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">Balance Actual</p>
          <p className="text-3xl font-display font-bold text-primary-700 mt-1">
            $
            {myBalance.length > 0
              ? myBalance[myBalance.length - 1].currentBalance.toFixed(2)
              : '0.00'}
          </p>
        </Card>
      </div>

      {/* Mis sesiones de caja */}
      <Card title="Mis Sesiones de Caja">
        <Table
          headers={['Apertura', 'Cierre', 'Inicial', 'Ventas', 'Premios', 'Balance', 'Estado']}
          emptyMessage="No tienes sesiones en esta fecha"
        >
          {myBalance.map((s) => (
            <tr key={s.sessionId} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(s.openedAt).toLocaleTimeString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {s.closedAt ? new Date(s.closedAt).toLocaleTimeString() : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                ${s.initialAmount.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm text-green-600 font-medium">
                +${s.totalSales.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm text-red-600 font-medium">
                -${s.totalPrizes.toFixed(2)}
              </td>
              <td
                className={`px-6 py-4 text-sm font-bold ${
                  s.currentBalance >= 0 ? 'text-primary-600' : 'text-red-600'
                }`}
              >
                ${s.currentBalance.toFixed(2)}
              </td>
              <td className="px-6 py-4">
                <Badge variant={s.status === 'open' ? 'success' : 'gray'}>
                  {s.status === 'open' ? 'Abierta' : 'Cerrada'}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
