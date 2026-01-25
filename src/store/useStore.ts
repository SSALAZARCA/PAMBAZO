import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usersAPI } from '../services/api';
import type {
  User,
  CartItem,
  Notification,
  DeviceInfo,
  AppState,
  InventoryEntry,
  InventoryItem,
  FinancialTransaction,
  Table,
  Order,
  PreparationWorkflow,
  PreparationTemplate,
  PreparationStage,
  FinishedProduct,
  ProductSaleRecord,
  ProductStock,
  OvenStatus,
  ProductionBatch,
  MaterialUsage,
  BakerKPI,
  ProductionSchedule,
  QualityCheck,
  StockAlert
} from '../../shared/types';

// Store principal de PAMBAZO con gestión de estado completa
interface PAMBAZOStore extends AppState {
  // Estados adicionales
  inventory: InventoryItem[];
  inventoryEntries: InventoryEntry[];
  financialTransactions: FinancialTransaction[];
  tables: Table[];
  orders: Order[];
  preparationWorkflows: PreparationWorkflow[];
  preparationTemplates: PreparationTemplate[];
  finishedProducts: FinishedProduct[];
  productSaleRecords: ProductSaleRecord[];
  productStocks: ProductStock[];
  users: User[];

  // Estados de producción y panadería
  ovenStatuses: OvenStatus[];
  productionBatches: ProductionBatch[];
  materialUsages: MaterialUsage[];
  bakerKPIs: BakerKPI[];
  stockAlerts: StockAlert[];
  productionSchedules: ProductionSchedule[];
  qualityChecks: QualityCheck[];

  // Acciones de usuario
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
  createUser: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<User>;
  loadUsers: () => Promise<void>;
  getAllUsers: () => User[];
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;

  // Acciones de dispositivo
  setDeviceInfo: (deviceInfo: DeviceInfo) => void;

  // Acciones de carrito
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;

  // Acciones de notificaciones
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  getUnreadCount: () => number;

  // Acciones de inventario
  addInventoryEntry: (entry: Omit<InventoryEntry, 'id' | 'entryDate'>) => void;
  getInventoryEntries: () => InventoryEntry[];
  initializeInventory: () => void;

  // Acciones financieras
  addFinancialTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'date'>) => void;
  getFinancialTransactions: () => FinancialTransaction[];
  getExpensesByCategory: () => { category: string; amount: number }[];

  // Acciones de tema
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;

  // Acciones de mesas
  initializeTables: () => void;
  updateTableStatus: (tableId: string, status: 'available' | 'occupied' | 'reserved' | 'cleaning', guestCount?: number, waiterId?: string) => void;
  getTables: () => Table[];
  getTableById: (tableId: string) => Table | undefined;

  // Acciones de pedidos
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'completed') => void;
  getOrders: () => Order[];
  getOrdersByTable: (tableId: string) => Order[];
  getOrdersByWaiter: (waiterId: string) => Order[];
  getOrdersByDateRange: (startDate: Date, endDate: Date) => Order[];

  // Acciones de preparación
  createPreparationWorkflow: (batchId: string, productId: string, productName: string, bakerId: string, bakerName: string) => void;
  updatePreparationStage: (workflowId: string, stageId: string, updates: Partial<PreparationStage>) => void;
  completePreparationStage: (workflowId: string, stageId: string, notes?: string) => void;
  updatePreparationStatus: (workflowId: string, status: PreparationWorkflow['status']) => void;
  getPreparationWorkflows: () => PreparationWorkflow[];
  getActivePreparationWorkflows: () => PreparationWorkflow[];
  getPreparationWorkflowById: (workflowId: string) => PreparationWorkflow | undefined;
  getPreparationWorkflowByBatchId: (batchId: string) => PreparationWorkflow | undefined;
  initializePreparationTemplates: () => void;
  getPreparationTemplateByProductId: (productId: string) => PreparationTemplate | undefined;

  // Acciones de productos terminados
  addFinishedProduct: (product: Omit<FinishedProduct, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFinishedProductStatus: (productId: string, status: FinishedProduct['status'], notes?: string) => void;
  markProductAvailableForSale: (productId: string, unitPrice: number) => void;
  getFinishedProducts: () => FinishedProduct[];
  getFinishedProductsHistory: (filters?: { startDate?: Date; endDate?: Date; bakerId?: string; productId?: string }) => FinishedProduct[];
  getAvailableForSaleProducts: () => FinishedProduct[];
  getReadyProducts: () => FinishedProduct[];

  // Acciones de registros de venta
  addProductSaleRecord: (record: Omit<ProductSaleRecord, 'id' | 'saleDate'>) => void;
  getProductSaleRecords: () => ProductSaleRecord[];
  getSalesByDateRange: (startDate: Date, endDate: Date) => ProductSaleRecord[];

  // Acciones de stock de productos
  updateProductStock: (productId: string, updates: Partial<Omit<ProductStock, 'id' | 'lastUpdated'>>) => void;
  getProductStock: (productId: string) => ProductStock | undefined;
  getAllProductStocks: () => ProductStock[];

  // Acciones de gestión de hornos
  addOven: (ovenConfig: Omit<OvenStatus, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeOven: (ovenId: string) => boolean;
  updateOvenConfiguration: (ovenId: string, updates: Partial<Omit<OvenStatus, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  updateOvenStatus: (ovenId: string, updates: Partial<OvenStatus>) => void;
  startOven: (ovenId: string, temperature: number, batchId?: string) => void;
  stopOven: (ovenId: string) => void;
  pauseOven: (ovenId: string) => void;
  resumeOven: (ovenId: string) => void;
  getAvailableOvens: () => OvenStatus[];
  debugOvenAvailability: () => { totalOvens: number; availableOvens: number; ovens: Array<{ id: string; name: string; status: string; available: boolean }> };
  getOvenById: (ovenId: string) => OvenStatus | undefined;
  getOvenUtilizationStats: () => { ovenId: string; utilizationRate: number; efficiency: number }[];
  getOvensRequiringMaintenance: () => OvenStatus[];
  initializeOvenStatuses: () => void;
  canRemoveOven: (ovenId: string) => boolean;
  updateOvenUtilizationStats: (ovenId: string, batchDuration: number) => void;
  checkMaintenanceSchedule: () => OvenStatus[];
  forceOvenAvailable: (ovenId: string) => void;
  resetAllOvens: () => void;
  ensureOvenAvailability: () => boolean;

  // Nuevas funciones de producción
  addProductionBatch: (batch: Omit<ProductionBatch, 'id'>) => void;
  updateProductionBatch: (batchId: string, updates: Partial<ProductionBatch>) => void;
  completeProductionBatch: (batchId: string) => void;
  moveProductToNextStage: (batchId: string) => void;
  getActiveBatches: () => ProductionBatch[];
  getBatchesByStatus: (status: ProductionBatch['status']) => ProductionBatch[];
  updateBatchStatus: (batchId: string, status: ProductionBatch['status']) => void;
  addMaterialUsage: (usage: Omit<MaterialUsage, 'id'>) => void;
  updateMaterialUsage: (id: string, updates: Partial<MaterialUsage>) => void;
  recordMaterialOutput: (materialId: string, quantity: number, reason: string) => void;
  getMaterialUsageByDate: (startDate: Date, endDate: Date) => MaterialUsage[];
  addBakerKPI: (kpi: Omit<BakerKPI, 'id'>) => void;
  updateBakerKPI: (kpiId: string, updates: Partial<BakerKPI>) => void;
  getBakerKPIsByDate: (startDate: Date, endDate: Date) => BakerKPI[];
  getBakerKPIsByBaker: (bakerId: string) => BakerKPI[];
  getBakerKPIs: () => BakerKPI[];
  getKPIsByDateRange: (startDate: Date, endDate: Date) => any;
  addStockAlert: (alert: any) => void; // StockAlert might be missing
  updateStockAlert: (alertId: string, updates: any) => void;
  resolveStockAlert: (alertId: string, action: 'restock' | 'ignore' | 'adjust_threshold') => void;
  acknowledgeStockAlert: (alertId: string) => void;
  addProductionSchedule: (schedule: Omit<ProductionSchedule, 'id'>) => void;
  updateProductionSchedule: (scheduleId: string, updates: Partial<ProductionSchedule>) => void;
  deleteProductionSchedule: (scheduleId: string) => void;
  getProductionScheduleByDate: (date: Date) => ProductionSchedule[];
  addQualityCheck: (check: Omit<QualityCheck, 'id'>) => void;
  updateQualityCheck: (checkId: string, updates: Partial<QualityCheck>) => void;
  getQualityChecksByBatch: (batchId: string) => QualityCheck[];
  getQualityChecksByProduct: (productId: string) => QualityCheck[];
  getQualityTrends: (productId: string, days: number) => QualityCheck[];
  getUnacknowledgedAlerts: () => any[];
}

export const useStore = create<PAMBAZOStore>()(persist(
  (set, get) => ({
    // Estado inicial
    user: null,
    isAuthenticated: false,
    inventory: [],
    deviceInfo: {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasTouch: false,
      userAgent: '',
      screenWidth: 0,
      screenHeight: 0
    },
    cart: [],
    notifications: [],
    theme: 'system',
    inventoryEntries: [],
    financialTransactions: [],
    tables: [],
    orders: [],
    preparationWorkflows: [],
    preparationTemplates: [],
    finishedProducts: [],
    productSaleRecords: [],
    productStocks: [],
    stockAlerts: [],
    users: [],

    // Inicialización de estados faltantes
    ovenStatuses: [],
    productionBatches: [],
    materialUsages: [],
    bakerKPIs: [],
    productionSchedules: [],
    qualityChecks: [],

    // Acciones de usuario
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    logout: () => set({
      user: null,
      isAuthenticated: false,
      cart: [],
      notifications: []
    }),

    // Funciones de gestión de usuarios
    createUser: async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => {
      try {
        // Call the backend API to register the user
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            phone: userData.phone
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Error al crear usuario');
        }

        // Create user object compatible with frontend types
        const newUser: User = {
          id: result.data.user.id.toString(),
          name: result.data.user.name,
          email: result.data.user.email,
          role: result.data.user.role,
          phone: result.data.user.phone || '',
          createdAt: new Date(result.data.user.created_at)
        };

        // Add to local state
        set((state) => ({
          users: [...state.users, newUser]
        }));

        return newUser;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    },

    loadUsers: async () => {
      try {
        const response = await usersAPI.getAll();

        if (response.success && response.data) {
          const apiData = response.data as any;
          if (apiData.users && Array.isArray(apiData.users)) {
            const mappedUsers: User[] = apiData.users.map((u: any) => ({
              id: u.id,
              email: u.email,
              name: u.name || u.username || 'Usuario',
              role: u.role as User['role'],
              phone: u.phone,
              createdAt: (u.created_at || u.createdAt) ? new Date(u.created_at || u.createdAt) : undefined
            }));
            set({ users: mappedUsers });
          }
        } else {
          console.error('Error loading users:', response.error);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    },

    getAllUsers: () => {
      const state = get();
      return state.users;
    },

    updateUser: (userId, updates) => set((state) => ({
      users: state.users.map(user =>
        user.id === userId
          ? { ...user, ...updates }
          : user
      )
    })),

    deleteUser: (userId) => set((state) => ({
      users: state.users.filter(user => user.id !== userId)
    })),

    // Acciones de dispositivo
    setDeviceInfo: (deviceInfo) => set({ deviceInfo }),

    // Acciones de carrito
    addToCart: (newItem) => set((state) => {
      const existingItem = state.cart.find(item => item.product.id === newItem.product.id);
      if (existingItem) {
        return {
          cart: state.cart.map(item =>
            item.product.id === newItem.product.id
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          )
        };
      }
      return { cart: [...state.cart, newItem] };
    }),

    removeFromCart: (productId) => set((state) => ({
      cart: state.cart.filter(item => item.product.id !== productId)
    })),

    updateCartQuantity: (productId, quantity) => set((state) => {
      if (quantity <= 0) {
        return { cart: state.cart.filter(item => item.product.id !== productId) };
      }
      return {
        cart: state.cart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      };
    }),

    clearCart: () => set({ cart: [] }),

    getCartTotal: () => {
      const state = get();
      return state.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    },

    getCartItemCount: () => {
      const state = get();
      return state.cart.reduce((count, item) => count + item.quantity, 0);
    },

    // Acciones de notificaciones
    addNotification: (notification) => set((state) => ({
      notifications: [{
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date(),
        read: false
      }, ...state.notifications]
    })),

    markNotificationAsRead: (notificationId) => set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    })),

    clearNotifications: () => set({ notifications: [] }),

    getUnreadCount: () => {
      const state = get();
      return state.notifications.filter(notification => !notification.read).length;
    },

    // Acciones de inventario
    addInventoryEntry: (entry) => set((state) => {
      const newEntry: InventoryEntry = {
        ...entry,
        id: Date.now().toString(),
        entryDate: new Date()
      };
      return {
        inventoryEntries: [newEntry, ...state.inventoryEntries]
      };
    }),

    getInventoryEntries: () => {
      const state = get();
      return state.inventoryEntries;
    },

    // Inicializar inventario con datos de ejemplo
    initializeInventory: () => set((state) => {
      if (state.inventoryEntries.length === 0) {
        const initialInventory: InventoryEntry[] = [
          {
            id: 'inv-1',
            itemId: 'harina',
            itemName: 'Harina',
            productId: 'harina',
            productName: 'Harina de Trigo',
            quantity: 50,
            unitCost: 2.5,
            totalCost: 125,
            supplier: 'Molinos del Valle',
            invoiceNumber: 'INV-001',
            entryDate: new Date(),
            userId: 'admin-1',
            userName: 'Administrador'
          },
          {
            id: 'inv-2',
            itemId: 'agua',
            itemName: 'Agua',
            productId: 'agua',
            productName: 'Agua Purificada',
            quantity: 100,
            unitCost: 0.5,
            totalCost: 50,
            supplier: 'Aguas Cristalinas',
            invoiceNumber: 'INV-002',
            entryDate: new Date(),
            userId: 'admin-1',
            userName: 'Administrador'
          },
          {
            id: 'inv-3',
            itemId: 'levadura',
            itemName: 'Levadura',
            productId: 'levadura',
            productName: 'Levadura Fresca',
            quantity: 10,
            unitCost: 8.0,
            totalCost: 80,
            supplier: 'Levaduras Premium',
            invoiceNumber: 'INV-003',
            entryDate: new Date(),
            userId: 'admin-1',
            userName: 'Administrador'
          },
          {
            id: 'inv-4',
            itemId: 'sal',
            itemName: 'Sal',
            productId: 'sal',
            productName: 'Sal Marina',
            quantity: 25,
            unitCost: 1.2,
            totalCost: 30,
            supplier: 'Sal del Pacífico',
            invoiceNumber: 'INV-004',
            entryDate: new Date(),
            userId: 'admin-1',
            userName: 'Administrador'
          },
          {
            id: 'inv-5',
            itemId: 'azucar',
            itemName: 'Azúcar',
            productId: 'azucar',
            productName: 'Azúcar Refinada',
            quantity: 30,
            unitCost: 1.8,
            totalCost: 54,
            supplier: 'Ingenio San Carlos',
            invoiceNumber: 'INV-005',
            entryDate: new Date(),
            userId: 'admin-1',
            userName: 'Administrador'
          }
        ];
        return { inventoryEntries: initialInventory };
      }
      return state;
    }),

    // Acciones financieras
    addFinancialTransaction: (transaction) => set((state) => {
      const newTransaction: FinancialTransaction = {
        ...transaction,
        id: Date.now().toString(),
        date: new Date()
      };
      return {
        financialTransactions: [newTransaction, ...state.financialTransactions]
      };
    }),

    getFinancialTransactions: () => {
      const state = get();
      return state.financialTransactions;
    },

    getExpensesByCategory: () => {
      const state = get();
      const expenses = state.financialTransactions.filter(t => t.type === 'expense');
      const categoryTotals: { [key: string]: number } = {};

      expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });

      return Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount
      }));
    },

    // Acciones de tema
    setTheme: (theme) => set({ theme }),

    toggleTheme: () => set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light'
    })),

    // Acciones de mesas
    initializeTables: () => set((state) => {
      if (state.tables.length === 0) {
        const initialTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
          id: (i + 1).toString(),
          number: i + 1,
          capacity: Math.floor(Math.random() * 4) + 2, // 2-6 personas
          status: 'available',
          guestCount: 0,
          waiterId: undefined,
          waiterName: undefined,
          occupiedSince: undefined
        }));
        return { tables: initialTables };
      }
      return state;
    }),

    updateTableStatus: (tableId, status, guestCount = 0, waiterId) => {
      set((state) => {
        const updatedTables = state.tables.map(table =>
          table.id === tableId
            ? {
              ...table,
              status,
              guestCount,
              waiterId,
              waiterName: waiterId ? state.user?.name : undefined,
              occupiedSince: status === 'occupied' ? new Date().toISOString() : undefined
            }
            : table
        );
        return { tables: updatedTables };
      });
    },

    getTables: () => {
      const state = get();
      return state.tables;
    },

    getTableById: (tableId) => {
      const state = get();
      return state.tables.find(table => table.id === tableId);
    },

    // Acciones de pedidos
    addOrder: (order) => {
      set((state) => {
        const newOrders = [order, ...state.orders];
        return { orders: newOrders };
      });
    },

    updateOrderStatus: (orderId, status) => {
      set((state) => {
        const updatedOrders = state.orders.map(order =>
          order.id === orderId
            ? { ...order, status }
            : order
        );
        return { orders: updatedOrders };
      });
    },

    getOrdersByDateRange: (startDate: Date, endDate: Date) => {
      const state = get();
      return state.orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    },

    getOrdersByTable: (tableId) => {
      const state = get();
      return state.orders.filter(order => order.tableId === tableId);
    },

    getOrdersByWaiter: (waiterId) => {
      const state = get();
      return state.orders.filter(order => order.waiterId === waiterId);
    },

    // Acciones del Panadero
    addProductionBatch: (batch: any) => set((state) => ({
      productionBatches: [{ ...batch, id: Date.now().toString() }, ...state.productionBatches]
    })),

    updateProductionBatch: (batchId: string, updates: any) => set((state) => ({
      productionBatches: state.productionBatches.map(batch =>
        batch.id === batchId ? { ...batch, ...updates } : batch
      )
    })),

    completeProductionBatch: (batchId: string) => set((state) => ({
      productionBatches: state.productionBatches.map(batch =>
        batch.id === batchId ? { ...batch, status: 'completed' as const } : batch
      )
    })),

    getActiveBatches: () => {
      return get().productionBatches.filter(batch => batch.status !== 'completed');
    },

    getBatchesByStatus: (status: any) => {
      const state = get();
      return state.productionBatches.filter(batch => batch.status === status);
    },

    addMaterialUsage: (usage: any) => set((state) => ({
      materialUsages: [{ ...usage, id: Date.now().toString() }, ...state.materialUsages]
    })),

    getMaterialUsageByBatch: (batchId: string) => {
      const state = get();
      return state.materialUsages.filter(usage => usage.batchId === batchId);
    },

    getTotalMaterialUsage: (materialId: string, startDate: Date, endDate: Date) => {
      const state = get();
      return state.materialUsages
        .filter((usage: MaterialUsage) =>
          usage.materialId === materialId &&
          usage.usageDate >= startDate &&
          usage.usageDate <= endDate
        )
        .reduce((total: number, usage: MaterialUsage) => total + usage.quantityUsed, 0);
    },

    addBakerKPI: (kpi: any) => set((state) => ({
      bakerKPIs: [{ ...kpi, id: Date.now().toString() }, ...state.bakerKPIs]
    })),

    updateBakerKPI: (kpiId: string, updates: any) => set((state) => ({
      bakerKPIs: state.bakerKPIs.map(kpi =>
        kpi.id === kpiId ? { ...kpi, ...updates } : kpi
      )
    })),



    getLatestKPIs: (bakerId: string) => {
      const state = get();
      const filtered = bakerId
        ? state.bakerKPIs.filter(kpi => kpi.bakerId === bakerId)
        : state.bakerKPIs;
      return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    },

    addStockAlert: (alert: any) => set((state) => ({
      stockAlerts: [{ ...alert, id: Date.now().toString() }, ...state.stockAlerts]
    })),

    acknowledgeStockAlert: (alertId: string) => set((state) => ({
      stockAlerts: state.stockAlerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    })),

    deleteStockAlert: (alertId: string) => set((state) => ({
      stockAlerts: state.stockAlerts.filter(alert => alert.id !== alertId)
    })),

    getCriticalAlerts: () => {
      const state = get();
      return state.stockAlerts.filter(alert => alert.alertLevel === 'critical' && !alert.acknowledged);
    },

    getUnacknowledgedAlerts: () => {
      const state = get();
      return (state.stockAlerts || []).filter(alert => !alert.acknowledged);
    },

    addProductionSchedule: (schedule: any) => set((state) => ({
      productionSchedules: [{ ...schedule, id: Date.now().toString() }, ...state.productionSchedules]
    })),

    updateProductionSchedule: (scheduleId: string, updates: any) => set((state) => ({
      productionSchedules: state.productionSchedules.map(schedule =>
        schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
      )
    })),

    deleteProductionSchedule: (scheduleId: string) => set((state) => ({
      productionSchedules: state.productionSchedules.filter(schedule => schedule.id !== scheduleId)
    })),

    getProductionScheduleByDate: (date: Date) => {
      const state = get();
      const dateStr = date.toDateString();
      return state.productionSchedules.filter(schedule =>
        new Date(schedule.date).toDateString() === dateStr
      );
    },

    updateOvenStatus: (ovenId, updates) => set((state) => ({
      ovenStatuses: state.ovenStatuses.map(oven =>
        oven.id === ovenId ? { ...oven, ...updates } : oven
      )
    })),

    getAvailableOvens: () => {
      const state = get();
      const now = new Date();

      // Protección null-safe para ovenStatuses
      if (!state.ovenStatuses || !Array.isArray(state.ovenStatuses)) {
        console.warn('⚠️ ovenStatuses no está definido o no es un array');
        return [];
      }

      console.log('🔍 DEBUG getAvailableOvens - Total hornos:', state.ovenStatuses.length);
      console.log('🔍 DEBUG getAvailableOvens - Hornos:', state.ovenStatuses.map(o => ({ id: o.id, name: o.name, status: o.status })));

      const availableOvens = state.ovenStatuses.filter(oven => {
        console.log(`\n🔍 Evaluando horno: ${oven.name} (${oven.id})`);

        // Verificar que el horno esté en estado idle
        if (oven.status !== 'idle') {
          console.log(`❌ Status no es idle: ${oven.status}`);
          return false;
        }
        console.log('✅ Status es idle');

        // Verificar que no tenga mantenimiento programado próximo (dentro de los próximos 30 minutos)
        if (oven.maintenanceSchedule?.nextMaintenance) {
          const maintenanceTime = new Date(oven.maintenanceSchedule.nextMaintenance);
          const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
          console.log(`🔧 Mantenimiento programado: ${maintenanceTime.toLocaleString()}`);
          console.log(`🔧 30 minutos desde ahora: ${thirtyMinutesFromNow.toLocaleString()}`);
          if (maintenanceTime <= thirtyMinutesFromNow) {
            console.log('❌ Mantenimiento muy próximo');
            return false;
          }
        }
        console.log('✅ Mantenimiento OK');

        // Verificar que la temperatura actual esté en rango normal (no sobrecalentado) - 90% del máximo
        const maxAllowedTemp = oven.maxTemperature * 0.9;
        console.log(`🌡️ Temp actual: ${oven.currentTemperature}°C, Máx permitida: ${maxAllowedTemp}°C`);
        if (oven.currentTemperature > maxAllowedTemp) {
          console.log('❌ Temperatura muy alta');
          return false;
        }
        console.log('✅ Temperatura OK');

        // Verificar que no esté asignado a otro lote
        console.log(`📦 Lote actual: ${oven.currentBatchId || 'ninguno'}`);
        if (oven.currentBatchId) {
          console.log('❌ Horno asignado a lote');
          return false;
        }
        console.log('✅ Sin lote asignado');

        // Verificar que tenga capacidad disponible (mayor a 0)
        console.log(`📏 Capacidad: ${oven.capacity}`);
        if (!oven.capacity || oven.capacity <= 0) {
          console.log('❌ Capacidad inválida');
          return false;
        }
        console.log('✅ Capacidad OK');

        console.log(`✅ Horno ${oven.name} DISPONIBLE`);
        return true;
      });

      console.log('🔍 DEBUG getAvailableOvens - Resultado:', availableOvens.length, 'hornos disponibles');
      console.log('🔍 DEBUG getAvailableOvens - Hornos disponibles:', availableOvens.map(o => o.name));

      return availableOvens;
    },

    // Función de diagnóstico para debugging
    debugOvenAvailability: () => {
      const state = get();
      const now = new Date();

      // Protección null-safe para ovenStatuses
      if (!state.ovenStatuses || !Array.isArray(state.ovenStatuses)) {
        console.warn('⚠️ ovenStatuses no está definido o no es un array en debugOvenAvailability');
        return {
          totalOvens: 0,
          availableOvens: 0,
          ovens: []
        };
      }

      console.log('\n🚨 DIAGNÓSTICO COMPLETO DE HORNOS 🚨');
      console.log('='.repeat(50));
      console.log(`Total de hornos en el sistema: ${state.ovenStatuses.length}`);

      state.ovenStatuses.forEach((oven, index) => {
        console.log(`\n🔍 HORNO ${index + 1}: ${oven.name} (${oven.id})`);
        console.log('-'.repeat(30));
        console.log(`Status: ${oven.status}`);
        console.log(`Temperatura actual: ${oven.currentTemperature}°C`);
        console.log(`Temperatura máxima: ${oven.maxTemperature}°C`);
        console.log(`Capacidad: ${oven.capacity}`);
        console.log(`Lote actual: ${oven.currentBatchId || 'ninguno'}`);

        if (oven.maintenanceSchedule?.nextMaintenance) {
          const maintenanceTime = new Date(oven.maintenanceSchedule.nextMaintenance);
          console.log(`Próximo mantenimiento: ${maintenanceTime.toLocaleString()}`);
        }

        // Evaluar cada condición
        const checks = {
          'Status idle': oven.status === 'idle',
          'Sin lote asignado': !oven.currentBatchId,
          'Capacidad válida': oven.capacity && oven.capacity > 0,
          'Temperatura OK': oven.currentTemperature <= (oven.maxTemperature * 0.9),
          'Mantenimiento OK': !oven.maintenanceSchedule?.nextMaintenance ||
            new Date(oven.maintenanceSchedule.nextMaintenance) > new Date(now.getTime() + 30 * 60 * 1000)
        };

        console.log('Validaciones:');
        Object.entries(checks).forEach(([check, passed]) => {
          console.log(`  ${passed ? '✅' : '❌'} ${check}`);
        });

        const isAvailable = Object.values(checks).every(Boolean);
        console.log(`\n${isAvailable ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`);
      });

      const availableCount = get().getAvailableOvens().length;
      console.log(`\n📊 RESUMEN: ${availableCount} de ${state.ovenStatuses.length} hornos disponibles`);
      console.log('='.repeat(50));

      return {
        totalOvens: state.ovenStatuses.length,
        availableOvens: availableCount,
        ovens: state.ovenStatuses.map(oven => ({
          id: oven.id,
          name: oven.name,
          status: oven.status,
          available: get().getAvailableOvens().some(ao => ao.id === oven.id)
        }))
      };
    },

    getOvenById: (ovenId) => {
      const state = get();
      if (!state.ovenStatuses || !Array.isArray(state.ovenStatuses)) {
        console.warn('⚠️ ovenStatuses no está definido o no es un array en getOvenById');
        return undefined;
      }
      return state.ovenStatuses.find(oven => oven.id === ovenId);
    },

    addQualityCheck: (check) => set((state) => ({
      qualityChecks: [{ ...check, id: Date.now().toString() }, ...state.qualityChecks]
    })),

    updateQualityCheck: (checkId, updates) => set((state) => ({
      qualityChecks: state.qualityChecks.map(check =>
        check.id === checkId ? { ...check, ...updates } : check
      )
    })),

    getQualityChecksByBatch: (batchId) => {
      const state = get();
      return state.qualityChecks.filter(check => check.batchId === batchId);
    },

    getQualityTrends: (productId, days) => {
      const state = get();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return state.qualityChecks
        .filter(check =>
          check.batchId.includes(productId) &&
          check.checkDate >= cutoffDate
        )
        .sort((a, b) => a.checkDate.getTime() - b.checkDate.getTime());
    },

    // Funciones adicionales para interactividad del panadero
    startOven: (ovenId: string, temperature: number, batchId?: string) => set((state) => ({
      ovenStatuses: state.ovenStatuses.map(oven =>
        oven.id === ovenId
          ? {
            ...oven,
            status: 'preheating' as const,
            currentTemperature: temperature,
            targetTemperature: temperature,
            currentBatchId: batchId,
            utilizationStats: {
              ...oven.utilizationStats,
              lastUsed: new Date()
            },
            updatedAt: new Date()
          }
          : oven
      )
    })),

    stopOven: (ovenId: string) => set((state) => ({
      ovenStatuses: state.ovenStatuses.map(oven =>
        oven.id === ovenId
          ? {
            ...oven,
            status: 'idle' as const,
            currentTemperature: 25,
            targetTemperature: 0,
            currentBatchId: undefined,
            updatedAt: new Date()
          }
          : oven
      )
    })),

    pauseOven: (ovenId: string) => set((state) => ({
      ovenStatuses: state.ovenStatuses.map(oven =>
        oven.id === ovenId
          ? { ...oven, status: 'paused' as const, updatedAt: new Date() }
          : oven
      )
    })),

    resumeOven: (ovenId: string) => set((state) => ({
      ovenStatuses: state.ovenStatuses.map(oven =>
        oven.id === ovenId
          ? { ...oven, status: 'baking' as const, updatedAt: new Date() }
          : oven
      )
    })),

    moveProductToNextStage: (batchId: string) => set((state) => {
      const batch = state.productionBatches.find(b => b.id === batchId);
      if (!batch) return state;

      let nextStatus: ProductionBatch['status'];
      switch (batch.status) {
        case 'preparing':
          nextStatus = 'baking';
          break;
        case 'baking':
          nextStatus = 'cooling';
          break;
        case 'cooling':
          nextStatus = 'ready';
          break;
        case 'ready':
          nextStatus = 'completed';
          break;
        default:
          return state;
      }

      return {
        productionBatches: state.productionBatches.map(b =>
          b.id === batchId ? { ...b, status: nextStatus } : b
        )
      };
    }),

    recordMaterialOutput: (materialId: string, quantity: number, reason: string) => {
      const usage: Omit<MaterialUsage, 'id'> = {
        materialId,
        quantityUsed: quantity,
        usageDate: new Date(),
        date: new Date(),
        batchId: 'manual-output',
        notes: reason,
        materialName: 'Manual Output',
        unit: 'unit',
        cost: 0
      };
      get().addMaterialUsage(usage);

      // Actualizar inventario si existe
      const state = get();
      const inventoryEntry = state.inventoryEntries.find(entry => entry.productId === materialId);
      if (inventoryEntry) {
        set((state) => ({
          inventoryEntries: state.inventoryEntries.map(entry =>
            entry.productId === materialId
              ? { ...entry, quantity: Math.max(0, entry.quantity - quantity) }
              : entry
          )
        }));
      }
    },

    resolveStockAlert: (alertId: string, action: 'restock' | 'ignore' | 'adjust_threshold') => {
      get().acknowledgeStockAlert(alertId);

      // Agregar notificación de resolución
      get().addNotification({
        type: 'system',
        title: 'Alerta de Stock Resuelta',
        message: `Alerta resuelta con acción: ${action}`,
        priority: 'medium'
      });
    },

    // Función para forzar un horno como disponible
    forceOvenAvailable: (ovenId: string) => set((state) => ({
      ovenStatuses: state.ovenStatuses.map(oven =>
        oven.id === ovenId
          ? {
            ...oven,
            status: 'idle' as const,
            currentTemperature: 25,
            targetTemperature: 0,
            currentBatchId: undefined,
            capacity: oven.capacity || 10, // Asegurar capacidad mínima
            updatedAt: new Date()
          }
          : oven
      )
    })),

    // Función para resetear todos los hornos
    resetAllOvens: () => set((state) => ({
      ovenStatuses: state.ovenStatuses.map(oven => ({
        ...oven,
        status: 'idle' as const,
        currentTemperature: 25,
        targetTemperature: 0,
        currentBatchId: undefined,
        capacity: oven.capacity || 10,
        updatedAt: new Date()
      }))
    })),

    // Función para verificar y corregir disponibilidad automáticamente
    ensureOvenAvailability: () => {
      const state = get();
      const availableOvens = get().getAvailableOvens();

      console.log('🔧 Verificando disponibilidad de hornos:', {
        total: state.ovenStatuses.length,
        disponibles: availableOvens.length
      });

      if (availableOvens.length === 0 && state.ovenStatuses.length > 0) {
        console.log('⚠️ No hay hornos disponibles, forzando reset automático');
        get().resetAllOvens();

        // Agregar notificación
        get().addNotification({
          type: 'system',
          title: 'Sistema de Hornos Reseteado',
          message: 'Se detectó que no había hornos disponibles y se realizó un reset automático',
          priority: 'high'
        });

        return true;
      }

      return false;
    },

    initializeOvenStatuses: () => set((_state) => {
      // Forzar inicialización incluso si ya existen hornos
      const now = new Date();
      const initialOvens: OvenStatus[] = [
        {
          id: 'horno-1',
          name: 'Horno Principal',
          status: 'idle',
          currentTemperature: 25,
          targetTemperature: 0,
          currentBatchId: undefined,
          lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          efficiency: 95,
          capacity: 20,
          maxTemperature: 250,
          energyConsumption: 3.5,
          maintenanceSchedule: {
            nextMaintenance: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
            maintenanceInterval: 30,
            maintenanceType: 'routine'
          },
          utilizationStats: {
            totalHoursUsed: 1250,
            batchesCompleted: 156,
            averageEfficiency: 95,
            lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          isRemovable: false,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'horno-2',
          name: 'Horno Secundario',
          status: 'idle',
          currentTemperature: 25,
          targetTemperature: 0,
          currentBatchId: undefined,
          lastMaintenance: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          efficiency: 92,
          capacity: 15,
          maxTemperature: 230,
          energyConsumption: 2.8,
          maintenanceSchedule: {
            nextMaintenance: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            maintenanceInterval: 30,
            maintenanceType: 'routine'
          },
          utilizationStats: {
            totalHoursUsed: 980,
            batchesCompleted: 124,
            averageEfficiency: 92,
            lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          isRemovable: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'horno-3',
          name: 'Horno de Respaldo',
          status: 'idle',
          currentTemperature: 25,
          targetTemperature: 0,
          currentBatchId: undefined,
          lastMaintenance: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          efficiency: 88,
          capacity: 12,
          maxTemperature: 220,
          energyConsumption: 2.2,
          maintenanceSchedule: {
            nextMaintenance: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
            maintenanceInterval: 30,
            maintenanceType: 'routine'
          },
          utilizationStats: {
            totalHoursUsed: 650,
            batchesCompleted: 78,
            averageEfficiency: 88,
            lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          isRemovable: true,
          createdAt: now,
          updatedAt: now
        }
      ];

      console.log('🔧 Inicializando hornos con estado forzado a disponible');
      return { ovenStatuses: initialOvens };
    }),

    // Acciones de preparación
    createPreparationWorkflow: (batchId, productId, productName, bakerId, bakerName) => {
      const template = get().getPreparationTemplateByProductId(productId);
      if (!template) {
        console.warn(`No se encontró plantilla de preparación para el producto: ${productId}`);
        return;
      }

      const workflow: PreparationWorkflow = {
        id: `prep-${Date.now()}`,
        batchId,
        productId,
        productName,
        status: 'not_started',
        currentStageIndex: 0,
        stages: template.stages.map((stage, index) => ({
          id: `stage-${index}-${Date.now()}`,
          name: stage.name,
          description: stage.description,
          estimatedDuration: stage.estimatedDuration,
          order: stage.order,
          isCompleted: false,
          status: 'pending'
        })),
        bakerId,
        bakerName,
        totalProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      set((state) => ({
        preparationWorkflows: [...state.preparationWorkflows, workflow]
      }));
    },

    updatePreparationStage: (workflowId, stageId, updates) => set((state) => ({
      preparationWorkflows: state.preparationWorkflows.map(workflow => {
        if (workflow.id === workflowId) {
          const updatedStages = workflow.stages.map((stage) =>
            stage.id === stageId ? { ...stage, ...updates } : stage
          );
          return {
            ...workflow,
            stages: updatedStages,
            updatedAt: new Date()
          };
        }
        return workflow;
      })
    })),

    completePreparationStage: (workflowId, stageId, notes) => set((state) => ({
      preparationWorkflows: state.preparationWorkflows.map(workflow => {
        if (workflow.id === workflowId) {
          const updatedStages = workflow.stages.map((stage) =>
            stage.id === stageId
              ? {
                ...stage,
                isCompleted: true,
                status: 'completed' as const,
                endTime: new Date(),
                notes: notes || stage.notes
              }
              : stage
          );

          const completedStages = updatedStages.filter(stage => stage.isCompleted).length;
          const totalProgress = Math.round((completedStages / updatedStages.length) * 100);
          const isAllCompleted = completedStages === updatedStages.length;

          const currentStageIndex = updatedStages.findIndex(s => s.id === stageId);
          const nextStageIndex = currentStageIndex >= 0 ? currentStageIndex + 1 : workflow.currentStageIndex;

          return {
            ...workflow,
            stages: updatedStages,
            currentStageIndex: isAllCompleted ? workflow.currentStageIndex : nextStageIndex,
            totalProgress,
            status: isAllCompleted ? 'completed' as const : 'in_progress' as const,
            actualEndTime: isAllCompleted ? new Date() : workflow.actualEndTime,
            updatedAt: new Date()
          };
        }
        return workflow;
      })
    })),

    updatePreparationStatus: (workflowId, status) => set((state) => ({
      preparationWorkflows: state.preparationWorkflows.map(workflow =>
        workflow.id === workflowId
          ? {
            ...workflow,
            status,
            startTime: status === 'in_progress' && !workflow.startTime ? new Date() : workflow.startTime,
            updatedAt: new Date()
          }
          : workflow
      )
    })),

    getPreparationWorkflows: () => {
      const state = get();
      return state.preparationWorkflows;
    },

    getActivePreparationWorkflows: () => {
      const state = get();
      return state.preparationWorkflows.filter(workflow =>
        workflow.status === 'in_progress' || workflow.status === 'paused'
      );
    },

    getPreparationWorkflowById: (workflowId) => {
      const state = get();
      return state.preparationWorkflows.find(workflow => workflow.id === workflowId);
    },

    getPreparationWorkflowByBatchId: (batchId) => {
      const state = get();
      return state.preparationWorkflows.find(workflow => workflow.batchId === batchId);
    },

    initializePreparationTemplates: () => set((state) => {
      if (state.preparationTemplates.length === 0) {
        const templates: PreparationTemplate[] = [
          {
            id: 'template-pan-blanco',
            productId: 'pan-blanco',
            productName: 'Pan Blanco',
            category: 'Panes',
            totalEstimatedTime: 240, // 4 horas
            stages: [
              {
                name: 'Preparación de ingredientes',
                description: 'Pesar y preparar todos los ingredientes necesarios',
                estimatedDuration: 15,
                order: 1,
                status: 'pending'
              },
              {
                name: 'Mezclado',
                description: 'Mezclar harina, agua, levadura y sal hasta formar una masa homogénea',
                estimatedDuration: 20,
                order: 2,
                status: 'pending'
              },
              {
                name: 'Amasado',
                description: 'Amasar la masa hasta desarrollar el gluten adecuadamente',
                estimatedDuration: 25,
                order: 3,
                status: 'pending'
              },
              {
                name: 'Primera fermentación',
                description: 'Dejar reposar la masa para la primera fermentación',
                estimatedDuration: 90,
                order: 4,
                status: 'pending'
              },
              {
                name: 'Formado',
                description: 'Dar forma a los panes individuales',
                estimatedDuration: 20,
                order: 5,
                status: 'pending'
              },
              {
                name: 'Segunda fermentación',
                description: 'Fermentación final antes del horneado',
                estimatedDuration: 45,
                order: 6,
                status: 'pending'
              },
              {
                name: 'Horneado',
                description: 'Hornear los panes a la temperatura adecuada',
                estimatedDuration: 25,
                order: 7,
                status: 'pending'
              }
            ]
          },
          {
            id: 'template-croissant',
            productId: 'croissant',
            productName: 'Croissant',
            category: 'Bollería',
            totalEstimatedTime: 480, // 8 horas
            stages: [
              {
                name: 'Preparación de masa base',
                description: 'Preparar la masa base con harina, agua, levadura y sal',
                estimatedDuration: 30,
                order: 1,
                status: 'pending'
              },
              {
                name: 'Preparación de mantequilla',
                description: 'Preparar el bloque de mantequilla para el laminado',
                estimatedDuration: 20,
                order: 2,
                status: 'pending'
              },
              {
                name: 'Primer laminado',
                description: 'Incorporar la mantequilla y realizar el primer pliegue',
                estimatedDuration: 30,
                order: 3,
                status: 'pending'
              },
              {
                name: 'Reposo en frío',
                description: 'Refrigerar la masa entre laminados',
                estimatedDuration: 60,
                order: 4,
                status: 'pending'
              },
              {
                name: 'Segundo laminado',
                description: 'Realizar el segundo pliegue',
                estimatedDuration: 20,
                order: 5,
                status: 'pending'
              },
              {
                name: 'Reposo final',
                description: 'Último reposo en refrigeración',
                estimatedDuration: 120,
                order: 6,
                status: 'pending'
              },
              {
                name: 'Formado',
                description: 'Cortar y formar los croissants',
                estimatedDuration: 40,
                order: 7,
                status: 'pending'
              },
              {
                name: 'Fermentación final',
                description: 'Fermentación antes del horneado',
                estimatedDuration: 120,
                order: 8,
                status: 'pending'
              },
              {
                name: 'Horneado',
                description: 'Hornear los croissants',
                estimatedDuration: 18,
                order: 9,
                status: 'pending'
              }
            ]
          }
        ];
        return { preparationTemplates: templates };
      }
      return state;
    }),

    getPreparationTemplateByProductId: (productId) => {
      const state = get();
      return state.preparationTemplates.find(template => template.productId === productId);
    },

    // Implementaciones de productos terminados
    addFinishedProduct: (product) => set((state) => {
      const newProduct: FinishedProduct = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return {
        finishedProducts: [newProduct, ...state.finishedProducts]
      };
    }),

    updateFinishedProductStatus: (productId, status, notes) => set((state) => ({
      finishedProducts: state.finishedProducts.map(product =>
        product.id === productId
          ? {
            ...product,
            status,
            notes: notes || product.notes,
            updatedAt: new Date()
          }
          : product
      )
    })),

    markProductAvailableForSale: (productId, _unitPrice) => set((state) => {
      const product = state.finishedProducts.find(p => p.id === productId);
      if (!product) return state;

      // Actualizar estado del producto terminado
      const updatedFinishedProducts = state.finishedProducts.map(p =>
        p.id === productId
          ? { ...p, status: 'available_for_sale' as const, updatedAt: new Date() }
          : p
      );

      // Actualizar o crear stock del producto
      const existingStock = state.productStocks.find(stock => stock.productId === product.productId);
      let updatedProductStocks;

      if (existingStock) {
        updatedProductStocks = state.productStocks.map(stock =>
          stock.productId === product.productId
            ? {
              ...stock,
              availableQuantity: stock.availableQuantity + product.quantity,
              totalQuantity: stock.totalQuantity + product.quantity,
              lastUpdated: new Date()
            }
            : stock
        );
      } else {
        const newStock: ProductStock = {
          id: Date.now().toString(),
          productId: product.productId,
          productName: product.productName,
          availableQuantity: product.quantity,
          reservedQuantity: 0,
          totalQuantity: product.quantity,
          lastUpdated: new Date(),
          location: 'counter'
        };
        updatedProductStocks = [newStock, ...state.productStocks];
      }

      // Crear notificación
      const notification = {
        type: 'inventory' as const,
        title: 'Producto Disponible para Venta',
        message: `${product.productName} (${product.quantity} unidades) está disponible en mostrador`,
        priority: 'medium' as const
      };

      return {
        finishedProducts: updatedFinishedProducts,
        productStocks: updatedProductStocks,
        notifications: [{
          ...notification,
          id: Date.now().toString(),
          createdAt: new Date(),
          read: false
        }, ...state.notifications]
      };
    }),

    getFinishedProducts: () => {
      const state = get();
      return state.finishedProducts;
    },

    getFinishedProductsHistory: (filters) => {
      const state = get();
      let products = state.finishedProducts;

      if (filters) {
        if (filters.startDate) {
          products = products.filter(p => p.completionTime >= filters.startDate!);
        }
        if (filters.endDate) {
          products = products.filter(p => p.completionTime <= filters.endDate!);
        }
        if (filters.bakerId) {
          products = products.filter(p => p.bakerId === filters.bakerId);
        }
        if (filters.productId) {
          products = products.filter(p => p.productId === filters.productId);
        }
      }

      return products.sort((a, b) => b.completionTime.getTime() - a.completionTime.getTime());
    },

    getAvailableForSaleProducts: () => {
      const state = get();
      return state.finishedProducts.filter(product => product.status === 'available_for_sale');
    },

    getReadyProducts: () => {
      const state = get();
      return state.finishedProducts.filter(product => product.status === 'ready');
    },

    // Implementaciones de registros de venta
    addProductSaleRecord: (record) => set((state) => {
      const newRecord: ProductSaleRecord = {
        ...record,
        id: Date.now().toString(),
        saleDate: new Date()
      };
      return {
        productSaleRecords: [newRecord, ...state.productSaleRecords]
      };
    }),

    getProductSaleRecords: () => {
      const state = get();
      return state.productSaleRecords;
    },

    getSalesByDateRange: (startDate, endDate) => {
      const state = get();
      return state.productSaleRecords.filter(record =>
        record.saleDate >= startDate && record.saleDate <= endDate
      );
    },

    // Implementaciones de stock de productos
    updateProductStock: (productId, updates) => set((state) => ({
      productStocks: state.productStocks.map(stock =>
        stock.productId === productId
          ? { ...stock, ...updates, lastUpdated: new Date() }
          : stock
      )
    })),

    getProductStock: (productId) => {
      const state = get();
      return state.productStocks.find(stock => stock.productId === productId);
    },

    getAllProductStocks: () => {
      const state = get();
      return state.productStocks;
    },

    // Implementaciones de gestión de hornos
    addOven: (ovenConfig) => set((state) => {
      const now = new Date();
      const newOven: OvenStatus = {
        ...ovenConfig,
        id: `horno-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        // Inicializar estadísticas de utilización para nuevos hornos
        utilizationStats: ovenConfig.utilizationStats || {
          totalHoursUsed: 0,
          batchesCompleted: 0,
          averageEfficiency: 0
        }
      };

      // Agregar notificación
      get().addNotification({
        type: 'system',
        title: 'Nuevo Horno Agregado',
        message: `Horno "${newOven.name}" ha sido agregado al sistema`,
        priority: 'medium'
      });

      return {
        ovenStatuses: [...state.ovenStatuses, newOven]
      };
    }),

    removeOven: (ovenId) => {
      const state = get();
      const oven = state.ovenStatuses.find(o => o.id === ovenId);

      if (!oven) {
        console.warn(`Horno con ID ${ovenId} no encontrado`);
        return false;
      }

      // Verificar si el horno puede ser eliminado
      if (!get().canRemoveOven(ovenId)) {
        get().addNotification({
          type: 'system',
          title: 'Error al Eliminar Horno',
          message: `No se puede eliminar el horno "${oven.name}" porque está en uso o no es removible`,
          priority: 'high'
        });
        return false;
      }

      set((state) => ({
        ovenStatuses: state.ovenStatuses.filter(o => o.id !== ovenId)
      }));

      // Agregar notificación de éxito
      get().addNotification({
        type: 'system',
        title: 'Horno Eliminado',
        message: `Horno "${oven.name}" ha sido eliminado del sistema`,
        priority: 'medium'
      });

      return true;
    },

    updateOvenConfiguration: (ovenId, updates) => set((state) => ({
      ovenStatuses: state.ovenStatuses.map(oven =>
        oven.id === ovenId
          ? { ...oven, ...updates, updatedAt: new Date() }
          : oven
      )
    })),

    canRemoveOven: (ovenId) => {
      const state = get();
      const oven = state.ovenStatuses.find(o => o.id === ovenId);

      if (!oven) return false;

      // No se puede eliminar si:
      // 1. No es removible
      // 2. Está en uso (no idle)
      // 3. Tiene un lote asignado
      return oven.isRemovable &&
        oven.status === 'idle' &&
        !oven.currentBatchId;
    },

    getOvenUtilizationStats: () => {
      const state = get();
      return state.ovenStatuses.map(oven => {
        // Verificar si utilizationStats existe, si no, usar valores por defecto
        const utilizationStats = oven.utilizationStats || {
          totalHoursUsed: 0,
          batchesCompleted: 0,
          averageEfficiency: 0
        };

        const totalHoursUsed = utilizationStats.totalHoursUsed || 0;
        const averageEfficiency = utilizationStats.averageEfficiency || 0;

        return {
          ovenId: oven.id,
          utilizationRate: Math.round((totalHoursUsed / (24 * 30)) * 100), // % del mes
          efficiency: averageEfficiency
        };
      });
    },

    getOvensRequiringMaintenance: () => {
      const state = get();
      const now = new Date();
      return state.ovenStatuses.filter(oven =>
        oven.maintenanceSchedule &&
        oven.maintenanceSchedule.nextMaintenance &&
        oven.maintenanceSchedule.nextMaintenance <= now
      );
    },

    // Función para actualizar estadísticas de utilización cuando se completa un lote
    updateOvenUtilizationStats: (ovenId: string, batchDuration: number) => set((state) => ({
      ovenStatuses: state.ovenStatuses.map(oven => {
        if (oven.id === ovenId) {
          // Inicializar utilizationStats si no existe
          const currentStats = oven.utilizationStats || {
            totalHoursUsed: 0,
            batchesCompleted: 0,
            averageEfficiency: 0
          };

          const newTotalHours = currentStats.totalHoursUsed + (batchDuration / 60);
          const newBatchesCompleted = currentStats.batchesCompleted + 1;
          const currentEfficiency = oven.efficiency || 85;
          const newAverageEfficiency = Math.round(
            (currentStats.averageEfficiency * currentStats.batchesCompleted + currentEfficiency) / newBatchesCompleted
          );

          return {
            ...oven,
            utilizationStats: {
              totalHoursUsed: newTotalHours,
              batchesCompleted: newBatchesCompleted,
              averageEfficiency: newAverageEfficiency
            },
            updatedAt: new Date()
          };
        }
        return oven;
      })
    })),

    // Implementación de funciones faltantes
    updateBatchStatus: (batchId, status) => set((state) => ({
      productionBatches: state.productionBatches.map(b => b.id === batchId ? { ...b, status } : b)
    })),

    updateMaterialUsage: (id, updates) => set((state) => ({
      materialUsages: state.materialUsages.map(u => u.id === id ? { ...u, ...updates } : u)
    })),
    getMaterialUsageByDate: (startDate, endDate) => {
      // Cast to any to avoid type errors if date/id missing in interface
      return get().materialUsages.filter(u => {
        const d = (u as any).date || (u as any).timestamp;
        if (!d) return false;
        const date = new Date(d);
        return date >= startDate && date <= endDate;
      });
    },

    getBakerKPIsByDate: (startDate, endDate) => {
      return get().bakerKPIs.filter(k => {
        const d = (k as any).date;
        if (!d) return false;
        return new Date(d) >= startDate && new Date(d) <= endDate;
      });
    },
    getBakerKPIsByBaker: (bakerId) => {
      return get().bakerKPIs.filter(k => k.bakerId === bakerId);
    },

    getQualityChecksByProduct: (productId) => {
      return get().qualityChecks.filter(q => q.productName === productId);
    },
    updateStockAlert: (alertId, updates) => set((state) => ({
      stockAlerts: state.stockAlerts.map(a => a.id === alertId ? { ...a, ...updates } : a)
    })),

    // Métodos para useOptimizedStore hooks
    getBakerKPIs: () => get().bakerKPIs,

    getKPIsByDateRange: (_startDate: Date, _endDate: Date) => {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        topSellingProducts: []
      };
    },

    getOrders: () => get().orders,

    // Función para verificar y programar mantenimiento automático
    checkMaintenanceSchedule: () => {
      const state = get();
      const now = new Date();
      const ovensNeedingMaintenance = state.ovenStatuses.filter(oven =>
        oven.maintenanceSchedule &&
        oven.maintenanceSchedule.nextMaintenance &&
        oven.maintenanceSchedule.nextMaintenance <= now &&
        oven.status === 'idle'
      );

      ovensNeedingMaintenance.forEach(oven => {
        get().addNotification({
          type: 'system',
          title: 'Mantenimiento Programado',
          message: `El horno "${oven.name}" requiere mantenimiento programado`,
          priority: 'high'
          // read implicitly false/handled by implementation
        });
      });

      return ovensNeedingMaintenance;
    }
  }),
  {
    name: 'pambazo-storage',
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      cart: state.cart,
      theme: state.theme,
      inventoryEntries: state.inventoryEntries,
      financialTransactions: state.financialTransactions,
      tables: state.tables,
      orders: state.orders,
      productionBatches: state.productionBatches,
      materialUsages: state.materialUsages,
      bakerKPIs: state.bakerKPIs,
      stockAlerts: state.stockAlerts,
      productionSchedules: state.productionSchedules,
      ovenStatuses: state.ovenStatuses,
      qualityChecks: state.qualityChecks,
      preparationWorkflows: state.preparationWorkflows,
      preparationTemplates: state.preparationTemplates,
      finishedProducts: state.finishedProducts,
      productSaleRecords: state.productSaleRecords,
      productStocks: state.productStocks,
      users: state.users
    })
  }
));

// Selectores específicos para optimización
export const useUser = () => useStore(state => state.user);
export const useCart = () => useStore(state => state.cart);
export const useNotifications = () => useStore(state => state.notifications);
export const useTheme = () => useStore(state => state.theme);
export const useDeviceInfo = () => useStore(state => state.deviceInfo);
export const useIsAuthenticated = () => useStore(state => state.isAuthenticated);