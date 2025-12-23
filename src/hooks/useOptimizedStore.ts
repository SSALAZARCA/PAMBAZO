// 🥖 PAMBAZO - Hook Optimizado para Store
// Capa de optimización que envuelve el store existente sin modificarlo

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { DataSyncOptimizer, ROLE_PERMISSIONS, memoizeByRole } from '../../store/syncOptimizer';
import type { Notification, Order, InventoryEntry, Table, UserRole } from '../../shared/types';

// Tipos para el hook optimizado
// Removed local UserRole definition

interface OptimizedStoreOptions {
  userRole: UserRole;
  userId?: string | undefined;
  enableCache?: boolean;
  syncInterval?: number;
}

// Hook principal optimizado
export const useOptimizedStore = (options: OptimizedStoreOptions) => {
  const { userRole, userId: _userId, enableCache = true, syncInterval } = options;
  const optimizer = DataSyncOptimizer.getInstance();
  const lastUpdateRef = useRef<number>(0);

  // Store original sin modificaciones
  const originalStore = useStore();

  // Memoización de funciones costosas por rol
  const memoizedGetters = useMemo(() => {
    const getFilteredOrders = memoizeByRole(
      (orders: Order[]) => optimizer.filterDataByRole(orders, userRole, 'orders'),
      userRole
    );

    const getFilteredInventory = memoizeByRole(
      (inventory: InventoryEntry[]) => optimizer.filterDataByRole(inventory, userRole, 'inventory'),
      userRole
    );

    const getFilteredTables = memoizeByRole(
      (tables: Table[]) => optimizer.filterDataByRole(tables, userRole, 'tables'),
      userRole
    );

    const getFilteredNotifications = memoizeByRole(
      (notifications: Notification[]) => optimizer.filterNotificationsByRole(notifications, userRole),
      userRole
    );

    return {
      getFilteredOrders,
      getFilteredInventory,
      getFilteredTables,
      getFilteredNotifications
    };
  }, [userRole, optimizer]);

  // Datos optimizados según rol
  const optimizedData = useMemo(() => {
    const now = Date.now();

    // Control de frecuencia de actualización
    if (enableCache && now - lastUpdateRef.current < (syncInterval || 2000)) {
      return null; // Usar datos cacheados
    }

    lastUpdateRef.current = now;

    return {
      // Órdenes filtradas
      orders: memoizedGetters.getFilteredOrders(originalStore.orders),

      // Inventario filtrado
      inventoryEntries: memoizedGetters.getFilteredInventory(originalStore.inventoryEntries),

      // Mesas filtradas
      tables: memoizedGetters.getFilteredTables(originalStore.tables),

      // Notificaciones filtradas
      notifications: memoizedGetters.getFilteredNotifications(originalStore.notifications),

      // Datos financieros (solo para roles autorizados)
      financialTransactions: optimizer.hasDataPermission(userRole, 'financial')
        ? originalStore.financialTransactions
        : [],

      // Datos de producción (solo para panaderos y administradores)
      productionBatches: optimizer.hasDataPermission(userRole, 'production')
        ? originalStore.productionBatches
        : [],

      ovenStatuses: optimizer.hasDataPermission(userRole, 'production')
        ? originalStore.ovenStatuses
        : [],

      preparationWorkflows: optimizer.hasDataPermission(userRole, 'production')
        ? originalStore.preparationWorkflows
        : [],

      // Productos terminados y stocks
      finishedProducts: originalStore.finishedProducts,
      productStocks: originalStore.productStocks,
      productSaleRecords: originalStore.productSaleRecords
    };
  }, [
    originalStore.orders,
    originalStore.inventoryEntries,
    originalStore.tables,
    originalStore.notifications,
    originalStore.financialTransactions,
    originalStore.productionBatches,
    originalStore.ovenStatuses,
    originalStore.preparationWorkflows,
    originalStore.finishedProducts,
    originalStore.productStocks,
    originalStore.productSaleRecords,
    userRole,
    memoizedGetters,
    enableCache,
    syncInterval
  ]);

  // Funciones optimizadas para notificaciones
  const optimizedNotificationActions = useMemo(() => {
    return {
      addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
        // Verificar si el usuario debe recibir esta notificación
        if (optimizer.hasNotificationPermission(userRole, notification.type as any)) {
          originalStore.addNotification(notification);

          // Invalidar cache de notificaciones
          optimizer.invalidateCache('notifications');
        }
      },

      markNotificationAsRead: originalStore.markNotificationAsRead,
      clearNotifications: originalStore.clearNotifications,

      getUnreadCount: useCallback(() => {
        const filteredNotifications = memoizedGetters.getFilteredNotifications(originalStore.notifications);
        return filteredNotifications.filter(n => !n.read).length;
      }, [originalStore.notifications, memoizedGetters])
    };
  }, [userRole, optimizer, originalStore, memoizedGetters]);

  // Funciones de datos optimizadas
  const optimizedDataActions = useMemo(() => {
    return {
      // Órdenes
      addOrder: originalStore.addOrder,
      updateOrderStatus: (orderId: string, status: Order['status']) => {
        originalStore.updateOrderStatus(orderId, status);
        optimizer.invalidateCache('orders');

        // Notificación optimizada según rol
        if (optimizer.hasNotificationPermission(userRole, 'order')) {
          optimizedNotificationActions.addNotification({
            type: 'order',
            title: 'Estado de Pedido Actualizado',
            message: `Pedido ${orderId} cambió a ${status}`,
            priority: 'medium'
          });
        }
      },

      // Inventario
      addInventoryEntry: (entry: Omit<InventoryEntry, 'id' | 'entryDate'>) => {
        if (optimizer.hasDataPermission(userRole, 'inventory')) {
          originalStore.addInventoryEntry(entry);
          optimizer.invalidateCache('inventory');
        }
      },

      // Mesas
      updateTableStatus: (tableId: string, status: Table['status'], guestCount?: number, waiterId?: string) => {
        if (optimizer.hasDataPermission(userRole, 'tables')) {
          originalStore.updateTableStatus(tableId, status, guestCount, waiterId);
          optimizer.invalidateCache('tables');
        }
      },

      // Producción (solo para panaderos)
      addProductionBatch: userRole === 'baker' || userRole === 'admin' || userRole === 'owner'
        ? originalStore.addProductionBatch
        : () => console.warn('Sin permisos para crear lotes de producción'),

      startOven: userRole === 'baker' || userRole === 'admin' || userRole === 'owner'
        ? originalStore.startOven
        : () => console.warn('Sin permisos para controlar hornos'),

      stopOven: userRole === 'baker' || userRole === 'admin' || userRole === 'owner'
        ? originalStore.stopOven
        : () => console.warn('Sin permisos para controlar hornos')
    };
  }, [userRole, optimizer, originalStore, optimizedNotificationActions]);

  // Métricas y reportes optimizados
  const optimizedReports = useMemo(() => {
    const permissions = ROLE_PERMISSIONS[userRole];

    return {
      // Reportes básicos para todos los roles autorizados
      getOrdersByDateRange: permissions.reports.includes('orders') || permissions.reports.includes('all')
        ? originalStore.getOrdersByDateRange
        : () => [],

      // Reportes financieros solo para owner y admin
      getFinancialTransactions: permissions.reports.includes('financial') || permissions.reports.includes('all')
        ? originalStore.getFinancialTransactions
        : () => [],

      getExpensesByCategory: permissions.reports.includes('financial') || permissions.reports.includes('all')
        ? originalStore.getExpensesByCategory
        : () => [],

      // Reportes de producción para panaderos y administradores
      getBakerKPIs: permissions.reports.includes('production') || permissions.reports.includes('all')
        ? originalStore.getBakerKPIs
        : () => [],

      getKPIsByDateRange: permissions.reports.includes('production') || permissions.reports.includes('all')
        ? originalStore.getKPIsByDateRange
        : () => [],

      // Reportes de inventario
      getInventoryEntries: permissions.reports.includes('inventory') || permissions.reports.includes('all')
        ? originalStore.getInventoryEntries
        : () => []
    };
  }, [userRole, originalStore]);

  // Efecto para sincronización en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (optimizer.shouldSync('general', userRole)) {
        // Invalidar caches para forzar actualización
        optimizer.invalidateCache('orders');
        optimizer.invalidateCache('notifications');
        optimizer.invalidateCache('inventory');
      }
    }, syncInterval || 5000);

    return () => clearInterval(interval);
  }, [userRole, syncInterval, optimizer]);

  // Retornar store optimizado
  return {
    // Datos optimizados (usar optimizedData si está disponible, sino usar datos originales)
    ...(optimizedData || {
      orders: originalStore.orders,
      inventoryEntries: originalStore.inventoryEntries,
      tables: originalStore.tables,
      notifications: originalStore.notifications,
      financialTransactions: originalStore.financialTransactions,
      productionBatches: originalStore.productionBatches,
      ovenStatuses: originalStore.ovenStatuses,
      preparationWorkflows: originalStore.preparationWorkflows,
      finishedProducts: originalStore.finishedProducts,
      productStocks: originalStore.productStocks,
      productSaleRecords: originalStore.productSaleRecords
    }),

    // Acciones optimizadas
    ...optimizedNotificationActions,
    ...optimizedDataActions,

    // Reportes optimizados
    reports: optimizedReports,

    // Datos del usuario y estado de la app (sin filtrar)
    user: originalStore.user,
    isAuthenticated: originalStore.isAuthenticated,
    cart: originalStore.cart,
    theme: originalStore.theme,
    deviceInfo: originalStore.deviceInfo,

    // Acciones generales (sin modificar)
    setUser: originalStore.setUser,
    logout: originalStore.logout,
    addToCart: originalStore.addToCart,
    removeFromCart: originalStore.removeFromCart,
    updateCartQuantity: originalStore.updateCartQuantity,
    clearCart: originalStore.clearCart,
    setTheme: originalStore.setTheme,
    toggleTheme: originalStore.toggleTheme,

    // Funciones de inicialización
    initializeTables: originalStore.initializeTables,
    initializeInventory: originalStore.initializeInventory,
    initializeOvenStatuses: originalStore.initializeOvenStatuses,
    initializePreparationTemplates: originalStore.initializePreparationTemplates,

    // Utilidades del optimizador
    optimizer: {
      clearCache: () => optimizer.clearCache(),
      invalidateCache: (pattern: string) => optimizer.invalidateCache(pattern),
      hasPermission: (dataType: string) => optimizer.hasDataPermission(userRole, dataType as any)
    }
  };
};

// Hook simplificado para casos comunes
export const useRoleBasedStore = (userRole: UserRole, userId?: string) => {
  return useOptimizedStore({ userRole, userId });
};

export default useOptimizedStore;