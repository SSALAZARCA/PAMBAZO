import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { ApiResponse } from '../utils/ApiResponse';

export class ReportController {
  async getSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;

      let dateFormat = '%Y-%m-%d';
      if (groupBy === 'month') dateFormat = '%Y-%m';
      if (groupBy === 'year') dateFormat = '%Y';

      const query = `
        SELECT 
          strftime('${dateFormat}', created_at) as period,
          COUNT(*) as total_orders,
          SUM(total) as total_sales,
          AVG(total) as average_order
        FROM orders
        WHERE status = 'completed'
        ${startDate ? `AND created_at >= '${startDate}'` : ''}
        ${endDate ? `AND created_at <= '${endDate}'` : ''}
        GROUP BY period
        ORDER BY period DESC
      `;

      const sales = await DatabaseService.all(query);
      ApiResponse.success(res, { sales });
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 10 } = req.query;

      const products = await DatabaseService.all(`
        SELECT 
          p.id,
          p.name,
          COUNT(oi.id) as times_ordered,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.subtotal) as total_revenue
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'completed'
        GROUP BY p.id
        ORDER BY total_revenue DESC
        LIMIT ?
      `, [limit]);

      ApiResponse.success(res, { products });
    } catch (error) {
      next(error);
    }
  }

  async getWaiterPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const waiters = await DatabaseService.all(`
        SELECT 
          u.id,
          u.username,
          u.first_name,
          u.last_name,
          COUNT(o.id) as total_orders,
          SUM(o.total) as total_sales,
          AVG(o.total) as average_order
        FROM users u
        LEFT JOIN orders o ON u.id = o.waiter_id AND o.status = 'completed'
        WHERE u.role = 'waiter'
        GROUP BY u.id
        ORDER BY total_sales DESC
      `);

      ApiResponse.success(res, { waiters });
    } catch (error) {
      next(error);
    }
  }

  async getKitchenMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await DatabaseService.get(`
        SELECT 
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
          COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders,
          AVG(CASE 
            WHEN status IN ('ready', 'served', 'completed') 
            THEN (julianday(updated_at) - julianday(created_at)) * 24 * 60 
          END) as avg_preparation_time_minutes
        FROM orders
        WHERE DATE(created_at) = DATE('now')
      `);

      ApiResponse.success(res, { metrics });
    } catch (error) {
      next(error);
    }
  }
}
