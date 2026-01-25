// 🥖 PAMBAZO - Tipos TypeScript Compartidos
// Definiciones de tipos según la arquitectura técnica

// Tipos de Usuario
export type UserRole = 'admin' | 'waiter' | 'kitchen' | 'cocina' | 'employee' | 'customer' | 'baker' | 'propietario' | 'owner';

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  createdAt?: Date | string;
  lastLogin?: Date | string;
  updatedAt?: Date | string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferences?: Record<string, any>;
}

// Tipos de Producto
export interface Material {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  cost: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  rating: number;
  stock: number;
}

// Tipos de Categoría
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
}

// Tipos de Item de Pedido
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  product?: Product;
  quantity: number;
  price: number;
  notes?: string;
  customizations?: any[];
}

// Tipos de Pedido
export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  customerId?: string;
  customerName: string;
  customer?: User;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'delivered';
  total: number;
  deliveryType?: 'pickup' | 'delivery';
  address?: string;
  paymentMethod?: 'cash' | 'card';
  notes?: string;
  createdAt: string;
  updatedAt?: string | Date;
  estimatedTime?: number;
  waiterId?: string;
  waiterName?: string;
}

// Tipos de Mesa
export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  waiterId?: string | undefined;
  waiterName?: string | undefined;
  waiter?: User;
  currentOrder?: string;
  occupiedSince?: Date | string | undefined;
  guestCount?: number;
}

// Tipos de Inventario
export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  cost: number;
  supplier?: string | undefined;
  lastRestocked: Date;
}

// Tipos de Entrada de Inventario
export interface InventoryEntry {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  invoiceNumber?: string | undefined;
  entryDate: Date;
  userId: string;
  userName: string;
  productId?: string | undefined;
  productName?: string | undefined;
}

// Tipos de Transacción Financiera
export interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  reference?: string | undefined;
  date: Date;
  userId: string;
  userName: string;
}

// Tipos de Carrito
export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

// Tipos de Analytics
export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Product[];
  salesByCategory: { category: string; amount: number }[];
}

export interface PerformanceMetrics {
  averagePreparationTime: number;
  customerSatisfaction: number;
  tableOccupancy: number;
  waiterEfficiency: { waiterId: string; ordersServed: number }[];
}

// Tipos de Notificación
export interface Notification {
  id: string;
  type: 'order' | 'inventory' | 'table' | 'system' | 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: Date;
  userId?: string;
}

// Tipos de Configuración PWA
export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  startUrl: string;
  scope: string;
}

// Tipos de Dispositivo
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
}

// Tipos de Estado de la Aplicación
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  deviceInfo: DeviceInfo;
  cart: CartItem[];
  notifications: Notification[];
  theme: 'light' | 'dark' | 'system';
}

// Tipos de Respuesta de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos de Filtros
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  search?: string;
}

export interface OrderFilters {
  status?: Order['status'];
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
  waiterId?: string;
}

// Tipos de Configuración de Tema
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    sans: string[];
    mono: string[];
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Tipos de Eventos del Sistema
export interface SystemEvent {
  id: string;
  type: 'user_login' | 'order_created' | 'order_updated' | 'inventory_low' | 'table_occupied';
  data: any;
  timestamp: Date;
  userId?: string;
}

// Tipos de Configuración de Navegación Móvil
export interface MobileNavTab {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  roles: User['role'][];
}

// Tipos de Gestos
export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

// Tipos de Configuración de Sheet
export interface SheetConfig {
  isOpen: boolean;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Tipos específicos del Panadero
export interface ProductionBatch {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  startTime: Date;
  estimatedEndTime: Date;
  actualEndTime?: Date;
  status: 'preparing' | 'baking' | 'cooling' | 'ready' | 'completed';
  ovenId?: string;
  temperature?: number;
  bakerId: string;
  bakerName: string;
  notes?: string;
  estimatedBakingTime?: number;
  materialsUsed: MaterialUsage[];
}

export interface MaterialUsage {
  id: string;
  materialId: string;
  materialName: string;
  quantityUsed: number;
  unit: string;
  cost: number;
  batchId: string;
  usageDate: Date;
  date: Date; // para compatibilidad
  notes?: string | undefined;
}

export interface BakerKPI {
  id: string;
  date: Date;
  totalProduction: number;
  batchesCompleted: number;
  averageBakeTime: number;
  ovenEfficiency: number;
  materialWaste: number;
  qualityScore: number;
  energyConsumption?: number;
  bakerId: string;
}

export interface StockAlert {
  id: string;
  materialId: string;
  materialName: string;
  currentStock: number;
  minStock: number;
  alertLevel: 'low' | 'critical' | 'out';
  estimatedDaysLeft: number;
  suggestedOrderQuantity: number;
  createdAt: Date;
  acknowledged: boolean;
}

export interface ProductionSchedule {
  id: string;
  date: Date;
  shifts: ProductionShift[];
  totalPlannedProduction: number;
  status: 'planned' | 'in_progress' | 'completed';
  notes?: string;
}

export interface ProductionShift {
  id: string;
  startTime: string;
  endTime: string;
  bakerId: string;
  bakerName: string;
  plannedBatches: PlannedBatch[];
  actualProduction?: number;
}

export interface PlannedBatch {
  productId: string;
  productName: string;
  quantity: number;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high';
  specialInstructions?: string;
}

export interface OvenStatus {
  id: string;
  name: string;
  status: 'idle' | 'preheating' | 'baking' | 'cooling' | 'maintenance' | 'paused' | 'heating';
  currentTemperature: number;
  targetTemperature: number;
  currentBatch?: string; // Nombre del lote (legacy)
  currentBatchId?: string | undefined;
  estimatedAvailableTime?: Date;
  lastMaintenance: Date;
  efficiency: number;
  // Nuevos campos para gestión avanzada
  capacity: number; // Capacidad máxima en unidades
  maxTemperature: number; // Temperatura máxima soportada
  energyConsumption: number; // Consumo energético por hora
  maintenanceSchedule: {
    nextMaintenance: Date;
    maintenanceInterval: number; // días
    maintenanceType: 'routine' | 'deep' | 'repair';
  };
  utilizationStats: {
    totalHoursUsed: number;
    batchesCompleted: number;
    averageEfficiency: number;
    lastUsed?: Date;
  };
  isRemovable: boolean; // Indica si el horno puede ser eliminado
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityCheck {
  id: string;
  batchId: string;
  productName: string;
  checkDate: Date;
  appearance: number; // 1-10
  texture: number; // 1-10
  taste: number; // 1-10
  overallScore: number; // 1-10
  passed: boolean;
  notes?: string;
  checkerId: string;
  checkerName: string;
}

// Tipos para el sistema de preparación de lotes
export interface PreparationStage {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // en minutos
  order: number;
  isCompleted: boolean;
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: Date | undefined;
  endTime?: Date | undefined;
  notes?: string | undefined;
}

export interface PreparationWorkflow {
  id: string;
  batchId: string;
  productId: string;
  productName: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  currentStageIndex: number;
  stages: PreparationStage[];
  startTime?: Date | undefined;
  estimatedEndTime?: Date | undefined;
  actualEndTime?: Date | undefined;
  bakerId: string;
  bakerName: string;
  totalProgress: number; // 0-100
  notes?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface PreparationTemplate {
  id: string;
  productId: string;
  productName: string;
  stages: Omit<PreparationStage, 'id' | 'isCompleted' | 'startTime' | 'endTime' | 'notes'>[];
  totalEstimatedTime: number;
  category: string;
}

// Tipos para productos terminados y sistema de venta
export interface FinishedProduct {
  id: string;
  batchId: string;
  productId: string;
  productName: string;
  quantity: number;
  completionTime: Date; // Legacy
  completedAt: Date; // New standard
  qualityScore?: number;
  status: 'ready' | 'available_for_sale' | 'sold' | 'expired';
  bakerId: string;
  bakerName: string;
  ovenId?: string;
  expirationTime?: Date;
  qualityNotes?: string;
  notes?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSaleRecord {
  id: string;
  finishedProductId: string;
  productId: string;
  productName: string;
  quantitySold: number;
  unitPrice: number;
  totalAmount: number;
  saleType: 'counter' | 'pre_order' | 'delivery';
  customerId?: string;
  customerName?: string;
  sellerId: string;
  sellerName: string;
  saleDate: Date;
  paymentMethod?: 'cash' | 'card' | 'digital';
  notes?: string;
}

export interface ProductStock {
  id: string;
  productId: string;
  productName: string;
  availableQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  lastUpdated: Date;
  location: 'counter' | 'storage' | 'display';
  expirationDate?: Date;
}

// Exportar todos los tipos como un namespace
export namespace PAMBAZO {
  export type UserRole = User['role'];
  export type OrderStatus = Order['status'];
  export type TableStatus = Table['status'];
  export type DeliveryType = Order['deliveryType'];
  export type PaymentMethod = Order['paymentMethod'];
  export type NotificationType = Notification['type'];
  export type NotificationPriority = Notification['priority'];
  export type Theme = AppState['theme'];
  export type ProductionStatus = ProductionBatch['status'];
  export type AlertLevel = StockAlert['alertLevel'];
  export type OvenStatusType = OvenStatus['status'];
  export type ProductionScheduleStatus = ProductionSchedule['status'];
  export type PreparationStatus = PreparationWorkflow['status'];
  export type FinishedProductStatus = FinishedProduct['status'];
  export type SaleType = ProductSaleRecord['saleType'];
  export type StockLocation = ProductStock['location'];
}