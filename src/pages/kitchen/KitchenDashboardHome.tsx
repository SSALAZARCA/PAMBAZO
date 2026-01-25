import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import {
    ChefHat,
    Clock,
    CheckCircle,
    AlertCircle,
    Flame,
    Timer
} from 'lucide-react';
import { User } from '../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { kitchenService, KitchenOrder, KitchenStats } from '../../services/kitchenService';
import { toast } from 'sonner';
import { useAuthContext } from '../../contexts/AuthContext';

interface KitchenDashboardProps {
    user: User;
    onLogout: () => void;
}

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('pending');
    const [stats, setStats] = useState<KitchenStats | null>(null);
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const { logout } = useAuthContext();

    useEffect(() => {
        loadData();
        // Recargar cada 30 segundos
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, ordersData] = await Promise.all([
                kitchenService.getStats(),
                kitchenService.getOrders()
            ]);
            setStats(statsData);
            setOrders(ordersData);
        } catch (error: any) {
            console.error('Error loading kitchen data:', error);
            if (error.response?.status === 401) {
                toast.error('Sesión expirada. Por favor inicie sesión nuevamente.');
                logout();
            } else {
                toast.error('Error al cargar datos de cocina');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStartOrder = async (orderId: string) => {
        try {
            await kitchenService.startOrder(orderId);
            toast.success('¡Preparación iniciada!');
            loadData();
        } catch (error) {
            console.error('Error starting order:', error);
            toast.error('Error al iniciar preparación');
        }
    };

    const handleCompleteOrder = async (orderId: string) => {
        try {
            await kitchenService.completeOrder(orderId);
            toast.success('¡Orden completada!');
            loadData();
        } catch (error) {
            console.error('Error completing order:', error);
            toast.error('Error al completar orden');
        }
    };

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');

    const getTimeSince = (dateString: string) => {
        const now = new Date();
        const created = new Date(dateString);
        const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);
        return `${diffMinutes} min`;
    };

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
                        Panel de Cocina
                    </h1>
                    <p className="text-gray-500">
                        Gestión de pedidos y preparación
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Pedidos Pendientes"
                        value={stats?.pendingOrders || 0}
                        icon={AlertCircle}
                        color="orange"
                        subtitle="Requieren atención"
                    />
                    <StatCard
                        title="En Preparación"
                        value={stats?.inPreparation || 0}
                        icon={Flame}
                        color="blue"
                        subtitle="Activos ahora"
                    />
                    <StatCard
                        title="Completados Hoy"
                        value={stats?.completedToday || 0}
                        icon={CheckCircle}
                        color="green"
                        trend={{ value: 15, isPositive: true }}
                    />
                    <StatCard
                        title="Tiempo Promedio"
                        value={`${stats?.avgPrepTime || 0} min`}
                        icon={Timer}
                        color="purple"
                        trend={{ value: 2, isPositive: false }}
                    />
                </div>

                {/* Orders Section */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ChefHat className="w-5 h-5 text-orange-600" />
                            Órdenes Activas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="pending">
                                    Pendientes ({pendingOrders.length})
                                </TabsTrigger>
                                <TabsTrigger value="preparing">
                                    En Preparación ({preparingOrders.length})
                                </TabsTrigger>
                                <TabsTrigger value="ready">
                                    Listos ({readyOrders.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="pending" className="space-y-3 mt-4">
                                {loading ? (
                                    <div className="p-6 text-center text-gray-500">
                                        Cargando...
                                    </div>
                                ) : pendingOrders.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        <p>No hay órdenes pendientes</p>
                                    </div>
                                ) : (
                                    pendingOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${order.priority === 'high'
                                                ? 'bg-red-50 border-red-300'
                                                : 'bg-white border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        #{order.id}
                                                    </div>
                                                    <Badge variant={order.priority === 'high' ? 'destructive' : 'secondary'}>
                                                        Mesa {order.tableNumber}
                                                    </Badge>
                                                    {order.priority === 'high' && (
                                                        <Badge variant="destructive">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            Urgente
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-orange-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-semibold">{getTimeSince(order.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-2 mb-4">
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className="text-sm border-b border-gray-100 last:border-0 pb-1">
                                                            <div className="flex justify-between font-medium">
                                                                <span>{item.quantity}x {item.productName || (item as any).product_name}</span>
                                                            </div>
                                                            {item.notes && (
                                                                <p className="text-xs text-gray-500 italic">
                                                                    Note: {item.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStartOrder(order.id)}
                                                    className="bg-orange-600 hover:bg-orange-700"
                                                >
                                                    <Flame className="w-4 h-4 mr-2" />
                                                    Iniciar Preparación
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="preparing" className="space-y-3 mt-4">
                                {loading ? (
                                    <div className="p-6 text-center text-gray-500">
                                        Cargando...
                                    </div>
                                ) : preparingOrders.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        <Flame className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        <p>No hay órdenes en preparación</p>
                                    </div>
                                ) : (
                                    preparingOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="p-4 rounded-lg border-2 bg-blue-50 border-blue-300 transition-all hover:shadow-md"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        #{order.id}
                                                    </div>
                                                    <Badge variant="secondary">
                                                        Mesa {order.tableNumber}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-blue-600">
                                                    <Timer className="w-4 h-4" />
                                                    <span className="font-semibold">{getTimeSince(order.startedAt!)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-2 mb-4">
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className="text-sm border-b border-blue-200 last:border-0 pb-1">
                                                            <div className="flex justify-between font-medium">
                                                                <span>{item.quantity}x {item.productName || (item as any).product_name}</span>
                                                            </div>
                                                            {item.notes && (
                                                                <p className="text-xs text-blue-600 italic">
                                                                    Note: {item.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleCompleteOrder(order.id)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Marcar Listo
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="ready" className="space-y-3 mt-4">
                                {loading ? (
                                    <div className="p-6 text-center text-gray-500">
                                        Cargando...
                                    </div>
                                ) : readyOrders.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        <p>No hay órdenes listas para servir</p>
                                    </div>
                                ) : (
                                    readyOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="p-4 rounded-lg border-2 bg-green-50 border-green-300"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        #{order.id}
                                                    </div>
                                                    <Badge variant="secondary">
                                                        Mesa {order.tableNumber}
                                                    </Badge>
                                                    <Badge className="bg-green-600">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Listo
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Tiempo: {order.prepTime} min
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Alertas de Órdenes Demoradas */}
                {(() => {
                    const now = new Date();
                    const PENDING_THRESHOLD = 10; // minutos
                    const PREPARING_THRESHOLD = 20; // minutos

                    const delayedPending = pendingOrders.filter(o => {
                        const created = new Date(o.createdAt);
                        const minutesWaiting = Math.floor((now.getTime() - created.getTime()) / 60000);
                        return minutesWaiting > PENDING_THRESHOLD;
                    });

                    const delayedPreparing = preparingOrders.filter(o => {
                        const started = new Date(o.startedAt!);
                        const minutesPreparing = Math.floor((now.getTime() - started.getTime()) / 60000);
                        return minutesPreparing > PREPARING_THRESHOLD;
                    });

                    const hasDelays = delayedPending.length > 0 || delayedPreparing.length > 0;

                    if (!hasDelays) return null;

                    return (
                        <Card className="glass-card border-2 border-orange-200 bg-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-900">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                    Alertas de Órdenes Demoradas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {delayedPending.length > 0 && (
                                    <div className="p-4 rounded-lg bg-red-50 border-2 border-red-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                            <h3 className="font-semibold text-red-900">
                                                Órdenes Pendientes sin Iniciar ({delayedPending.length})
                                            </h3>
                                        </div>
                                        <div className="space-y-2">
                                            {delayedPending.map(order => {
                                                const minutesWaiting = Math.floor(
                                                    (now.getTime() - new Date(order.createdAt).getTime()) / 60000
                                                );
                                                return (
                                                    <div
                                                        key={order.id}
                                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="font-bold text-red-900">#{order.id}</div>
                                                            <Badge variant="secondary">Mesa {order.tableNumber}</Badge>
                                                            <span className="text-sm text-red-700 font-medium">
                                                                ⏱️ {minutesWaiting} min esperando
                                                            </span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStartOrder(order.id)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            <Flame className="w-4 h-4 mr-2" />
                                                            Iniciar Ahora
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {delayedPreparing.length > 0 && (
                                    <div className="p-4 rounded-lg bg-yellow-50 border-2 border-yellow-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Clock className="w-5 h-5 text-yellow-600" />
                                            <h3 className="font-semibold text-yellow-900">
                                                Órdenes en Preparación Demoradas ({delayedPreparing.length})
                                            </h3>
                                        </div>
                                        <div className="space-y-2">
                                            {delayedPreparing.map(order => {
                                                const minutesPreparing = Math.floor(
                                                    (now.getTime() - new Date(order.startedAt!).getTime()) / 60000
                                                );
                                                return (
                                                    <div
                                                        key={order.id}
                                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="font-bold text-yellow-900">#{order.id}</div>
                                                            <Badge variant="secondary">Mesa {order.tableNumber}</Badge>
                                                            <span className="text-sm text-yellow-700 font-medium">
                                                                ⏱️ {minutesPreparing} min en preparación
                                                            </span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleCompleteOrder(order.id)}
                                                            className="bg-yellow-600 hover:bg-yellow-700"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Marcar Listo
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="text-xs text-orange-700 bg-orange-100 p-3 rounded-lg">
                                    <strong>Umbrales de alerta:</strong> Pendientes &gt; {PENDING_THRESHOLD} min | En preparación &gt; {PREPARING_THRESHOLD} min
                                </div>
                            </CardContent>
                        </Card>
                    );
                })()}
            </div>
        </DashboardLayout>
    );
};

export default KitchenDashboard;
