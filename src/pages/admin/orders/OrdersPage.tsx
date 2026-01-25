import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import api, { User, Order } from '../../../services/api';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { toast } from 'sonner';

interface OrdersPageProps {
    user: User;
    onLogout: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ user, onLogout }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Auto-refresh for live monitoring
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // 30s polling
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        // Don't set loading true on background refresh to avoid flickering
        if (loading) setLoading(true);
        try {
            const res = await api.orders.getAll();
            if (res.success && res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data as any).data || (res.data as any).orders || [];
                list.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setOrders(list);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await api.orders.updateStatus(id, newStatus);
            toast.success(`Pedido movido a ${newStatus}`);
            fetchOrders();
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus as any });
            }
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    const handleCancel = async (id: string) => {
        if (window.confirm('¿Cancelar este pedido?')) {
            try {
                await api.orders.updateStatus(id, 'cancelled');
                toast.success('Pedido cancelado');
                fetchOrders();
            } catch (error) {
                toast.error('Error al cancelar');
            }
        }
    };

    const openDetail = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const getElapsedMinutes = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        return Math.floor(diff / 60000);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            preparing: 'bg-blue-100 text-blue-800',
            ready: 'bg-green-100 text-green-800',
            served: 'bg-gray-100 text-gray-800',
            completed: 'bg-gray-800 text-white',
            cancelled: 'bg-red-100 text-red-800'
        };
        const labels: Record<string, string> = {
            pending: 'Pendiente',
            preparing: 'Preparando',
            ready: 'Listo',
            served: 'Servido',
            completed: 'Completado',
            cancelled: 'Cancelado'
        };
        return (
            <Badge className={`${styles[status] || styles['pending']} border-0`}>
                {labels[status] || status}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount);
    };

    const filteredOrders = orders.filter(o =>
        (o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.includes(searchTerm) ||
        (o.table_number?.toString() || '').includes(searchTerm)
    );

    // Kanban Column Component
    const KanbanColumn = ({ title, status, color }: { title: string, status: string, color: string }) => {
        const columnOrders = filteredOrders.filter(o => o.status === status);
        return (
            <div className="flex flex-col h-full bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                <div className={`flex items-center justify-between mb-4 pb-2 border-b border-${color}-200`}>
                    <h3 className={`font-bold text-${color}-700`}>{title}</h3>
                    <Badge variant="secondary" className="bg-white">{columnOrders.length}</Badge>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px]">
                    {columnOrders.map(order => {
                        const elapsed = getElapsedMinutes(order.created_at);
                        const isLate = elapsed > 20;
                        return (
                            <div key={order.id} className={`bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow ${isLate ? 'border-l-4 border-l-red-500' : ''}`} onClick={() => openDetail(order)}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900">#{order.id.slice(0, 4)}</span>
                                    <span className={`text-xs font-mono ${isLate ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                                        {elapsed}m
                                    </span>
                                </div>
                                <div className="text-sm mb-2">
                                    <p className="font-medium text-gray-800">{order.customer_name || 'Cliente'}</p>
                                    <p className="text-gray-500 text-xs">Mesa {order.table_number || '-'}</p>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold">{formatCurrency(Number(order.total))}</span>
                                    <Badge variant="outline" className="text-[10px] px-1">{order.items?.length || 0} items</Badge>
                                </div>
                                {status === 'pending' && (
                                    <Button size="sm" className="w-full mt-3 bg-blue-600 h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'preparing'); }}>
                                        Cocinar
                                    </Button>
                                )}
                                {status === 'preparing' && (
                                    <Button size="sm" className="w-full mt-3 bg-green-600 h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'ready'); }}>
                                        Listo
                                    </Button>
                                )}
                                {status === 'ready' && (
                                    <Button size="sm" className="w-full mt-3 bg-gray-700 h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'served'); }}>
                                        Servir
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                    {columnOrders.length === 0 && <div className="text-center text-gray-400 text-sm py-4">Sin pedidos</div>}
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
                            Gestión de Pedidos
                        </h1>
                        <p className="text-gray-500">
                            Centro de control de órdenes y cocina
                        </p>
                    </div>
                </div>

                <Card className="glass-card border-0 bg-transparent shadow-none p-0">
                    <Tabs defaultValue="board" className="w-full space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <TabsList className="bg-gray-100">
                                <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <List className="w-4 h-4 mr-2" /> Lista
                                </TabsTrigger>
                                <TabsTrigger value="board" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <LayoutGrid className="w-4 h-4 mr-2" /> Tablero de Cocina
                                </TabsTrigger>
                            </TabsList>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar..."
                                    className="pl-10 w-64 h-9 text-sm"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <TabsContent value="board" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-250px)]">
                                <KanbanColumn title="Pendientes" status="pending" color="orange" />
                                <KanbanColumn title="En Preparación" status="preparing" color="blue" />
                                <KanbanColumn title="Listos para Servir" status="ready" color="green" />
                                <KanbanColumn title="Servidos / Historial" status="served" color="gray" />
                            </div>
                        </TabsContent>

                        <TabsContent value="list" className="mt-0">
                            <Card className="glass-card">
                                {/* Keeping previous table implementation inside this card */}
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50/50">
                                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    <th className="p-4">Pedido</th>
                                                    <th className="p-4">Cliente</th>
                                                    <th className="p-4">Estado</th>
                                                    <th className="p-4">Tiempo</th>
                                                    <th className="p-4">Total</th>
                                                    <th className="p-4 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {loading && <tr><td colSpan={6} className="p-4 text-center">Cargando...</td></tr>}
                                                {!loading && filteredOrders.map(order => (
                                                    <tr key={order.id} className="hover:bg-gray-50">
                                                        <td className="p-4 font-mono text-sm">#{order.id.slice(0, 6)}</td>
                                                        <td className="p-4">
                                                            <div className="font-medium text-sm">{order.customer_name}</div>
                                                            <div className="text-xs text-gray-500">Mesa {order.table_number || '-'}</div>
                                                        </td>
                                                        <td className="p-4">{getStatusBadge(order.status)}</td>
                                                        <td className="p-4 text-sm text-gray-600">{getElapsedMinutes(order.created_at)} min</td>
                                                        <td className="p-4 font-bold text-sm">{formatCurrency(Number(order.total))}</td>
                                                        <td className="p-4 text-right">
                                                            <Button variant="ghost" size="sm" onClick={() => openDetail(order)}>Ver</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </Card>

                {/* Detail Dialog (Reused) */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Detalle del Pedido #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                                    <div><p className="text-gray-500">Estado</p>{getStatusBadge(selectedOrder.status)}</div>
                                    <div><p className="text-gray-500">Tiempo Transcurrido</p><p className="font-mono font-bold">{getElapsedMinutes(selectedOrder.created_at)} min</p></div>
                                    <div><p className="text-gray-500">Cliente</p><p className="font-medium">{selectedOrder.customer_name}</p></div>
                                    <div><p className="text-gray-500">Mesa</p><p className="font-medium">#{selectedOrder.table_number || 'N/A'}</p></div>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {selectedOrder.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center p-2 border-b last:border-0 border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold bg-gray-100 px-2 py-1 rounded text-xs">x{item.quantity}</span>
                                                <span className="text-sm">{item.product_name}</span>
                                            </div>
                                            <span className="font-medium text-sm">{formatCurrency(item.subtotal || item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 flex justify-between items-center border-t">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-bold text-xl text-orange-600">{formatCurrency(Number(selectedOrder.total))}</span>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed' && selectedOrder.status !== 'served' && (
                                        <Button variant="destructive" onClick={() => { handleCancel(selectedOrder.id); setIsDetailOpen(false); }}>
                                            Cancelar
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Cerrar</Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default OrdersPage;
