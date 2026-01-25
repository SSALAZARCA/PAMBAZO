import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Users,
    Calendar,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Activity,
    Clock
} from 'lucide-react';
import { User } from '../../shared/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import api from '../../services/api';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

interface OwnerDashboardProps {
    user: User;
    onLogout: () => void;
}

const COLORS = ['#F97316', '#FBBF24', '#38BDF8', '#818CF8', '#A78BFA'];

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user, onLogout }) => {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        customers: 0,
        avgTicket: 0,
        growth: 0,
        topProduct: 'Cargando...'
    });
    const [salesData, setSalesData] = useState<any[]>([]);
    const [productSalesData, setProductSalesData] = useState<any[]>([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const overviewRes = await api.analytics.getOverview();
                if (overviewRes.success && overviewRes.data) {
                    const data = overviewRes.data as any;
                    setStats(prev => ({
                        ...prev,
                        revenue: data.sales?.month || 0,
                        orders: data.orders?.total || 0,
                        customers: data.users?.total || 0,
                        avgTicket: (data.sales?.month && data.orders?.total) ? (data.sales.month / data.orders.total) : 0,
                        growth: data.growth?.sales || 0
                    }));
                }

                const [salesRes, productsRes] = await Promise.all([
                    api.analytics.getSales(),
                    api.analytics.getProducts()
                ]);

                if (productsRes.success && productsRes.data) {
                    const data = productsRes.data as any;
                    if (Array.isArray(data)) {
                        const top5 = data.slice(0, 5).map((p: any) => ({
                            name: p.name,
                            value: p.salesThisMonth || 0,
                        }));
                        setProductSalesData(top5);
                        setStats(prev => ({ ...prev, topProduct: top5[0]?.name || 'Sin datos' }));
                    }
                }

                if (salesRes.success && salesRes.data) {
                    const data = salesRes.data as any;
                    if (data.history && Array.isArray(data.history)) {
                        setSalesData(data.history.map((h: any) => ({
                            name: new Date(h.date).toLocaleDateString('es-ES', { weekday: 'short' }),
                            ventas: h.amount
                        })));
                    } else if (data.today) {
                        setSalesData([
                            { name: 'Hoy', ventas: data.today },
                            { name: 'Semana', ventas: data.week / 7 },
                        ]);
                    }
                }
            } catch (err) {
                console.error("Error fetching analytics", err);
            }
        };
        fetchAnalytics();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };



    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight">
                            Panel General
                        </h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Actualizado en tiempo real
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700">
                            <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                            Este Mes
                        </Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar Informe
                        </Button>
                    </div>
                </header>

                {/* Key Metrics Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <StatCard
                        title="Ingresos Totales"
                        value={`$${(stats.revenue).toLocaleString()}`}
                        subtext="vs. mes anterior"
                        trend={12.5}
                        icon={DollarSign}
                        color="bg-green-50 text-green-600"
                    />
                    <StatCard
                        title="Pedidos Totales"
                        value={stats.orders.toString()}
                        subtext="completados"
                        trend={8.2}
                        icon={ShoppingBag}
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        title="Clientes Activos"
                        value={stats.customers.toString()}
                        subtext="registrados"
                        trend={-2.4}
                        icon={Users}
                        color="bg-purple-50 text-purple-600"
                    />
                    <StatCard
                        title="Ticket Promedio"
                        value={`$${Math.round(stats.avgTicket).toLocaleString()}`}
                        subtext="por orden"
                        trend={5.7}
                        icon={TrendingUp}
                        color="bg-orange-50 text-orange-600"
                    />
                </motion.div>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2"
                    >
                        <Card className="h-full border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl text-gray-800">Tendencia de Ingresos</CardTitle>
                                        <CardDescription>Comportamiento de ventas en los últimos 7 días</CardDescription>
                                    </div>
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <Activity className="w-5 h-5 text-orange-600" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                                tickFormatter={(value) => `$${value / 1000}k`}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ventas']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="ventas"
                                                stroke="#ea580c"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorVentas)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Top Products */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="h-full border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl text-gray-800">Productos Top</CardTitle>
                                        <CardDescription>Más vendidos del mes</CardDescription>
                                    </div>
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={productSalesData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {productSalesData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Centered Total or Label */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                        <span className="text-3xl font-bold text-gray-900">{productSalesData.reduce((acc, curr) => acc + curr.value, 0)}</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Ventas</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Quick Actions Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Placeholder for Quick Actions or Recent Activity */}
                    <Card className="col-span-1 md:col-span-3 border-none shadow-lg bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">¿Listo para escalar tu negocio?</h3>
                                <p className="text-gray-300">Revisa el inventario y asegúrate de tener suficiente stock para la semana.</p>
                            </div>
                            <div className="flex gap-4">
                                <Button className="bg-white text-gray-900 hover:bg-gray-100">Ver Inventario</Button>
                                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">Configurar Alertas</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

// Internal Component for Stats
const StatCard = ({ title, value, subtext, trend, icon: Icon, color }: any) => (
    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
        <Card className="border-none shadow-lg shadow-gray-100 hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'} bg-gray-50 px-2 py-1 rounded-full`}>
                            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
                    <p className="text-xs text-gray-400 mt-1">{subtext}</p>
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

export default OwnerDashboard;
