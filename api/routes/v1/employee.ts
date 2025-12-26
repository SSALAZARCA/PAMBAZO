/**
 * Employee Routes - Production Ready
 */

import { Router } from 'express';
import { EmployeeController } from '../controllers/EmployeeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /api/v1/employee/stats/{userId}:
 *   get:
 *     summary: Get employee dashboard statistics
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee statistics
 *       401:
 *         description: Unauthorized
 */
router.get('/stats/:userId?', authenticate, EmployeeController.getEmployeeStats);

/**
 * @swagger
 * /api/v1/employee/performance/{userId}:
 *   get:
 *     summary: Get employee performance metrics
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Performance metrics
 */
router.get('/performance/:userId?', authenticate, EmployeeController.getPerformanceMetrics);

export default router;
