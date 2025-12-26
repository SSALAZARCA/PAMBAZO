/**
 * Admin Controller - Production Ready
 * Real stats from PostgreSQL
 */

import { Request, Response } from 'express';
import { query } from '../config/database.js';
import { logger } from '../utils/logger.js';

export class AdminController {
    /**
     * Get admin dashboard statistics
     */
    static async getAdminStats(req: Request, res: Response): Promise<void> {
        try {
            // Get total products
            const productsResult = await query('SELECT COUNT(*) as count FROM products');
            const totalProducts = parseInt(productsResult[0]?.count || '0');

            // Get low stock items (assuming there's a stock column)
            const lowStockResult = await query(
                'SELECT COUNT(*) as count FROM products WHERE stock < 10'
            );
            const lowStock = parseInt(lowStockResult[0]?.count || '0');

            // Get active orders
            const activeOrdersResult = await query(
                "SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'preparing')"
            );
            const activeOrders = parseInt(activeOrdersResult[0]?.count || '0');

            // Get total users
            const usersResult = await query('SELECT COUNT(*) as count FROM users');
            const totalUsers = parseInt(usersResult[0]?.count || '0');

            // Get today's revenue
            const revenueResult = await query(
                `SELECT COALESCE(SUM(total), 0) as revenue 
         FROM orders 
         WHERE DATE(created_at) = CURRENT_DATE 
         AND status = 'completed'`
            );
            const todayRevenue = parseFloat(revenueResult[0]?.revenue || '0');

            res.json({
                success: true,
                data: {
                    totalProducts,
                    lowStock,
                    activeOrders,
                    totalUsers,
                    todayRevenue,
                    stats: [
                        {
                            title: 'Total Productos',
                            value: totalProducts.toString(),
                            change: 'Activos',
                            color: 'text-blue-600',
                        },
                        {
                            title: 'Stock Bajo',
                            value: lowStock.toString(),
                            change: lowStock > 0 ? 'Requiere atención' : 'Todo bien',
                            color: lowStock > 0 ? 'text-red-600' : 'text-green-600',
                        },
                        {
                            title: 'Órdenes Activas',
                            value: activeOrders.toString(),
                            change: 'En proceso',
                            color: 'text-orange-600',
                        },
                        {
                            title: 'Usuarios Totales',
                            value: totalUsers.toString(),
                            change: 'Registrados',
                            color: 'text-purple-600',
                        },
                    ]
                }
            });
        } catch (error: any) {
            logger.error('Error fetching admin stats:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Error al obtener estadísticas',
                    details: error.message
                }
            });
        }
    }

    /**
     * Get inventory stats
     */
    static async getInventoryStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await query(`
        SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN stock < 10 THEN 1 END) as low_stock,
          COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock,
          SUM(stock * price) as total_value
        FROM products
      `);

            res.json({
                success: true,
                data: stats[0]
            });
        } catch (error: any) {
            logger.error('Error fetching inventory stats:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Error al obtener estadísticas de inventario',
                    details: error.message
                }
            });
        }
    }
}

export default AdminController;
