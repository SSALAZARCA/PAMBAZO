import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { User, Order } from '../../../../shared/types';
import { Card, CardContent } from '../../../components/ui/card';
import {
    Flame,
    CheckCircle,
    Clock,
    RefreshCw,
    ChefHat,
    UtensilsCrossed
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import api from '../../../services/api';
import ProductionMonitor from '../../../components/ProductionMonitor';
import { CreateBatchDialog } from '../../../components/CreateBatchDialog';

interface ProductionPageProps {
    user: User;
    onLogout: () => void;
}

export const ProductionPage: React.FC<ProductionPageProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('batches');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.orders.getAll();
            if (res.success && res.data) {
                const allOrders = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
                // Filter for kitchen/baker relevant statuses
                setOrders(allOrders.filter((o: any) => ['pending', 'preparing', 'ready'].includes(o.status)));
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            await api.orders.updateStatus(orderId, newStatus);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="text-gray-600 border-gray-400 bg-gray-50">Por Iniciar</Badge>;
            case 'preparing': return <Badge className="bg-orange-600 animate-pulse"><Flame className="w-3 h-3 mr-1" />En Horno</Badge>;
            case 'ready': return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Para Servir</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const OrderCard = ({ order }: { order: any }) => (
        <Card className={`overflow-hidden border-t-4 transition-all hover:shadow-md ${order.status === 'preparing' ? 'border-t-orange-500 bg-orange-50/30' :
            order.status === 'ready' ? 'border-t-green-500 bg-green-50/30' :
                'border-t-gray-300'
            }`}>
            <CardContent className="p-0">
                <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">Mesa {order.table_number || order.tableId || '?'}</h3>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-gray-500 font-mono">#{order.id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-medium text-gray-500 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    <ul className="space-y-2">
                        {order.items && order.items.map((item: any, idx: number) => (
                            <li key={idx} className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 font-medium text-gray-700">
                                    <span className="bg-gray-100 text-gray-800 w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold">
                                        {item.quantity}
                                    </span>
                                    {item.product?.name || item.product_name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                    {order.status === 'pending' && (
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" size="sm" onClick={() => updateStatus(order.id, 'preparing')}>
                            <Flame className="w-4 h-4 mr-2" /> Iniciar
                        </Button>
                    )}
                    {order.status === 'preparing' && (
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={() => updateStatus(order.id, 'ready')}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Marcar Listo
                        </Button>
                    )}
                    {order.status === 'ready' && (
                        <div className="w-full text-center py-1 text-sm font-medium text-green-700 flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Esperando servicio
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 px-1">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-2 text-sm font-medium uppercase tracking-wider">
                            <UtensilsCrossed className="w-4 h-4" />
                            <span>Centro de Operaciones</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 font-display">
                            Control de Producción
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Gestiona lotes de panadería y pedidos a la carta desde un solo lugar.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <CreateBatchDialog />
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200">
                        <TabsList className="bg-transparent p-0 h-auto gap-6">
                            <TabsTrigger
                                value="batches"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-700 data-[state=active]:shadow-none rounded-none px-2 py-3 bg-transparent text-gray-500 hover:text-gray-700 transition-all text-base"
                            >
                                <ChefHat className="w-4 h-4 mr-2" />
                                Lotes en Producción
                            </TabsTrigger>
                            <TabsTrigger
                                value="orders"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 data-[state=active]:shadow-none rounded-none px-2 py-3 bg-transparent text-gray-500 hover:text-gray-700 transition-all text-base"
                            >
                                <Flame className="w-4 h-4 mr-2" />
                                Comandas de Cocina
                                {orders.length > 0 && (
                                    <span className="ml-2 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-bold">
                                        {orders.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {activeTab === 'orders' && (
                            <Button variant="ghost" size="sm" onClick={fetchOrders} disabled={loading} className="text-gray-500 hover:text-gray-900">
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </Button>
                        )}
                    </div>

                    <TabsContent value="batches" className="pt-2">
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <ProductionMonitor className="border-none shadow-none" />
                        </div>
                    </TabsContent>

                    <TabsContent value="orders" className="pt-2">
                        {orders.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Todo tranquilo en la cocina</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-1">
                                    No hay pedidos pendientes por preparar en este momento.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-6 text-gray-600"
                                    onClick={fetchOrders}
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Verificar Nuevos Pedidos
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {orders.map((order) => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default ProductionPage;

