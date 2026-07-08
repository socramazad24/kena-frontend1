import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function CashierHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="p-8">
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-800">
          ¡Hola, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Bienvenido al panel de cajero</p>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🎮</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Nueva Apuesta
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Vender tickets a los jugadores
            </p>
            <Button onClick={() => navigate('/cashier/new-bet')} className="w-full">
              Empezar a Vender
            </Button>
          </div>
        </Card>

        <Card>
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Buscar Ticket
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Buscar tickets por código
            </p>
            <Button
              onClick={() => navigate('/cashier/search')}
              variant="secondary"
              className="w-full"
            >
              Buscar
            </Button>
          </div>
        </Card>

        <Card>
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Pagar Premio
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Pagar premios a ganadores
            </p>
            <Button
              onClick={() => navigate('/cashier/pay')}
              variant="secondary"
              className="w-full"
            >
              Ir a Pagar
            </Button>
          </div>
        </Card>

        <Card>
          <div className="text-center py-4">
            <div className="text-5xl mb-3">💼</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Mi Caja</h3>
            <p className="text-sm text-gray-500 mb-4">
              Abrir o cerrar caja
            </p>
            <Button
              onClick={() => navigate('/cashier/cash')}
              variant="secondary"
              className="w-full"
            >
              Gestionar Caja
            </Button>
          </div>
        </Card>

        <Card>
          <div className="text-center py-4">
            <div className="text-5xl mb-3">💰</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Mis Apuestas
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Ver tickets que he vendido
            </p>
            <Button
              onClick={() => navigate('/cashier/my-bets')}
              variant="secondary"
              className="w-full"
            >
              Ver Tickets
            </Button>
          </div>
        </Card>

        <Card>
          <div className="text-center py-4">
            <div className="text-5xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Reportes</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ver reportes del día
            </p>
            <Button
              onClick={() => navigate('/cashier/reports')}
              variant="secondary"
              className="w-full"
            >
              Ver Reportes
            </Button>
          </div>
        </Card>
      </div>

      {/* Tips */}
      <Card className="mt-8" title="💡 Tips Rápidos">
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Para vender, ve a "Nueva Apuesta" y selecciona los números</li>
          <li>• Antes de vender, asegúrate de tener la caja abierta</li>
          <li>• Para pagar premios, busca el ticket por su código</li>
          <li>• El sorteo se realiza automáticamente al finalizar la ronda</li>
        </ul>
      </Card>
    </div>
  );
}
