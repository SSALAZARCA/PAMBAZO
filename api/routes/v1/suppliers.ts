import { Router } from 'express';
import { SupplierController } from '../../controllers/SupplierController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { createSupplierSchema, updateSupplierSchema } from '../../validators/supplierValidators';

const router = Router();
const supplierController = new SupplierController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/v1/suppliers
router.get('/', authorize(['OWNER', 'ADMIN']), supplierController.getSuppliers);

// GET /api/v1/suppliers/:id
router.get('/:id', authorize(['OWNER', 'ADMIN']), supplierController.getSupplierById);

// POST /api/v1/suppliers
router.post('/', authorize(['OWNER', 'ADMIN']), validateRequest(createSupplierSchema), supplierController.createSupplier);

// PUT /api/v1/suppliers/:id
router.put('/:id', authorize(['OWNER', 'ADMIN']), validateRequest(updateSupplierSchema), supplierController.updateSupplier);

// DELETE /api/v1/suppliers/:id
router.delete('/:id', authorize(['OWNER', 'ADMIN']), supplierController.deleteSupplier);

// PUT /api/v1/suppliers/:id/status
router.put('/:id/status', authorize(['OWNER', 'ADMIN']), supplierController.updateSupplierStatus);

export default router;
