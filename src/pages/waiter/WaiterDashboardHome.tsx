import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import {
    Users,
    Coffee,
    CheckCircle,
    Clock,
    DollarSign,
    Table as TableIcon,
    Plus,
    Bell,
    HandPlatter
} from 'lucide-react';
import { User } from '../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import api from '../../services/api';
import { CreateOrderDialog } from '../../components/orders/CreateOrderDialog';
import { TableDetailsModal } from '../../components/orders/TableDetailsModal';
import { CheckoutSummaryModal } from '../../components/orders/CheckoutSummaryModal';
import { toast } from 'sonner';
import { useNotifications } from '../../context/NotificationContext';

interface WaiterDashboardProps {
    user: User;
    onLogout: () => void;
}

export const WaiterDashboard: React.FC<WaiterDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('tables');
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const { notifications, dismissNotification } = useNotifications();

    // Order Logic State
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [selectedTableNumber, setSelectedTableNumber] = useState<number | undefined>(undefined);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // Detailed Table Views
    const [selectedTable, setSelectedTable] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isTableDetailsOpen, setIsTableDetailsOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const [stats, setStats] = useState({
        myTables: 0,
        activeOrders: 0,
        completedToday: 0,
        totalSales: 0
    });

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [tablesRes, ordersRes] = await Promise.all([
                api.tables.getAll(),
                api.orders.getAll()
            ]);

            let mappedTables: any[] = [];
            if (tablesRes.success && tablesRes.data) {
                const rawTables = Array.isArray(tablesRes.data) ? tablesRes.data : (tablesRes.data as any).tables || [];
                mappedTables = rawTables.map((t: any) => ({
                    id: t.id,
                    number: t.number || t.table_number,
                    status: t.status || (t.is_available ? 'available' : 'occupied'),
                    guests: t.capacity
                }));
                setTables(mappedTables);
            }

            if (ordersRes.success && ordersRes.data) {
                const rawOrders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data as any).orders || [];
                setOrders(rawOrders);

                // Stats Calculation
                const activeCount = mappedTables.filter((t: any) => t.status === 'occupied').length;
                const today = new Date().toISOString().split('T')[0];
                const todayOrders = rawOrders.filter((o: any) => o.created_at?.startsWith(today) || o.createdAt?.startsWith(today));

                const completedCount = todayOrders.filter((o: any) => o.status === 'completed' || o.status === 'ready').length;
                const dailySales = todayOrders
                    .filter((o: any) => o.status === 'completed' || o.status === 'served' || o.status === 'ready')
                    .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

                setStats({
                    myTables: mappedTables.length,
                    activeOrders: activeCount,
                    completedToday: completedCount,
                    totalSales: dailySales
                });
            }
        } catch (error) {
            console.error('Error loading waiter dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleCloseAccount = (orderId: string, tableId: string) => {
        const order = orders.find(o => o.id === orderId);
        const table = tables.find(t => t.id === tableId);

        if (order && table) {
            setSelectedOrder(order);
            setSelectedTable(table);
            setIsCheckoutOpen(true);
            setIsTableDetailsOpen(false); // Cerrar detalles si estaban abiertos
        }
    };

    const handleConfirmCheckout = async () => {
        if (!selectedOrder || !selectedTable) return;

        try {
            setLoading(true);
            // 1. Marcar orden como lista para pago (va a caja)
            await api.orders.updateStatus(selectedOrder.id, 'awaiting_payment');

            // 2. Marcar mesa como disponible
            await api.tables.update(selectedTable.id, { status: 'available', currentOrder: null });

            toast.success(`Cuenta de Mesa ${selectedTable.number} enviada a caja`);
            setIsCheckoutOpen(false);
            fetchDashboardData();
        } catch (error) {
            console.error('Error during checkout:', error);
            toast.error('Error al procesar el cobro');
        } finally {
            setLoading(false);
        }
    };

    const handleTableClick = (table: any) => {
        const activeOrder = orders.find(o => (o.table_id === table.id || o.tableNumber === table.number) && o.status !== 'completed' && o.status !== 'cancelled');

        if (table.status === 'occupied' && activeOrder) {
            setSelectedTable(table);
            setSelectedOrder(activeOrder);
            setIsTableDetailsOpen(true);
        } else {
            handleOpenOrder(table);
        }
    };

    const handleOpenOrder = (table: any) => {
        setSelectedTableId(table.id);
        setSelectedTableNumber(table.number);
        setIsOrderModalOpen(true);
    };

    const handleOrderCreated = () => {
        fetchDashboardData();
    };

    const getTableColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-50 border-green-300 hover:bg-green-100';
            case 'occupied': return 'bg-orange-50 border-orange-300 hover:bg-orange-100';
            case 'reserved': return 'bg-blue-50 border-blue-300 hover:bg-blue-100';
            default: return 'bg-gray-50 border-gray-300';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available': return <Badge className="bg-green-600">Disponible</Badge>;
            case 'occupied': return <Badge className="bg-orange-600">Ocupada</Badge>;
            case 'reserved': return <Badge className="bg-blue-600">Reservada</Badge>;
            default: return <Badge>Desconocido</Badge>;
        }
    };

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">Panel de Mesero</h1>
                    <p className="text-gray-500">Gestión de mesas y pedidos - {user.name}</p>
                </div>

                {/* Pickup Alerts */}
                {orders.filter(o => o.status === 'ready').length > 0 && (
                    <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6 rounded-r-xl shadow-lg animate-pulse-slow">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500 p-2 rounded-full">
                                <Bell className="w-5 h-5 text-white animate-bounce" />
                            </div>
                            <div>
                                <h3 className="text-orange-900 font-bold text-lg">¡Órdenes listas en Cocina!</h3>
                                <p className="text-orange-700">Por favor, recoge los pedidos de las siguientes mesas:</p>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {orders.filter(o => o.status === 'ready').map(order => (
                                <div
                                    key={order.id}
                                    className="bg-white p-3 rounded-xl border border-orange-200 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all min-w-[200px]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-lg text-lg">
                                            Mesa {order.table_number || order.tableNumber || 'S/N'}
                                        </div>
                                        <div className="text-sm font-medium text-gray-600">
                                            Listo para servir
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-orange-600 hover:bg-orange-700 text-white gap-2 font-bold px-4"
                                        onClick={() => {
                                            // Optimismo: Actualizar localmente para que desaparezca de inmediato
                                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'served' } : o));

                                            // Limpiar notificación del sistema si existe
                                            const relatedNotif = notifications.find(n => n.orderId === order.id);
                                            if (relatedNotif) dismissNotification(relatedNotif.id);

                                            api.orders.updateStatus(order.id, 'served').then(() => {
                                                toast.success(`Mesa ${order.table_number || order.tableNumber} marcada como servida`);
                                                fetchDashboardData();
                                            }).catch(() => {
                                                toast.error('Error al actualizar el estado');
                                                fetchDashboardData(); // Re-sincronizar en caso de error
                                            });
                                        }}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Recogido
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Mesas Totales" value={stats.myTables} icon={TableIcon} color="blue" subtitle="En sala" />
                    <StatCard title="Ocupadas" value={stats.activeOrders} icon={Coffee} color="orange" subtitle="Con clientes" />
                    <StatCard title="Completados Hoy" value={stats.completedToday} icon={CheckCircle} color="green" />
                    <StatCard title="Ventas del Día" value={`$${stats.totalSales.toLocaleString()}`} icon={DollarSign} color="purple" />
                </div>

                {/* Tables Grid */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TableIcon className="w-5 h-5 text-blue-600" />
                            Gestión de Mesas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="tables">Mis Mesas</TabsTrigger>
                                <TabsTrigger value="history">Historial Hoy</TabsTrigger>
                            </TabsList>

                            <TabsContent value="tables" className="mt-4">
                                {loading ? (
                                    <div className="text-center py-8 text-gray-400">Cargando mesas...</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tables.map((table) => {
                                            const activeOrder = orders.find(o => o.table_id === table.id && o.status !== 'completed');
                                            const isReady = activeOrder?.status === 'ready';

                                            return (
                                                <div
                                                    key={table.id}
                                                    className={`p-4 rounded-lg border-2 transition-all relative cursor-pointer ${getTableColor(table.status)} ${isReady ? 'ring-4 ring-green-500 ring-offset-2 animate-pulse' : ''}`}
                                                    onClick={() => handleTableClick(table)}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="text-2xl font-bold text-gray-900">Mesa {table.number}</div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            {getStatusBadge(table.status)}
                                                            {isReady && <Badge className="bg-green-600 animate-bounce">¡LISTO!</Badge>}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Users className="w-4 h-4" />
                                                            <span>Capacidad: {table.guests}</span>
                                                        </div>

                                                        {table.status === 'occupied' ? (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 bg-white" onClick={() => handleOpenOrder(table)}>
                                                                    <Plus className="w-4 h-4 mr-1" /> Pedido
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className={`${isReady ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'} text-white`}
                                                                    onClick={() => {
                                                                        if (activeOrder) {
                                                                            if (isReady) {
                                                                                setOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: 'served' } : o));
                                                                                api.orders.updateStatus(activeOrder.id, 'served').then(() => {
                                                                                    toast.success('Pedido servido');
                                                                                    fetchDashboardData();
                                                                                }).catch(() => {
                                                                                    toast.error('Error al actualizar pedido');
                                                                                    fetchDashboardData();
                                                                                });
                                                                            } else {
                                                                                handleCloseAccount(activeOrder.id, table.id);
                                                                            }
                                                                        } else toast.error('Sin orden activa');
                                                                    }}
                                                                >
                                                                    {isReady ? <><HandPlatter className="w-4 h-4 mr-1" /> Servir</> : <><DollarSign className="w-4 h-4 mr-1" /> Cerrar</>}
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleOpenOrder(table)}>
                                                                <Plus className="w-4 h-4 mr-2" /> Asignar mesa
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="mt-4">
                                <div className="space-y-2">
                                    {orders.filter(o => o.status === 'completed' && (o.created_at?.startsWith(new Date().toISOString().split('T')[0]) || o.createdAt?.startsWith(new Date().toISOString().split('T')[0]))).length === 0 ? (
                                        <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-xl">
                                            <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                            <p>No hay historial hoy</p>
                                        </div>
                                    ) : (
                                        orders
                                            .filter(o => o.status === 'completed' && (o.created_at?.startsWith(new Date().toISOString().split('T')[0]) || o.createdAt?.startsWith(new Date().toISOString().split('T')[0])))
                                            .map(order => (
                                                <div key={order.id} className="flex justify-between p-3 bg-gray-50 rounded-lg border">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Mesa {order.table_number}</p>
                                                        <p className="text-xs text-gray-500">{new Date(order.created_at || order.createdAt).toLocaleTimeString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">${(order.total || 0).toLocaleString()}</p>
                                                        <Badge variant="secondary" className="text-[10px]">PAGADO</Badge>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="glass-card hover:shadow-md transition-all cursor-pointer" onClick={() => setIsOrderModalOpen(true)}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><Coffee className="w-6 h-6" /></div>
                            <div>
                                <h3 className="font-bold text-gray-900">Nuevo Pedido</h3>
                                <p className="text-xs text-gray-500">Tomar orden manual</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl text-green-600"><CheckCircle className="w-6 h-6" /></div>
                            <div>
                                <h3 className="font-bold text-gray-900">Cerrar Caja</h3>
                                <p className="text-xs text-gray-500">Resumen del turno</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl text-purple-600"><DollarSign className="w-6 h-6" /></div>
                            <div>
                                <h3 className="font-bold text-gray-900">Ventas</h3>
                                <p className="text-xs text-gray-500">Ver reporte rápido</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <CreateOrderDialog
                    isOpen={isOrderModalOpen}
                    onClose={() => setIsOrderModalOpen(false)}
                    tableId={selectedTableId}
                    tableNumber={selectedTableNumber}
                    onOrderCreated={handleOrderCreated}
                />

                <TableDetailsModal
                    isOpen={isTableDetailsOpen}
                    onClose={() => setIsTableDetailsOpen(false)}
                    table={selectedTable}
                    order={selectedOrder}
                    onCloseAccount={() => handleCloseAccount(selectedOrder.id, selectedTable.id)}
                />

                <CheckoutSummaryModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    table={selectedTable}
                    order={selectedOrder}
                    onConfirmCheckout={handleConfirmCheckout}
                />
            </div>
        </DashboardLayout>
    );
};

export default WaiterDashboard;
