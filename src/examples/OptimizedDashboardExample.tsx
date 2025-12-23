// 🥖 PAMBAZO - Ejemplo de Dashboard Optimizado
// Demuestra cómo usar el sistema de optimización sin modificar componentes existentes

import React, { useState } from 'react';
import { OptimizedSyncProvider, useSyncContext, SyncIndicator, SyncDebugInfo } from '../components/OptimizedSyncProvider';
import { useSyncConfig } from '../config/syncConfig';
import type { User } from '../../shared/types';

// Ejemplo de cómo envolver un dashboard existente
interface OptimizedDashboardWrapperProps {
  user: User;
  children: React.ReactNode;
  enableDebug?: boolean;
}

export const OptimizedDashboardWrapper: React.FC<OptimizedDashboardWrapperProps> = ({
  user,
  children,
  enableDebug = false
}) => {
  return (
    <OptimizedSyncProvider
      user={user}
      enablePerformanceMonitoring={true}
    >
      <div className="relative">
        {/* Indicador de sincronización */}
        <div className="fixed top-4 right-4 z-50">
          <SyncIndicator className="bg-white shadow-lg rounded-lg p-2" />
        </div>

        {/* Contenido del dashboard */}
        {children}

        {/* Debug info si está habilitado */}
        <SyncDebugInfo show={enableDebug} />
      </div>
    </OptimizedSyncProvider>
  );
};

// Ejemplo de componente que usa el store optimizado
export const OptimizedOrdersList: React.FC = () => {
  const { optimizedStore, userRole } = useSyncContext();
  const [filter, setFilter] = useState<'all' | 'pending' | 'ready'>('all');

  // Usar datos optimizados según el rol
  const orders = optimizedStore.orders;

  // Filtrar órdenes según selección
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  // Mostrar solo las órdenes relevantes para el rol
  const relevantOrders = filteredOrders.slice(0, getRoleBasedLimit(userRole));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Órdenes ({userRole})</h3>

        {/* Filtros */}
        <div className="flex space-x-2">
          {['all', 'pending', 'ready'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 py-1 rounded text-sm ${filter === status
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700'
                }`}
            >
              {status === 'all' ? 'Todas' : status === 'pending' ? 'Pendientes' : 'Listas'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="space-y-2">
        {relevantOrders.map(order => (
          <div key={order.id} className="border rounded p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Mesa {order.tableNumber}</span>
              <span className={`px-2 py-1 rounded text-xs ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'ready' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {order.items.length} items - ${order.total}
            </p>
          </div>
        ))}
      </div>

      {relevantOrders.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No hay órdenes {filter !== 'all' ? filter : ''}
        </p>
      )}
    </div>
  );
};

// Ejemplo de componente de notificaciones optimizado
export const OptimizedNotifications: React.FC = () => {
  const { optimizedStore } = useSyncContext();
  const notifications = optimizedStore.notifications;
  const unreadCount = optimizedStore.getUnreadCount();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Notificaciones
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>

        <button
          onClick={() => optimizedStore.clearNotifications()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Limpiar todas
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {notifications.slice(0, 10).map(notification => (
          <div
            key={notification.id}
            className={`p-3 rounded border-l-4 ${notification.read
              ? 'bg-gray-50 border-gray-300'
              : 'bg-blue-50 border-blue-500'
              }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
              </div>

              {!notification.read && (
                <button
                  onClick={() => optimizedStore.markNotificationAsRead(notification.id)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Marcar leída
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No hay notificaciones
        </p>
      )}
    </div>
  );
};

// Ejemplo de métricas de rendimiento
export const PerformanceMetrics: React.FC = () => {
  const { performance, syncStatus, lastSync } = useSyncContext();
  const { config } = useSyncConfig();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Métricas de Rendimiento</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600">Renders</div>
          <div className="text-xl font-bold">{performance.renderCount}</div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600">Tiempo Promedio</div>
          <div className="text-xl font-bold">
            {performance.avgRenderTime.toFixed(1)}ms
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600">Estado Sync</div>
          <div className={`text-sm font-medium ${syncStatus === 'idle' ? 'text-green-600' :
            syncStatus === 'syncing' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
            {syncStatus === 'idle' ? 'Sincronizado' :
              syncStatus === 'syncing' ? 'Sincronizando' :
                'Error'}
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600">Última Sync</div>
          <div className="text-sm">
            {lastSync ? lastSync.toLocaleTimeString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Indicador de salud */}
      <div className="mt-4 p-3 rounded border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Salud del Sistema</span>
          <div className={`w-3 h-3 rounded-full ${performance.avgRenderTime < 16.67 ? 'bg-green-500' :
            performance.avgRenderTime < 33.33 ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
        </div>

        <div className="text-xs text-gray-600 mt-1">
          {performance.avgRenderTime < 16.67 ? 'Óptimo (60+ FPS)' :
            performance.avgRenderTime < 33.33 ? 'Bueno (30+ FPS)' :
              'Necesita optimización'}
        </div>
      </div>

      {/* Configuración actual */}
      {config.debug && (
        <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
          <div className="text-sm font-medium text-yellow-800">Modo Debug Activo</div>
          <div className="text-xs text-yellow-600 mt-1">
            Cache: {config.cache.enabled ? 'Habilitado' : 'Deshabilitado'} |
            Batching: {config.performance.enableBatching ? 'Sí' : 'No'}
          </div>
        </div>
      )}
    </div>
  );
};

// Utilidad para obtener límites basados en rol
function getRoleBasedLimit(role: string): number {
  const limits = {
    owner: 50,
    admin: 30,
    baker: 20,
    waiter: 15,
    employee: 15,
    customer: 5,
    kitchen: 20,
    cocina: 20,
    propietario: 50
  };

  return limits[role as keyof typeof limits] || 10;
}

// Ejemplo de dashboard completo optimizado
export const ExampleOptimizedDashboard: React.FC<{ user: User }> = ({ user }) => {
  return (
    <OptimizedDashboardWrapper user={user} enableDebug={true}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Dashboard Optimizado - {user.role}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Órdenes */}
            <div className="lg:col-span-2">
              <OptimizedOrdersList />
            </div>

            {/* Notificaciones */}
            <div>
              <OptimizedNotifications />
            </div>

            {/* Métricas de rendimiento */}
            <div className="lg:col-span-3">
              <PerformanceMetrics />
            </div>
          </div>
        </div>
      </div>
    </OptimizedDashboardWrapper>
  );
};

export default ExampleOptimizedDashboard;