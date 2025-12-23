import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export class ReservationController {
    async getReservations(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, status } = req.query;

            let query = `
        SELECT r.*, t.number as table_number, u.username as customer_name
        FROM reservations r
        LEFT JOIN tables t ON r.table_id = t.id
        LEFT JOIN users u ON r.customer_id = u.id
        WHERE 1=1
      `;
            const params: any[] = [];

            if (date) {
                query += ' AND DATE(r.reservation_date) = DATE(?)';
                params.push(date);
            }

            if (status) {
                query += ' AND r.status = ?';
                params.push(status);
            }

            query += ' ORDER BY r.reservation_date ASC';

            const reservations = await DatabaseService.all(query, params);
            ApiResponse.success(res, { reservations });
        } catch (error) {
            next(error);
        }
    }

    async createReservation(req: Request, res: Response, next: NextFunction) {
        try {
            const { customer_id, table_id, reservation_date, party_size, notes, customer_name, customer_phone } = req.body;

            // Check if table is available
            const existingReservation = await DatabaseService.get(
                `SELECT * FROM reservations 
         WHERE table_id = ? 
         AND DATE(reservation_date) = DATE(?) 
         AND status != 'cancelled'`,
                [table_id, reservation_date]
            );

            if (existingReservation) {
                throw new ApiError(400, 'TABLE_NOT_AVAILABLE', 'Mesa no disponible para esta fecha');
            }

            const id = `reservation-${Date.now()}`;
            await DatabaseService.run(
                `INSERT INTO reservations (id, customer_id, table_id, reservation_date, party_size, status, notes, customer_name, customer_phone)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
                [id, customer_id, table_id, reservation_date, party_size, notes, customer_name, customer_phone]
            );

            const reservation = await DatabaseService.get('SELECT * FROM reservations WHERE id = ?', [id]);
            ApiResponse.created(res, { reservation }, 'Reserva creada exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async updateReservationStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            await DatabaseService.run(
                `UPDATE reservations SET status = ?, updated_at = datetime('now') WHERE id = ?`,
                [status, id]
            );

            const reservation = await DatabaseService.get('SELECT * FROM reservations WHERE id = ?', [id]);
            ApiResponse.success(res, { reservation }, 'Estado de reserva actualizado');
        } catch (error) {
            next(error);
        }
    }

    async cancelReservation(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await DatabaseService.run(
                `UPDATE reservations SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`,
                [id]
            );

            ApiResponse.success(res, null, 'Reserva cancelada exitosamente');
        } catch (error) {
            next(error);
        }
    }
}
