import { Router } from 'express';
import { UserController } from '../../controllers/UserController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { validateCreateUser, validateUpdateUser } from '../../validators/userValidators';

const router = Router();
const userController = new UserController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/v1/users
router.get('/', authorize(['OWNER', 'ADMIN']), userController.getUsers);

// GET /api/v1/users/:id
router.get('/:id', authorize(['OWNER', 'ADMIN']), userController.getUserById);

// POST /api/v1/users
router.post('/', authorize(['OWNER', 'ADMIN']), validateCreateUser, userController.createUser);

// PUT /api/v1/users/:id
router.put('/:id', authorize(['OWNER', 'ADMIN']), validateUpdateUser, userController.updateUser);

// DELETE /api/v1/users/:id
router.delete('/:id', authorize(['OWNER']), userController.deleteUser);

// PUT /api/v1/users/:id/status
router.put('/:id/status', authorize(['OWNER', 'ADMIN']), userController.updateUserStatus);

export default router;
