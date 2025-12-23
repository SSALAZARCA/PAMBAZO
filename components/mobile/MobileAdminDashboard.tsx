import { useState } from 'react';
import type { User } from '../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { MobileHeader } from '../MobileHeader';
import { MobileBottomNav } from '../MobileBottomNav';
import { InventoryManagement } from '../InventoryManagement';

import { toast } from 'sonner';
// useStore removed
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
} from 'lucide-react';

interface MobileAdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function MobileAdminDashboard({ user, onLogout }: MobileAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Helper function for currency formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  // Dialog states
  // Dialog states removed
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false);
  const [showEditOrderDialog, setShowEditOrderDialog] = useState(false);
  const [showAssignOrderDialog, setShowAssignOrderDialog] = useState(false);
  const [showQuickActionsDialog, setShowQuickActionsDialog] = useState(false);
  const [showSystemConfigDialog, setShowSystemConfigDialog] = useState(false);
  // Removed user management - only available for owner
  const [showReportsDialog, setShowReportsDialog] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Form states
  // Form states removed
  const [editOrderForm, setEditOrderForm] = useState({
    items: '',
    notes: '',
    priority: 'normal'
  });
  const [assignOrderForm, setAssignOrderForm] = useState({
    waiter: '',
    priority: 'normal',
    estimatedTime: ''
  });
  const [systemConfig, setSystemConfig] = useState({
    businessName: 'Panadería Pambazo',
    address: 'Calle Principal 123',
    phone: '555-0123',
    email: 'info@pambazo.com',
    taxRate: '16',
    currency: 'COP',
    timezone: 'America/Bogota'
  });
  // Removed newUser state - user management only available for owner

  // Inventory items state
  // Inventory items handled by component


  // Mock data
  const todayStats = {
    totalSales: 2840.50,
    ordersCount: 47,
    activeOrders: 8,
    avgOrderValue: 60.43
  };

  const lowStockItems = [
    { id: '1', name: 'Harina de Trigo', current: 15, minimum: 50, unit: 'kg' },
    { id: '2', name: 'Azúcar Refinada', current: 8, minimum: 30, unit: 'kg' },
    { id: '3', name: 'Mantequilla', current: 3, minimum: 20, unit: 'kg' },
    { id: '4', name: 'Huevos', current: 24, minimum: 100, unit: 'piezas' },
  ];

  const recentOrders = [
    {
      id: '1001',
      customerName: 'María González',
      items: ['Café Americano x2', 'Pan Dulce x3'],
      total: 145.00,
      status: 'preparing',
      time: '10:30 AM',
      notes: 'Sin azúcar extra',
      priority: 'normal'
    },
    {
      id: '1002',
      customerName: 'Carlos López',
      items: ['Pastel de Chocolate x1'],
      total: 250.00,
      status: 'ready',
      time: '10:25 AM',
      notes: 'Para llevar',
      priority: 'high'
    },
    {
      id: '1003',
      customerName: 'Ana Rivera',
      items: ['Croissant x2', 'Jugo x1'],
      total: 105.00,
      status: 'pending',
      time: '10:20 AM',
      notes: '',
      priority: 'normal'
    },
  ];

  const tables = [
    {
      id: '1',
      number: 1,
      status: 'available',
      customerCount: 0,
      arrivalTime: new Date(),
      estimatedDuration: 60,
      customer: { name: '', phone: '', email: '', allergies: 'Ninguna' },
      orders: [],
      serviceStatus: 'disponible',
      paymentStatus: 'pendiente'
    },
    {
      id: '2',
      number: 2,
      status: 'occupied',
      customerCount: 2,
      waiter: 'Ana García',
      duration: 45,
      arrivalTime: new Date(Date.now() - 45 * 60000),
      estimatedDuration: 90,
      customer: {
        name: 'María González',
        phone: '555-0456',
        email: 'maria@email.com',
        allergies: 'Ninguna'
      },
      orders: [
        { id: '3', name: 'Café Latte', quantity: 1, price: 30.00, status: 'servido' },
        { id: '4', name: 'Croissant', quantity: 2, price: 20.00, status: 'servido' }
      ],
      serviceStatus: 'servido',
      paymentStatus: 'pendiente',
      notes: 'Cliente regular'
    },
    {
      id: '3',
      number: 3,
      status: 'cleaning',
      customerCount: 0,
      arrivalTime: new Date(),
      estimatedDuration: 60,
      customer: { name: '', phone: '', email: '', allergies: 'Ninguna' },
      orders: [],
      serviceStatus: 'limpieza',
      paymentStatus: 'completado'
    }
  ];

  const availableWaiters = ['Ana García', 'Carlos López', 'María González', 'Luis Rodríguez'];

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'cleaning': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Inventory management functions
  // Inventory management functions removed (handled by component)


  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetailsDialog(true);
  };

  const handleEditOrder = () => {
    if (!selectedOrder || !editOrderForm.items) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setSelectedOrder((prev: any) => ({
      ...prev,
      items: editOrderForm.items.split(',').map(item => item.trim()),
      notes: editOrderForm.notes,
      priority: editOrderForm.priority,
      lastModified: new Date()
    }));

    setShowEditOrderDialog(false);
    setEditOrderForm({ items: '', notes: '', priority: 'normal' });
    toast.success('Pedido actualizado exitosamente');
  };

  const handleAssignOrder = () => {
    if (!selectedOrder || !assignOrderForm.waiter) {
      toast.error('Por favor selecciona un mesero');
      return;
    }

    setSelectedOrder((prev: any) => ({
      ...prev,
      assignedWaiter: assignOrderForm.waiter,
      priority: assignOrderForm.priority,
      estimatedTime: assignOrderForm.estimatedTime,
      assignedAt: new Date()
    }));

    setShowAssignOrderDialog(false);
    setAssignOrderForm({ waiter: '', priority: 'normal', estimatedTime: '' });
    toast.success(`Pedido asignado a ${assignOrderForm.waiter}`);
  };

  const renderOverviewContent = () => (
    <div className="space-y-4">
      {/* Quick Actions for Admin */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSystemConfigDialog(true)}
              className="flex flex-col h-auto py-3"
            >
              <div className="text-lg mb-1">⚙️</div>
              <span className="text-xs">Configuración</span>
            </Button>
            {/* User management removed - only available for owner */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowReportsDialog(true)}
              className="flex flex-col h-auto py-3"
            >
              <div className="text-lg mb-1">📊</div>
              <span className="text-xs">Reportes</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowQuickActionsDialog(true)}
              className="flex flex-col h-auto py-3"
            >
              <div className="text-lg mb-1">⚡</div>
              <span className="text-xs">Herramientas</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventas Hoy</p>
                <p className="text-lg font-bold">{formatCurrency(todayStats.totalSales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos</p>
                <p className="text-lg font-bold">{todayStats.ordersCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-lg font-bold">{todayStats.activeOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promedio</p>
                <p className="text-lg font-bold">{formatCurrency(todayStats.avgOrderValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Stock Bajo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lowStockItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.current} / {item.minimum} {item.unit}
                </p>
              </div>
              <Badge variant="destructive" className="text-xs">
                Bajo
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pedidos Recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-sm">{order.customerName}</p>
                <p className="text-xs text-muted-foreground">{order.items.join(', ')}</p>
                <p className="text-xs text-muted-foreground">{order.time}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">{formatCurrency(order.total)}</p>
                <Badge className={getStatusColor(order.status)} variant="outline">
                  {order.status === 'pending' ? 'Pendiente' :
                    order.status === 'preparing' ? 'Preparando' : 'Listo'}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderOrdersContent = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Gestión de Pedidos</h2>
          <p className="text-sm text-muted-foreground">
            {recentOrders.length} pedidos activos
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recentOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">#{order.id} • {order.time}</p>
                </div>
                <Badge className={getStatusColor(order.status)} variant="outline">
                  {order.status === 'pending' ? 'Pendiente' :
                    order.status === 'preparing' ? 'Preparando' : 'Listo'}
                </Badge>
              </div>

              <div className="space-y-1 mb-3">
                {order.items.map((item, index) => (
                  <p key={index} className="text-sm text-muted-foreground">{item}</p>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <p className="font-bold">{formatCurrency(order.total)}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedOrder(order);
                      setEditOrderForm({
                        items: order.items.join(', '),
                        notes: order.notes || '',
                        priority: order.priority || 'normal'
                      });
                      setShowEditOrderDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewOrderDetails(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderInventoryContent = () => (
    <div className="space-y-4">
      <InventoryManagement />
    </div>
  );

  const renderTablesContent = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Gestión de Mesas</h2>
          <p className="text-sm text-muted-foreground">
            {tables.length} mesas disponibles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tables.map((table) => (
          <Card key={table.id} className={`cursor-pointer ${getTableStatusColor(table.status)}`}>
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-bold text-lg">Mesa {table.number}</h3>
                {table.customerCount > 0 && (
                  <p className="text-sm">{table.customerCount} personas</p>
                )}
                <p className="text-sm font-medium mt-1">
                  {table.status === 'available' ? 'Disponible' :
                    table.status === 'occupied' ? 'Ocupada' :
                      table.status === 'reserved' ? 'Reservada' : 'Limpieza'}
                </p>
                {table.waiter && (
                  <p className="text-xs text-muted-foreground">Mesero: {table.waiter}</p>
                )}
                {table.duration && (
                  <p className="text-xs text-muted-foreground">{table.duration} min</p>
                )}


              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'overview': return renderOverviewContent();
      case 'orders': return renderOrdersContent();
      case 'inventory': return renderInventoryContent();
      case 'staff':
      case 'tables': return renderTablesContent();
      case 'settings': return renderOverviewContent(); // Placeholder for settings
      default: return renderOverviewContent();
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'overview': return 'Panel Principal';
      case 'orders': return 'Pedidos';
      case 'inventory': return 'Inventario';
      case 'staff':
      case 'tables': return 'Mesas';
      case 'settings': return 'Configuración';
      default: return 'Panel Principal';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader
        title={getTabTitle()}
        user={user}
        onLogout={onLogout}
      />

      <main className="pb-20 pt-16">
        <div className="p-4">
          {renderContent()}
        </div>
      </main>

      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
      />

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetailsDialog} onOpenChange={setShowOrderDetailsDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Información del Pedido</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Cliente:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Hora:</strong> {selectedOrder.time}</p>
                  <p><strong>Estado:</strong> {selectedOrder.status}</p>
                  <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Items del Pedido</h4>
                <div className="space-y-1">
                  {selectedOrder.items.map((item: string, index: number) => (
                    <p key={index} className="text-sm bg-muted/30 p-2 rounded">{item}</p>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowOrderDetailsDialog(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setShowOrderDetailsDialog(false);
                    setEditOrderForm({
                      items: selectedOrder.items.join(', '),
                      notes: selectedOrder.notes || '',
                      priority: selectedOrder.priority || 'normal'
                    });
                    setShowEditOrderDialog(true);
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={showEditOrderDialog} onOpenChange={setShowEditOrderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Pedido #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderItems">Items del Pedido</Label>
              <Textarea
                id="orderItems"
                value={editOrderForm.items}
                onChange={(e) => setEditOrderForm(prev => ({ ...prev, items: e.target.value }))}
                placeholder="Café Americano x2, Pan Dulce x3"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderPriority">Prioridad</Label>
              <Select value={editOrderForm.priority} onValueChange={(value) => setEditOrderForm(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderNotes">Notas Especiales</Label>
              <Textarea
                id="orderNotes"
                value={editOrderForm.notes}
                onChange={(e) => setEditOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditOrderDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleEditOrder} className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Order Dialog */}
      <Dialog open={showAssignOrderDialog} onOpenChange={setShowAssignOrderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignWaiter">Mesero</Label>
              <Select value={assignOrderForm.waiter} onValueChange={(value) => setAssignOrderForm(prev => ({ ...prev, waiter: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mesero" />
                </SelectTrigger>
                <SelectContent>
                  {availableWaiters.map((waiter) => (
                    <SelectItem key={waiter} value={waiter}>
                      {waiter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignPriority">Prioridad</Label>
              <Select value={assignOrderForm.priority} onValueChange={(value) => setAssignOrderForm(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Tiempo Estimado (min)</Label>
              <Input
                id="estimatedTime"
                type="number"
                value={assignOrderForm.estimatedTime}
                onChange={(e) => setAssignOrderForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                placeholder="15"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAssignOrderDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAssignOrder} className="flex-1">
                👨‍🍳 Asignar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* System Configuration Dialog */}
      <Dialog open={showSystemConfigDialog} onOpenChange={setShowSystemConfigDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configuración del Sistema</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nombre del Negocio</Label>
              <Input
                id="businessName"
                value={systemConfig.businessName}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Nombre del negocio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={systemConfig.address}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Dirección completa"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={systemConfig.phone}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="555-0123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={systemConfig.email}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="info@negocio.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={systemConfig.taxRate}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, taxRate: e.target.value }))}
                  placeholder="16"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select value={systemConfig.currency} onValueChange={(value) => {
                  setSystemConfig(prev => ({ ...prev, currency: value }));
                  // updateCurrency(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COP">COP (Peso Colombiano)</SelectItem>
                    <SelectItem value="MXN">MXN (Peso Mexicano)</SelectItem>
                    <SelectItem value="USD">USD (Dólar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSystemConfigDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => {
                toast.success('Configuración guardada exitosamente');
                setShowSystemConfigDialog(false);
              }} className="flex-1">
                ⚙️ Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Management removed - only available for owner */}

      {/* Reports Dialog */}
      <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generar Reportes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  toast.success('Reporte de ventas generado exitosamente');
                  setShowReportsDialog(false);
                }}
                className="flex flex-col h-auto py-4"
              >
                <div className="text-2xl mb-2">💰</div>
                <span className="text-sm">Reporte de Ventas</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  toast.success('Reporte de inventario generado exitosamente');
                  setShowReportsDialog(false);
                }}
                className="flex flex-col h-auto py-4"
              >
                <div className="text-2xl mb-2">📦</div>
                <span className="text-sm">Reporte de Inventario</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  toast.success('Reporte de personal generado exitosamente');
                  setShowReportsDialog(false);
                }}
                className="flex flex-col h-auto py-4"
              >
                <div className="text-2xl mb-2">👥</div>
                <span className="text-sm">Reporte de Personal</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  toast.success('Reporte de mesas generado exitosamente');
                  setShowReportsDialog(false);
                }}
                className="flex flex-col h-auto py-4"
              >
                <div className="text-2xl mb-2">🪑</div>
                <span className="text-sm">Reporte de Mesas</span>
              </Button>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowReportsDialog(false)} className="flex-1">
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogs removed */}

      {/* Quick Actions Dialog */}
      <Dialog open={showQuickActionsDialog} onOpenChange={setShowQuickActionsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Herramientas Rápidas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  toast.success('Respaldo completado exitosamente');
                  setShowQuickActionsDialog(false);
                }}
                className="flex flex-col h-auto py-4"
              >
                <div className="text-2xl mb-2">💾</div>
                <span className="text-sm">Respaldo</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  toast.success('Modo mantenimiento activado');
                  setShowQuickActionsDialog(false);
                }}
                className="flex flex-col h-auto py-4"
              >
                <div className="text-2xl mb-2">🔧</div>
                <span className="text-sm">Mantenimiento</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  toast.success('Notificaciones configuradas');
                  setShowQuickActionsDialog(false);
                }}
                className="flex flex-col h-auto py-4"
              >
                <div className="text-2xl mb-2">🔔</div>
                <span className="text-sm">Notificaciones</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  toast.success('Sincronización completada');
                  setShowQuickActionsDialog(false);
                }}
                className="flex flex-col h-auto py-4"
              >
                <div className="text-2xl mb-2">🔄</div>
                <span className="text-sm">Sincronizar</span>
              </Button>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowQuickActionsDialog(false)} className="flex-1">
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MobileAdminDashboard;