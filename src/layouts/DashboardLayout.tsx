import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
    ChefHat,
    LayoutDashboard,
    Users,
    Package,
    Boxes,
    ShoppingCart,
    Table as TableIcon,
    DollarSign,
    BarChart3,
    LogOut,
    Menu,
    Gift,
    X
} from 'lucide-react';
import { User } from '../shared/types';
import { NotificationCenter } from '../components/ui/notifications'; // UI Only
import { useNotifications } from '../context/NotificationContext'; // Context Hook
import NotificationSettings from '../components/NotificationSettings';
import { Dialog, DialogContent } from '../components/ui/dialog';

interface DashboardLayoutProps {
    user: User;
    onLogout: () => void;
    children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, children }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const {
        notifications,
        markAsRead,
        markAllAsRead,
        dismissNotification
    } = useNotifications();

    // Define navigation items based on role
    const getNavigationItems = () => {
        const baseItems = [
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true }
        ];

        const roleSpecificItems: Record<string, any[]> = {
            admin: [
                { to: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
                { to: '/admin/tables', icon: TableIcon, label: 'Sala' },
                { to: '/admin/finance', icon: DollarSign, label: 'Finanzas' },
                { to: '/admin/products', icon: Package, label: 'Productos' },
                { to: '/admin/inventory', icon: Boxes, label: 'Inventario' },
                { to: '/admin/users', icon: Users, label: 'Usuarios' },
                { to: '/admin/reports', icon: BarChart3, label: 'Reportes' },
                { to: '/admin/loyalty', icon: Gift, label: 'Lealtad' }
            ],
            baker: [
                { to: '/baker/production', icon: ChefHat, label: 'Producción' },
                { to: '/baker/inventory', icon: Package, label: 'Inventario' }
            ],
            kitchen: [
                { to: '/kitchen/menu', icon: Package, label: 'Menú' }
            ],
            waiter: [
                { to: '/waiter/tables', icon: TableIcon, label: 'Mesas' }
            ],
            customer: [
                { to: '/customer/loyalty', icon: Gift, label: 'Puntos' }
            ],
            owner: [
                { to: '/owner/analytics', icon: BarChart3, label: 'Analytics' },
                { to: '/owner/products', icon: Package, label: 'Productos' },
                { to: '/owner/inventory', icon: Boxes, label: 'Inventario' },
                { to: '/owner/finance', icon: DollarSign, label: 'Finanzas' },
                { to: '/owner/staff', icon: Users, label: 'Personal' },
                { to: '/owner/loyalty', icon: Gift, label: 'Lealtad' }
            ]
        };

        return [...baseItems, ...(roleSpecificItems[user.role] || [])];
    };

    const navItems = getNavigationItems();

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 
        bg-white/80 backdrop-blur-xl border-r border-white/20
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="p-6 border-b border-gray-100 flex-none">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl shadow-lg shadow-orange-500/20">
                                <ChefHat className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold font-display text-gray-900">PAMBAZO</h1>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-100 flex-none">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                                    : 'text-gray-600 hover:bg-white/50 hover:text-orange-600'
                                }
              `}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium flex-1">{item.label}</span>
                            {item.to === '/dashboard' && user.role === 'waiter' && notifications.filter(n => n.type === 'order_ready').length > 0 && (
                                <span className="bg-white text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                    {notifications.filter(n => n.type === 'order_ready').length}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-100 flex-none">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
              text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 glass-card border-b border-white/20 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
                        >
                            <Menu className="w-6 h-6 text-gray-700" />
                        </button>

                        <div className="flex-1 lg:flex-none">
                            <h2 className="text-xl font-bold text-gray-900">
                                Bienvenido, {user.name?.split(' ')[0] || 'Usuario'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {new Date().toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-4">
                            <NotificationCenter
                                notifications={notifications}
                                onMarkAsRead={markAsRead}
                                onMarkAllAsRead={markAllAsRead}
                                onDismiss={dismissNotification}
                                onSettingsClick={() => setIsSettingsOpen(true)}
                            />

                            <div className="hidden md:flex items-center gap-2">
                                <div className="px-4 py-2 rounded-full bg-white/50 border border-gray-200">
                                    <span className="text-sm font-medium text-gray-700">
                                        🔥 Sistema Activo
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children || <Outlet />}
                </main>
            </div>


            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <NotificationSettings user={user} />
                </DialogContent>
            </Dialog>
        </div >
    );
};
