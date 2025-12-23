import { Router } from 'express';
import { NotificationController } from '../../controllers/NotificationController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createNotificationSchema } from '../../validators/notificationValidators';

const router = Router();
const notificationController = new NotificationController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/v1/notifications
router.get('/', notificationController.getNotifications);

// GET /api/v1/notifications/:id
router.get('/:id', notificationController.getNotificationById);

// POST /api/v1/notifications
router.post('/', authorize(['OWNER', 'ADMIN']), validateRequest(createNotificationSchema), notificationController.createNotification);

// PUT /api/v1/notifications/:id/read
router.put('/:id/read', notificationController.markAsRead);

// PUT /api/v1/notifications/read-all
router.put('/read-all', notificationController.markAllAsRead);

// DELETE /api/v1/notifications/:id
router.delete('/:id', notificationController.deleteNotification);

// GET /api/v1/notifications/unread/count
router.get('/unread/count', notificationController.getUnreadCount);

export default router;
