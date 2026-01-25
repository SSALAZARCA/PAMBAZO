import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import ProductionMonitor from '../../components/ProductionMonitor';
import BakerKPIs from '../../components/BakerKPIs';
import BakerAlerts from '../../components/BakerAlerts';
import { User } from '../../../shared/types';
import {
    ChefHat,
    PlusCircle,
    ClipboardList,
    Archive,
    Settings,
    CalendarClock,
    TrendingUp,
    Clock,
    Flame
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

interface BakerDashboardHomeProps {
    user: User;
    onLogout: () => void;
}

export const BakerDashboardHome: React.FC<BakerDashboardHomeProps> = ({ user, onLogout }) => {
    const navigate = useNavigate();

    const QuickAction = ({ icon: Icon, label, onClick, colorClass, badge }: any) => (
        <button
            onClick={onClick}
            className={`group relative overflow-hidden bg-white p-4 rounded-xl border border-gray-200 hover:border-${colorClass.split('-')[1]}-300 shadow-sm hover:shadow-md transition-all duration-200 text-left w-full`}
        >
            <div className={`flex items-center gap-3`}>
                <div className={`p-2.5 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100')} ${colorClass} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{label}</h3>
                    {badge && (
                        <span className={`text-xs font-medium ${colorClass}`}>{badge}</span>
                    )}
                </div>
            </div>
        </button>
    );

    const StatCard = ({ icon: Icon, label, value, trend, colorClass }: any) => (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-green-600">{trend}</span>
                        </div>
                    )}
                </div>
                <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100')} ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-5 pb-6">
                {/* Compact Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-1.5 text-orange-600 font-semibold bg-orange-50 px-2.5 py-1 rounded-lg text-xs">
                                <ChefHat className="w-3.5 h-3.5" />
                                <span>PANEL MAESTRO</span>
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 font-medium">
                                {new Date().toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Hola, {user.name?.split(' ')[0] || 'Panadero'} 👋
                        </h1>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 rounded-xl border border-orange-200">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <div className="text-right">
                            <p className="text-xs font-medium text-gray-600">Turno Actual</p>
                            <p className="text-sm font-bold text-orange-600">Mañana</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard
                        icon={Flame}
                        label="En Producción"
                        value="3"
                        trend="+2 hoy"
                        colorClass="text-orange-600"
                    />
                    <StatCard
                        icon={Clock}
                        label="Tiempo Promedio"
                        value="45m"
                        colorClass="text-blue-600"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Completados"
                        value="12"
                        trend="+8%"
                        colorClass="text-green-600"
                    />
                    <StatCard
                        icon={Archive}
                        label="Stock Bajo"
                        value="2"
                        colorClass="text-amber-600"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                    {/* Left Column - Production Monitor (70%) */}
                    <div className="xl:col-span-8 space-y-5">
                        {/* Production Monitor */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <ProductionMonitor className="border-none shadow-none" />
                        </div>

                        {/* KPIs Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-orange-600" />
                                Métricas de Rendimiento
                            </h3>
                            <BakerKPIs timeRange="today" showHeader={false} className="border-none shadow-none bg-transparent p-0" />
                        </div>
                    </div>

                    {/* Right Column - Sidebar (30%) */}
                    <div className="xl:col-span-4 space-y-5">
                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <PlusCircle className="w-4 h-4 text-orange-600" />
                                Acciones Rápidas
                            </h3>
                            <div className="space-y-2">
                                <QuickAction
                                    icon={PlusCircle}
                                    label="Nuevo Lote de Producción"
                                    badge="Crear ahora"
                                    colorClass="text-orange-600"
                                    onClick={() => navigate('/baker/production')}
                                />
                                <QuickAction
                                    icon={ClipboardList}
                                    label="Ver Recetas"
                                    colorClass="text-blue-600"
                                    onClick={() => navigate('/baker/recipes')}
                                />
                                <QuickAction
                                    icon={Archive}
                                    label="Gestionar Inventario"
                                    badge="2 alertas"
                                    colorClass="text-emerald-600"
                                    onClick={() => navigate('/baker/inventory')}
                                />
                                <QuickAction
                                    icon={CalendarClock}
                                    label="Horarios y Turnos"
                                    colorClass="text-purple-600"
                                    onClick={() => navigate('/baker/schedule')}
                                />
                            </div>
                        </div>

                        {/* Alerts */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Alertas y Novedades</h3>
                            <BakerAlerts />
                        </div>

                        {/* System Status */}
                        <Card className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white border-none rounded-2xl overflow-hidden relative shadow-lg">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Settings className="w-24 h-24" />
                            </div>
                            <CardContent className="p-5 relative z-10">
                                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Estado del Sistema
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs items-center">
                                        <span className="text-gray-400">Conexión</span>
                                        <span className="flex items-center gap-1.5 text-green-400 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                            Activo
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs items-center">
                                        <span className="text-gray-400">Última Sync</span>
                                        <span className="text-gray-300 font-medium">Hace 30s</span>
                                    </div>
                                    <div className="flex justify-between text-xs items-center">
                                        <span className="text-gray-400">Versión</span>
                                        <span className="text-gray-300 font-medium">v2.1.0</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
