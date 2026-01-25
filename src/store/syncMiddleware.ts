// 🥖 PAMBAZO - Middleware de Sincronización Optimizada
// Intercepta actualizaciones del store para aplicar optimizaciones automáticamente

import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { DataSyncOptimizer } from './syncOptimizer';
import type { Notification as AppNotification, Order, InventoryEntry, Table } from '../shared/types';

// Tipos para el middleware
type SyncMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  options?: SyncMiddlewareOptions
) => StateCreator<T, Mps, Mcs>;

interface SyncMiddlewareOptions {
  enableLogging?: boolean;
  enablePerformanceTracking?: boolean;
  batchUpdates?: boolean;
  debounceMs?: number;
}

// Cache para batch updates
class UpdateBatcher {
  private pendingUpdates = new Map<string, any>();
  private timeouts = new Map<string, NodeJS.Timeout>();
  private readonly defaultDelay = 100; // 100ms

  schedule(key: string, update: any, delay: number = this.defaultDelay): void {
    // Cancelar timeout anterior si existe
    const existingTimeout = this.timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Acumular actualizaciones
    this.pendingUpdates.set(key, {
      ...this.pendingUpdates.get(key),
      ...update
    });

    // Programar ejecución
    const timeout = setTimeout(() => {
      const batchedUpdate = this.pendingUpdates.get(key);
      if (batchedUpdate) {
        this.executeBatch(key, batchedUpdate);
        this.pendingUpdates.delete(key);
        this.timeouts.delete(key);
      }
    }, delay);

    this.timeouts.set(key, timeout);
  }

  private executeBatch(key: string, update: any): void {
    // Aquí se ejecutaría la actualización real
    console.log(`Ejecutando batch update para ${key}:`, update);
  }

  flush(key?: string): void {
    if (key) {
      const timeout = this.timeouts.get(key);
      if (timeout) {
        clearTimeout(timeout);
        const update = this.pendingUpdates.get(key);
        if (update) {
          this.executeBatch(key, update);
        }
        this.pendingUpdates.delete(key);
        this.timeouts.delete(key);
      }
    } else {
      // Flush all
      for (const [k, timeout] of this.timeouts) {
        clearTimeout(timeout);
        const update = this.pendingUpdates.get(k);
        if (update) {
          this.executeBatch(k, update);
        }
      }
      this.pendingUpdates.clear();
      this.timeouts.clear();
    }
  }
}

// Instancia global del batcher
const updateBatcher = new UpdateBatcher();

// Métricas de rendimiento
class PerformanceTracker {
  private metrics = new Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    lastExecution: number;
  }>();

  track<T>(operation: string, fn: () => T): T {
    const start = performance.now();

    try {
      const result = fn();
      this.recordMetric(operation, performance.now() - start);
      return result;
    } catch (error) {
      this.recordMetric(operation, performance.now() - start, true);
      throw error;
    }
  }

  private recordMetric(operation: string, duration: number, _isError: boolean = false): void {
    const existing = this.metrics.get(operation) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      lastExecution: 0
    };

    const newCount = existing.count + 1;
    const newTotalTime = existing.totalTime + duration;
    const newAvgTime = newTotalTime / newCount;

    this.metrics.set(operation, {
      count: newCount,
      totalTime: newTotalTime,
      avgTime: newAvgTime,
      lastExecution: Date.now()
    });

    // Log si la operación es lenta
    if (duration > 50) {
      console.warn(`Operación lenta detectada: ${operation} tomó ${duration.toFixed(2)}ms`);
    }
  }

  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [operation, metrics] of this.metrics) {
      result[operation] = { ...metrics };
    }
    return result;
  }

  reset(): void {
    this.metrics.clear();
  }
}

// Instancia global del tracker
const performanceTracker = new PerformanceTracker();

// Middleware principal
export const syncMiddleware: SyncMiddleware = (f, options = {}) => {
  const {
    enableLogging = false,
    enablePerformanceTracking = true,
    batchUpdates = true,
    debounceMs = 100
  } = options;

  return (set, get, api) => {
    // const optimizer = DataSyncOptimizer.getInstance(); // Remove unused

    // Wrapper para el set function
    const optimizedSet = (...args: any[]) => {
      const [partial, replace] = args;
      const operation = 'store_update';

      if (enablePerformanceTracking) {
        performanceTracker.track(operation, () => {
          executeOptimizedSet(partial, replace);
        });
      } else {
        executeOptimizedSet(partial, replace);
      }
    };

    const executeOptimizedSet = (partial: any, replace?: boolean) => {
      // Obtener estado actual
      const _currentState = get();

      // Determinar qué tipo de datos se están actualizando
      const updateType = detectUpdateType(partial, _currentState);

      if (enableLogging) {
        console.log(`🔄 Sync Middleware - Actualizando: ${updateType}`, partial);
      }

      // Aplicar optimizaciones según el tipo de actualización
      const optimizedPartial = applyOptimizations(partial, updateType, _currentState);

      // Ejecutar actualización
      if (batchUpdates && shouldBatch(updateType)) {
        updateBatcher.schedule(updateType, optimizedPartial, debounceMs);
        // Para batch updates, ejecutamos inmediatamente pero notificamos después
        // force replace definition
        set(optimizedPartial, replace as any);

        // Notificar cambios de forma optimizada
        setTimeout(() => {
          notifyOptimizedChanges(updateType, optimizedPartial);
        }, 0);
      } else {
        set(optimizedPartial, replace as any);
        notifyOptimizedChanges(updateType, optimizedPartial);
      }
    };

    // Crear el store con el set optimizado
    return f(optimizedSet as any, get, api) as any;
  };
};

// Detectar tipo de actualización
function detectUpdateType(partial: any, _currentState: any): string {
  if (partial.orders !== undefined) return 'orders';
  if (partial.notifications !== undefined) return 'notifications';
  if (partial.inventoryEntries !== undefined) return 'inventory';
  if (partial.tables !== undefined) return 'tables';
  if (partial.productionBatches !== undefined) return 'production';
  if (partial.ovenStatuses !== undefined) return 'ovens';
  if (partial.financialTransactions !== undefined) return 'financial';
  if (partial.finishedProducts !== undefined) return 'finished_products';
  if (partial.productStocks !== undefined) return 'product_stocks';

  return 'general';
}

// Aplicar optimizaciones específicas
function applyOptimizations(partial: any, updateType: string, _currentState: any): any {
  let optimized = { ...partial };

  switch (updateType) {
    case 'notifications':
      if (optimized.notifications) {
        // Limitar número de notificaciones en memoria
        optimized.notifications = optimized.notifications.slice(0, 100);

        // Marcar notificaciones antiguas como leídas automáticamente
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        optimized.notifications = optimized.notifications.map((notif: AppNotification) => {
          if (notif.createdAt && notif.createdAt.getTime() < oneHourAgo) {
            return { ...notif, read: true };
          }
          return notif;
        });
      }
      break;

    case 'orders':
      if (optimized.orders) {
        // Ordenar por fecha de creación (más recientes primero)
        optimized.orders = [...optimized.orders].sort((a: Order, b: Order) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Limitar órdenes en memoria (últimas 500)
        optimized.orders = optimized.orders.slice(0, 500);
      }
      break;

    case 'inventory':
      if (optimized.inventoryEntries) {
        // Consolidar entradas duplicadas del mismo producto
        const consolidated = new Map<string, InventoryEntry>();

        optimized.inventoryEntries.forEach((entry: InventoryEntry) => {
          const key = entry.productId || entry.itemId;
          const existing = consolidated.get(key);

          if (existing) {
            consolidated.set(key, {
              ...existing,
              quantity: existing.quantity + entry.quantity,
              totalCost: existing.totalCost + entry.totalCost
            });
          } else {
            consolidated.set(key, entry);
          }
        });

        optimized.inventoryEntries = Array.from(consolidated.values());
      }
      break;

    case 'tables':
      if (optimized.tables) {
        // Validar estados de mesa
        optimized.tables = optimized.tables.map((table: Table) => {
          // Auto-limpiar mesas ocupadas por más de 4 horas
          if (table.status === 'occupied' && table.occupiedSince) {
            const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
            if (new Date(table.occupiedSince).getTime() < fourHoursAgo) {
              return {
                ...table,
                status: 'cleaning' as const,
                guestCount: 0
              };
            }
          }
          return table;
        });
      }
      break;
  }

  return optimized;
}

// Determinar si debe usar batch updates
function shouldBatch(updateType: string): boolean {
  // Batch para actualizaciones frecuentes
  return ['notifications', 'inventory', 'production'].includes(updateType);
}

// Notificar cambios de forma optimizada
function notifyOptimizedChanges(updateType: string, data: any): void {
  const optimizer = DataSyncOptimizer.getInstance();

  // Invalidar caches relevantes
  optimizer.invalidateCache(updateType);

  // Notificar a suscriptores específicos
  optimizer.notify(updateType, data);

  // Trigger eventos personalizados para componentes que los escuchen
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`pambazo:${updateType}:updated`, {
      detail: { updateType, data }
    }));
  }
}

// Utilidades para acceder a métricas
export const getSyncMetrics = () => {
  return {
    performance: performanceTracker.getMetrics(),
    cache: DataSyncOptimizer.getInstance(),
    batcher: {
      flush: (key?: string) => updateBatcher.flush(key)
    }
  };
};

// Limpiar recursos
export const cleanupSyncMiddleware = () => {
  performanceTracker.reset();
  updateBatcher.flush();
  DataSyncOptimizer.getInstance().clearCache();
};

export default syncMiddleware;