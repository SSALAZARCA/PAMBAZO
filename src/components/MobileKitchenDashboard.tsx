import React, { useState } from 'react';
import { ChefHat, Clock, CheckCircle, AlertCircle, Package, TrendingUp, Filter, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { User } from '../shared/types';
import { toast } from 'sonner';

interface MobileKitchenDashboardProps {
  user: User;
  onLogout: () => void;
}

const MobileKitchenDashboard: React.FC<MobileKitchenDashboardProps> = ({ onLogout }) => {
  const { orders, updateOrderStatus } = useStore();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const [showFilters, setShowFilters] = useState(false);

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
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'preparing': return <ChefHat className="w-3 h-3" />;
      case 'ready': return <CheckCircle className="w-3 h-3" />;
      case 'delivered': return <Package className="w-3 h-3" />;
      case 'cancelled': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🥖</div>
              <div>
                <h1 className="text-lg font-bold text-orange-800">PAMBAZO</h1>
                <p className="text-xs text-orange-600">Cocina</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pendientes</p>
                <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Preparando</p>
                <p className="text-lg font-bold text-blue-600">{stats.preparing}</p>
              </div>
              <ChefHat className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Listos</p>
                <p className="text-lg font-bold text-green-600">{stats.ready}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-bold text-orange-600">{stats.total}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-orange-100 text-sm"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>

          {showFilters && (
            <div className="mt-2 bg-white rounded-lg p-3 shadow-sm border border-orange-100">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedStatus === 'all'
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectedStatus('pending')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Pendientes
                </button>
                <button
                  onClick={() => setSelectedStatus('preparing')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedStatus === 'preparing'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Preparando
                </button>
                <button
                  onClick={() => setSelectedStatus('ready')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedStatus === 'ready'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Listos
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-orange-100">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No hay pedidos para mostrar</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Pedido #{order.id.slice(-6)}</h3>
                    <p className="text-xs text-gray-500">Mesa {order.tableNumber}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">Productos:</p>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span>{item.quantity}x {item.productName}</span>
                        <span className="text-gray-500">${item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    Total: ${order.total}
                  </span>
                  <div className="flex space-x-1">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'preparing')}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        Preparar
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'ready')}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        Listo
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'delivered')}
                        className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                      >
                        Entregar
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
  );
};

export default MobileKitchenDashboard;