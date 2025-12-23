import { Router } from 'express';
import { OrderController } from '../../controllers/OrderController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';
import { apiRateLimiter } from '../../middleware/rateLimiter';

const router = Router();
const orderController = new OrderController();

// All routes require authentication
router.use(authMiddleware);
router.use(apiRateLimiter);

// Get orders (all roles can view their own orders)
router.get('/', orderController.getOrders.bind(orderController));

// Create order (waiter, admin, owner)
router.post('/',
    authorize(['waiter', 'admin', 'owner']),
    orderController.createOrder.bind(orderController)
);

// Update order status (kitchen, waiter, admin, owner)
router.patch('/:id/status',
    authorize(['kitchen', 'waiter', 'admin', 'owner']),
    orderController.updateOrderStatus.bind(orderController)
);

export default router;
