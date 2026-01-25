import type { Notification as AppNotification, UserRole } from '../shared/types';

// Tipos para el optimizador
type DataType = 'orders' | 'inventory' | 'financial' | 'tables' | 'users' | 'production' | 'all';
type NotificationType = 'system' | 'inventory' | 'order' | 'table' | 'production' | 'all';
// Removed local UserRole definition

// Definición de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, { data: string[], notifications: string[], reports: string[] }> = {
  owner: {
    data: ['all'],
    notifications: ['all'],
    reports: ['all']
  },
  admin: {
    data: ['orders', 'inventory', 'financial', 'tables', 'users'],
    notifications: ['system', 'inventory', 'order', 'table'],
    reports: ['sales', 'inventory', 'financial']
  },
  baker: {
    data: ['orders', 'inventory', 'production'],
    notifications: ['order', 'inventory', 'production'],
    reports: ['production', 'inventory']
  },
  waiter: {
    data: ['orders', 'tables'],
    notifications: ['order', 'table'],
    reports: ['orders']
  },
  employee: {
    data: ['orders', 'tables'],
    notifications: ['order', 'table'],
    reports: ['basic']
  },
  customer: {
    data: ['orders'],
    notifications: ['order'],
    reports: ['personal']
  },
  kitchen: {
    data: ['orders', 'inventory', 'production'],
    notifications: ['order', 'inventory', 'production'],
    reports: ['production', 'inventory']
  },
  cocina: {
    data: ['orders', 'inventory', 'production'],
    notifications: ['order', 'inventory', 'production'],
    reports: ['production', 'inventory']
  },
  propietario: {
    data: ['all'],
    notifications: ['all'],
    reports: ['all']
  }
};


// Cache para optimización de rendimiento
class SyncCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Instancia global del cache
const syncCache = new SyncCache();

// Optimizador de sincronización
export class DataSyncOptimizer {
  private static instance: DataSyncOptimizer;
  private subscribers = new Map<string, Set<(data: any) => void>>();
  private lastSync = new Map<string, number>();

  static getInstance(): DataSyncOptimizer {
    if (!DataSyncOptimizer.instance) {
      DataSyncOptimizer.instance = new DataSyncOptimizer();
    }
    return DataSyncOptimizer.instance;
  }

  // Verificar permisos de datos
  hasDataPermission(userRole: UserRole, dataType: DataType): boolean {
    const permissions = ROLE_PERMISSIONS[userRole];
    return permissions.data.includes('all') || permissions.data.includes(dataType);
  }

  // Verificar permisos de notificaciones
  hasNotificationPermission(userRole: UserRole, notificationType: NotificationType): boolean {
    const permissions = ROLE_PERMISSIONS[userRole];
    return permissions.notifications.includes('all') || permissions.notifications.includes(notificationType);
  }

  // Filtrar datos según rol
  filterDataByRole<T>(data: T[], userRole: UserRole, dataType: DataType): T[] {
    if (!this.hasDataPermission(userRole, dataType)) {
      return [];
    }

    // Cache key para optimización
    const cacheKey = `filtered_${dataType}_${userRole}_${JSON.stringify(data).slice(0, 50)}`;
    const cached = syncCache.get(cacheKey);
    if (cached) return cached;

    let filteredData = data;

    // Filtros específicos por rol y tipo de datos
    switch (dataType) {
      case 'orders':
        if (userRole === 'waiter' || userRole === 'employee') {
          // Los meseros solo ven pedidos de sus mesas asignadas
          filteredData = data.filter((item: any) =>
            !item.waiterId || item.waiterId === 'current_user_id'
          );
        }
        break;

      case 'financial':
        if (userRole !== 'owner' && userRole !== 'admin') {
          filteredData = [];
        }
        break;

      case 'inventory':
        if (userRole === 'customer') {
          filteredData = [];
        }
        break;
    }

    // Guardar en cache
    syncCache.set(cacheKey, filteredData, 2 * 60 * 1000); // 2 minutos para datos filtrados
    return filteredData;
  }

  // Filtrar notificaciones según rol
  filterNotificationsByRole(notifications: AppNotification[], userRole: UserRole): AppNotification[] {
    const cacheKey = `notifications_${userRole}_${notifications.length}`;
    const cached = syncCache.get(cacheKey);
    if (cached) return cached;

    const filtered = notifications.filter(notification =>
      this.hasNotificationPermission(userRole, notification.type as NotificationType)
    );

    // Filtros adicionales por rol
    const roleFiltered = filtered.filter(notification => {
      switch (userRole) {
        case 'baker':
          return ['order', 'inventory', 'system'].includes(notification.type) &&
            (notification.message.includes('producción') ||
              notification.message.includes('inventario') ||
              notification.message.includes('horno'));

        case 'waiter':
        case 'employee':
          return ['order', 'table'].includes(notification.type);

        case 'customer':
          return notification.type === 'order' &&
            notification.userId === 'current_user_id';

        default:
          return true;
      }
    });

    syncCache.set(cacheKey, roleFiltered, 1 * 60 * 1000); // 1 minuto para notificaciones
    return roleFiltered;
  }

  // Optimizar actualizaciones en tiempo real
  shouldSync(dataType: string, userRole: UserRole): boolean {
    const lastSyncTime = this.lastSync.get(`${dataType}_${userRole}`) || 0;
    const now = Date.now();

    // Intervalos de sincronización por rol
    const syncIntervals: Record<UserRole, number> = {
      owner: 1000,     // 1 segundo
      admin: 2000,     // 2 segundos
      baker: 3000,     // 3 segundos
      waiter: 5000,    // 5 segundos
      employee: 5000,  // 5 segundos
      customer: 10000, // 10 segundos
      kitchen: 3000,   // 3 segundos
      cocina: 3000,    // 3 segundos
      propietario: 1000 // 1 segundo
    };

    const interval = syncIntervals[userRole] || 5000;

    if (now - lastSyncTime >= interval) {
      this.lastSync.set(`${dataType}_${userRole}`, now);
      return true;
    }

    return false;
  }

  // Suscribirse a actualizaciones optimizadas
  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    this.subscribers.get(key)!.add(callback);

    // Retornar función de desuscripción
    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  // Notificar cambios a suscriptores
  notify(key: string, data: any): void {
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error en callback de sincronización:', error);
        }
      });
    }
  }

  // Limpiar cache
  clearCache(): void {
    syncCache.clear();
  }

  // Invalidar cache específico
  invalidateCache(pattern: string): void {
    syncCache.invalidate(pattern);
  }
}

// Hook para usar el optimizador
export const useSyncOptimizer = () => {
  return DataSyncOptimizer.getInstance();
};

// Utilidades de memoización para componentes
export const memoizeByRole = <T extends any[], R>(
  fn: (...args: T) => R,
  userRole: UserRole
): ((...args: T) => R) => {
  const cache = new Map<string, R>();

  return (...args: T): R => {
    const key = `${userRole}_${JSON.stringify(args)}`;

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);

    // Limpiar cache después de 5 minutos
    setTimeout(() => cache.delete(key), 5 * 60 * 1000);

    return result;
  };
};

// Validador de consistencia de datos
export const validateDataConsistency = (data: any, expectedSchema: any): boolean => {
  try {
    // Validación básica de estructura
    if (typeof data !== typeof expectedSchema) {
      return false;
    }

    if (Array.isArray(expectedSchema)) {
      return Array.isArray(data);
    }

    if (typeof expectedSchema === 'object' && expectedSchema !== null) {
      for (const key in expectedSchema) {
        if (!(key in data)) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error validando consistencia:', error);
    return false;
  }
};

export default DataSyncOptimizer;