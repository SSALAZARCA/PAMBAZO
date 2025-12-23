// 🥖 PAMBAZO - Configuración de Sincronización Optimizada
// Configuración centralizada para el sistema de optimización

export interface SyncConfig {
  // Configuración general
  enabled: boolean;
  debug: boolean;
  performanceMonitoring: boolean;
  
  // Configuración de cache
  cache: {
    enabled: boolean;
    defaultTTL: number; // en milisegundos
    maxSize: number; // número máximo de entradas
    cleanupInterval: number; // intervalo de limpieza en ms
  };
  
  // Configuración de sincronización por rol
  roleSync: {
    owner: {
      interval: number;
      batchUpdates: boolean;
      realTimeNotifications: boolean;
    };
    admin: {
      interval: number;
      batchUpdates: boolean;
      realTimeNotifications: boolean;
    };
    baker: {
      interval: number;
      batchUpdates: boolean;
      realTimeNotifications: boolean;
    };
    waiter: {
      interval: number;
      batchUpdates: boolean;
      realTimeNotifications: boolean;
    };
    employee: {
      interval: number;
      batchUpdates: boolean;
      realTimeNotifications: boolean;
    };
    customer: {
      interval: number;
      batchUpdates: boolean;
      realTimeNotifications: boolean;
    };
  };
  
  // Configuración de filtros de datos
  dataFilters: {
    orders: {
      maxItems: number;
      autoArchiveAfterDays: number;
    };
    notifications: {
      maxItems: number;
      autoMarkReadAfterHours: number;
    };
    inventory: {
      consolidateDuplicates: boolean;
      lowStockThreshold: number;
    };
    tables: {
      autoCleanAfterHours: number;
      maxOccupancyTime: number;
    };
  };
  
  // Configuración de notificaciones
  notifications: {
    enableRoleFiltering: boolean;
    priorityLevels: {
      high: string[];
      medium: string[];
      low: string[];
    };
    autoActions: {
      markReadAfter: number;
      deleteAfter: number;
    };
  };
  
  // Configuración de reportes
  reports: {
    enableRoleBasedAccess: boolean;
    cacheResults: boolean;
    maxHistoryDays: number;
  };
  
  // Configuración de rendimiento
  performance: {
    enableBatching: boolean;
    batchDelay: number;
    maxBatchSize: number;
    enableMemoization: boolean;
    renderOptimization: boolean;
  };
}

// Configuración por defecto
export const defaultSyncConfig: SyncConfig = {
  enabled: true,
  debug: false,
  performanceMonitoring: true,
  
  cache: {
    enabled: true,
    defaultTTL: 5 * 60 * 1000, // 5 minutos
    maxSize: 1000,
    cleanupInterval: 10 * 60 * 1000 // 10 minutos
  },
  
  roleSync: {
    owner: {
      interval: 1000, // 1 segundo
      batchUpdates: false,
      realTimeNotifications: true
    },
    admin: {
      interval: 2000, // 2 segundos
      batchUpdates: true,
      realTimeNotifications: true
    },
    baker: {
      interval: 3000, // 3 segundos
      batchUpdates: true,
      realTimeNotifications: true
    },
    waiter: {
      interval: 5000, // 5 segundos
      batchUpdates: true,
      realTimeNotifications: false
    },
    employee: {
      interval: 5000, // 5 segundos
      batchUpdates: true,
      realTimeNotifications: false
    },
    customer: {
      interval: 10000, // 10 segundos
      batchUpdates: true,
      realTimeNotifications: false
    }
  },
  
  dataFilters: {
    orders: {
      maxItems: 500,
      autoArchiveAfterDays: 30
    },
    notifications: {
      maxItems: 100,
      autoMarkReadAfterHours: 1
    },
    inventory: {
      consolidateDuplicates: true,
      lowStockThreshold: 10
    },
    tables: {
      autoCleanAfterHours: 4,
      maxOccupancyTime: 6
    }
  },
  
  notifications: {
    enableRoleFiltering: true,
    priorityLevels: {
      high: ['system', 'critical_inventory', 'urgent_order'],
      medium: ['order', 'inventory', 'table'],
      low: ['info', 'reminder']
    },
    autoActions: {
      markReadAfter: 60 * 60 * 1000, // 1 hora
      deleteAfter: 7 * 24 * 60 * 60 * 1000 // 7 días
    }
  },
  
  reports: {
    enableRoleBasedAccess: true,
    cacheResults: true,
    maxHistoryDays: 90
  },
  
  performance: {
    enableBatching: true,
    batchDelay: 100, // 100ms
    maxBatchSize: 50,
    enableMemoization: true,
    renderOptimization: true
  }
};

// Configuraciones específicas por entorno
export const environmentConfigs = {
  development: {
    ...defaultSyncConfig,
    debug: true,
    performanceMonitoring: true,
    cache: {
      ...defaultSyncConfig.cache,
      defaultTTL: 1 * 60 * 1000 // 1 minuto en desarrollo
    }
  },
  
  production: {
    ...defaultSyncConfig,
    debug: false,
    performanceMonitoring: false,
    cache: {
      ...defaultSyncConfig.cache,
      defaultTTL: 10 * 60 * 1000 // 10 minutos en producción
    }
  },
  
  testing: {
    ...defaultSyncConfig,
    enabled: false, // Desactivar optimizaciones en tests
    cache: {
      ...defaultSyncConfig.cache,
      enabled: false
    }
  }
};

// Clase para gestionar la configuración
class SyncConfigManager {
  private config: SyncConfig;
  private listeners: Set<(config: SyncConfig) => void> = new Set();
  
  constructor(initialConfig: SyncConfig = defaultSyncConfig) {
    this.config = { ...initialConfig };
  }
  
  // Obtener configuración actual
  getConfig(): SyncConfig {
    return { ...this.config };
  }
  
  // Actualizar configuración
  updateConfig(updates: Partial<SyncConfig>): void {
    this.config = {
      ...this.config,
      ...updates
    };
    
    // Notificar a listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (error) {
        console.error('Error en listener de configuración:', error);
      }
    });
  }
  
  // Obtener configuración específica por rol
  getRoleConfig(role: keyof SyncConfig['roleSync']) {
    return this.config.roleSync[role];
  }
  
  // Suscribirse a cambios de configuración
  subscribe(listener: (config: SyncConfig) => void): () => void {
    this.listeners.add(listener);
    
    // Retornar función de desuscripción
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  // Resetear a configuración por defecto
  reset(): void {
    this.updateConfig(defaultSyncConfig);
  }
  
  // Cargar configuración desde localStorage
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('pambazo_sync_config');
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        this.updateConfig(parsedConfig);
      }
    } catch (error) {
      console.warn('Error cargando configuración desde localStorage:', error);
    }
  }
  
  // Guardar configuración en localStorage
  saveToStorage(): void {
    try {
      localStorage.setItem('pambazo_sync_config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Error guardando configuración en localStorage:', error);
    }
  }
  
  // Validar configuración
  validate(): boolean {
    try {
      // Validaciones básicas
      if (typeof this.config.enabled !== 'boolean') return false;
      if (typeof this.config.cache.defaultTTL !== 'number') return false;
      if (this.config.cache.defaultTTL < 0) return false;
      
      // Validar intervalos de sincronización
      for (const role in this.config.roleSync) {
        const roleConfig = this.config.roleSync[role as keyof SyncConfig['roleSync']];
        if (typeof roleConfig.interval !== 'number' || roleConfig.interval < 100) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error validando configuración:', error);
      return false;
    }
  }
}

// Instancia global del gestor de configuración
const configManager = new SyncConfigManager();

// Detectar entorno y cargar configuración apropiada
const getEnvironment = (): keyof typeof environmentConfigs => {
  if (typeof window === 'undefined') return 'production';
  
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname.includes('test') || hostname.includes('staging')) {
    return 'testing';
  }
  
  return 'production';
};

// Inicializar configuración según entorno
const currentEnv = getEnvironment();
configManager.updateConfig(environmentConfigs[currentEnv]);

// Cargar configuración personalizada si existe
if (typeof window !== 'undefined') {
  configManager.loadFromStorage();
}

// Exportar instancia y utilidades
export const syncConfig = configManager;

// Hook para usar la configuración en componentes React
export const useSyncConfig = () => {
  const [config, setConfig] = React.useState(configManager.getConfig());
  
  React.useEffect(() => {
    const unsubscribe = configManager.subscribe(setConfig);
    return unsubscribe;
  }, []);
  
  return {
    config,
    updateConfig: (updates: Partial<SyncConfig>) => configManager.updateConfig(updates),
    resetConfig: () => configManager.reset(),
    saveConfig: () => configManager.saveToStorage()
  };
};

// Utilidades para acceso rápido
export const getSyncInterval = (role: keyof SyncConfig['roleSync']): number => {
  return configManager.getRoleConfig(role).interval;
};

export const isCacheEnabled = (): boolean => {
  return configManager.getConfig().cache.enabled;
};

export const isDebugEnabled = (): boolean => {
  return configManager.getConfig().debug;
};

export const getMaxNotifications = (): number => {
  return configManager.getConfig().dataFilters.notifications.maxItems;
};

export default configManager;

// Importar React para el hook
import React from 'react';