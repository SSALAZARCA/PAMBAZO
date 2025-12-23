import { Router } from 'express';
import { SettingsController } from '../../controllers/SettingsController';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

/**
 * @swagger
 * /api/v1/settings/store-info:
 *   get:
 *     summary: Get store information (public)
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Store information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     location:
 *                       type: object
 *                     contact:
 *                       type: object
 *                     hours:
 *                       type: array
 */
router.get('/store-info', SettingsController.getStoreInfo);

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     summary: Get all settings (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All settings grouped by category
 */
router.get('/', authenticate, authorize(['admin', 'owner']), SettingsController.getAllSettings);

/**
 * @swagger
 * /api/v1/settings/category/{category}:
 *   get:
 *     summary: Get settings by category (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Settings for the category
 */
router.get('/category/:category', authenticate, authorize(['admin', 'owner']), SettingsController.getSettingsByCategory);

/**
 * @swagger
 * /api/v1/settings/{key}:
 *   put:
 *     summary: Update a setting (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Setting updated
 */
router.put('/:key', authenticate, authorize(['admin', 'owner']), SettingsController.updateSetting);

export default router;
