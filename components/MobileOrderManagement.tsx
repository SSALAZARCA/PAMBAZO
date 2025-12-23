import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ShoppingCart, Eye, Plus, Clock, CheckCircle, Truck, AlertCircle, Phone } from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderType: 'pickup' | 'delivery';
  address?: string;
  orderDate: Date;
  notes?: string;
}

interface MobileOrderManagementProps {
  role: 'owner' | 'waiter';
}

export function MobileOrderManagement({ role }: MobileOrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1234',
      customerName: 'Ana López',
      customerEmail: 'ana@email.com',
      customerPhone: '+1 234 567 8901',
      items: [
        { id: '1', productName: 'Pan Dulce Tradicional', quantity: 6, price: 25.00 },
        { id: '2', productName: 'Pastel de Chocolate', quantity: 1, price: 250.00 },
      ],
      total: 400.00,
      status: 'pending',
      orderType: 'delivery',
      address: 'Calle Principal 456, Col. Centro',
      orderDate: new Date(),
      notes: 'Entrega antes de las 3 PM por favor',
    },
    {
      id: '1235',
      customerName: 'Carlos Ruiz',
      customerEmail: 'carlos@email.com',
      customerPhone: '+1 234 567 8902',
      items: [
        { id: '3', productName: 'Pan de Caja Integral', quantity: 2, price: 45.00 },
        { id: '4', productName: 'Galletas de Avena', quantity: 3, price: 35.00 },
      ],
      total: 195.00,
      status: 'preparing',
      orderType: 'pickup',
      orderDate: new Date(),
    },
    {
      id: '1236',
      customerName: 'María González',
      customerEmail: 'maria@email.com',
      customerPhone: '+1 234 567 8903',
      items: [
        { id: '5', productName: 'Pan Dulce Tradicional', quantity: 12, price: 25.00 },
      ],
      total: 300.00,
      status: 'ready',
      orderType: 'pickup',
      orderDate: new Date(),
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');

  const filteredOrders = orders.filter(order =>
    statusFilter === 'all' || order.status === statusFilter
  );

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <AlertCircle className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivered':
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'preparing':
        return 'Preparando';
      case 'ready':
        return 'Listo';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Todos', count: orders.length },
    { value: 'pending', label: 'Pendientes', count: orders.filter(o => o.status === 'pending').length },
    { value: 'preparing', label: 'Preparando', count: orders.filter(o => o.status === 'preparing').length },
    { value: 'ready', label: 'Listos', count: orders.filter(o => o.status === 'ready').length },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pedidos
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredOrders.length} pedidos
          </p>
        </div>
        {role === 'waiter' && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(option.value as 'all' | Order['status'])}
            className="whitespace-nowrap"
          >
            {option.label} ({option.count})
          </Button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Order Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">#{order.id}</h3>
                      <Badge variant="outline">
                        {order.orderType === 'pickup' ? '🏪 Recoger' : '🚚 Entrega'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.orderDate.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{getStatusText(order.status)}</span>
                  </Badge>
                </div>

                {/* Customer Info */}
                <div className="space-y-1">
                  <p className="font-medium">{order.customerName}</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{order.customerPhone}</span>
                  </div>
                  {order.address && (
                    <p className="text-sm text-muted-foreground">{order.address}</p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="text-sm">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.quantity}x {item.productName}</span>
                        <span>${(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-muted-foreground">+{order.items.length - 2} productos más</p>
                    )}
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Pedido #{order.id}</DialogTitle>
                        <DialogDescription>
                          Detalles completos del pedido y gestión de estado
                        </DialogDescription>
                      </DialogHeader>
                      {selectedOrder && selectedOrder.id === order.id && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Cliente</h4>
                            <div className="space-y-1 text-sm">
                              <p>{selectedOrder.customerName}</p>
                              <p>{selectedOrder.customerPhone}</p>
                              {selectedOrder.address && (
                                <p className="text-muted-foreground">{selectedOrder.address}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Productos</h4>
                            <div className="space-y-2">
                              {selectedOrder.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span>{item.quantity}x {item.productName}</span>
                                  <span>${(item.quantity * item.price).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>${selectedOrder.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {selectedOrder.notes && (
                            <div>
                              <h4 className="font-medium mb-2">Notas</h4>
                              <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                            </div>
                          )}

                          <div className="space-y-3">
                            <h4 className="font-medium">Cambiar Estado</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {['pending', 'preparing', 'ready', 'delivered'].map((status) => (
                                <Button
                                  key={status}
                                  variant={selectedOrder.status === status ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateOrderStatus(selectedOrder.id, status as Order['status'])}
                                >
                                  {getStatusText(status as Order['status'])}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                    >
                      Iniciar
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                    >
                      Completar
                    </Button>
                  )}
                  {order.status === 'ready' && order.orderType === 'delivery' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                    >
                      Entregar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No hay pedidos</p>
        </div>
      )}
    </div>
  );
}