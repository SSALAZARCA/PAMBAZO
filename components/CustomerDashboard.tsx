import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Product, User, Order } from '../shared/types';
import { formatCOP } from '../src/utils/currency';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import {
  ShoppingCart,
  Clock,
  MapPin,
  Plus,
  Minus,
  LogOut,
  Search,
  Heart,
  CheckCircle,
  Truck,
  Cake
} from 'lucide-react';
import { COLOMBIA_PRICES } from '../src/utils/currency';
import LoyaltyCard from '../src/components/LoyaltyCard';

// Extender la interfaz Product para incluir propiedades adicionales del dashboard
interface ExtendedProduct extends Product {
  preparationTime: string;
  ingredients: string[];
  allergens: string[];
  calories: number;
  spicyLevel: number;
}

interface CustomerDashboardProps {
  user: User;
  onLogout: () => void;
}

// 🥖 PAMBASO - Dashboard del Cliente Desktop
// Catálogo completo con carrito lateral y sistema de pedidos

// Products will be loaded from backend API

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, onLogout }) => {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart
  } = useStore();
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState({
    orderType: 'pickup' as 'pickup' | 'delivery',
    address: '',
    notes: '',
    paymentMethod: 'cash' as 'cash' | 'card',
  });

  // Limpiar carrito al inicializar para evitar elementos corruptos
  useEffect(() => {
    // Verificar si hay elementos corruptos en el carrito
    const hasCorruptedItems = cart.some(item => !item.product || !item.product.id || !item.product.name);
    if (hasCorruptedItems) {
      clearCart();
    }
  }, [cart, clearCart]);

  // Load products from backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Failed to load products');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = [
    { id: 'all', name: 'Todos', count: products.length, icon: '🍞' },
    { id: 'Pan Dulce', name: 'Pan Dulce', count: products.filter(p => p.category === 'Pan Dulce').length, icon: '🧁' },
    { id: 'Pan de Caja', name: 'Pan de Caja', count: products.filter(p => p.category === 'Pan de Caja').length, icon: '🍞' },
    { id: 'Pasteles', name: 'Pasteles', count: products.filter(p => p.category === 'Pasteles').length, icon: '🎂' },
    { id: 'Galletas', name: 'Galletas', count: products.filter(p => p.category === 'Galletas').length, icon: '🍪' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });



  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      if (item?.product?.price && item?.quantity) {
        return total + (item.product.price * item.quantity);
      }
      return total;
    }, 0);
  };



  const handleAddToCart = (product: Product) => {
    addToCart({
      product: product,
      quantity: 1,
      notes: ''
    });
    toast.success(`${product.name} agregado al carrito`);
  };



  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    const order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      customerId: user.id,
      items: cart.map((item, index) => ({
        id: `order-item-${Date.now()}-${index}`,
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        notes: ''
      })),
      status: 'pending',
      total: getTotalPrice(),
      notes: orderNotes,
      tableNumber: 0,
      estimatedTime: 25,
      customerName: user.name || 'Cliente',
      tableId: '',
      waiterId: '',
      waiterName: ''
    };

    // Usar addOrder del store en lugar de createOrder
    const store = useStore.getState();
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.addOrder(newOrder);
    clearCart();
    setOrderNotes('');
    setIsCheckoutOpen(false);
    toast.success('¡Pedido realizado con éxito! Te notificaremos cuando esté listo.');
  };



  // Mock order history
  const orderHistory = [
    {
      id: '1001',
      date: undefined, // removed runtime property, logic should parse createdAt
      createdAt: new Date('2024-01-15').toISOString(),
      items: [
        { id: 'i1', productId: 'p1', productName: 'Pan Dulce Tradicional', quantity: 6, price: COLOMBIA_PRICES.PAN_DULCE },
        { id: 'i2', productId: 'p2', productName: 'Galletas de Avena', quantity: 2, price: 5000 },
      ] as any[],
      total: (COLOMBIA_PRICES.PAN_DULCE * 6) + (5000 * 2),
      status: 'completed' as const, // 'delivered' doesn't exist in type, 'completed' does
      tableNumber: 0,
      customerName: 'Cliente',
      waiterId: 'sys',
      waiterName: 'Sistema'
    },
    {
      id: '1002',
      date: undefined,
      createdAt: new Date('2024-01-10').toISOString(),
      items: [
        { id: 'i3', productId: 'p3', productName: 'Pastel de Chocolate', quantity: 1, price: COLOMBIA_PRICES.PASTEL_CHOCOLATE },
      ] as any[],
      total: COLOMBIA_PRICES.PASTEL_CHOCOLATE,
      status: 'completed' as const,
      tableNumber: 0,
      customerName: 'Cliente',
      waiterId: 'sys',
      waiterName: 'Sistema'
    },
  ];

  const updateQuantity = (productId: string, change: number) => {
    const item = cart.find(item => item.product.id === productId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateCartQuantity(productId, newQuantity);
      } else {
        removeFromCart(productId);
      }
    }
  };

  const getCartTotal = () => {
    return getTotalPrice();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <Clock className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivered':
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'preparing':
        return 'Preparando';
      case 'ready':
        return 'Listo';
      case 'delivered':
        return 'Entregado';
      default:
        return status;
    }
  };

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cake className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-lg font-semibold">PAMBAZO</h1>
              <p className="text-xs text-muted-foreground">Hola, {user?.name?.split(' ')[0]}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tu Carrito</DialogTitle>
                  <DialogDescription>
                    Revisa tu pedido antes de confirmar
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Tu carrito está vacío
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {cart.map((item, index) => (
                          item.product ? (
                            <div key={`${item.product.id}-${index}`} className="flex items-center justify-between p-3 border rounded">
                              <div className="flex-1">
                                <h4 className="font-medium">{item.product.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatCOP(item.product.price)} c/u
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.product.id, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.product.id, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : null
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>{formatCOP(getCartTotal())}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Tipo de Pedido</Label>
                          <Select value={orderData.orderType} onValueChange={(value: 'pickup' | 'delivery') => setOrderData({ ...orderData, orderType: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pickup">Recoger en tienda</SelectItem>
                              <SelectItem value="delivery">Entrega a domicilio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {orderData.orderType === 'delivery' && (
                          <div className="space-y-2">
                            <Label>Dirección de Entrega</Label>
                            <Input
                              value={orderData.address}
                              onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                              placeholder="Tu dirección completa"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Notas Especiales</Label>
                          <Textarea
                            value={orderData.notes}
                            onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                            placeholder="Instrucciones especiales (opcional)"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Método de Pago</Label>
                          <Select value={orderData.paymentMethod} onValueChange={(value: 'cash' | 'card') => setOrderData({ ...orderData, paymentMethod: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Efectivo</SelectItem>
                              <SelectItem value="card">Tarjeta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button onClick={handleCheckout} className="w-full">
                          Confirmar Pedido - {formatCOP(getCartTotal())}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={activeTab === 'catalog' ? 'default' : 'outline'}
              onClick={() => setActiveTab('catalog')}
              className="flex flex-col p-3 h-auto"
            >
              <span className="text-lg mb-1">🛍️</span>
              <span className="text-xs">Catálogo</span>
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              onClick={() => setActiveTab('orders')}
              className="flex flex-col p-3 h-auto"
            >
              <span className="text-lg mb-1">📋</span>
              <span className="text-xs">Pedidos</span>
            </Button>
            <Button
              variant={activeTab === 'loyalty' ? 'default' : 'outline'}
              onClick={() => setActiveTab('loyalty')}
              className="flex flex-col p-3 h-auto"
            >
              <span className="text-lg mb-1">🏆</span>
              <span className="text-xs">Lealtad</span>
            </Button>
            <Button
              variant={activeTab === 'location' ? 'default' : 'outline'}
              onClick={() => setActiveTab('location')}
              className="flex flex-col p-3 h-auto"
            >
              <span className="text-lg mb-1">📍</span>
              <span className="text-xs">Ubicación</span>
            </Button>
          </div>

          <TabsContent value="catalog">
            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Nuestros Productos</h2>
                    <p className="text-sm text-muted-foreground">
                      Explora nuestro catálogo de productos frescos
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar productos..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                          className="whitespace-nowrap rounded-full"
                        >
                          <span className="mr-2">{category.icon}</span>
                          {category.name}
                          <span className="ml-2 text-xs opacity-70">({category.count})</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando productos...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className={!product.available ? 'opacity-50' : ''}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold">{product.name}</h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-6 w-6 ${favorites.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`}
                                onClick={() => toggleFavorite(product.id)}
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                            <Badge variant="outline" className="text-xs mb-2">
                              {product.category}
                            </Badge>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">{formatCOP(product.price)}</span>
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={!product.available}
                              size="sm"
                            >
                              {product.available ? (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Agregar
                                </>
                              ) : (
                                'No Disponible'
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Mis Pedidos</h2>
                <p className="text-sm text-muted-foreground">
                  Historial de tus pedidos anteriores
                </p>
              </div>

              <div className="space-y-3">
                {orderHistory.map((order) => (
                  <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOrderClick(order)}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Pedido #{order.id}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{getStatusText(order.status)}</span>
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {order.items && order.items.map((item, index) => (
                            item && item.productName ? (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.productName}</span>
                                <span>{formatCOP(item.quantity * item.price)}</span>
                              </div>
                            ) : null
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="loyalty">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Programa de Lealtad</h2>
                <p className="text-sm text-muted-foreground">
                  Acumula puntos y obtén recompensas
                </p>
              </div>

              <LoyaltyCard customerId={user.id} />

              <Card>
                <CardHeader>
                  <CardTitle>¿Cómo funciona?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="font-medium">Acumula Puntos</p>
                        <p className="text-muted-foreground">Gana puntos con cada compra que realices</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-2xl">🎁</span>
                      <div>
                        <p className="font-medium">Canjea Recompensas</p>
                        <p className="text-muted-foreground">Usa tus puntos para obtener descuentos y productos gratis</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-2xl">⬆️</span>
                      <div>
                        <p className="font-medium">Sube de Nivel</p>
                        <p className="text-muted-foreground">Alcanza niveles superiores para obtener más beneficios</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Favorites Tab - Using the favorites state */}
          <TabsContent value="favorites">
            <div className="text-center py-8">
              <h2 className="text-lg font-semibold mb-2">Tus Favoritos ({favorites.length})</h2>
              <p className="text-muted-foreground">Próximamente verás tus productos favoritos aquí.</p>
            </div>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Nuestra Ubicación
                </CardTitle>
                <CardDescription>
                  Visítanos en nuestra panadería
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Información de Contacto</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Dirección:</strong> Av. Principal 123, Col. Centro</p>
                        <p><strong>Teléfono:</strong> +1 234 567 8900</p>
                        <p><strong>Email:</strong> info@pambazo.com</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Horarios de Atención</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Lunes - Viernes:</strong> 6:00 AM - 8:00 PM</p>
                        <p><strong>Sábados:</strong> 6:00 AM - 9:00 PM</p>
                        <p><strong>Domingos:</strong> 7:00 AM - 7:00 PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Zona de Entrega</h4>
                    <p className="text-sm text-muted-foreground">
                      Realizamos entregas a domicilio en un radio de 5 km de nuestra panadería.
                      El costo de envío es de $30 pesos y el tiempo estimado es de 30-45 minutos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Diálogo de Detalles del Pedido */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido</DialogTitle>
            <DialogDescription>
              Información completa de tu pedido
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Pedido #{selectedOrder.id}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="ml-1">{getStatusText(selectedOrder.status)}</span>
                </Badge>
              </div>

              <Separator />

              <div>
                <h5 className="font-medium mb-2">Productos</h5>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    item && item.productName ? (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <div>
                          <span className="font-medium">{item.productName}</span>
                          <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                        <span className="font-medium">{formatCOP(item.quantity * item.price)}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold">{formatCOP(selectedOrder.total)}</span>
              </div>

              {selectedOrder.status === 'delivered' && (
                <div className="text-center">
                  <Button variant="outline" className="w-full">
                    Volver a Pedir
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CustomerDashboard;