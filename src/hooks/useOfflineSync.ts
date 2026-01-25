import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';

interface OfflineAction {
  id: string;
  type: 'ADD_TO_CART' | 'REMOVE_FROM_CART' | 'UPDATE_CART' | 'PLACE_ORDER' | 'UPDATE_PROFILE' | 'ADD_REVIEW';
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: number;
  lastSyncTime: Date | null;
  syncErrors: string[];
}

const STORAGE_KEYS = {
  OFFLINE_ACTIONS: 'pambazo_offline_actions',
  LAST_SYNC: 'pambazo_last_sync',
  CACHED_DATA: 'pambazo_cached_data'
};

export const useOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingActions: 0,
    lastSyncTime: null,
    syncErrors: []
  });

  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);
  const addNotification = useStore(state => state.addNotification);

  // Load offline actions from localStorage
  const loadOfflineActions = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_ACTIONS);
      if (stored) {
        const actions = JSON.parse(stored).map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp)
        }));
        setOfflineActions(actions);
        setSyncStatus(prev => ({ ...prev, pendingActions: actions.length }));
      }

      const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (lastSync) {
        setSyncStatus(prev => ({ ...prev, lastSyncTime: new Date(lastSync) }));
      }
    } catch (_error) {
      console.error('Error loading offline actions:', _error);
    }
  }, []);

  // Save offline actions to localStorage
  const saveOfflineActions = useCallback((actions: OfflineAction[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_ACTIONS, JSON.stringify(actions));
    } catch (_error) {
      console.error('Error saving offline actions:', _error);
    }
  }, []);

  // Add action to offline queue
  const addOfflineAction = useCallback((type: OfflineAction['type'], data: any) => {
    const action: OfflineAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3
    };

    const newActions = [...offlineActions, action];
    setOfflineActions(newActions);
    saveOfflineActions(newActions);
    setSyncStatus(prev => ({ ...prev, pendingActions: newActions.length }));

    if (!syncStatus.isOnline) {
      addNotification({
        title: 'Modo offline',
        message: 'Acción guardada para sincronizar más tarde',
        type: 'info',
        priority: 'low'
      });
    }

    return action.id;
  }, [offlineActions, saveOfflineActions, syncStatus.isOnline, addNotification]);

  // Remove action from offline queue
  const removeOfflineAction = useCallback((actionId: string) => {
    const newActions = offlineActions.filter(action => action.id !== actionId);
    setOfflineActions(newActions);
    saveOfflineActions(newActions);
    setSyncStatus(prev => ({ ...prev, pendingActions: newActions.length }));
  }, [offlineActions, saveOfflineActions]);

  // Simulate API calls for different action types
  const executeAction = useCallback(async (action: OfflineAction): Promise<boolean> => {
    try {
      switch (action.type) {
        case 'ADD_TO_CART':
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('Syncing add to cart:', action.data);
          break;

        case 'REMOVE_FROM_CART':
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('Syncing remove from cart:', action.data);
          break;

        case 'UPDATE_CART':
          await new Promise(resolve => setTimeout(resolve, 800));
          console.log('Syncing cart update:', action.data);
          break;

        case 'PLACE_ORDER':
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('Syncing order placement:', action.data);
          break;

        case 'UPDATE_PROFILE':
          await new Promise(resolve => setTimeout(resolve, 1200));
          console.log('Syncing profile update:', action.data);
          break;

        case 'ADD_REVIEW':
          await new Promise(resolve => setTimeout(resolve, 1500));
          console.log('Syncing review:', action.data);
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      return true;
    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error);
      return false;
    }
  }, []);

  // Sync all pending actions
  const syncPendingActions = useCallback(async () => {
    if (!syncStatus.isOnline || syncStatus.isSyncing || offlineActions.length === 0) {
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncErrors: [] }));

    const errors: string[] = [];
    const actionsToRemove: string[] = [];
    const actionsToRetry: OfflineAction[] = [];

    for (const action of offlineActions) {
      try {
        const success = await executeAction(action);

        if (success) {
          actionsToRemove.push(action.id);
        } else {
          if (action.retryCount < action.maxRetries) {
            actionsToRetry.push({
              ...action,
              retryCount: action.retryCount + 1
            });
          } else {
            errors.push(`Falló la sincronización de ${action.type} después de ${action.maxRetries} intentos`);
            actionsToRemove.push(action.id);
          }
        }
      } catch (error) {
        errors.push(`Error en ${action.type}: ${error instanceof Error ? error.message : 'Error desconocido'}`);

        if (action.retryCount < action.maxRetries) {
          actionsToRetry.push({
            ...action,
            retryCount: action.retryCount + 1
          });
        } else {
          actionsToRemove.push(action.id);
        }
      }
    }

    // Remove successfully synced actions
    let newActions = offlineActions.filter(action => !actionsToRemove.includes(action.id));

    // Update retry actions
    newActions = newActions.map(action => {
      const retryAction = actionsToRetry.find(retry => retry.id === action.id);
      return retryAction || action;
    });

    setOfflineActions(newActions);
    saveOfflineActions(newActions);

    const syncTime = new Date();
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, syncTime.toISOString());

    setSyncStatus({
      isOnline: true,
      isSyncing: false,
      pendingActions: newActions.length,
      lastSyncTime: syncTime,
      syncErrors: errors
    });

    // Show sync results
    const syncedCount = actionsToRemove.length;
    if (syncedCount > 0) {
      addNotification({
        title: 'Datos sincronizados',
        message: `${syncedCount} cambios aplicados exitosamente`,
        type: 'success',
        priority: 'medium'
      });
    }

    if (errors.length > 0) {
      addNotification({
        title: 'Errores de sincronización',
        message: `${errors.length} acciones no se pudieron sincronizar`,
        type: 'warning',
        priority: 'high'
      });
    }
  }, [syncStatus.isOnline, syncStatus.isSyncing, offlineActions, executeAction, saveOfflineActions, addNotification]);

  // Handle online/offline status changes
  const handleOnlineStatusChange = useCallback(() => {
    const isOnline = navigator.onLine;
    setSyncStatus(prev => ({ ...prev, isOnline }));

    if (isOnline) {
      addNotification({
        title: 'Conexión restaurada',
        message: 'Volviste a estar en línea',
        type: 'success',
        priority: 'medium'
      });

      // Auto-sync when coming back online
      setTimeout(() => {
        syncPendingActions();
      }, 1000);
    } else {
      addNotification({
        title: 'Modo offline',
        message: 'Sin conexión a internet. Los cambios se guardarán localmente.',
        type: 'warning',
        priority: 'medium'
      });
    }
  }, [addNotification, syncPendingActions]);

  // Cache management
  const cacheData = useCallback((key: string, data: any) => {
    try {
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.CACHED_DATA) || '{}');
      cached[key] = {
        data,
        timestamp: new Date().toISOString(),
        ttl: 24 * 60 * 60 * 1000 // 24 hours
      };
      localStorage.setItem(STORAGE_KEYS.CACHED_DATA, JSON.stringify(cached));
    } catch (_error) {
      console.error('Error caching data:', _error);
    }
  }, []);

  const getCachedData = useCallback((key: string) => {
    try {
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.CACHED_DATA) || '{}');
      const item = cached[key];

      if (!item) return null;

      const now = new Date().getTime();
      const itemTime = new Date(item.timestamp).getTime();

      if (now - itemTime > item.ttl) {
        // Data expired
        delete cached[key];
        localStorage.setItem(STORAGE_KEYS.CACHED_DATA, JSON.stringify(cached));
        return null;
      }

      return item.data;
    } catch (_error) {
      console.error('Error getting cached data:', _error);
      return null;
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.CACHED_DATA);
  }, []);

  // Initialize
  useEffect(() => {
    loadOfflineActions();

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [loadOfflineActions, handleOnlineStatusChange]);

  // Auto-sync periodically when online
  useEffect(() => {
    if (!syncStatus.isOnline || offlineActions.length === 0) return;

    const interval = setInterval(() => {
      if (syncStatus.isOnline && !syncStatus.isSyncing && offlineActions.length > 0) {
        syncPendingActions();
      }
    }, 30000); // Try to sync every 30 seconds

    return () => clearInterval(interval);
  }, [syncStatus.isOnline, syncStatus.isSyncing, offlineActions.length, syncPendingActions]);

  return {
    syncStatus,
    offlineActions,
    addOfflineAction,
    removeOfflineAction,
    syncPendingActions,
    cacheData,
    getCachedData,
    clearCache
  };
};

// Hook for offline-aware data fetching
export const useOfflineData = <T>(key: string, fetcher: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { syncStatus, cacheData, getCachedData } = useOfflineSync();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (syncStatus.isOnline) {
        // Try to fetch fresh data
        const freshData = await fetcher();
        setData(freshData);
        cacheData(key, freshData);
      } else {
        // Use cached data when offline
        const cachedData = getCachedData(key);
        if (cachedData) {
          setData(cachedData);
        } else {
          throw new Error('No hay datos en caché disponibles');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);

      // Try to use cached data as fallback
      const cachedData = getCachedData(key);
      if (cachedData) {
        setData(cachedData);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, syncStatus.isOnline, cacheData, getCachedData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isFromCache: !syncStatus.isOnline
  };
};