import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ShoppingCart, Eye, Plus, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';

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

interface OrderManagementProps {
  role: 'owner' | 'waiter';
}

export function OrderManagement({ role }: OrderManagementProps) {
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orderType: 'pickup' as 'pickup' | 'delivery',
    address: '',
    notes: '',
  });

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

  const handleNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // En una implementación real, aquí se abriría un selector de productos
    alert('Funcionalidad de nuevo pedido: se abriría un selector de productos');
    setIsNewOrderOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Gestión de Pedidos
              </CardTitle>
              <CardDescription>
                {role === 'owner' ? 'Administra todos los pedidos' : 'Gestiona pedidos como mesero'}
              </CardDescription>
            </div>
            {role === 'waiter' && (
              <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Pedido
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Pedido</DialogTitle>
                    <DialogDescription>
                      Información básica del cliente y pedido
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleNewOrder} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Nombre del Cliente</Label>
                      <Input
                        id="customerName"
                        value={newOrderData.customerName}
                        onChange={(e) => setNewOrderData({...newOrderData, customerName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Teléfono</Label>
                      <Input
                        id="customerPhone"
                        value={newOrderData.customerPhone}
                        onChange={(e) => setNewOrderData({...newOrderData, customerPhone: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orderType">Tipo de Pedido</Label>
                      <Select value={newOrderData.orderType} onValueChange={(value: 'pickup' | 'delivery') => setNewOrderData({...newOrderData, orderType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">Recoger en tienda</SelectItem>
                          <SelectItem value="delivery">Entrega a domicilio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newOrderData.orderType === 'delivery' && (
                      <div className="space-y-2">
                        <Label htmlFor="address">Dirección de Entrega</Label>
                        <Input
                          id="address"
                          value={newOrderData.address}
                          onChange={(e) => setNewOrderData({...newOrderData, address: e.target.value})}
                          required
                        />
                      </div>
                    )}
                    <Button type="submit" className="w-full">
                      Continuar con Productos
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">#{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.orderDate.toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.orderType === 'pickup' ? 'Recoger' : 'Entrega'}
                    </Badge>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusText(order.status)}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={isDialogOpen && selectedOrder?.id === order.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedOrder(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Detalles del Pedido #{order.id}</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium">Cliente</h4>
                                <p>{selectedOrder.customerName}</p>
                                <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium">Productos</h4>
                                <div className="space-y-2">
                                  {selectedOrder.items.map((item) => (
                                    <div key={item.id} className="flex justify-between">
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

                              {selectedOrder.address && (
                                <div>
                                  <h4 className="font-medium">Dirección de Entrega</h4>
                                  <p>{selectedOrder.address}</p>
                                </div>
                              )}

                              {selectedOrder.notes && (
                                <div>
                                  <h4 className="font-medium">Notas</h4>
                                  <p>{selectedOrder.notes}</p>
                                </div>
                              )}

                              <div className="space-y-2">
                                <h4 className="font-medium">Cambiar Estado</h4>
                                <div className="flex gap-2 flex-wrap">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}