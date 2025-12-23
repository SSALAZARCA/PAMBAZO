import { Router } from 'express';
import { CategoryController } from '../../controllers/CategoryController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { validateCreateCategory, validateUpdateCategory } from '../../validators/categoryValidators';

const router = Router();
const categoryController = new CategoryController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/v1/categories
router.get('/', categoryController.getCategories);

// GET /api/v1/categories/:id
router.get('/:id', categoryController.getCategoryById);

// POST /api/v1/categories
router.post('/', authorize(['OWNER', 'ADMIN']), validateCreateCategory, categoryController.createCategory);

// PUT /api/v1/categories/:id
router.put('/:id', authorize(['OWNER', 'ADMIN']), validateUpdateCategory, categoryController.updateCategory);

// DELETE /api/v1/categories/:id
router.delete('/:id', authorize(['OWNER', 'ADMIN']), categoryController.deleteCategory);

// PUT /api/v1/categories/:id/status
router.put('/:id/status', authorize(['OWNER', 'ADMIN']), categoryController.updateCategoryStatus);

export default router;
