import { Router } from 'express';
import { ReportController } from '../../controllers/ReportController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';

const router = Router();
const reportController = new ReportController();

// All routes require authentication and admin/owner role
router.use(authMiddleware);
router.use(authorize(['owner', 'admin']));

router.get('/sales', reportController.getSalesReport.bind(reportController));
router.get('/top-products', reportController.getTopProducts.bind(reportController));
router.get('/waiter-performance', reportController.getWaiterPerformance.bind(reportController));
router.get('/kitchen-metrics', reportController.getKitchenMetrics.bind(reportController));

export default router;
