import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export class TipController {
    async addTip(req: Request, res: Response, next: NextFunction) {
        try {
            const { order_id, amount, percentage, payment_method } = req.body;

            // Get order to find waiter
            const order = await DatabaseService.get(
                'SELECT waiter_id, total FROM orders WHERE id = ?',
                [order_id]
            );

            if (!order) {
                throw new ApiError(404, 'ORDER_NOT_FOUND', 'Orden no encontrada');
            }

            // Calculate tip if percentage provided
            const tipAmount = percentage ? (order.total * percentage) / 100 : amount;

            // Create tip record
            const tipId = `tip-${Date.now()}`;
            await DatabaseService.run(
                `INSERT INTO tips (id, order_id, waiter_id, amount, percentage, payment_method)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [tipId, order_id, order.waiter_id, tipAmount, percentage, payment_method]
            );

            // Update order with tip
            await DatabaseService.run(
                `UPDATE orders SET tip = ?, tip_percentage = ? WHERE id = ?`,
                [tipAmount, percentage, order_id]
            );

            ApiResponse.success(res, { tip: { id: tipId, amount: tipAmount } }, 'Propina agregada exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async getWaiterTips(req: Request, res: Response, next: NextFunction) {
        try {
            const { waiter_id } = req.params;
            const { startDate, endDate } = req.query;

            let query = `
        SELECT t.*, o.table_id, o.total as order_total
        FROM tips t
        JOIN orders o ON t.order_id = o.id
        WHERE t.waiter_id = ?
      `;
            const params: any[] = [waiter_id];

            if (startDate) {
                query += ' AND DATE(t.created_at) >= DATE(?)';
                params.push(startDate);
            }

            if (endDate) {
                query += ' AND DATE(t.created_at) <= DATE(?)';
                params.push(endDate);
            }

            query += ' ORDER BY t.created_at DESC';

            const tips = await DatabaseService.all(query, params);

            // Calculate totals
            const total = tips.reduce((sum, tip) => sum + tip.amount, 0);
            const count = tips.length;

            ApiResponse.success(res, { tips, summary: { total, count, average: count > 0 ? total / count : 0 } });
        } catch (error) {
            next(error);
        }
    }

    async getDailyTipsSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;

            const summary = await DatabaseService.get(
                `SELECT 
          COUNT(*) as total_tips,
          SUM(amount) as total_amount,
          AVG(amount) as average_tip
         FROM tips
         WHERE waiter_id = ? AND DATE(created_at) = DATE('now')`,
                [userId]
            );

            ApiResponse.success(res, { summary });
        } catch (error) {
            next(error);
        }
    }
}
