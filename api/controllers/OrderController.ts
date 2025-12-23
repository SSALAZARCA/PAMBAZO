import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export class OrderController {
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, offset } = getPaginationParams(req.query);
      const { status, waiter_id, table_id } = req.query;

      let query = `
        SELECT o.*, t.number as table_number, u.username as waiter_name
        FROM orders o
        LEFT JOIN tables t ON o.table_id = t.id
        LEFT JOIN users u ON o.waiter_id = u.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (status) {
        query += ' AND o.status = ?';
        params.push(status);
      }

      if (waiter_id) {
        query += ' AND o.waiter_id = ?';
        params.push(waiter_id);
      }

      if (table_id) {
        query += ' AND o.table_id = ?';
        params.push(table_id);
      }

      query += ' ORDER BY o.created_at DESC';

      const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
      const countResult = await DatabaseService.get(countQuery, params);
      const total = countResult?.total || 0;

      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const orders = await DatabaseService.all(query, params);

      // Get items for each order
      for (const order of orders) {
        const items = await DatabaseService.all(
          `SELECT oi.*, p.name as product_name
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
        order.items = items;
      }

      const result = createPaginatedResponse(orders, total, page, limit);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { customer_id, table_id, waiter_id, items, notes, customer_name } = req.body;

      const orderId = `order-${Date.now()}`;

      // Create order
      await DatabaseService.run(
        `INSERT INTO orders (id, customer_id, table_id, waiter_id, status, total, notes, customer_name)
         VALUES (?, ?, ?, ?, 'pending', 0, ?, ?)`,
        [orderId, customer_id, table_id, waiter_id, notes, customer_name]
      );

      // Add items and calculate total
      let total = 0;
      for (const item of items) {
        const product = await DatabaseService.get('SELECT price FROM products WHERE id = ?', [item.product_id]);
        const subtotal = product.price * item.quantity;
        total += subtotal;

        await DatabaseService.run(
          `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [`item-${Date.now()}-${Math.random()}`, orderId, item.product_id, item.quantity, product.price, subtotal, item.notes]
        );
      }

      // Update order total
      await DatabaseService.run('UPDATE orders SET total = ? WHERE id = ?', [total, orderId]);

      // Update table status
      if (table_id) {
        await DatabaseService.run('UPDATE tables SET status = ? WHERE id = ?', ['occupied', table_id]);
      }

      const order = await DatabaseService.get('SELECT * FROM orders WHERE id = ?', [orderId]);
      ApiResponse.created(res, { order }, 'Orden creada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await DatabaseService.run(
        `UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`,
        [status, id]
      );

      // If order is completed, free the table
      if (status === 'completed') {
        const order = await DatabaseService.get('SELECT table_id FROM orders WHERE id = ?', [id]);
        if (order?.table_id) {
          await DatabaseService.run('UPDATE tables SET status = ? WHERE id = ?', ['available', order.table_id]);
        }
      }

      const updatedOrder = await DatabaseService.get('SELECT * FROM orders WHERE id = ?', [id]);
      ApiResponse.success(res, { order: updatedOrder }, 'Estado de orden actualizado');
    } catch (error) {
      next(error);
    }
  }
}
