import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useIsMobile } from './components/ui/use-mobile';
import { useAuthContext } from './contexts/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import './globals.css';

// Layouts
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './components/LoginPage';
import MobileLoginPage from './components/mobile/MobileLoginPage';

// Dashboards
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import { BakerDashboardHome } from './pages/baker/BakerDashboardHome';
import OwnerDashboardHome from './pages/owner/OwnerDashboardHome';
import KitchenDashboardHome from './pages/kitchen/KitchenDashboardHome';
import KitchenMenuView from './pages/kitchen/KitchenMenuView';
import WaiterDashboardHome from './pages/waiter/WaiterDashboardHome';
// import CustomerDashboardHome from './pages/customer/CustomerDashboardHome'; // Removed direct import
import { CustomerRoutes } from './routes/CustomerRoutes'; // Added route handler

// Sub-routes
import UsersPage from './pages/admin/users/UsersPage';
import { ProductsPage } from './pages/admin/products/ProductsPage';
import ReportsPage from './pages/admin/reports/ReportsPage';
import InventoryPage from './pages/admin/inventory/InventoryPage';
import OrdersPage from './pages/admin/orders/OrdersPage';
import TablesPage from './pages/admin/tables/TablesPage';
import FinancePage from './pages/admin/finance/FinancePage';
import AdminShiftManagementPage from './pages/admin/shifts/AdminShiftManagementPage';
import ProductionPage from './pages/baker/production/ProductionPage';
import BakerInventoryPage from './pages/baker/inventory/BakerInventoryPage';
import BakerRecipesPage from './pages/baker/recipes/BakerRecipesPage';
import BakerSchedulePage from './pages/baker/schedule/BakerSchedulePage';
import { LoyaltySettingsPage } from './pages/admin/loyalty/LoyaltySettingsPage';

// Components
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Services
import { getAuthToken } from './services/api';
import { wsClient } from './utils/websocket';
import { pushNotifications } from './utils/pushNotifications';

function App() {
  const isMobile = useIsMobile();
  const { user, logout } = useAuthContext();

  // Initialize WebSocket and Push Notifications when user logs in
  React.useEffect(() => {
    if (user) {
      initializeRealtimeFeatures();
    } else {
      wsClient.disconnect();
    }
  }, [user]);

  const initializeRealtimeFeatures = async () => {
    const token = getAuthToken();
    if (token) {
      wsClient.connect(token);
    }

    try {
      const initialized = await pushNotifications.initialize();
      if (initialized) {
        const permission = await pushNotifications.requestPermission();
        if (permission) {
          await pushNotifications.subscribe();
        }
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Helper to get dashboard component based on role
  const getDashboardComponent = (role: string) => {
    switch (role) {
      case 'admin': return <AdminDashboardHome user={user!} onLogout={handleLogout} />;
      case 'owner': return <OwnerDashboardHome user={user!} onLogout={handleLogout} />;
      case 'kitchen': return <KitchenDashboardHome user={user!} onLogout={handleLogout} />;
      case 'waiter': return <WaiterDashboardHome user={user!} onLogout={handleLogout} />;
      case 'customer': return <CustomerRoutes user={user!} onLogout={handleLogout} />;
      case 'baker': return <BakerDashboardHome user={user!} onLogout={handleLogout} />;
      default: return <Navigate to="/" replace />;
    }
  };

  return (
    <NotificationProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={isMobile ? <MobileLoginPage /> : <LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={user ? getDashboardComponent(user.role) : <Navigate to="/login" replace />} />

          {/* Role-specific nested routes */}
          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={user ? getDashboardComponent('admin') : <Navigate to="/login" replace />} />
            <Route path="users" element={<UsersPage user={user!} onLogout={handleLogout} />} />
            <Route path="products" element={<ProductsPage user={user!} onLogout={handleLogout} />} />
            <Route path="reports" element={<ReportsPage user={user!} onLogout={handleLogout} />} />
            <Route path="inventory" element={<InventoryPage user={user!} onLogout={handleLogout} />} />
            <Route path="orders" element={<OrdersPage user={user!} onLogout={handleLogout} />} />
            <Route path="tables" element={<TablesPage user={user!} onLogout={handleLogout} />} />
            <Route path="finance" element={<FinancePage user={user!} onLogout={handleLogout} />} />
            <Route path="shifts" element={<AdminShiftManagementPage user={user!} onLogout={handleLogout} />} />
            <Route path="loyalty" element={<LoyaltySettingsPage user={user!} onLogout={handleLogout} />} />
          </Route>

          <Route path="/baker/*" element={<ProtectedRoute allowedRoles={['baker']} />}>
            <Route index element={user ? getDashboardComponent('baker') : <Navigate to="/login" replace />} />
            <Route path="production" element={<ProductionPage user={user!} onLogout={handleLogout} />} />
            <Route path="inventory" element={<BakerInventoryPage user={user!} onLogout={handleLogout} />} />
            <Route path="recipes" element={<BakerRecipesPage user={user!} onLogout={handleLogout} />} />
            <Route path="schedule" element={<BakerSchedulePage user={user!} onLogout={handleLogout} />} />
          </Route>

          <Route path="/kitchen/*" element={<ProtectedRoute allowedRoles={['kitchen']} />}>
            <Route index element={user ? getDashboardComponent('kitchen') : <Navigate to="/login" replace />} />
            <Route path="menu" element={<KitchenMenuView user={user!} onLogout={handleLogout} />} />
          </Route>

          <Route path="/waiter/*" element={<ProtectedRoute allowedRoles={['waiter']} />}>
            <Route index element={user ? getDashboardComponent('waiter') : <Navigate to="/login" replace />} />
            <Route path="tables" element={user ? getDashboardComponent('waiter') : <Navigate to="/login" replace />} />
          </Route>

          <Route path="/customer/*" element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route index element={user ? getDashboardComponent('customer') : <Navigate to="/login" replace />} />
            <Route path="*" element={user ? getDashboardComponent('customer') : <Navigate to="/login" replace />} />
          </Route>

          <Route path="/owner/*" element={<ProtectedRoute allowedRoles={['owner']} />}>
            <Route index element={user ? getDashboardComponent('owner') : <Navigate to="/login" replace />} />
            <Route path="analytics" element={user ? getDashboardComponent('owner') : <Navigate to="/login" replace />} />
            <Route path="products" element={<ProductsPage user={user!} onLogout={handleLogout} />} />
            <Route path="inventory" element={<InventoryPage user={user!} onLogout={handleLogout} />} />
            <Route path="finance" element={<FinancePage user={user!} onLogout={handleLogout} />} />
            <Route path="staff" element={<UsersPage user={user!} onLogout={handleLogout} />} />
            <Route path="loyalty" element={<LoyaltySettingsPage user={user!} onLogout={handleLogout} />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <PWAInstallPrompt />
      <Toaster position="top-right" richColors />
    </NotificationProvider>
  );
}

export default App;