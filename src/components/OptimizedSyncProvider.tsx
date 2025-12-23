// 🥖 PAMBAZO - Proveedor de Sincronización Optimizada
// Wrapper que proporciona optimización sin modificar componentes existentes

import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { useOptimizedStore } from '../hooks/useOptimizedStore';
import { DataSyncOptimizer } from '../../store/syncOptimizer';
import type { User } from '../../shared/types';

// Tipos para el contexto
type UserRole = 'owner' | 'admin' | 'baker' | 'waiter' | 'employee' | 'customer';

interface SyncContextValue {
  optimizedStore: ReturnType<typeof useOptimizedStore>;
  userRole: UserRole;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSync: Date | null;
  performance: {
    renderCount: number;
    lastRenderTime: number;
    avgRenderTime: number;
  };
}

interface OptimizedSyncProviderProps {
  children: ReactNode;
  user: User | null;
  fallbackRole?: UserRole;
  enablePerformanceMonitoring?: boolean;
}

// Contexto de sincronización optimizada
const SyncContext = createContext<SyncContextValue | null>(null);

// Hook para usar el contexto
export const useSyncContext = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext debe usarse dentro de OptimizedSyncProvider');
  }
  return context;
};

// Componente proveedor principal
export const OptimizedSyncProvider: React.FC<OptimizedSyncProviderProps> = ({
  children,
  user,
  fallbackRole = 'customer',
  enablePerformanceMonitoring = true
}) => {
  const [syncStatus, setSyncStatus] = React.useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSync, setLastSync] = React.useState<Date | null>(null);
  const [performance, setPerformance] = React.useState({
    renderCount: 0,
    lastRenderTime: 0,
    avgRenderTime: 0
  });

  // Determinar rol del usuario
  const userRole: UserRole = useMemo(() => {
    if (!user || !user.role) return fallbackRole;

    // Mapear roles del sistema a roles del optimizador
    const roleMap: Record<string, UserRole> = {
      'owner': 'owner',
      'admin': 'admin',
      'baker': 'baker',
      'waiter': 'waiter',
      'employee': 'employee',
      'customer': 'customer'
    };

    return roleMap[user.role] || fallbackRole;
  }, [user, fallbackRole]);

  // Store optimizado
  const optimizedStore = useOptimizedStore({
    userRole,
    userId: user?.id,
    enableCache: true,
    syncInterval: getSyncIntervalByRole(userRole)
  });

  // Monitoreo de rendimiento
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const startTime = window.performance.now();

    return () => {
      const endTime = window.performance.now();
      const renderTime = endTime - startTime;

      setPerformance(prev => {
        const newRenderCount = prev.renderCount + 1;
        const newAvgRenderTime = (prev.avgRenderTime * prev.renderCount + renderTime) / newRenderCount;

        return {
          renderCount: newRenderCount,
          lastRenderTime: renderTime,
          avgRenderTime: newAvgRenderTime
        };
      });
    };
  });

  // Sincronización automática
  useEffect(() => {
    const optimizer = DataSyncOptimizer.getInstance();

    const syncInterval = setInterval(async () => {
      try {
        setSyncStatus('syncing');

        // Verificar si necesita sincronización
        if (optimizer.shouldSync('general', userRole)) {
          // Invalidar caches para forzar actualización
          optimizer.invalidateCache('orders');
          optimizer.invalidateCache('notifications');
          optimizer.invalidateCache('inventory');

          setLastSync(new Date());
        }

        setSyncStatus('idle');
      } catch (error) {
        console.error('Error en sincronización automática:', error);
        setSyncStatus('error');
      }
    }, getSyncIntervalByRole(userRole));

    return () => clearInterval(syncInterval);
  }, [userRole]);

  // Valor del contexto
  const contextValue: SyncContextValue = useMemo(() => ({
    optimizedStore,
    userRole,
    syncStatus,
    lastSync,
    performance
  }), [optimizedStore, userRole, syncStatus, lastSync, performance]);

  return (
    <SyncContext.Provider value={contextValue}>
      {children}
    </SyncContext.Provider>
  );
};

// Utilidades auxiliares
function getSyncIntervalByRole(role: UserRole): number {
  const intervals = {
    owner: 1000,     // 1 segundo
    admin: 2000,     // 2 segundos
    baker: 3000,     // 3 segundos
    waiter: 5000,    // 5 segundos
    employee: 5000,  // 5 segundos
    customer: 10000  // 10 segundos
  };

  return intervals[role] || 5000;
}

// HOC para envolver componentes automáticamente
export const withOptimizedSync = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => {
    const { optimizedStore } = useSyncContext();

    // Pasar el store optimizado como prop adicional
    return <Component {...props} optimizedStore={optimizedStore} />;
  };

  WrappedComponent.displayName = `withOptimizedSync(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Hook para acceso directo al store optimizado
export const useOptimizedStoreContext = () => {
  const { optimizedStore } = useSyncContext();
  return optimizedStore;
};

// Hook para métricas de rendimiento
export const usePerformanceMetrics = () => {
  const { performance, syncStatus, lastSync } = useSyncContext();

  return {
    ...performance,
    syncStatus,
    lastSync,
    isOptimal: performance.avgRenderTime < 16.67, // 60 FPS
    syncHealth: syncStatus === 'idle' ? 'healthy' : syncStatus
  };
};

// Componente de debug para desarrollo
export const SyncDebugInfo: React.FC<{ show?: boolean }> = ({ show = false }) => {
  const { userRole, syncStatus, lastSync, performance } = useSyncContext();

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>Rol: {userRole}</div>
      <div>Sync: {syncStatus}</div>
      <div>Último: {lastSync?.toLocaleTimeString() || 'N/A'}</div>
      <div>Renders: {performance.renderCount}</div>
      <div>Avg: {performance.avgRenderTime.toFixed(2)}ms</div>
      <div className={`status ${performance.avgRenderTime < 16.67 ? 'text-green-400' : 'text-red-400'}`}>
        {performance.avgRenderTime < 16.67 ? '✓ Óptimo' : '⚠ Lento'}
      </div>
    </div>
  );
};

// Componente de indicador de sincronización
export const SyncIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { syncStatus } = useSyncContext();

  const statusConfig = {
    idle: { color: 'bg-green-500', text: 'Sincronizado' },
    syncing: { color: 'bg-yellow-500', text: 'Sincronizando...' },
    error: { color: 'bg-red-500', text: 'Error de sync' }
  };

  const config = statusConfig[syncStatus];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${config.color} ${syncStatus === 'syncing' ? 'animate-pulse' : ''}`} />
      <span className="text-xs text-gray-600">{config.text}</span>
    </div>
  );
};

export default OptimizedSyncProvider;