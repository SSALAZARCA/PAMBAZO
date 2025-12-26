/**
 * Admin Routes - Production Ready
 */

import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', authenticate, authorize(['admin', 'owner']), AdminController.getAdminStats);

/**
 * @swagger
 * /api/v1/admin/inventory/stats:
 *   get:
 *     summary: Get inventory statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory statistics
 */
router.get('/inventory/stats', authenticate, authorize(['admin', 'owner']), AdminController.getInventoryStats);

export default router;
