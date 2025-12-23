import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';
import { Coffee, Users, ShoppingCart, LogOut, Plus, Minus, X } from 'lucide-react';
import type { Table, Order, OrderItem } from '../../shared/types';
import { formatCOP, COLOMBIA_PRICES } from '../../src/utils/currency';

// Productos del menú con precios en pesos colombianos (COP)
const MENU_PRODUCTS = [
  { id: '1', name: 'Pan Dulce', price: COLOMBIA_PRICES.PAN_DULCE, category: 'Panadería' },
  { id: '2', name: 'Café Americano', price: COLOMBIA_PRICES.CAFE_AMERICANO, category: 'Bebidas' },
  { id: '3', name: 'Croissant', price: COLOMBIA_PRICES.CROISSANT, category: 'Panadería' },
  { id: '4', name: 'Jugo de Naranja', price: COLOMBIA_PRICES.JUGO_NARANJA, category: 'Bebidas' },
  { id: '5', name: 'Sandwich Club', price: COLOMBIA_PRICES.SANDWICH_CLUB, category: 'Comida' },
  { id: '6', name: 'Pastel de Chocolate', price: COLOMBIA_PRICES.PASTEL_CHOCOLATE, category: 'Postres' }
];

interface MobileWaiterDashboardProps {
  user?: any;
  onLogout?: () => void;
}

export function MobileWaiterDashboard({ user: propUser, onLogout }: MobileWaiterDashboardProps = {}) {
  const {
    user: storeUser,
    setUser,
    tables,
    orders,
    initializeTables,
    updateTableStatus,
    addOrder
  } = useStore();

  const user = propUser || storeUser;

  // Estados principales
  const [activeTab, setActiveTab] = useState('tables');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState('info');
  const [guestCount, setGuestCount] = useState(1);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderNotes, setOrderNotes] = useState('');

  // Inicializar mesas
  useEffect(() => {
    initializeTables();
  }, [initializeTables]);

  // Funciones de utilidad
  const getTableColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-300 text-green-800';
      case 'occupied': return 'bg-red-100 border-red-300 text-red-800';
      case 'reserved': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'cleaning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getTableStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      case 'cleaning': return 'Limpieza';
      default: return 'Desconocido';
    }
  };

  // Funciones principales
  const handleTableClick = (table: Table) => {
    console.log('🔥 MESA CLICKEADA:', table.number);
    setSelectedTable(table);
    setGuestCount(table.guestCount || 1);
    setShowModal(true);
    setModalTab('info');
    setOrderItems([]);
    setOrderNotes('');
    toast.success(`Mesa ${table.number} seleccionada`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTable(null);
    setOrderItems([]);
    setOrderNotes('');
    setModalTab('info');
  };

  const startSession = () => {
    if (!selectedTable || !user) return;

    updateTableStatus(selectedTable.id, 'occupied', guestCount, user.id);
    toast.success(`Mesa ${selectedTable.number} ocupada con ${guestCount} comensales`);
    setModalTab('order');
  };

  const addProductToOrder = (product: typeof MENU_PRODUCTS[0]) => {
    console.log('🔥 AGREGANDO PRODUCTO:', product.name);

    const existingItem = orderItems.find(item => item.productId === product.id);

    if (existingItem) {
      setOrderItems(prev => prev.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        notes: ''
      };
      setOrderItems(prev => [...prev, newItem]);
    }

    toast.success(`${product.name} agregado`);
  };

  const updateQuantity = (productId: string, change: number) => {
    setOrderItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const confirmOrder = () => {
    if (orderItems.length === 0) {
      toast.error('Agrega productos al pedido');
      return;
    }

    if (!user || !selectedTable) {
      toast.error('Error: Usuario o mesa no válidos');
      return;
    }

    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder: Order = {
      id: Date.now().toString(),
      tableId: selectedTable.id,
      tableNumber: selectedTable.number,
      items: orderItems,
      total: total,
      status: 'pending',
      waiterId: user.id,
      waiterName: user.name,
      customerName: `Mesa ${selectedTable.number}`,
      notes: orderNotes,
      createdAt: new Date().toISOString(),
      estimatedTime: 15
    };

    console.log('🔥 CREANDO PEDIDO:', newOrder);
    addOrder(newOrder);
    toast.success(`Pedido confirmado - Total: ${formatCOP(total)}`);

    setOrderItems([]);
    setOrderNotes('');
    setModalTab('orders');
  };

  const finishTable = () => {
    if (!selectedTable) return;

    updateTableStatus(selectedTable.id, 'available', 0);
    toast.success(`Mesa ${selectedTable.number} liberada`);
    closeModal();
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      setUser(null);
      localStorage.removeItem('pambazo_user');
    }
    toast.success('Sesión cerrada');
  };

  // Obtener pedidos de la mesa seleccionada
  const tableOrders = selectedTable ? orders.filter(order => order.tableId === selectedTable.id) : [];
  const activeOrders = tableOrders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
  const orderTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">PAMBAZO</h1>
              <p className="text-sm text-gray-600">Mesero: {user?.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="flex">
          {[
            { id: 'tables', label: 'Mesas', icon: Users },
            { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 bg-orange-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Icon className="h-4 w-4 mx-auto mb-1" />
                <div>{tab.label}</div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4">
        {activeTab === 'tables' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Gestión de Mesas</h2>
              <p className="text-gray-600">
                {tables.filter(t => t.waiterId === user?.id).length} mesas asignadas
              </p>
            </div>

            {/* Grid de Mesas */}
            <div className="grid grid-cols-2 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getTableColor(table.status)
                    }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold mb-1">Mesa {table.number}</div>
                    <div className="text-sm mb-2">{getTableStatusText(table.status)}</div>
                    <div className="text-xs">
                      <div>Capacidad: {table.capacity}</div>
                      {table.waiterName && (table.guestCount ?? 0) > 0 && (
                        <div>Comensales: {table.guestCount}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Mis Pedidos</h2>
              <p className="text-gray-600">
                {orders.filter(o => o.waiterId === user?.id).length} pedidos activos
              </p>
            </div>

            <div className="space-y-3">
              {orders.filter(o => o.waiterId === user?.id).map((order) => (
                <div key={order.id} className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">Pedido #{order.id.slice(-4)}</div>
                      <div className="text-sm text-gray-600">
                        Mesa {order.tableNumber} • {formatCOP(order.total)}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'ready' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {order.status === 'pending' ? 'Pendiente' :
                        order.status === 'preparing' ? 'Preparando' :
                          order.status === 'ready' ? 'Listo' : 'Entregado'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.productName}</span>
                        <span>{formatCOP(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Simple */}
      {showModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Mesa {selectedTable.number}</h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="border-b">
              <div className="flex">
                {[
                  { id: 'info', label: 'Información' },
                  { id: 'order', label: 'Nuevo Pedido' },
                  { id: 'orders', label: 'Pedidos Activos' },
                  { id: 'finish', label: 'Finalizar' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${modalTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {modalTab === 'info' && (
                <div className="space-y-4">
                  <h4 className="font-medium">Gestión de Ocupantes</h4>

                  {selectedTable.status === 'available' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Número de Comensales</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                            className="p-1 border rounded hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1 border rounded text-center min-w-[50px]">{guestCount}</span>
                          <button
                            onClick={() => setGuestCount(guestCount + 1)}
                            className="p-1 border rounded hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={startSession}
                        className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
                      >
                        Iniciar Sesión
                      </button>
                    </div>
                  )}

                  {selectedTable.status === 'occupied' && (
                    <div className="space-y-2">
                      <p><strong>Comensales:</strong> {selectedTable.guestCount}</p>
                      <p><strong>Mesero:</strong> {user?.name}</p>
                      <button
                        onClick={() => setModalTab('order')}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                      >
                        Tomar Pedido
                      </button>
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'order' && (
                <div className="space-y-4">
                  <h4 className="font-medium">Nuevo Pedido</h4>

                  {/* Lista de Productos */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Productos Disponibles</h5>
                    {MENU_PRODUCTS.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.category}</div>
                          <div className="text-sm font-medium">{formatCOP(product.price)}</div>
                        </div>
                        <button
                          onClick={() => addProductToOrder(product)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Agregar
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pedido Actual */}
                  {orderItems.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Pedido Actual</h5>
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-gray-600">
                              {formatCOP(item.price)} x {item.quantity} = {formatCOP(item.price * item.quantity)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="p-1 border rounded hover:bg-gray-100"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="p-1 border rounded hover:bg-gray-100"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <div>
                        <label className="block text-sm font-medium mb-1">Notas Especiales</label>
                        <textarea
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Instrucciones especiales..."
                          className="w-full p-2 border rounded text-sm"
                          rows={2}
                        />
                      </div>

                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold">{formatCOP(orderTotal)}</span>
                        </div>
                        <button
                          onClick={confirmOrder}
                          className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
                        >
                          Confirmar Pedido
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Pedidos Activos</h4>
                    <button
                      onClick={() => setModalTab('order')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Agregar Más Pedidos
                    </button>
                  </div>

                  {activeOrders.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">No hay pedidos activos</p>
                  ) : (
                    <div className="space-y-3">
                      {activeOrders.map((order) => (
                        <div key={order.id} className="border rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">Pedido #{order.id.slice(-4)}</div>
                              <div className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {order.status === 'pending' ? 'Pendiente' :
                                order.status === 'preparing' ? 'Preparando' : 'Listo'}
                            </div>
                          </div>

                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.productName}</span>
                                <span>{formatCOP(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Total: {formatCOP(order.total)}</span>
                              <span className="text-sm text-gray-600">{order.estimatedTime} min</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'finish' && (
                <div className="space-y-4">
                  <h4 className="font-medium">Finalizar Mesa</h4>

                  <div className="space-y-2">
                    <p><strong>Mesa:</strong> {selectedTable.number}</p>
                    <p><strong>Comensales:</strong> {selectedTable.guestCount}</p>
                    <p><strong>Pedidos activos:</strong> {activeOrders.length}</p>
                    <p><strong>Total facturado:</strong> {formatCOP(tableOrders.reduce((sum, order) => sum + order.total, 0))}</p>
                  </div>

                  {activeOrders.length > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ Hay pedidos activos. Completa todos los pedidos antes de finalizar.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={finishTable}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                  >
                    Finalizar Mesa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileWaiterDashboard;