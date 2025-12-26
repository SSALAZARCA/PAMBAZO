/**
 * Data Adapter Service - Production Ready
 * Direct PostgreSQL queries only
 */

import { query, queryOne } from '../config/database.js';

export class DataAdapter {
  // ==================== USERS ====================

  static async getAllUsers(filters?: any) {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];

    if (filters?.role) {
      params.push(filters.role);
      sql += ` AND role = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';
    return await query(sql, params);
  }

  static async getUserById(id: string) {
    return await queryOne('SELECT * FROM users WHERE id = $1', [id]);
  }

  static async getUserByEmail(email: string) {
    return await queryOne('SELECT * FROM users WHERE email = $1', [email]);
  }

  static async getUserByUsername(username: string) {
    return await queryOne('SELECT * FROM users WHERE username = $1', [username]);
  }

  static async createUser(userData: any) {
    const { name, email, password, role, phone, username } = userData;

    const result = await query(
      `INSERT INTO users (name, email, password, role, phone, username, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [name, email, password, role, phone || null, username || null]
    );

    return result[0];
  }

  static async updateUser(id: string, updates: any) {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramIndex}`);
        params.push(updates[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;

    const result = await query(sql, params);
    return result[0];
  }

  static async updateUserPassword(id: string, currentPassword: string, newPasswordHash: string) {
    const user = await this.getUserById(id);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password (should be done with bcrypt in the calling function)
    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, id]
    );

    return true;
  }

  static async deleteUser(id: string) {
    await query('DELETE FROM users WHERE id = $1', [id]);
    return true;
  }

  // ==================== PRODUCTS ====================

  static async getAllProducts(filters?: any) {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (filters?.category) {
      params.push(filters.category);
      sql += ` AND category = $${params.length}`;
    }

    if (filters?.available !== undefined) {
      params.push(filters.available);
      sql += ` AND available = $${params.length}`;
    }

    sql += ' ORDER BY name ASC';
    return await query(sql, params);
  }

  static async getProductById(id: string) {
    return await queryOne('SELECT * FROM products WHERE id = $1', [id]);
  }

  static async createProduct(productData: any) {
    const { name, description, price, category, available, image } = productData;

    const result = await query(
      `INSERT INTO products (name, description, price, category, available, image, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [name, description, price, category, available !== false, image || null]
    );

    return result[0];
  }

  static async updateProduct(id: string, updates: any) {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramIndex}`);
        params.push(updates[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id);
    const sql = `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;

    const result = await query(sql, params);
    return result[0];
  }

  static async deleteProduct(id: string) {
    await query('DELETE FROM products WHERE id = $1', [id]);
    return true;
  }

  // ==================== ORDERS ====================

  static async getAllOrders(filters?: any) {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      params.push(filters.status);
      sql += ` AND status = $${params.length}`;
    }

    if (filters?.userId) {
      params.push(filters.userId);
      sql += ` AND user_id = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';
    return await query(sql, params);
  }

  static async getOrderById(id: string) {
    return await queryOne('SELECT * FROM orders WHERE id = $1', [id]);
  }

  static async createOrder(orderData: any) {
    const { userId, total, status, tableNumber, customerName } = orderData;

    const result = await query(
      `INSERT INTO orders (user_id, total, status, table_number, customer_name, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [userId, total, status || 'pending', tableNumber || null, customerName || null]
    );

    return result[0];
  }

  static async updateOrderStatus(id: string, status: string) {
    const result = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result[0];
  }
}

export default DataAdapter;
