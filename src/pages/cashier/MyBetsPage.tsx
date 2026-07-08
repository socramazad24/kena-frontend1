import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import cashiersService from '../../services/cashiers.service';
import betsService from '../../services/bets.service';
import type { Ticket, Cashier, TicketStatus } from '../../types';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function MyBetsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [myCashier, setMyCashier] = useState<Cashier | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const cashiers = await cashiersService.findAll();
      const mine = cashiers.find((c) => c.userId === user?.id);
      if (!mine) return;
      setMyCashier(mine);

      // Filtrar tickets por mi cashierId
      const all = await betsService.findAll();
      const myTickets = all.filter((t) => t.cashierId === mine.id);
      setTickets(myTickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);

  const statusVariants: Record<string, 'success' | 'danger' | 'warning' | 'gray' | 'info'> = {
    active: 'info',
    won: 'success',
    lost: 'danger',
    paid: 'success',
    cancelled: 'gray',
  };

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    won: 'Ganador',
    lost: 'Perdedor',
    paid: 'Pagado',
    cancelled: 'Cancelado',
  };

  // Stats
  const totalSales = tickets.reduce((sum, t) => sum + Number(t.totalAmount), 0);
  const totalPrizes = tickets.reduce((sum, t) => sum + Number(t.prizeAmount), 0);
  const winners = tickets.filter((t) => t.prizeAmount > 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Mis Apuestas
        </h1>
        <p className="text-gray-500 mt-1">
          Tickets que has vendido hoy
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <p className="text-sm text-gray-500">Total Vendidos</p>
          <p className="text-3xl font-display font-bold text-gray-800 mt-1">
            {tickets.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Ventas</p>
          <p className="text-3xl font-display font-bold text-green-600 mt-1">
            ${totalSales.toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Tickets Ganadores</p>
          <p className="text-3xl font-display font-bold text-primary-600 mt-1">
            {winners.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Premios Generados</p>
          <p className="text-3xl font-display font-bold text-red-600 mt-1">
            ${totalPrizes.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex gap-2">
        {(['all', 'active', 'won', 'lost', 'paid'] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'primary' : 'ghost'}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todos' : statusLabels[f]}
          </Button>
        ))}
      </div>

      {/* Tabla */}
      <Card>
        <Table
          headers={['Código', 'Fecha', 'Números', 'Total', 'Premio', 'Estado']}
          loading={loading}
          emptyMessage="No has vendido tickets aún"
        >
          {filtered.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-mono font-medium text-primary-600">
                {t.code}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(t.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex flex-wrap gap-1">
                  {t.numbers.map((n) => (
                    <span
                      key={n.id}
                      className="px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-mono"
                    >
                      {n.number}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-800">
                ${Number(t.totalAmount).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm font-bold text-green-600">
                {t.prizeAmount > 0 ? `$${Number(t.prizeAmount).toFixed(2)}` : '-'}
              </td>
              <td className="px-6 py-4">
                <Badge variant={statusVariants[t.status]}>
                  {statusLabels[t.status]}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
