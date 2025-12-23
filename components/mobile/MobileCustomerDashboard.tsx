import { useState } from 'react';
import type { User } from '../../shared/types';
import { MobileHeader } from '../MobileHeader';
import { MobileBottomNav } from '../MobileBottomNav';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useSwipeGesture } from '../hooks/useMobile';
import { toast } from 'sonner';
import { formatCOP, COLOMBIA_PRICES } from '../../src/utils/currency';
import {
  Plus,
  Minus,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Star,
  Phone,
  Mail,
  Navigation,
  X,
} from 'lucide-react';
import type { Product, CartItem } from '../../shared/types';

interface MobileCustomerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function MobileCustomerDashboard({ user, onLogout }: MobileCustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState('catalog');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderData, setOrderData] = useState({
    orderType: 'pickup' as 'pickup' | 'delivery',
    address: '',
    notes: '',
    paymentMethod: 'cash' as 'cash' | 'card',
  });

  // Swipe gestures for tab navigation
  const swipeHandlers = useSwipeGesture(
    () => {
      // Swipe left - next tab
      const tabs = ['catalog', 'orders', 'location'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        const nextTab = tabs[currentIndex + 1];
        if (nextTab) setActiveTab(nextTab);
      }
    },
    () => {
      // Swipe right - previous tab
      const tabs = ['catalog', 'orders', 'location'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        const prevTab = tabs[currentIndex - 1];
        if (prevTab) setActiveTab(prevTab);
      }
    }
  );

  // Mock products with categories
  const products = [
    { id: '1', name: 'Pan Dulce Tradicional', price: COLOMBIA_PRICES.PAN_DULCE, description: 'Delicioso pan dulce artesanal con canela', category: 'Pan Dulce', available: true, rating: 4.8, image: '🥐' },
    { id: '2', name: 'Pan de Caja Integral', price: 8000, description: 'Pan de caja elaborado con harina integral', category: 'Pan de Caja', available: true, rating: 4.6, image: '🍞' },
    { id: '3', name: 'Pastel de Chocolate', price: COLOMBIA_PRICES.PASTEL_CHOCOLATE, description: 'Pastel de chocolate con cobertura de crema', category: 'Pasteles', available: true, rating: 4.9, image: '🎂' },
    { id: '4', name: 'Galletas de Avena', price: 5000, description: 'Galletas caseras de avena con pasas', category: 'Galletas', available: true, rating: 4.7, image: '🍪' },
    { id: '5', name: 'Concha de Chocolate', price: COLOMBIA_PRICES.CONCHA, description: 'Pan dulce tradicional con cobertura de chocolate', category: 'Pan Dulce', available: true, rating: 4.8, image: '🥐' },
    { id: '6', name: 'Pay de Limón', price: 12000, description: 'Pay casero de limón con merengue', category: 'Pasteles', available: false, rating: 4.5, image: '🥧' },
    { id: '7', name: 'Croissant Mantequilla', price: COLOMBIA_PRICES.CROISSANT, description: 'Croissant francés con mantequilla fresca', category: 'Pan Dulce', available: true, rating: 4.7, image: '🥐' },
    { id: '8', name: 'Donas Glaseadas', price: 4000, description: 'Donas esponjosas con glaseado de azúcar', category: 'Pan Dulce', available: true, rating: 4.6, image: '🍩' },
  ];

  // Mock order history
  const orderHistory = [
    {
      id: '1001',
      date: new Date('2024-01-15'),
      items: [
        { name: 'Pan Dulce Tradicional', quantity: 6, price: COLOMBIA_PRICES.PAN_DULCE },
        { name: 'Galletas de Avena', quantity: 2, price: 5000 },
      ],
      total: (COLOMBIA_PRICES.PAN_DULCE * 6) + (5000 * 2),
      status: 'delivered' as const,
    },
    {
      id: '1002',
      date: new Date('2024-01-10'),
      items: [
        { name: 'Pastel de Chocolate', quantity: 1, price: COLOMBIA_PRICES.PASTEL_CHOCOLATE },
      ],
      total: COLOMBIA_PRICES.PASTEL_CHOCOLATE,
      status: 'delivered' as const,
    },
    {
      id: '1003',
      date: new Date('2024-01-08'),
      items: [
        { name: 'Croissant Mantequilla', quantity: 4, price: COLOMBIA_PRICES.CROISSANT },
        { name: 'Donas Glaseadas', quantity: 3, price: 4000 },
      ],
      total: (COLOMBIA_PRICES.CROISSANT * 4) + (4000 * 3),
      status: 'preparing' as const,
    },
  ];

  const categories = [...new Set(products.map(p => p.category))];
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (productData: any) => {
    // Cast to Product (mock data needs stock and other fields to match Product interface)
    const product = {
      ...productData,
      stock: 100,
      image: productData.image || '',
    } as Product;

    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
      }]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.product.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    alert(`Pedido realizado exitosamente!\nTotal: ${formatCOP(getCartTotal())}\nTipo: ${orderData.orderType === 'pickup' ? 'Recoger en tienda' : 'Entrega a domicilio'}`);
    setCart([]);
    setIsCartOpen(false);
    setActiveTab('orders');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'preparing': return <Clock className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'delivered': return <Truck className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      default: return status;
    }
  };

  const renderCatalogContent = () => (
    <div className="space-y-4">
      {/* Categories */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            size="sm"
            variant={selectedCategory === 'Todos' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('Todos')}
            className="whitespace-nowrap"
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className={`overflow-hidden transition-all duration-200 hover:shadow-md ${!product.available ? 'opacity-50' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl">
                    {product.image}
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-base truncate">{product.name}</h3>
                    <Badge variant="outline" className="text-xs ml-2 whitespace-nowrap">
                      {product.category}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{product.rating}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary">{formatCOP(product.price)}</span>
                    <Button
                      onClick={() => addToCart(product)}
                      disabled={!product.available}
                      size="sm"
                      className="ml-2"
                    >
                      {product.available ? (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar
                        </>
                      ) : (
                        'No Disponible'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderOrdersContent = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-1">Mis Pedidos</h2>
        <p className="text-sm text-muted-foreground">
          Historial de tus pedidos anteriores
        </p>
      </div>

      <div className="space-y-3">
        {orderHistory.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Pedido #{order.id}</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.date.toLocaleDateString('es-ES', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{getStatusText(order.status)}</span>
                  </Badge>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="truncate">{item.quantity}x {item.name}</span>
                      <span className="font-medium ml-2">{formatCOP(item.quantity * item.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCOP(order.total)}</span>
                  </div>
                </div>

                {order.status === 'preparing' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      🔥 Tu pedido está siendo preparado. Tiempo estimado: 15-20 min
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLocationContent = () => (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-1">Panadería PAMBAZO</h2>
              <p className="text-sm text-muted-foreground">Tu panadería de confianza</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">Ubicación</span>
              </div>
              <p className="text-sm mb-3">Av. Principal 123, Col. Centro</p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  // Simular apertura de mapa
                  const address = encodeURIComponent('Av. Principal 123, Col. Centro');
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
                  window.open(mapsUrl, '_blank');
                  toast.success('Abriendo ubicación en el mapa');
                }}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Ver en Mapa
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <h3 className="font-medium">Contacto</h3>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto p-2"
                    onClick={() => {
                      window.open('tel:+12345678900', '_self');
                      toast.success('Iniciando llamada...');
                    }}
                  >
                    <Phone className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-sm">+1 234 567 8900</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto p-2"
                    onClick={() => {
                      window.open('mailto:info@pambazo.com', '_blank');
                      toast.success('Abriendo cliente de correo...');
                    }}
                  >
                    <Mail className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-sm">info@pambazo.com</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Horarios</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Lunes - Viernes:</span>
                    <span>6:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábados:</span>
                    <span>6:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingos:</span>
                    <span>7:00 AM - 7:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Síguenos</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open('https://facebook.com/pambazo', '_blank');
                    toast.success('Abriendo Facebook...');
                  }}
                >
                  📘 Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open('https://instagram.com/pambazo', '_blank');
                    toast.success('Abriendo Instagram...');
                  }}
                >
                  📷 Instagram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const message = encodeURIComponent('Hola, me gustaría hacer un pedido');
                    window.open(`https://wa.me/12345678900?text=${message}`, '_blank');
                    toast.success('Abriendo WhatsApp...');
                  }}
                >
                  💬 WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.share ?
                      navigator.share({
                        title: 'Panadería PAMBAZO',
                        text: 'Visita la mejor panadería de la ciudad',
                        url: window.location.href
                      }) :
                      toast.info('Función de compartir no disponible');
                  }}
                >
                  🔗 Compartir
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Servicios</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>🚚 Entrega a domicilio:</span>
                  <span className="text-green-600 font-medium">Disponible</span>
                </div>
                <div className="flex justify-between">
                  <span>🏪 Recoger en tienda:</span>
                  <span className="text-green-600 font-medium">Disponible</span>
                </div>
                <div className="flex justify-between">
                  <span>💳 Pago con tarjeta:</span>
                  <span className="text-green-600 font-medium">Aceptamos</span>
                </div>
                <div className="flex justify-between">
                  <span>🎂 Pedidos especiales:</span>
                  <span className="text-blue-600 font-medium">24h anticipación</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">🚚 Entrega a Domicilio</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Radio de 5 km • $30 pesos • 30-45 minutos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'catalog': return renderCatalogContent();
      case 'orders': return renderOrdersContent();
      case 'location': return renderLocationContent();
      default: return renderCatalogContent();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col safe-area-inset">
      <MobileHeader
        user={user}
        onLogout={onLogout}
        cartItemCount={getCartItemCount()}
        onCartClick={() => setIsCartOpen(true)}
        notifications={orderHistory.filter(o => o.status === 'preparing').length}
        title={activeTab === 'catalog' ? 'Catálogo' : activeTab === 'orders' ? 'Mis Pedidos' : 'Ubicación'}
      />

      <main
        className="flex-1 px-4 py-4 pb-20 overflow-y-auto"
        {...swipeHandlers}
      >
        {renderContent()}
      </main>

      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
      />

      {/* Shopping Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Tu Carrito</SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex flex-col h-full">
            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">🛒</div>
                  <p className="text-muted-foreground">Tu carrito está vacío</p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveTab('catalog');
                    }}
                  >
                    Explorar Productos
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 border rounded-lg">
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
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCOP(getCartTotal())}</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Tipo de Pedido</Label>
                      <Select
                        value={orderData.orderType}
                        onValueChange={(value: 'pickup' | 'delivery') =>
                          setOrderData({ ...orderData, orderType: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">🏪 Recoger en tienda</SelectItem>
                          <SelectItem value="delivery">🚚 Entrega a domicilio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {orderData.orderType === 'delivery' && (
                      <div>
                        <Label className="text-sm">Dirección de Entrega</Label>
                        <Input
                          className="mt-1"
                          value={orderData.address}
                          onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                          placeholder="Tu dirección completa"
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-sm">Método de Pago</Label>
                      <Select
                        value={orderData.paymentMethod}
                        onValueChange={(value: 'cash' | 'card') =>
                          setOrderData({ ...orderData, paymentMethod: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">💵 Efectivo</SelectItem>
                          <SelectItem value="card">💳 Tarjeta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleCheckout} className="w-full h-12">
                      Confirmar Pedido - {formatCOP(getCartTotal())}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileCustomerDashboard;