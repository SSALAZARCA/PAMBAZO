import { Router } from 'express';
import { TableController } from '../../controllers/TableController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createTableSchema, updateTableSchema } from '../../validators/tableValidators';

const router = Router();
const tableController = new TableController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/v1/tables
router.get('/', tableController.getTables);

// GET /api/v1/tables/:id
router.get('/:id', tableController.getTableById);

// POST /api/v1/tables
router.post('/', authorize(['OWNER', 'ADMIN']), validateRequest(createTableSchema), tableController.createTable);

// PUT /api/v1/tables/:id
router.put('/:id', authorize(['OWNER', 'ADMIN']), validateRequest(updateTableSchema), tableController.updateTable);

// DELETE /api/v1/tables/:id
router.delete('/:id', authorize(['OWNER', 'ADMIN']), tableController.deleteTable);

// PUT /api/v1/tables/:id/status
router.put('/:id/status', authorize(['OWNER', 'ADMIN', 'WAITER']), tableController.updateTableStatus);

// GET /api/v1/tables/status/:status
router.get('/status/:status', tableController.getTablesByStatus);

export default router;
