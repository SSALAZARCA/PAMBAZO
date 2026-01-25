import { useState } from 'react';
import { ChefHat, Clock, CheckCircle, AlertCircle, Package, Users, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { User } from '../shared/types';
import { toast } from 'sonner';

interface KitchenDashboardProps {
  user: User;
  onLogout: () => void;
}

const KitchenDashboard: React.FC<KitchenDashboardProps> = ({ user, onLogout }) => {
  const { orders, updateOrderStatus } = useStore();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');

  // Filtrar pedidos según el estado seleccionado
  const filteredOrders = orders.filter(order => {
    if (selectedStatus === 'all') return true;
    return order.status === selectedStatus;
  });

  // Función para cambiar el estado de un pedido
  const handleStatusChange = (orderId: string, newStatus: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled') => {
    updateOrderStatus(orderId, newStatus);

    const statusMessages = {
      pending: 'Pedido marcado como pendiente',
      preparing: 'Pedido en preparación',
      ready: 'Pedido listo para entregar',
      delivered: 'Pedido entregado',
      cancelled: 'Pedido cancelado'
    };

    toast.success(statusMessages[newStatus]);
  };

  // Obtener estadísticas de pedidos
  const getOrderStats = () => {
    const pending = orders.filter(order => order.status === 'pending').length;
    const preparing = orders.filter(order => order.status === 'preparing').length;
    const ready = orders.filter(order => order.status === 'ready').length;
    const total = orders.length;

    return { pending, preparing, ready, total };
  };

  const stats = getOrderStats();

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para obtener el icono del estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🥖</div>
              <div>
                <h1 className="text-xl font-bold text-orange-800">PAMBAZO - Cocina</h1>
                <p className="text-sm text-orange-600">Gestión de Pedidos</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Chef de Cocina</p>
              </div>
              <button
                onClick={onLogout}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Preparación</p>
                <p className="text-2xl font-bold text-blue-600">{stats.preparing}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ChefHat className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Listos</p>
                <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-orange-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrar Pedidos</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', label: 'Todos', icon: <Users className="w-4 h-4" /> },
              { key: 'pending', label: 'Pendientes', icon: <Clock className="w-4 h-4" /> },
              { key: 'preparing', label: 'En Preparación', icon: <ChefHat className="w-4 h-4" /> },
              { key: 'ready', label: 'Listos', icon: <CheckCircle className="w-4 h-4" /> }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedStatus(filter.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${selectedStatus === filter.key
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {filter.icon}
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Pedidos {selectedStatus !== 'all' && `- ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay pedidos para mostrar</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Pedido #{order.id.slice(-6)}</h3>
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status === 'pending' ? 'Pendiente' : order.status === 'preparing' ? 'En Preparación' : order.status === 'ready' ? 'Listo' : order.status}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Mesa</p>
                          <p className="font-medium">{order.tableId || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Mesero</p>
                          <p className="font-medium">{order.waiterId || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Hora</p>
                          <p className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Productos:</p>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                              <div>
                                <p className="font-medium">{item.product?.name || item.productName || 'Producto'}</p>
                                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                              </div>
                              <p className="font-semibold">${((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-gray-900">
                          Total: ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="ml-6 flex flex-col space-y-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'preparing')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                        >
                          <ChefHat className="w-4 h-4" />
                          <span>Iniciar Preparación</span>
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'ready')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Marcar Listo</span>
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <div className="text-center">
                          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
                            ✅ Listo para entregar
                          </div>
                        </div>
                      )}

                      {(order.status === 'pending' || order.status === 'preparing') && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>Cancelar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;