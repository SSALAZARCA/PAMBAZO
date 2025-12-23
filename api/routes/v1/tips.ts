import { Router } from 'express';
import { TipController } from '../../controllers/TipController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';

const router = Router();
const tipController = new TipController();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/tips:
 *   post:
 *     summary: Add a tip to an order
 *     tags: [Tips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: string
 *               amount:
 *                 type: number
 *               percentage:
 *                 type: number
 *               payment_method:
 *                 type: string
 *                 enum: [cash, card, digital]
 *     responses:
 *       200:
 *         description: Tip added successfully
 */
router.post('/', tipController.addTip.bind(tipController));

/**
 * @swagger
 * /api/v1/tips/waiter/{waiter_id}:
 *   get:
 *     summary: Get tips for a waiter
 *     tags: [Tips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: waiter_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Waiter tips retrieved successfully
 */
router.get('/waiter/:waiter_id',
    authorize(['waiter', 'admin', 'owner']),
    tipController.getWaiterTips.bind(tipController)
);

/**
 * @swagger
 * /api/v1/tips/daily-summary:
 *   get:
 *     summary: Get daily tips summary for current user
 *     tags: [Tips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily tips summary
 */
router.get('/daily-summary', tipController.getDailyTipsSummary.bind(tipController));

export default router;
