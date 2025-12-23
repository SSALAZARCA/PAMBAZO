import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { calculatePointsForPurchase, getTierForPoints } from '../types/loyalty';

export class LoyaltyController {
    async getCustomerPoints(req: Request, res: Response, next: NextFunction) {
        try {
            const customerId = (req as any).user?.id;

            const points = await DatabaseService.get(
                'SELECT * FROM loyalty_points WHERE customer_id = ?',
                [customerId]
            );

            if (!points) {
                // Create new loyalty account
                await DatabaseService.run(
                    `INSERT INTO loyalty_points (id, customer_id, points, total_earned, total_redeemed)
           VALUES (?, ?, 0, 0, 0)`,
                    [`loyalty-${Date.now()}`, customerId]
                );

                return ApiResponse.success(res, {
                    points: 0,
                    total_earned: 0,
                    total_redeemed: 0,
                    tier: getTierForPoints(0)
                });
            }

            const tier = getTierForPoints(points.points);
            ApiResponse.success(res, { ...points, tier });
        } catch (error) {
            next(error);
        }
    }

    async addPoints(req: Request, res: Response, next: NextFunction) {
        try {
            const { customer_id, order_id, amount } = req.body;

            // Get current points
            let loyalty = await DatabaseService.get(
                'SELECT * FROM loyalty_points WHERE customer_id = ?',
                [customer_id]
            );

            if (!loyalty) {
                await DatabaseService.run(
                    `INSERT INTO loyalty_points (id, customer_id, points, total_earned, total_redeemed)
           VALUES (?, ?, 0, 0, 0)`,
                    [`loyalty-${Date.now()}`, customer_id]
                );
                loyalty = { points: 0, total_earned: 0 };
            }

            const pointsToAdd = calculatePointsForPurchase(amount, loyalty.points);

            // Update points
            await DatabaseService.run(
                `UPDATE loyalty_points 
         SET points = points + ?, 
             total_earned = total_earned + ?,
             updated_at = datetime('now')
         WHERE customer_id = ?`,
                [pointsToAdd, pointsToAdd, customer_id]
            );

            // Record transaction
            await DatabaseService.run(
                `INSERT INTO loyalty_transactions (id, customer_id, order_id, transaction_type, points, description)
         VALUES (?, ?, ?, 'earned', ?, ?)`,
                [
                    `trans-${Date.now()}`,
                    customer_id,
                    order_id,
                    pointsToAdd,
                    `Earned ${pointsToAdd} points from purchase`
                ]
            );

            ApiResponse.success(res, { pointsAdded: pointsToAdd }, 'Puntos agregados exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async redeemPoints(req: Request, res: Response, next: NextFunction) {
        try {
            const customerId = (req as any).user?.id;
            const { points, description } = req.body;

            const loyalty = await DatabaseService.get(
                'SELECT * FROM loyalty_points WHERE customer_id = ?',
                [customerId]
            );

            if (!loyalty || loyalty.points < points) {
                throw new ApiError(400, 'INSUFFICIENT_POINTS', 'Puntos insuficientes');
            }

            // Redeem points
            await DatabaseService.run(
                `UPDATE loyalty_points 
         SET points = points - ?, 
             total_redeemed = total_redeemed + ?,
             updated_at = datetime('now')
         WHERE customer_id = ?`,
                [points, points, customerId]
            );

            // Record transaction
            await DatabaseService.run(
                `INSERT INTO loyalty_transactions (id, customer_id, transaction_type, points, description)
         VALUES (?, ?, 'redeemed', ?, ?)`,
                [`trans-${Date.now()}`, customerId, points, description || 'Points redeemed']
            );

            ApiResponse.success(res, { pointsRedeemed: points }, 'Puntos canjeados exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async getTransactionHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const customerId = (req as any).user?.id;

            const transactions = await DatabaseService.all(
                `SELECT * FROM loyalty_transactions 
         WHERE customer_id = ? 
         ORDER BY created_at DESC 
         LIMIT 50`,
                [customerId]
            );

            ApiResponse.success(res, { transactions });
        } catch (error) {
            next(error);
        }
    }
}
