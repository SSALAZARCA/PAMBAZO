import { Router } from 'express';
import { InventoryController } from '../../controllers/InventoryController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createInventorySchema, updateInventorySchema, adjustStockSchema } from '../../validators/inventoryValidators';

const router = Router();
const inventoryController = new InventoryController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/v1/inventory
router.get('/', inventoryController.getInventory);

// GET /api/v1/inventory/:id
router.get('/:id', inventoryController.getInventoryById);

// POST /api/v1/inventory
router.post('/', authorize(['OWNER', 'ADMIN']), validateRequest(createInventorySchema), inventoryController.createInventoryItem);

// PUT /api/v1/inventory/:id
router.put('/:id', authorize(['OWNER', 'ADMIN']), validateRequest(updateInventorySchema), inventoryController.updateInventoryItem);

// DELETE /api/v1/inventory/:id
router.delete('/:id', authorize(['OWNER', 'ADMIN']), inventoryController.deleteInventoryItem);

// POST /api/v1/inventory/:id/adjust
router.post('/:id/adjust', authorize(['OWNER', 'ADMIN']), validateRequest(adjustStockSchema), inventoryController.adjustStock);

// GET /api/v1/inventory/low-stock
router.get('/low-stock', inventoryController.getLowStockItems);

// GET /api/v1/inventory/product/:productId
router.get('/product/:productId', inventoryController.getInventoryByProduct);

export default router;
