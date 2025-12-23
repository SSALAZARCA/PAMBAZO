/**
 * Servicio de datos mock para desarrollo temporal
 * Simula operaciones de base de datos mientras se configura PostgreSQL
 */
import {
  BackendUser,
  BackendCategory,
  BackendProduct,
  BackendOrder,
  BackendOrderItem,
  BackendInventoryItem,
  BackendTable
} from '../types/index.js';

// Use backend types
type User = BackendUser;
type Category = BackendCategory;
type Product = BackendProduct;
type Order = BackendOrder;
type OrderItem = BackendOrderItem;
type InventoryItem = BackendInventoryItem;
type Table = BackendTable;

// Datos mock
let mockUsers: User[] = [
  {
    id: 1,
    name: 'Luis Rodríguez',
    email: 'owner@pambazo.com',
    password: '$2b$10$7eiseK8m9e7zrqDANwLz2uUGymm4zJRDU887phw.Z3S3LWyY/uBMu',
    role: 'owner',
    phone: '+57 300 123 4567',
    address: 'Oficina Principal',
    avatar: undefined,
    loyaltyPoints: 0,
    loyaltyTier: 'bronze',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Ana García',
    email: 'admin@pambazo.com',
    password: '$2b$10$hcXsG5ClLCycN7Ygjv01fuUQDXBdUerpgNgjdPNbICWbqOxX5nIku',
    role: 'admin',
    phone: '+57 300 234 5678',
    address: 'Oficina Central',
    avatar: undefined,
    loyaltyPoints: 0,
    loyaltyTier: 'bronze',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Carlos Mendoza',
    email: 'mesero@pambazo.com',
    password: '$2b$10$hcXsG5ClLCycN7Ygjv01fuUQDXBdUerpgNgjdPNbICWbqOxX5nIku',
    role: 'waiter',
    phone: '+57 300 345 6789',
    address: 'Sucursal Centro',
    avatar: undefined,
    loyaltyPoints: 0,
    loyaltyTier: 'bronze',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'María González',
    email: 'baker@pambazo.com',
    password: '$2b$10$hcXsG5ClLCycN7Ygjv01fuUQDXBdUerpgNgjdPNbICWbqOxX5nIku',
    role: 'baker',
    phone: '+57 300 456 7890',
    address: 'Área de Producción',
    avatar: undefined,
    loyaltyPoints: 0,
    loyaltyTier: 'bronze',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Sofia Martínez',
    email: 'employee@pambazo.com',
    password: '$2b$10$hcXsG5ClLCycN7Ygjv01fuUQDXBdUerpgNgjdPNbICWbqOxX5nIku',
    role: 'employee',
    phone: '+57 300 567 8901',
    address: 'Sucursal Centro',
    avatar: undefined,
    loyaltyPoints: 0,
    loyaltyTier: 'bronze',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Juan Pérez',
    email: 'customer@pambazo.com',
    password: '$2b$10$hcXsG5ClLCycN7Ygjv01fuUQDXBdUerpgNgjdPNbICWbqOxX5nIku',
    role: 'customer',
    phone: '+57 300 678 9012',
    address: 'Bogotá, Colombia',
    avatar: undefined,
    loyaltyPoints: 1250,
    loyaltyTier: 'silver',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let mockCategories: Category[] = [
  {
    id: 1,
    name: 'Panes Dulces',
    description: 'Variedad de panes dulces tradicionales',
    image_url: undefined,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Panes Salados',
    description: 'Panes para acompañar comidas',
    image_url: undefined,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Pasteles',
    description: 'Pasteles y postres especiales',
    image_url: undefined,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let mockProducts: Product[] = [
  {
    id: 1,
    name: 'Concha de Chocolate',
    description: 'Pan dulce tradicional con cobertura de chocolate',
    price: 15.00,
    category_id: 1,
    image_url: '/images/concha-chocolate.jpg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Bolillo',
    description: 'Pan blanco tradicional mexicano',
    price: 3.50,
    category_id: 2,
    image_url: '/images/bolillo.jpg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Pastel de Tres Leches',
    description: 'Delicioso pastel empapado en tres tipos de leche',
    price: 45.00,
    category_id: 3,
    image_url: '/images/tres-leches.jpg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let mockOrders: Order[] = [];
let mockOrderItems: OrderItem[] = [];
let mockInventory: InventoryItem[] = [
  { id: 1, product_id: 1, quantity: 50, min_stock: 10, max_stock: 100, last_updated: new Date().toISOString() },
  { id: 2, product_id: 2, quantity: 75, min_stock: 20, max_stock: 150, last_updated: new Date().toISOString() },
  { id: 3, product_id: 3, quantity: 8, min_stock: 5, max_stock: 20, last_updated: new Date().toISOString() }
];

let mockTables: Table[] = [
  {
    id: 1,
    table_number: 1,
    capacity: 4,
    location: 'Ventana principal',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    table_number: 2,
    capacity: 2,
    location: 'Terraza',
    is_available: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    table_number: 3,
    capacity: 6,
    location: 'Salón principal',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Contadores para IDs
let nextUserId = 7;
let nextCategoryId = 4;
let nextProductId = 4;
let nextOrderId = 1;
let nextOrderItemId = 1;
let nextInventoryId = 4;
let nextTableId = 4;

export class MockDataService {
  // Usuarios
  static async getAllUsers(filters?: any): Promise<User[]> {
    return [...mockUsers];
  }

  static async getUserById(id: number): Promise<User | null> {
    return mockUsers.find(user => user.id === id) || null;
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    return mockUsers.find(user => user.name === username) || null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return mockUsers.find(user => user.email === email) || null;
  }

  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: nextUserId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  }

  static async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const index = mockUsers.findIndex(user => user.id === id);
    if (index === -1) return null;

    mockUsers[index] = {
      ...mockUsers[index]!,
      ...updates,
      id: id,
      updated_at: new Date().toISOString()
    } as any;
    return mockUsers[index]!;
  }

  static async updateUserPassword(id: number, currentPassword: string, newPasswordHash: string): Promise<boolean> {
    const user = mockUsers.find(u => u.id === id);
    if (!user) return false;

    // Import comparePassword dynamically
    const { comparePassword } = await import('../utils/auth.js');
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) return false;

    // Update password
    const index = mockUsers.findIndex(u => u.id === id);
    mockUsers[index] = {
      ...mockUsers[index]!,
      password: newPasswordHash,
      updated_at: new Date().toISOString()
    } as any;
    return true;
  }

  static async deleteUser(id: number): Promise<boolean> {
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) return false;

    // In strict mode, we might just mark as inactive, but for delete we remove
    mockUsers.splice(index, 1);
    return true;
  }

  // Categorías
  static async getAllCategories(): Promise<Category[]> {
    return [...mockCategories];
  }

  static async getCategoryById(id: number): Promise<Category | null> {
    return mockCategories.find(cat => cat.id === id) || null;
  }

  static async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const newCategory: Category = {
      ...categoryData,
      id: nextCategoryId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockCategories.push(newCategory);
    return newCategory;
  }

  static async updateCategory(id: number, updates: Partial<Category>): Promise<Category | null> {
    const index = mockCategories.findIndex(category => category.id === id);
    if (index === -1) return null;

    mockCategories[index] = {
      ...mockCategories[index]!,
      ...updates,
      id: id,
      updated_at: new Date().toISOString()
    } as any;
    return mockCategories[index]!;
  }

  static async deleteCategory(id: number): Promise<boolean> {
    const index = mockCategories.findIndex(category => category.id === id);
    if (index === -1) return false;

    // Eliminar la categoría del array
    mockCategories.splice(index, 1);
    return true;
  }

  // Productos
  static async getAllProducts(): Promise<Product[]> {
    return [...mockProducts];
  }

  static async getProductById(id: number): Promise<Product | null> {
    return mockProducts.find(product => product.id === id) || null;
  }

  static async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return mockProducts.filter(product => product.category_id === categoryId);
  }

  static async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const newProduct: Product = {
      ...productData,
      id: nextProductId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockProducts.push(newProduct);
    return newProduct;
  }

  static async updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
    const index = mockProducts.findIndex(product => product.id === id);
    if (index === -1) return null;

    mockProducts[index] = {
      ...mockProducts[index]!,
      ...updates,
      id: id,
      updated_at: new Date().toISOString()
    } as any;
    return mockProducts[index]!;
  }

  // Órdenes
  static async getAllOrders(): Promise<Order[]> {
    return [...mockOrders];
  }

  static async getOrderById(id: number): Promise<Order | null> {
    return mockOrders.find(order => order.id === id) || null;
  }

  static async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const newOrder: Order = {
      ...orderData,
      id: nextOrderId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockOrders.push(newOrder);
    return newOrder;
  }

  static async updateOrder(id: number, updates: Partial<Order>): Promise<Order | null> {
    const index = mockOrders.findIndex(order => order.id === id);
    if (index === -1) return null;

    mockOrders[index] = {
      ...mockOrders[index]!,
      ...updates,
      id: id,
      updated_at: new Date().toISOString()
    } as any;
    return mockOrders[index]!;
  }

  static async deleteOrder(id: number, userId?: number, userRole?: string): Promise<boolean> {
    const index = mockOrders.findIndex(order => order.id === id);
    if (index === -1) return false;

    // Verificar permisos si es necesario
    if (userId && userRole !== 'admin') {
      const order = mockOrders[index]!;
      if (order.user_id !== userId) return false;
    }

    mockOrders.splice(index, 1);
    return true;
  }

  static async getOrderStats(filters: any): Promise<any> {
    const totalOrders = mockOrders.length;
    const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      average_order_value: averageOrderValue
    };
  }

  // Items de órdenes
  static async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return mockOrderItems.filter(item => item.order_id === orderId);
  }

  static async createOrderItem(itemData: Omit<OrderItem, 'id'>): Promise<OrderItem> {
    const newItem: OrderItem = {
      ...itemData,
      id: nextOrderItemId++
    };
    mockOrderItems.push(newItem);
    return newItem;
  }

  // Inventario
  static async getAllInventory(): Promise<InventoryItem[]> {
    return [...mockInventory];
  }

  static async getInventoryByProduct(productId: number): Promise<InventoryItem | null> {
    return mockInventory.find(item => item.product_id === productId) || null;
  }

  static async updateInventory(productId: number, quantity: number): Promise<InventoryItem | null> {
    const index = mockInventory.findIndex(item => item.product_id === productId);
    if (index === -1) return null;

    mockInventory[index] = {
      ...mockInventory[index]!,
      quantity,
      id: mockInventory[index]!.id,
      last_updated: new Date().toISOString()
    } as any;
    return mockInventory[index]!;
  }

  // Tablas
  static async getAllTables(): Promise<Table[]> {
    return [...mockTables];
  }

  static async getTableById(id: number): Promise<Table | null> {
    return mockTables.find(table => table.id === id) || null;
  }

  static async createTable(tableData: Omit<Table, 'id' | 'created_at' | 'updated_at'>): Promise<Table> {
    const newTable: Table = {
      ...tableData,
      id: nextTableId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockTables.push(newTable);
    return newTable;
  }

  static async updateTable(id: number, updates: Partial<Table>): Promise<Table | null> {
    const index = mockTables.findIndex(table => table.id === id);
    if (index === -1) return null;

    mockTables[index] = {
      ...mockTables[index]!,
      ...updates,
      id: id,
      updated_at: new Date().toISOString()
    } as any;
    return mockTables[index]!;
  }

  static async deleteTable(id: number): Promise<boolean> {
    const index = mockTables.findIndex(table => table.id === id);
    if (index === -1) return false;

    mockTables.splice(index, 1);
    return true;
  }

  static async updateTableStatus(id: number, isAvailable: boolean): Promise<Table | null> {
    const index = mockTables.findIndex(table => table.id === id);
    if (index === -1) return null;

    mockTables[index] = {
      ...mockTables[index]!,
      is_available: isAvailable,
      id: id,
      updated_at: new Date().toISOString()
    } as any;
    return mockTables[index]!;
  }

  static async getTableStats() {
    const totalTables = mockTables.length;
    const availableTables = mockTables.filter(table => table.is_available).length;
    const occupiedTables = totalTables - availableTables;

    return {
      total: totalTables,
      available: availableTables,
      occupied: occupiedTables,
      occupancy_rate: totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0
    };
  }

  // Utilidades
  static async getDatabaseStats() {
    return {
      users: mockUsers.length,
      categories: mockCategories.length,
      products: mockProducts.length,
      orders: mockOrders.length,
      inventory_items: mockInventory.length,
      tables: mockTables.length,
      database_type: 'mock',
      status: 'connected'
    };
  }

  static async resetData() {
    mockUsers.splice(2); // Mantener admin y empleado1
    mockCategories.splice(3); // Mantener categorías iniciales
    mockProducts.splice(3); // Mantener productos iniciales
    mockOrders.length = 0;
    mockOrderItems.length = 0;
    mockInventory.splice(3); // Mantener inventario inicial
    mockTables.splice(3); // Mantener tablas iniciales

    // Resetear contadores
    nextUserId = 3;
    nextCategoryId = 4;
    nextProductId = 4;
    nextOrderId = 1;
    nextOrderItemId = 1;
    nextInventoryId = 4;
    nextTableId = 4;
  }
}
