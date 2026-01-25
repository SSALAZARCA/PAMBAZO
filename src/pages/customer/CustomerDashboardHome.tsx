import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import {
    ShoppingBag,
    Heart,
    Star,
    Clock,
    Gift,
    Truck,
    Search,
    Plus,
    Minus,
    Trash2,
    CheckCircle
} from 'lucide-react';
import { User, Product, Category, Order } from '../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import api from '../../services/api';
import { toast } from 'sonner';

interface CustomerDashboardProps {
    user: User;
    onLogout: () => void;
}
interface CartItem {
    product: Product;
    quantity: number;
}

interface CustomerDashboardProps {
    user: User;
    onLogout: () => void;
}
interface CartItem {
    product: Product;
    quantity: number;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('menu');
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [orders, setOrders] = useState<Order[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Loyalty State
    const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);

    const stats = {
        orders: orders.length,
        favorites: 0,
        points: loyaltyPoints || 0,
        nextReward: 500
    };

    useEffect(() => {
        fetchData();
        const path = window.location.pathname;
        if (path.includes('/cart')) setActiveTab('cart');
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes, orderRes, pointsRes] = await Promise.all([
                api.products.getAll({ available: true }),
                api.categories.getAll({ active: true }),
                api.orders.getAll({ user: user.id }),
                api.loyalty.getPoints(parseInt(user.id))
            ]);

            if (prodRes.success && prodRes.data) {
                const prodData = (prodRes.data as any).products || prodRes.data;
                const mappedProducts = (Array.isArray(prodData) ? prodData : []).map((p: any) => ({
                    ...p,
                    category: p.category_id || p.category || ''
                }));
                setProducts(mappedProducts);
            }
            if (catRes.success && catRes.data) {
                setCategories((catRes.data as any).categories || catRes.data);
            }
            if (orderRes.success && orderRes.data) {
                setOrders((orderRes.data as any).orders || orderRes.data);
            }
            if (pointsRes.success && pointsRes.data) {
                const pointsData = (pointsRes.data as any).points !== undefined ? (pointsRes.data as any).points : 0;
                setLoyaltyPoints(pointsData);
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
            toast.error('Error al cargar la información');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        toast.success(`${product.name} agregado al carrito`);
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            const orderData = {
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    notes: ''
                })),
                order_type: 'dine_in', // Default for now
                customer_name: user.name || 'Cliente',
                notes: 'Pedido desde app cliente'
            };

            const res = await api.orders.create(orderData);
            if (res.success) {
                toast.success('¡Pedido realizado con éxito!');
                setCart([]);
                setActiveTab('orders'); // Note: 'orders' tab is gone, maybe switch to 'menu' or staying put? 
                // But user asked to verify everything... Wait, user said remove 'orders' module.
                // So we should probably switch to 'menu' or just empty cart.
                setActiveTab('menu');
                fetchData(); // Refresh orders (even if not shown in own tab, maybe in history somewhere else?)
            } else {
                toast.error('Error al procesar el pedido');
            }
        } catch (error) {
            toast.error('Error conectando con el servidor');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || (p.category && p.category === selectedCategory);
        return matchesSearch && matchesCategory;
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-gray-900 mb-1 leading-tight">
                            ¡Bienvenido, <span className="text-orange-600">{user.name}</span>!
                        </h1>
                        <p className="text-gray-500">
                            Panadería artesanal y café de especialidad.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Mis Pedidos"
                        value={stats.orders}
                        icon={ShoppingBag}
                        color="blue"
                    />
                    <StatCard
                        title="Favoritos"
                        value={stats.favorites}
                        icon={Heart}
                        color="red"
                    />
                    <StatCard
                        title="Puntos"
                        value={stats.points || 0}
                        icon={Star}
                        color="orange"
                        subtitle={`${(stats.nextReward || 500) - (stats.points || 0)} para recompensa`}
                    />
                    <StatCard
                        title="Estatus"
                        value="Silver"
                        icon={Clock}
                        color="purple"
                        subtitle="Cliente frecuente"
                    />
                </div>

                {/* Loyalty Program */}
                <Card className="overflow-hidden border-orange-200 bg-white shadow-md">
                    <div className="bg-gradient-to-r from-orange-600 to-orange-400 p-1"></div>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner">
                                    <Gift className="w-8 h-8 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                        Programa Pambazo Loyalty
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                        Tienes <span className="font-bold text-orange-600">{stats.points}</span> puntos acumulados.
                                    </p>
                                </div>
                            </div>
                            <div className="flex-1 w-full max-w-md">
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                    <span>Progreso</span>
                                    <span>{stats.points} / {stats.nextReward}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 p-0.5 border border-gray-100">
                                    <div
                                        className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                        style={{ width: `${Math.min(100, ((stats.points || 0) / (stats.nextReward || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                            <Button
                                className="bg-gray-900 hover:bg-black text-white px-6 font-bold shadow-lg"
                                onClick={() => window.location.href = '/customer/loyalty'}
                            >
                                Canjear Puntos
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Menu Section */}
                <Card className="glass-card shadow-xl border-gray-100 overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-2xl font-black text-gray-900">Carta de Productos</CardTitle>
                                <CardDescription>Explora nuestras delicias horneadas hoy.</CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-full sm:w-64 bg-white border-gray-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full justify-start h-auto p-4 gap-2 bg-transparent overflow-x-auto no-scrollbar">
                                <TabsTrigger value="menu" className="rounded-full px-6 data-[state=active]:bg-orange-600 data-[state=active]:text-white border">📜 Menú</TabsTrigger>
                                <TabsTrigger value="favorites" className="rounded-full px-6 data-[state=active]:bg-red-600 data-[state=active]:text-white border">❤️ Favoritos</TabsTrigger>
                                <TabsTrigger value="cart" className="rounded-full px-6 data-[state=active]:bg-green-600 data-[state=active]:text-white border relative">
                                    🛒 Carrito
                                    {cart.length > 0 && <Badge className="ml-2 bg-white text-green-600 p-0 w-5 h-5 flex items-center justify-center rounded-full text-[10px] border-none">{cart.length}</Badge>}
                                </TabsTrigger>
                            </TabsList>

                            {/* MENU CONTENT */}
                            <TabsContent value="menu" className="p-6 mt-0">
                                {/* Category Pills */}
                                <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                                    <Button
                                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        className={`rounded-full px-4 ${selectedCategory === 'all' ? 'bg-orange-600' : ''}`}
                                        onClick={() => setSelectedCategory('all')}
                                    >
                                        Todos
                                    </Button>
                                    {categories.map(cat => (
                                        <Button
                                            key={cat.id}
                                            variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                            size="sm"
                                            className={`rounded-full px-4 ${selectedCategory === cat.id ? 'bg-orange-600' : ''}`}
                                            onClick={() => setSelectedCategory(cat.id)}
                                        >
                                            {cat.name}
                                        </Button>
                                    ))}
                                </div>

                                {loading ? (
                                    <div className="h-64 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                                    </div>
                                ) : filteredProducts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <p className="mb-2">No se encontraron productos.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredProducts.map((product) => (
                                            <Card key={product.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                                                <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="text-6xl group-hover:scale-125 transition-transform duration-500">🥐</div>
                                                    )}
                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="secondary" size="icon" className="rounded-full shadow-lg">
                                                            <Heart className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <CardContent className="p-4 space-y-3">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">{product.name}</h3>
                                                            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                                <Star className="w-3 h-3 fill-current" />
                                                                {product.rating}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.description || 'Delicioso pan recién horneado.'}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xl font-black text-gray-900">
                                                            {formatPrice(product.price)}
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg px-4"
                                                            onClick={() => addToCart(product)}
                                                        >
                                                            <Plus className="w-4 h-4 mr-1" />
                                                            Agregar
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* FAVORITES CONTENT */}
                            <TabsContent value="favorites" className="p-12 text-center">
                                <Heart className="w-16 h-16 mx-auto mb-4 text-red-100" />
                                <h3 className="text-xl font-bold text-gray-900">Aún no tienes favoritos</h3>
                                <p className="text-gray-500 mt-2 max-w-xs mx-auto">Marca con un corazón tus productos preferidos para verlos aquí.</p>
                                <Button className="mt-6 font-bold" variant="outline" onClick={() => setActiveTab('menu')}>Ir al Menú</Button>
                            </TabsContent>

                            {/* ORDERS HISTORY CONTENT */}


                            {/* CART CONTENT */}
                            <TabsContent value="cart" className="p-6">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12 flex flex-col items-center">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <ShoppingBag className="w-12 h-12 text-gray-200" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Tu carrito está vacío</h3>
                                        <p className="text-gray-500 mt-2 mb-6">Parece que no has añadido nada delicioso hoy.</p>
                                        <Button className="bg-orange-600 hover:bg-orange-700 font-bold px-8 shadow-lg" onClick={() => setActiveTab('menu')}>
                                            Ver el Menú
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-4">
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <ShoppingBag className="w-5 h-5 text-green-600" />
                                                Productos en el Carrito
                                            </h3>
                                            {cart.map((item) => (
                                                <div key={item.product.id} className="flex justify-between items-center p-4 bg-white border rounded-2xl shadow-sm hover:border-green-100 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl">
                                                            {item.product.image || '🥐'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{item.product.name}</p>
                                                            <p className="text-xs text-gray-500">{formatPrice(item.product.price)} c/u</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center bg-gray-50 rounded-full p-1 border">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full"
                                                                onClick={() => updateQuantity(item.product.id, -1)}
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </Button>
                                                            <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full"
                                                                onClick={() => updateQuantity(item.product.id, 1)}
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                        <div className="text-right w-24">
                                                            <p className="font-black text-gray-900">{formatPrice(item.product.price * item.quantity)}</p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => removeFromCart(item.product.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-6">
                                            <Card className="bg-gray-50 border-none shadow-inner p-6 rounded-3xl">
                                                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Resumen del Pedido</h3>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500 font-medium">Subtotal</span>
                                                        <span className="text-gray-900 font-bold">{formatPrice(cartTotal)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500 font-medium">Envío</span>
                                                        <span className="text-green-600 font-bold">Gratis</span>
                                                    </div>
                                                    <div className="h-px bg-gray-200 my-4 shadow-[0_1px_0_white]"></div>
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-gray-900 font-extrabold text-lg">Total</span>
                                                        <span className="text-3xl font-black text-orange-600 tracking-tighter">{formatPrice(cartTotal)}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full mt-8 h-12 rounded-2xl bg-gray-900 hover:bg-black text-white font-black text-lg shadow-xl shadow-gray-200 group relative overflow-hidden"
                                                    onClick={handleCheckout}
                                                >
                                                    <div className="relative z-10 flex items-center justify-center gap-2">
                                                        <CheckCircle className="w-5 h-5" />
                                                        REALIZAR PEDIDO
                                                    </div>
                                                    <div className="absolute inset-0 bg-green-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                                </Button>
                                                <p className="text-[10px] text-gray-400 text-center mt-4 px-4 font-medium uppercase tracking-widest leading-relaxed">
                                                    Al realizar el pedido, aceptas nuestras condiciones de servicio.
                                                </p>
                                            </Card>

                                            <Card className="border-dashed border-2 bg-white/50 p-4 rounded-3xl flex items-center gap-4">
                                                <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                                    <Gift className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900">Cupón de Descuento</p>
                                                    <p className="text-[10px] text-gray-500">¿Tienes un código? Aplícalo aquí.</p>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-blue-100 bg-blue-50/50 p-6 rounded-3xl group cursor-pointer hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                                <Truck className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Envío Gratis Garantizado</h3>
                                <p className="text-sm text-blue-800 opacity-80 mt-1">
                                    En todos los pedidos superiores a $50.000 COP dentro de la zona.
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="border-orange-100 bg-orange-50/50 p-6 rounded-3xl group cursor-pointer hover:bg-orange-50 transition-colors">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-orange-100 group-hover:scale-110 transition-transform">
                                <Clock className="w-7 h-7 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Pan Caliente Siempre</h3>
                                <p className="text-sm text-orange-800 opacity-80 mt-1">
                                    Horneamos cada 2 horas para que disfrutes la máxima frescura.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomerDashboard;
