import { Router } from 'express';
import { ProductController } from '../../controllers/ProductController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';
import { apiRateLimiter } from '../../middleware/rateLimiter';

const router = Router();
const productController = new ProductController();

// Apply rate limiting
router.use(apiRateLimiter);

// Public routes
router.get('/', productController.getProducts.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));

// Protected routes (require authentication)
router.use(authMiddleware);

// Admin/Owner only routes
router.post('/',
    authorize(['owner', 'admin']),
    productController.createProduct.bind(productController)
);

router.put('/:id',
    authorize(['owner', 'admin']),
    productController.updateProduct.bind(productController)
);

router.delete('/:id',
    authorize(['owner', 'admin']),
    productController.deleteProduct.bind(productController)
);

export default router;
