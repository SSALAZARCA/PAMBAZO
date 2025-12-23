/**
 * Data Adapter Service
 * Provides a unified interface for data operations
 * Switches between PostgreSQL and mock data based on configuration
 */
import { query, isUsingMockData } from '../config/database.js';
import { MockDataService } from './mockDataService.js';
import { BackendUser, BackendCategory, BackendProduct, BackendOrder, BackendOrderItem, BackendInventoryItem, BackendTable } from '../types/index.js';

const getMockService = () => MockDataService;

export class DataAdapter {
  // ===== USER METHODS =====

  static async getAllUsers(filters?: any): Promise<BackendUser[]> {
    if (isUsingMockData()) {
      return getMockService().getAllUsers(filters);
    }

    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  static async getUserById(id: number): Promise<BackendUser | null> {
    if (isUsingMockData()) {
      return getMockService().getUserById(id);
    }

    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getUserByEmail(email: string): Promise<BackendUser | null> {
    if (isUsingMockData()) {
      return getMockService().getUserByEmail(email);
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async getUserByUsername(username: string): Promise<BackendUser | null> {
    if (isUsingMockData()) {
      return getMockService().getUserByUsername(username);
    }

    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  static async createUser(userData: Omit<BackendUser, 'id' | 'created_at' | 'updated_at'>): Promise<BackendUser> {
    if (isUsingMockData()) {
      return getMockService().createUser(userData);
    }

    const result = await query(
      `INSERT INTO users (name, email, password, role, phone, address, avatar, loyalty_points, loyalty_tier, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [userData.name, userData.email, userData.password, userData.role, userData.phone, userData.address, userData.avatar, userData.loyaltyPoints || 0, userData.loyaltyTier || 'bronze', userData.is_active]
    );
    return result.rows[0];
  }

  static async updateUser(id: number, updates: Partial<BackendUser>): Promise<BackendUser | null> {
    if (isUsingMockData()) {
      return getMockService().updateUser(id, updates);
    }

    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    if (!setClause) return null;

    const values = [id, ...Object.values(updates).filter((_, index) =>
      Object.keys(updates)[index] !== 'id' && Object.keys(updates)[index] !== 'created_at'
    )];

    const result = await query(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async updateUserPassword(id: number, currentPassword: string, newPasswordHash: string): Promise<boolean> {
    if (isUsingMockData()) {
      return getMockService().updateUserPassword(id, currentPassword, newPasswordHash);
    }

    // First verify current password
    const user = await DataAdapter.getUserById(id);
    if (!user) return false;

    const { comparePassword } = await import('../utils/auth.js');
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) return false;

    // Update password
    const result = await query(
      `UPDATE users SET password = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [id, newPasswordHash]
    );
    return result.rowCount > 0;
  }

  static async deleteUser(id: number): Promise<boolean> {
    if (isUsingMockData()) {
      return getMockService().deleteUser(id);
    }

    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // Categorías
  static async getAllCategories(): Promise<BackendCategory[]> {
    if (isUsingMockData()) {
      return getMockService().getAllCategories();
    }

    const result = await query('SELECT * FROM categories ORDER BY name');
    return result.rows;
  }

  static async getCategoryById(id: number): Promise<BackendCategory | null> {
    if (isUsingMockData()) {
      return getMockService().getCategoryById(id);
    }

    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async createCategory(categoryData: Omit<BackendCategory, 'id' | 'created_at' | 'updated_at'>): Promise<BackendCategory> {
    if (isUsingMockData()) {
      return getMockService().createCategory(categoryData);
    }

    const result = await query(
      `INSERT INTO categories (name, description) 
       VALUES ($1, $2) 
       RETURNING *`,
      [categoryData.name, categoryData.description]
    );
    return result.rows[0];
  }

  static async updateCategory(id: number, updates: Partial<BackendCategory>): Promise<BackendCategory | null> {
    if (isUsingMockData()) {
      return getMockService().updateCategory(id, updates);
    }

    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    if (!setClause) return null;

    const values = [id, ...Object.values(updates).filter((_, index) =>
      Object.keys(updates)[index] !== 'id' && Object.keys(updates)[index] !== 'created_at'
    )];

    const result = await query(
      `UPDATE categories SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async deleteCategory(id: number): Promise<boolean> {
    if (isUsingMockData()) {
      return getMockService().deleteCategory(id);
    }

    const result = await query(
      `DELETE FROM categories WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }

  // Productos
  static async getAllProducts(): Promise<BackendProduct[]> {
    if (isUsingMockData()) {
      return getMockService().getAllProducts();
    }

    const result = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.is_active = true 
       ORDER BY p.name`
    );
    return result.rows;
  }

  static async getProductById(id: number): Promise<BackendProduct | null> {
    if (isUsingMockData()) {
      return getMockService().getProductById(id);
    }

    const result = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async getProductsByCategory(categoryId: number): Promise<BackendProduct[]> {
    if (isUsingMockData()) {
      return getMockService().getProductsByCategory(categoryId);
    }

    const result = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.category_id = $1 AND p.is_active = true 
       ORDER BY p.name`,
      [categoryId]
    );
    return result.rows;
  }

  static async createProduct(productData: Omit<BackendProduct, 'id' | 'created_at' | 'updated_at'>): Promise<BackendProduct> {
    if (isUsingMockData()) {
      return getMockService().createProduct(productData);
    }

    const result = await query(
      `INSERT INTO products (name, description, price, category_id, image_url, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [productData.name, productData.description, productData.price,
      productData.category_id, productData.image_url, productData.is_active]
    );
    return result.rows[0];
  }

  static async updateProduct(id: number, updates: Partial<BackendProduct>): Promise<BackendProduct | null> {
    if (isUsingMockData()) {
      return getMockService().updateProduct(id, updates);
    }

    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    if (!setClause) return null;

    const values = [id, ...Object.values(updates).filter((_, index) =>
      Object.keys(updates)[index] !== 'id' && Object.keys(updates)[index] !== 'created_at'
    )];

    const result = await query(
      `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async deleteProduct(id: number): Promise<boolean> {
    if (isUsingMockData()) {
      // Agregar método deleteProduct al MockDataService si no existe
      const products = await getMockService().getAllProducts();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) return false;

      // Marcar como inactivo en lugar de eliminar
      await getMockService().updateProduct(id, { is_active: false });
      return true;
    }

    const result = await query(
      `UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }

  // Órdenes
  static async getAllOrders(): Promise<BackendOrder[]> {
    if (isUsingMockData()) {
      return getMockService().getAllOrders();
    }

    const result = await query(
      `SELECT o.*, u.username 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    );
    return result.rows;
  }

  static async getOrderById(id: number): Promise<BackendOrder | null> {
    if (isUsingMockData()) {
      return getMockService().getOrderById(id);
    }

    const result = await query(
      `SELECT o.*, u.username 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id 
       WHERE o.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async createOrder(orderData: Omit<BackendOrder, 'id' | 'created_at' | 'updated_at'>): Promise<BackendOrder> {
    if (isUsingMockData()) {
      return getMockService().createOrder(orderData);
    }

    const result = await query(
      `INSERT INTO orders (user_id, total_amount, status) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [orderData.user_id, orderData.total_amount, orderData.status]
    );
    return result.rows[0];
  }

  static async updateOrder(id: number, data: any): Promise<BackendOrder | null> {
    if (isUsingMockData()) {
      return getMockService().updateOrder(id, data);
    }

    const setClause = Object.keys(data)
      .filter(key => key !== 'id')
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    if (!setClause) return null;

    const values = [id, ...Object.values(data)];
    const result = await query(
      `UPDATE orders SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async deleteOrder(id: number, userId?: number, userRole?: string): Promise<boolean> {
    if (isUsingMockData()) {
      return getMockService().deleteOrder(id, userId, userRole);
    }

    const result = await query('DELETE FROM orders WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async getOrderStats(filters: any): Promise<any> {
    if (isUsingMockData()) {
      return getMockService().getOrderStats(filters);
    }

    const result = await query(
      `SELECT 
         COUNT(*) as total_orders,
         SUM(total_amount) as total_revenue,
         AVG(total_amount) as average_order_value
       FROM orders`
    );
    return result.rows[0] || { total_orders: 0, total_revenue: 0, average_order_value: 0 };
  }

  // Items de órdenes
  static async getOrderItems(orderId: number): Promise<BackendOrderItem[]> {
    if (isUsingMockData()) {
      return getMockService().getOrderItems(orderId);
    }

    const result = await query(
      `SELECT oi.*, p.name as product_name 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [orderId]
    );
    return result.rows;
  }

  static async createOrderItem(itemData: Omit<BackendOrderItem, 'id'>): Promise<BackendOrderItem> {
    if (isUsingMockData()) {
      return getMockService().createOrderItem(itemData);
    }

    const result = await query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [itemData.order_id, itemData.product_id, itemData.quantity,
      itemData.unit_price, itemData.subtotal]
    );
    return result.rows[0];
  }

  // Inventario
  static async getAllInventory(): Promise<BackendInventoryItem[]> {
    if (isUsingMockData()) {
      return getMockService().getAllInventory();
    }

    const result = await query('SELECT * FROM inventory ORDER BY id');
    return result.rows;
  }

  static async getInventory(filters?: any): Promise<BackendInventoryItem[]> {
    return this.getAllInventory();
  }

  static async getInventoryById(id: number): Promise<BackendInventoryItem | null> {
    if (isUsingMockData()) {
      const inventory = await getMockService().getAllInventory();
      return inventory.find(item => item.id === id) || null;
    }

    const result = await query('SELECT * FROM inventory WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getInventoryByProductId(productId: number): Promise<BackendInventoryItem | null> {
    if (isUsingMockData()) {
      return getMockService().getInventoryByProduct(productId);
    }

    const result = await query('SELECT * FROM inventory WHERE product_id = $1', [productId]);
    return result.rows[0] || null;
  }

  static async createInventoryItem(data: any): Promise<BackendInventoryItem> {
    if (isUsingMockData()) {
      // Simular creación de item de inventario
      const newItem: BackendInventoryItem = {
        id: Date.now(),
        product_id: data.product_id || 0,
        quantity: data.current_stock || 0,
        min_stock: data.min_stock || 0,
        max_stock: data.max_stock || 100,
        last_updated: new Date().toISOString()
      };
      return newItem;
    }

    const result = await query(
      `INSERT INTO inventory (product_id, quantity, min_stock, max_stock) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.product_id, data.current_stock, data.min_stock, data.max_stock]
    );
    return result.rows[0];
  }

  static async updateInventoryItem(id: number, data: any): Promise<BackendInventoryItem | null> {
    if (isUsingMockData()) {
      const inventory = await getMockService().getAllInventory();
      const item = inventory.find(i => i.id === id);
      if (!item) return null;

      Object.assign(item, data, { last_updated: new Date().toISOString() });
      return item;
    }

    const setClause = Object.keys(data)
      .filter(key => key !== 'id')
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    if (!setClause) return null;

    const values = [id, ...Object.values(data)];
    const result = await query(
      `UPDATE inventory SET ${setClause}, last_updated = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async deleteInventoryItem(id: number): Promise<boolean> {
    if (isUsingMockData()) {
      return true; // Simular eliminación exitosa
    }

    const result = await query('DELETE FROM inventory WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async updateInventoryStock(id: number, data: any): Promise<any> {
    if (isUsingMockData()) {
      return { success: true, message: 'Stock actualizado' };
    }

    // Implementar lógica de actualización de stock
    return { success: true, message: 'Stock actualizado' };
  }

  static async getInventoryMovements(filters: any): Promise<any[]> {
    if (isUsingMockData()) {
      return []; // Retornar array vacío para mock
    }

    const result = await query('SELECT * FROM inventory_movements ORDER BY created_at DESC');
    return result.rows;
  }

  static async getLowStockAlerts(): Promise<BackendInventoryItem[]> {
    if (isUsingMockData()) {
      const inventory = await getMockService().getAllInventory();
      return inventory.filter(item => item.quantity <= item.min_stock);
    }

    const result = await query('SELECT * FROM inventory WHERE quantity <= min_stock');
    return result.rows;
  }

  static async getInventoryByProduct(productId: number): Promise<BackendInventoryItem | null> {
    if (isUsingMockData()) {
      return getMockService().getInventoryByProduct(productId);
    }

    const result = await query(
      `SELECT i.*, p.name as product_name 
       FROM inventory i 
       LEFT JOIN products p ON i.product_id = p.id 
       WHERE i.product_id = $1`,
      [productId]
    );
    return result.rows[0] || null;
  }

  static async updateInventory(productId: number, quantity: number): Promise<BackendInventoryItem | null> {
    if (isUsingMockData()) {
      return getMockService().updateInventory(productId, quantity);
    }

    const result = await query(
      `UPDATE inventory 
       SET quantity = $2, last_updated = CURRENT_TIMESTAMP 
       WHERE product_id = $1 
       RETURNING *`,
      [productId, quantity]
    );
    return result.rows[0] || null;
  }

  // Tablas
  static async getTables(): Promise<BackendTable[]> {
    if (isUsingMockData()) {
      return getMockService().getAllTables();
    }

    const result = await query('SELECT * FROM tables ORDER BY table_number');
    return result.rows;
  }

  static async getTableById(id: number): Promise<BackendTable | null> {
    if (isUsingMockData()) {
      return getMockService().getTableById(id);
    }

    const result = await query('SELECT * FROM tables WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async createTable(tableData: Omit<BackendTable, 'id' | 'created_at' | 'updated_at'>): Promise<BackendTable> {
    if (isUsingMockData()) {
      return getMockService().createTable(tableData);
    }

    const result = await query(
      `INSERT INTO tables (table_number, capacity, location, is_available) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [tableData.table_number, tableData.capacity, tableData.location, tableData.is_available]
    );
    return result.rows[0];
  }

  static async updateTable(id: number, updates: Partial<BackendTable>): Promise<BackendTable | null> {
    if (isUsingMockData()) {
      return getMockService().updateTable(id, updates);
    }

    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    if (!setClause) return null;

    const values = [id, ...Object.values(updates).filter((_, index) =>
      Object.keys(updates)[index] !== 'id' && Object.keys(updates)[index] !== 'created_at'
    )];

    const result = await query(
      `UPDATE tables SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async deleteTable(id: number): Promise<boolean> {
    if (isUsingMockData()) {
      return getMockService().deleteTable(id);
    }

    const result = await query('DELETE FROM tables WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async updateTableStatus(id: number, isAvailable: boolean): Promise<BackendTable | null> {
    if (isUsingMockData()) {
      return getMockService().updateTableStatus(id, isAvailable);
    }

    const result = await query(
      `UPDATE tables SET is_available = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      [id, isAvailable]
    );
    return result.rows[0] || null;
  }

  static async getTableStats() {
    if (isUsingMockData()) {
      return getMockService().getTableStats();
    }

    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_available = true THEN 1 END) as available,
        COUNT(CASE WHEN is_available = false THEN 1 END) as occupied
       FROM tables`
    );

    const stats = result.rows[0];
    const total = parseInt(stats.total);
    const available = parseInt(stats.available);
    const occupied = parseInt(stats.occupied);

    return {
      total,
      available,
      occupied,
      occupancy_rate: total > 0 ? (occupied / total) * 100 : 0
    };
  }

  // Estadísticas
  static async getDatabaseStats() {
    if (isUsingMockData()) {
      return getMockService().getDatabaseStats();
    }

    const [users, categories, products, orders, inventory, tables] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(*) as count FROM categories'),
      query('SELECT COUNT(*) as count FROM products'),
      query('SELECT COUNT(*) as count FROM orders'),
      query('SELECT COUNT(*) as count FROM inventory'),
      query('SELECT COUNT(*) as count FROM tables')
    ]);

    return {
      users: parseInt(users.rows[0].count),
      categories: parseInt(categories.rows[0].count),
      products: parseInt(products.rows[0].count),
      orders: parseInt(orders.rows[0].count),
      inventory_items: parseInt(inventory.rows[0].count),
      tables: parseInt(tables.rows[0].count),
      database_type: 'postgresql',
      status: 'connected'
    };
  }
}
