import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatCOP, COLOMBIA_PRICES } from '../src/utils/currency';
import { Badge } from './ui/badge';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  Clock,
  LogOut,
  Utensils,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Users,
  Star,
  Plus,
  Minus,
  X,
  Coffee,
  Menu,
  DollarSign,
  TrendingUp,
  Timer,
  ChefHat,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';
import { NotificationCenter, useNotifications } from './ui/notifications';
import type { User, Order, Table } from '../shared/types';

// 🥖 PAMBASO - Dashboard del Mesero Desktop
// Gestión de pedidos y control de mesas con grid 2x4

// Gestión de pedidos y control de mesas con grid 2x4

interface DashboardTable extends Omit<Table, 'currentOrder'> {
  currentOrder: Order | null | undefined;
}

const mockTables: DashboardTable[] = [
  { id: '1', number: 1, capacity: 4, status: 'occupied', currentOrder: { id: 'order-1', items: [], status: 'preparing', total: 0, notes: '', tableNumber: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), customerId: 'customer-1', tableId: '1', customerName: 'Cliente 1', waiterId: 'waiter-1', waiterName: 'Juan Pérez' }, waiterId: 'waiter-1' },
  { id: '2', number: 2, capacity: 2, status: 'available', currentOrder: undefined, waiterId: undefined },
  { id: '3', number: 3, capacity: 6, status: 'reserved', currentOrder: undefined, waiterId: 'waiter-1' },
  { id: '4', number: 4, capacity: 4, status: 'occupied', currentOrder: { id: 'order-2', items: [], status: 'ready', total: 0, notes: '', tableNumber: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), customerId: 'customer-2', tableId: '4', customerName: 'Cliente 2', waiterId: 'waiter-1', waiterName: 'Juan Pérez' }, waiterId: 'waiter-1' },
  { id: '5', number: 5, capacity: 2, status: 'cleaning', currentOrder: undefined, waiterId: undefined },
  { id: '6', number: 6, capacity: 4, status: 'available', currentOrder: undefined, waiterId: undefined },
  { id: '7', number: 7, capacity: 8, status: 'occupied', currentOrder: { id: 'order-3', items: [], status: 'pending', total: 0, notes: '', tableNumber: 7, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), customerId: 'customer-3', tableId: '7', customerName: 'Cliente 3', waiterId: 'waiter-2', waiterName: 'Maria Garcia' }, waiterId: 'waiter-2' },
  { id: '8', number: 8, capacity: 4, status: 'available', currentOrder: undefined, waiterId: undefined },
];

const mockOrders: Order[] = [
  {
    id: 'order-1',
    customerId: 'customer-1',
    customerName: 'Juan Pérez',
    items: [
      { id: 'item-1', productId: '1', productName: 'Pan Dulce Tradicional PAMBAZO', price: COLOMBIA_PRICES.PAN_DULCE, quantity: 2, notes: '', customizations: [] },
      { id: 'item-2', productId: '3', productName: 'Pastel de Chocolate Gourmet', price: COLOMBIA_PRICES.PASTEL_CHOCOLATE, quantity: 1, notes: 'Sin cebolla', customizations: [] }
    ],
    status: 'preparing',
    total: 89.98,
    notes: 'Mesa junto a la ventana',
    tableNumber: 1,
    tableId: '1',
    waiterId: 'waiter-1',
    waiterName: 'Carlos Mesero',
    estimatedTime: 15,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'order-2',
    customerId: 'customer-2',
    customerName: 'Ana García',
    items: [
      { id: 'item-3', productId: '2', productName: 'Pan de Caja Integral Premium', price: 8000, quantity: 1, notes: '', customizations: [] }
    ],
    status: 'ready',
    total: 45.00,
    notes: '',
    tableNumber: 4,
    tableId: '4',
    waiterId: 'waiter-1',
    waiterName: 'Carlos Mesero',
    estimatedTime: 5,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'order-3',
    customerId: 'customer-3',
    customerName: 'Luis Rodríguez',
    items: [
      { id: 'item-4', productId: '5', productName: 'Concha de Chocolate Premium', price: COLOMBIA_PRICES.CONCHA, quantity: 3, notes: '', customizations: [] },
      { id: 'item-5', productId: '1', productName: 'Pan Dulce Tradicional PAMBAZO', price: COLOMBIA_PRICES.PAN_DULCE, quantity: 1, notes: 'Extra canela', customizations: [] }
    ],
    status: 'pending',
    total: 85.00,
    notes: 'Cliente con alergia al gluten',
    tableNumber: 7,
    tableId: '7',
    waiterId: 'waiter-2',
    waiterName: 'María Mesera',
    estimatedTime: 20,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockProducts = [
  { id: '1', name: 'Pan Dulce Tradicional PAMBAZO', price: COLOMBIA_PRICES.PAN_DULCE, category: 'Panadería' },
  { id: '2', name: 'Pan de Caja Integral Premium', price: 8000, category: 'Panadería' },
  { id: '3', name: 'Pastel de Chocolate Gourmet', price: COLOMBIA_PRICES.PASTEL_CHOCOLATE, category: 'Repostería' },
  { id: '5', name: 'Concha de Chocolate Premium', price: COLOMBIA_PRICES.CONCHA, category: 'Panadería' }
];

export default function WaiterDashboard({ user, onLogout }: { user: User; onLogout?: () => void }) {
  const { setUser } = useStore();
  const [selectedTable, setSelectedTable] = useState<DashboardTable | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tables, setTables] = useState<DashboardTable[]>(mockTables);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('tables');
  const [dailyTips, setDailyTips] = useState(125.50);
  const [tablesServed] = useState(8);
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    tableNumber: '',
    customerName: '',
    customerPhone: '',
    notes: '',
    items: [] as Array<{ productId: string, quantity: number, notes: string }>
  });
  const [orderTotal, setOrderTotal] = useState(0);

  // Sistema de notificaciones
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    generateOrderReadyNotification,
    generateUrgentOrderNotification,
    generateTipNotification
  } = useNotifications();

  // Efectos para generar notificaciones automáticas
  useEffect(() => {
    // Verificar pedidos urgentes (más de 30 minutos)
    const checkUrgentOrders = () => {
      orders.forEach(order => {
        const elapsedTime = getElapsedTime(order.createdAt);
        if (elapsedTime > 30 && (order.status === 'pending' || order.status === 'preparing')) {
          generateUrgentOrderNotification(order.id, elapsedTime, order.tableNumber);
        }
      });
    };

    // Verificar cada 5 minutos
    const interval = setInterval(checkUrgentOrders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [orders, generateUrgentOrderNotification]);

  // Generar notificación cuando un pedido esté listo
  useEffect(() => {
    orders.forEach(order => {
      if (order.status === 'ready') {
        // Solo generar si no se ha notificado antes (simulado)
        const lastNotified = localStorage.getItem(`notified_${order.id}`);
        if (!lastNotified) {
          generateOrderReadyNotification(order.id, order.tableNumber);
          localStorage.setItem(`notified_${order.id}`, 'true');
        }
      }
    });
  }, [orders, generateOrderReadyNotification]);

  // Calcular total automáticamente cuando cambien los items del pedido
  useEffect(() => {
    calculateOrderTotal();
  }, [newOrderData.items]);

  const getTableStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-300 text-green-800';
      case 'occupied': return 'bg-red-100 border-red-300 text-red-800';
      case 'reserved': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'cleaning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getTableStatusIcon = (status: Table['status']) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'occupied': return <Users className="h-4 w-4" />;
      case 'reserved': return <Clock className="h-4 w-4" />;
      case 'cleaning': return <AlertCircle className="h-4 w-4" />;
      default: return <Coffee className="h-4 w-4" />;
    }
  };

  const getOrderStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber?.toString().includes(searchTerm) ||
      order.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateTableStatus = (tableId: string, newStatus: Table['status']) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        const updatedTable = { ...table, status: newStatus };
        // Si se libera la mesa, limpiar datos
        if (newStatus === 'available') {
          updatedTable.currentOrder = null;
          updatedTable.waiterId = undefined;
        }
        // Si se ocupa la mesa, asignar al mesero actual
        if (newStatus === 'occupied' && user) {
          updatedTable.waiterId = user.id;
        }
        return updatedTable;
      }
      return table;
    }));
    toast.success(`Mesa ${tables.find(t => t.id === tableId)?.number} actualizada a ${newStatus}`);
  };



  const getOccupationTime = (table: any) => {
    if (table.status !== 'occupied') return null;
    // Simulamos tiempo de ocupación
    const times = ['15 min', '32 min', '1h 5min', '45 min', '2h 15min'];
    return times[parseInt(table.id) % times.length];
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, status: newStatus, updatedAt: new Date() };

        // Generar notificación de propina cuando se entrega un pedido
        if (newStatus === 'delivered') {
          const tipAmount = Math.random() * 50 + 10; // Propina aleatoria entre $10-60
          setTimeout(() => {
            generateTipNotification(tipAmount, order.tableNumber);
            setDailyTips(prev => prev + tipAmount);
          }, 2000); // Simular delay de propina
        }

        return updatedOrder;
      }
      return order;
    }));
    toast.success(`Pedido ${orderId} actualizado a ${getOrderStatusLabel(newStatus)}`);
  };

  const getElapsedTime = (createdAt: Date | string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    return diff;
  };

  const getProductName = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    return product ? product.name : 'Producto desconocido';
  };

  const getProductPrice = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    return product ? product.price : 0;
  };

  // Funciones para nuevo pedido
  const addProductToNewOrder = (productId: string) => {
    const existingItem = newOrderData.items.find(item => item.productId === productId);
    if (existingItem) {
      setNewOrderData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }));
    } else {
      setNewOrderData(prev => ({
        ...prev,
        items: [...prev.items, { productId, quantity: 1, notes: '' }]
      }));
    }
    calculateOrderTotal();
  };

  const removeProductFromNewOrder = (productId: string) => {
    setNewOrderData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)
    }));
    calculateOrderTotal();
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromNewOrder(productId);
      return;
    }
    setNewOrderData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    }));
    calculateOrderTotal();
  };

  const calculateOrderTotal = () => {
    const total = newOrderData.items.reduce((sum, item) => {
      const price = getProductPrice(item.productId);
      return sum + (price * item.quantity);
    }, 0);
    setOrderTotal(total);
  };

  const handleCreateOrder = () => {
    if (!newOrderData.tableNumber || newOrderData.items.length === 0) {
      toast.error('Por favor selecciona una mesa y agrega al menos un producto');
      return;
    }

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      customerId: `customer-${Date.now()}`,
      items: newOrderData.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        productId: item.productId,
        productName: getProductName(item.productId),
        price: getProductPrice(item.productId),
        quantity: item.quantity,
        notes: item.notes,
        customizations: []
      })),
      status: 'pending',
      total: orderTotal,
      notes: newOrderData.notes,
      tableNumber: parseInt(newOrderData.tableNumber),
      tableId: tables.find(t => t.number === parseInt(newOrderData.tableNumber))?.id || '',
      customerName: newOrderData.customerName || 'Cliente General',
      waiterId: user.id || '',
      waiterName: user.name || '',
      estimatedTime: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOrders(prev => [...prev, newOrder]);

    // Actualizar estado de la mesa
    updateTableStatus(newOrderData.tableNumber, 'occupied');
    setTables(prev => prev.map(table =>
      table.number === parseInt(newOrderData.tableNumber)
        ? { ...table, currentOrder: newOrder }
        : table
    ));

    // Limpiar formulario
    setNewOrderData({
      tableNumber: '',
      customerName: '',
      customerPhone: '',
      notes: '',
      items: []
    });
    setOrderTotal(0);
    setIsNewOrderDialogOpen(false);

    toast.success(`Pedido creado exitosamente para la mesa ${newOrderData.tableNumber}`);
  };

  const resetNewOrderForm = () => {
    setNewOrderData({
      tableNumber: '',
      customerName: '',
      customerPhone: '',
      notes: '',
      items: []
    });
    setOrderTotal(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">PAMBAZO</h1>
              <p className="text-xs text-muted-foreground">Mesero - {user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats rápidas */}
            <div className="hidden md:flex items-center gap-4 mr-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Pedidos activos</p>
                <p className="text-lg font-bold text-orange-600">{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Mesas ocupadas</p>
                <p className="text-lg font-bold text-blue-600">{tables.filter(t => t.status === 'occupied').length}/8</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Propinas hoy</p>
                <p className="text-lg font-bold text-green-600">{formatCOP(dailyTips)}</p>
              </div>
            </div>

            {/* Centro de Notificaciones */}
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDismiss={dismissNotification}
              className="mr-2"
            />

            {/* Menú lateral */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="space-y-4 pt-6">
                  <div className="px-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">Mesero</p>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas del día */}
                  <div className="px-3 space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Estadísticas del día</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                        <div className="flex items-center gap-2">
                          <Utensils className="h-4 w-4 text-orange-600" />
                          <span className="text-sm">Mesas atendidas</span>
                        </div>
                        <span className="font-bold text-orange-600">{tablesServed}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Propinas</span>
                        </div>
                        <span className="font-bold text-green-600">${dailyTips.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Promedio/mesa</span>
                        </div>
                        <span className="font-bold text-blue-600">${(dailyTips / tablesServed).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Navegación */}
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('tables')}
                    >
                      <Utensils className="h-4 w-4 mr-2" />
                      Control de Mesas
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('orders')}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Gestión de Pedidos
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('profile')}
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      Mi Perfil
                    </Button>
                  </div>

                  {/* Logout */}
                  <div className="border-t pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setUser(null);
                        localStorage.removeItem('pambazo_user');
                        if (onLogout) {
                          onLogout();
                        }
                        toast.success('Sesión cerrada exitosamente');
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Navegación móvil */}
          <div className="grid grid-cols-3 gap-2 mb-4 md:hidden">
            {[
              { id: 'tables', label: '🍽️', title: 'Mesas' },
              { id: 'orders', label: '📋', title: 'Pedidos' },
              { id: 'profile', label: '👤', title: 'Perfil' },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col p-3 h-auto"
              >
                <span className="text-lg mb-1">{tab.label}</span>
                <span className="text-xs">{tab.title}</span>
              </Button>
            ))}
          </div>

          {/* Navegación desktop */}
          <TabsList className="hidden md:grid w-full grid-cols-3 bg-orange-50 border border-orange-200">
            <TabsTrigger
              value="tables"
              className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"
            >
              <Utensils className="h-4 w-4 mr-2" />
              Control de Mesas
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              Gestión de Pedidos
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Mi Perfil
            </TabsTrigger>
          </TabsList>

          {/* Control de Mesas */}
          <TabsContent value="tables" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Control de Mesas (Grid 2x4)</h2>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Disponible: {tables.filter(t => t.status === 'available').length}
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <Users className="h-3 w-3 mr-1" />
                  Ocupada: {tables.filter(t => t.status === 'occupied').length}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Reservada: {tables.filter(t => t.status === 'reserved').length}
                </Badge>
              </div>
            </div>

            {/* Grid 2x4 de Mesas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tables.map(table => {
                const tableOrder = orders.find(order => order.tableNumber === table.number && order.status !== 'delivered');
                const occupationTime = getOccupationTime(table);
                const isMyTable = table.waiterId === user?.id;
                return (
                  <Card
                    key={table.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 ${getTableStatusColor(table.status)
                      } ${isMyTable ? 'ring-2 ring-orange-400' : ''}`}
                    onClick={() => {
                      setSelectedTable(table);
                      setIsTableDialogOpen(true);
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">Mesa {table.number}</CardTitle>
                        <div className="flex items-center gap-1">
                          {isMyTable && <Star className="h-4 w-4 text-orange-500 fill-current" />}
                          {getTableStatusIcon(table.status)}
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-xs">
                        <Users className="h-3 w-3" />
                        {table.capacity} personas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Badge className={getTableStatusColor(table.status)}>
                        {table.status === 'available' && 'Disponible'}
                        {table.status === 'occupied' && 'Ocupada'}
                        {table.status === 'reserved' && 'Reservada'}
                        {table.status === 'cleaning' && 'Limpieza'}
                      </Badge>

                      {occupationTime && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <Clock className="h-3 w-3" />
                          <span>{occupationTime}</span>
                        </div>
                      )}

                      {tableOrder && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="font-medium">Pedido: {tableOrder.id.slice(-4)}</span>
                          </div>
                          <Badge className={getOrderStatusColor(tableOrder.status)}>
                            {getOrderStatusLabel(tableOrder.status)}
                          </Badge>
                          <div className="text-xs text-gray-600">
                            ${tableOrder.total.toFixed(2)}
                          </div>
                          {tableOrder.estimatedTime && (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <Timer className="h-3 w-3" />
                              {tableOrder.estimatedTime}min
                            </div>
                          )}
                        </div>
                      )}

                      {/* Botones de acción rápida */}
                      <div className="flex gap-1 mt-2">
                        {table.status === 'available' && (
                          <Button

                            variant="outline"
                            className="text-xs h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTableStatus(table.id, 'occupied');
                            }}
                          >
                            Ocupar
                          </Button>
                        )}
                        {table.status === 'occupied' && (
                          <Button

                            variant="outline"
                            className="text-xs h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTableStatus(table.id, 'cleaning');
                            }}
                          >
                            Limpiar
                          </Button>
                        )}
                        {table.status === 'cleaning' && (
                          <Button

                            variant="outline"
                            className="text-xs h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTableStatus(table.id, 'available');
                            }}
                          >
                            Listo
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Gestión de Pedidos */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h2>
                <p className="text-sm text-muted-foreground">Administra todos los pedidos activos y su estado</p>
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <Button
                  onClick={() => setIsNewOrderDialogOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Pedido
                </Button>
                <Input
                  placeholder="Buscar pedidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="preparing">Preparando</SelectItem>
                    <SelectItem value="ready">Listo</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                    <p className="text-xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <ChefHat className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preparando</p>
                    <p className="text-xl font-bold text-blue-600">{orders.filter(o => o.status === 'preparing').length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Listos</p>
                    <p className="text-xl font-bold text-green-600">{orders.filter(o => o.status === 'ready').length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Bell className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Urgentes</p>
                    <p className="text-xl font-bold text-orange-600">{orders.filter(o => getElapsedTime(o.createdAt) > 30).length}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map(order => {
                const elapsedTime = getElapsedTime(order.createdAt);
                const isUrgent = elapsedTime > 30;
                return (
                  <Card
                    key={order.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 ${isUrgent ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsOrderDialogOpen(true);
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">Pedido {order.id}</CardTitle>
                        {isUrgent && <Bell className="h-5 w-5 text-red-500 animate-pulse" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getOrderStatusColor(order.status)}>
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                        {order.tableNumber && (
                          <Badge variant="outline">
                            Mesa {order.tableNumber}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <p><strong>Items:</strong> {order.items.length}</p>
                          <p><strong>Total:</strong> {formatCOP(order.total)}</p>
                          <p><strong>Tiempo transcurrido:</strong> {elapsedTime} min</p>
                          {order.estimatedTime && (
                            <p className="flex items-center gap-1 text-orange-600">
                              <Timer className="h-3 w-3" />
                              <strong>Tiempo estimado:</strong> {order.estimatedTime} min
                            </p>
                          )}
                        </div>

                        {order.notes && (
                          <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                              <strong>Notas:</strong> {order.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, 'preparing');
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              Iniciar preparación
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, 'ready');
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              Marcar como listo
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, 'delivered');
                              }}
                              className="bg-gray-500 hover:bg-gray-600 text-white"
                            >
                              Marcar como entregado
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay pedidos</h3>
                <p className="text-gray-500">No se encontraron pedidos con los filtros aplicados</p>
              </div>
            )}
          </TabsContent>

          {/* Mi Perfil */}
          <TabsContent value="profile" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h2>

              {/* Información personal */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{user?.name}</h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                      <Badge variant="outline">Mesero</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas del día */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estadísticas del Día
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Utensils className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">{tablesServed}</p>
                      <p className="text-sm text-muted-foreground">Mesas atendidas</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{formatCOP(dailyTips)}</p>
                      <p className="text-sm text-muted-foreground">Propinas del día</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{formatCOP(dailyTips / tablesServed)}</p>
                      <p className="text-sm text-muted-foreground">Promedio por mesa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resumen de actividad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Resumen de Actividad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Pedidos activos</span>
                      <Badge variant="outline">{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Mesas ocupadas</span>
                      <Badge variant="outline">{tables.filter(t => t.status === 'occupied').length}/8</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Tiempo de turno</span>
                      <Badge variant="outline">6h 30m</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span>Calificación promedio</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">4.8</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Mesa */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedTable && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Mesa {selectedTable.number}
                  {selectedTable.waiterId === user?.id && (
                    <Badge variant="outline" className="ml-2">
                      <Star className="h-3 w-3 mr-1" />
                      Mi mesa
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Capacidad: {selectedTable.capacity} personas • Estado: {selectedTable.status}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Estado actual */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Estado actual</span>
                    <Badge className={getTableStatusColor(selectedTable.status)}>
                      {selectedTable.status === 'available' && 'Disponible'}
                      {selectedTable.status === 'occupied' && 'Ocupada'}
                      {selectedTable.status === 'reserved' && 'Reservada'}
                      {selectedTable.status === 'cleaning' && 'En limpieza'}
                    </Badge>
                  </div>
                  {getOccupationTime(selectedTable) && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <Clock className="h-4 w-4" />
                      <span>Tiempo ocupada: {getOccupationTime(selectedTable)}</span>
                    </div>
                  )}
                </div>

                {/* Cambiar estado */}
                <div>
                  <label className="block text-sm font-medium mb-2">Cambiar estado</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedTable.status === 'available' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        updateTableStatus(selectedTable.id, 'available');
                        setSelectedTable({ ...selectedTable, status: 'available' });
                      }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Disponible
                    </Button>
                    <Button
                      variant={selectedTable.status === 'occupied' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        updateTableStatus(selectedTable.id, 'occupied');
                        setSelectedTable({ ...selectedTable, status: 'occupied' });
                      }}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Ocupada
                    </Button>
                    <Button
                      variant={selectedTable.status === 'reserved' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        updateTableStatus(selectedTable.id, 'reserved');
                        setSelectedTable({ ...selectedTable, status: 'reserved' });
                      }}
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Reservada
                    </Button>
                    <Button
                      variant={selectedTable.status === 'cleaning' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        updateTableStatus(selectedTable.id, 'cleaning');
                        setSelectedTable({ ...selectedTable, status: 'cleaning' });
                      }}
                      className="flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Limpieza
                    </Button>
                  </div>
                </div>

                {/* Pedido activo */}
                {selectedTable.currentOrder && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800">Pedido activo</p>
                        <p className="text-sm text-blue-600">{selectedTable.currentOrder?.id || 'Sin ID'}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const order = orders.find(o => o.id === selectedTable.currentOrder?.id);
                          if (order) {
                            setSelectedOrder(order);
                            setIsOrderDialogOpen(true);
                            setIsTableDialogOpen(false);
                          }
                        }}
                      >
                        Ver pedido
                      </Button>
                    </div>
                  </div>
                )}

                {/* Acciones rápidas */}
                <div>
                  <label className="block text-sm font-medium mb-2">Acciones rápidas</label>
                  <div className="flex gap-2">
                    {selectedTable.status === 'available' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          updateTableStatus(selectedTable.id, 'occupied');
                          setSelectedTable({ ...selectedTable, status: 'occupied' });
                        }}
                      >
                        Ocupar mesa
                      </Button>
                    )}
                    {selectedTable.status === 'occupied' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setNewOrderData({
                              tableNumber: selectedTable.number.toString(),
                              customerName: '',
                              customerPhone: '',
                              notes: '',
                              items: []
                            });
                            setIsNewOrderDialogOpen(true);
                          }}
                        >
                          Nuevo pedido
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            updateTableStatus(selectedTable.id, 'cleaning');
                            setSelectedTable({ ...selectedTable, status: 'cleaning' });
                          }}
                        >
                          Solicitar limpieza
                        </Button>
                      </>
                    )}
                    {selectedTable.status === 'cleaning' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          updateTableStatus(selectedTable.id, 'available');
                          setSelectedTable({ ...selectedTable, status: 'available' });
                        }}
                      >
                        Marcar como limpia
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTableDialogOpen(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Pedido */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Detalles del Pedido {selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  {selectedOrder.tableNumber && `Mesa ${selectedOrder.tableNumber} • `}
                  Creado hace {getElapsedTime(selectedOrder.createdAt)} minutos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-700">Estado actual</p>
                    <Badge className={getOrderStatusColor(selectedOrder.status)}>
                      {getOrderStatusLabel(selectedOrder.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Total</p>
                    <p className="text-2xl font-bold text-green-600">${selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-700 mb-2">Items del pedido</p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Notas especiales</p>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-yellow-800">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="font-semibold text-gray-700 mb-2">Actualizar estado</p>
                <div className="flex gap-2">
                  {selectedOrder.status === 'pending' && (
                    <Button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'preparing');
                        setIsOrderDialogOpen(false);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Iniciar preparación
                    </Button>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <Button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'ready');
                        setIsOrderDialogOpen(false);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Marcar como listo
                    </Button>
                  )}
                  {selectedOrder.status === 'ready' && (
                    <Button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'delivered');
                        setIsOrderDialogOpen(false);
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      Marcar como entregado
                    </Button>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Nuevo Pedido */}
      <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Pedido</DialogTitle>
            <DialogDescription>
              Selecciona productos y completa la información del pedido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mesa</label>
                <Select
                  value={newOrderData.tableNumber}
                  onValueChange={(value) => setNewOrderData({ ...newOrderData, tableNumber: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.filter(table => table.status === 'occupied').map(table => (
                      <SelectItem key={table.id} value={table.number.toString()}>
                        Mesa {table.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cliente</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del cliente (opcional)"
                  value={newOrderData.customerName}
                  onChange={(e) => setNewOrderData({ ...newOrderData, customerName: e.target.value })}
                />
              </div>
            </div>

            {/* Selección de productos */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Seleccionar Productos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                {mockProducts.map(product => (
                  <div key={product.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <p className="text-xs text-gray-600">{product.category}</p>
                        <p className="text-sm font-bold text-green-600">${product.price.toFixed(2)}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addProductToNewOrder(product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Productos seleccionados */}
            {newOrderData.items.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Productos Seleccionados</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {newOrderData.items.map(item => {
                    const product = mockProducts.find(p => p.id === item.productId);
                    return (
                      <div key={item.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{product?.name}</p>
                          <p className="text-sm text-gray-600">${product?.price.toFixed(2)} c/u</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateProductQuantity(item.productId, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateProductQuantity(item.productId, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeProductFromNewOrder(item.productId)}
                            className="h-8 w-8 p-0 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <span className="ml-2 font-bold">${((product?.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Notas especiales</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Instrucciones especiales para el pedido..."
                rows={3}
                value={newOrderData.notes}
                onChange={(e) => setNewOrderData({ ...newOrderData, notes: e.target.value })}
              />
            </div>

            {/* Total */}
            {
              newOrderData.items.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-green-600">${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              )
            }
          </div >

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsNewOrderDialogOpen(false);
              resetNewOrderForm();
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={newOrderData.items.length === 0 || !newOrderData.tableNumber}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Crear Pedido
            </Button>
          </DialogFooter>
        </DialogContent >
      </Dialog >
    </div >
  );
}
