import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import {
    Users,
    Package,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    AlertTriangle,
    Boxes,
    FileText
} from 'lucide-react';
import { User } from '../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import api from '../../services/api';

interface AdminDashboardProps {
    user: User;
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    // const [loading, setLoading] = useState(true); // Removed unused loading
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        revenue: 0,
        lowStockItems: 0,
        pendingOrders: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch overview stats and inventory alerts in parallel
                const [overviewRes, inventoryRes] = await Promise.all([
                    api.analytics.getOverview(),
                    api.inventory.getLowStockAlerts()
                ]);

                if (overviewRes.success && overviewRes.data) {
                    const data = overviewRes.data as any; // Type casting
                    setStats(prev => ({
                        ...prev,
                        totalUsers: data.users?.total || 0,
                        totalProducts: data.products?.total || 0,
                        totalOrders: data.orders?.total || 0,
                        revenue: data.sales?.month || 0,
                        pendingOrders: data.orders?.pending || 0
                    }));
                }

                if (inventoryRes.success && inventoryRes.data) {
                    const invData = inventoryRes.data as any;
                    setStats(prev => ({
                        ...prev,
                        lowStockItems: invData.count || (Array.isArray(invData) ? invData.length : 0)
                    }));
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
                        Panel de Administración
                    </h1>
                    <p className="text-gray-500">
                        Gestión completa del sistema PAMBAZO
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Usuarios Totales"
                        value={stats.totalUsers}
                        icon={Users}
                        color="blue"
                    // trend={{ value: 12, isPositive: true }} // TODO: Add trend calculation
                    />
                    <StatCard
                        title="Productos"
                        value={stats.totalProducts}
                        icon={Package}
                        color="green"
                        subtitle="En catálogo"
                    />
                    <StatCard
                        title="Pedidos del Mes"
                        value={stats.totalOrders}
                        icon={ShoppingCart}
                        color="purple"
                    // trend={{ value: 8, isPositive: true }}
                    />
                    <StatCard
                        title="Ingresos (Mes)"
                        value={`$${(stats.revenue / 1000).toFixed(0)}K`}
                        icon={DollarSign}
                        color="orange"
                        trend={{ value: 15, isPositive: true }}
                    />
                </div>

                {/* Alerts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="glass-card border-orange-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                Alertas de Inventario
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.lowStockItems > 0 ? (
                                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                                        <p className="text-sm font-medium text-orange-900">
                                            {stats.lowStockItems} productos con stock bajo
                                        </p>
                                        <p className="text-xs text-orange-700 mt-1">
                                            Requieren reabastecimiento urgente
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                                        <p className="text-sm font-medium text-green-900">
                                            Inventario saludable
                                        </p>
                                    </div>
                                )}
                                <Button variant="outline" className="w-full" onClick={() => navigate('/admin/inventory')}>
                                    <Boxes className="w-4 h-4 mr-2" />
                                    Ver Inventario
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-blue-600" />
                                Pedidos Pendientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                    <p className="text-sm font-medium text-blue-900">
                                        {stats.pendingOrders} pedidos esperando procesamiento
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Tiempo promedio de espera: 15 min
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full" onClick={() => navigate('/admin/orders')}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Ver Pedidos
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Section */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Gestión del Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Resumen</TabsTrigger>
                                <TabsTrigger value="users">Usuarios</TabsTrigger>
                                <TabsTrigger value="products">Productos</TabsTrigger>
                                <TabsTrigger value="reports">Reportes</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4 mt-4">
                                <div className="p-6 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200">
                                    <h3 className="text-lg font-semibold text-orange-900 mb-2">
                                        Bienvenido, {user.name}
                                    </h3>
                                    <p className="text-orange-700">
                                        Sistema operando normalmente. Todos los servicios están funcionando correctamente.
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="users" className="space-y-4 mt-4">
                                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
                                    <Users className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                                    <h3 className="text-lg font-medium text-gray-900">Gestión de Usuarios</h3>
                                    <p className="text-gray-500 mb-4">Administra cuentas, roles y permisos de acceso.</p>
                                    <Button onClick={() => navigate('/admin/users')}>
                                        Ir al Panel de Usuarios
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="products" className="space-y-4 mt-4">
                                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-green-500" />
                                    <h3 className="text-lg font-medium text-gray-900">Catálogo de Productos</h3>
                                    <p className="text-gray-500 mb-4">Administra productos, precios y categorías.</p>
                                    <Button onClick={() => navigate('/admin/products')} className="bg-green-600 hover:bg-green-700">
                                        Gestionar Productos
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="reports" className="space-y-4 mt-4">
                                <div className="p-6 text-center text-gray-500">
                                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p>Reportes y análisis - Próximamente</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
