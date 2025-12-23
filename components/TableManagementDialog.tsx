import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Users, Plus, Minus, ShoppingCart, Clock, Check, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import type { Table, Order, OrderItem } from '../shared/types';
import { formatCOP, COLOMBIA_PRICES } from '../src/utils/currency';

interface TableManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table;
}

interface OrderFormData {
  items: OrderItem[];
  notes: string;
  total: number;
}

const mockProducts = [
  { id: '1', name: 'Pan Dulce', price: COLOMBIA_PRICES.PAN_DULCE, category: 'Panadería' },
  { id: '2', name: 'Café Americano', price: COLOMBIA_PRICES.CAFE_AMERICANO, category: 'Bebidas' },
  { id: '3', name: 'Croissant', price: COLOMBIA_PRICES.CROISSANT, category: 'Panadería' },
  { id: '4', name: 'Jugo Natural', price: COLOMBIA_PRICES.JUGO_NARANJA, category: 'Bebidas' },
  { id: '5', name: 'Sandwich', price: COLOMBIA_PRICES.SANDWICH_CLUB, category: 'Comida' },
  { id: '6', name: 'Pastel', price: COLOMBIA_PRICES.PASTEL_CHOCOLATE, category: 'Postres' },
];

export function TableManagementDialog({ isOpen, onClose, table }: TableManagementDialogProps) {
  console.log('🚀 DIÁLOGO RENDERIZADO - isOpen:', isOpen, 'table:', table);
  const { user, updateTableStatus, addOrder, orders } = useStore();
  const [activeTab, setActiveTab] = useState('info');
  const [guestCount, setGuestCount] = useState(table.guestCount || 1);
  const [sessionType, setSessionType] = useState<'new' | 'existing'>('new');
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    items: [],
    notes: '',
    total: 0
  });

  console.log('🚀 ESTADO ACTUAL DEL DIÁLOGO:', { isOpen, activeTab, table: table.number });

  // Obtener pedidos existentes de la mesa
  const tableOrders = orders.filter(order => order.tableId === table.id);
  const activeOrders = tableOrders.filter(order => order.status !== 'completed' && order.status !== 'cancelled');

  const handleSessionStart = () => {
    if (sessionType === 'new') {
      // Iniciar nueva sesión
      updateTableStatus(table.id, 'occupied', guestCount, user?.id);
      toast.success(`Mesa ${table.number} ocupada con ${guestCount} comensales`);
    }
    setActiveTab('order');
  };

  const addItemToOrder = (product: typeof mockProducts[0]) => {
    const existingItem = orderForm.items.find(item => item.productId === product.id);

    if (existingItem) {
      const updatedItems = orderForm.items.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setOrderForm(prev => ({
        ...prev,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }));
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        notes: ''
      };
      const updatedItems = [...orderForm.items, newItem];
      setOrderForm(prev => ({
        ...prev,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }));
    }
  };

  const updateItemQuantity = (productId: string, change: number) => {
    const updatedItems = orderForm.items.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setOrderForm(prev => ({
      ...prev,
      items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }));
  };

  const submitOrder = () => {
    if (orderForm.items.length === 0) {
      toast.error('Agrega al menos un producto al pedido');
      return;
    }

    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      tableId: table.id,
      tableNumber: table.number,
      items: orderForm.items,
      total: orderForm.total,
      status: 'pending',
      waiterId: user.id || '',
      waiterName: user.name || 'Mesero',
      customerName: `Mesa ${table.number}`,
      notes: orderForm.notes,
      createdAt: new Date().toISOString(),
      estimatedTime: 15
    };

    addOrder(newOrder);
    toast.success(`Pedido registrado para Mesa ${table.number}`);

    // Limpiar formulario
    setOrderForm({ items: [], notes: '', total: 0 });
    setActiveTab('orders');
  };

  const finishTable = () => {
    updateTableStatus(table.id, 'available', 0);
    toast.success(`Mesa ${table.number} liberada`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            Gestión Mesa {table.number}
          </DialogTitle>
          <DialogDescription>
            Estado actual: <Badge variant={table.status === 'available' ? 'secondary' : 'default'}>
              {table.status === 'available' ? 'Libre' : 'Ocupada'}
            </Badge>
            {table.guestCount && table.guestCount > 0 && (
              <span className="ml-2">• {table.guestCount} comensales</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="order">Nuevo Pedido</TabsTrigger>
            <TabsTrigger value="orders">Pedidos Activos</TabsTrigger>
            <TabsTrigger value="finish">Finalizar</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Ocupantes</CardTitle>
                <CardDescription>
                  Configura los ocupantes de la mesa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {table.status === 'available' && (
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Sesión</Label>
                      <Select value={sessionType} onValueChange={(value: 'new' | 'existing') => setSessionType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Ocupantes Nuevos</SelectItem>
                          <SelectItem value="existing">Ocupantes Existentes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="guestCount">Número de Comensales</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id="guestCount"
                          type="number"
                          value={guestCount}
                          onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setGuestCount(guestCount + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button onClick={handleSessionStart} className="w-full">
                      {sessionType === 'new' ? 'Iniciar Nueva Sesión' : 'Continuar Sesión'}
                    </Button>
                  </div>
                )}

                {table.status === 'occupied' && (
                  <div className="space-y-2">
                    <p><strong>Comensales:</strong> {table.guestCount}</p>
                    <p><strong>Mesero:</strong> {user?.name}</p>
                    <p><strong>Tiempo ocupada:</strong> {table.occupiedSince ?
                      Math.floor((Date.now() - new Date(table.occupiedSince).getTime()) / 60000) : 0} min
                    </p>
                    <Button onClick={() => setActiveTab('order')} className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Tomar Pedido
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="order" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lista de productos */}
              <Card>
                <CardHeader>
                  <CardTitle>Productos Disponibles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {mockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-sm font-medium">{formatCOP(product.price)}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addItemToOrder(product)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Pedido actual */}
              <Card>
                <CardHeader>
                  <CardTitle>Pedido Actual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderForm.items.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No hay productos en el pedido
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {orderForm.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCOP(item.price)} x {item.quantity} = {formatCOP(item.price * item.quantity)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.productId, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.productId, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas Especiales</Label>
                    <Textarea
                      id="notes"
                      placeholder="Instrucciones especiales para el pedido..."
                      value={orderForm.notes}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold">{formatCOP(orderForm.total)}</span>
                    </div>
                    <Button
                      onClick={submitOrder}
                      className="w-full"
                      disabled={orderForm.items.length === 0}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Confirmar Pedido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pedidos Activos
                  <Button onClick={() => setActiveTab('order')} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Más Pedidos
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay pedidos activos para esta mesa
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activeOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Pedido #{order.id.slice(-4)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                            {order.status === 'pending' ? 'Pendiente' :
                              order.status === 'preparing' ? 'Preparando' : 'Listo'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.productName}</span>
                              <span>{formatCOP(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t">
                          <span className="font-medium">Total: {formatCOP(order.total)}</span>
                          <div className="flex gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {order.estimatedTime} min
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finish" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Finalizar Mesa</CardTitle>
                <CardDescription>
                  Liberar la mesa y finalizar la sesión
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p><strong>Mesa:</strong> {table.number}</p>
                  <p><strong>Comensales:</strong> {table.guestCount}</p>
                  <p><strong>Pedidos activos:</strong> {activeOrders.length}</p>
                  <p><strong>Total de pedidos:</strong> {formatCOP(tableOrders.reduce((sum, order) => sum + order.total, 0))}</p>
                </div>

                {activeOrders.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Hay pedidos activos. Asegúrate de que todos los pedidos estén completados antes de finalizar.
                    </p>
                  </div>
                )}

                <Button
                  onClick={finishTable}
                  variant="destructive"
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Finalizar Mesa
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default TableManagementDialog;