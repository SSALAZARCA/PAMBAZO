/**
 * Inventory API routes
 * Handle CRUD operations for inventory management
 */
import { Router, type Request, type Response } from 'express';
import { DataAdapter } from '../services/dataAdapter.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

/**
 * Get all inventory items
 * GET /api/inventory
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { low_stock, search, page = 1, limit = 50 } = req.query;

    const filters = {
      low_stock: low_stock === 'true',
      search: search as string,
      page: parseInt((page as string) || '1'),
      limit: parseInt((limit as string) || '50')
    };

    const result = await DataAdapter.getInventory(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error obteniendo inventario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Get inventory item by ID
 * GET /api/inventory/:id
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await DataAdapter.getInventoryById(parseInt(id || '0'));

    if (!item) {
      res.status(404).json({
        success: false,
        error: 'Artículo de inventario no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { item }
    });
  } catch (error: any) {
    console.error('Error obteniendo artículo de inventario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Create new inventory item
 * POST /api/inventory
 */
router.post('/', authenticateToken, authorizeRoles('admin', 'kitchen'), async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      item_name,
      product_id,
      current_stock,
      min_stock,
      max_stock,
      unit,
      cost_per_unit,
      supplier,
      notes
    } = req.body;

    // Validate required fields
    if (!item_name || current_stock === undefined || min_stock === undefined || !unit) {
      res.status(400).json({
        success: false,
        error: 'Nombre del artículo, stock actual, stock mínimo y unidad son requeridos'
      });
      return;
    }

    const inventoryData = {
      item_name,
      product_id,
      current_stock,
      min_stock,
      max_stock,
      unit,
      cost_per_unit,
      supplier,
      notes,
      user_id: req.user?.id ? parseInt(req.user.id) : undefined
    };

    if (!inventoryData.user_id) {
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }

    const newItem = await DataAdapter.createInventoryItem(inventoryData);

    res.status(201).json({
      success: true,
      message: 'Artículo de inventario creado exitosamente',
      data: { item: newItem }
    });
  } catch (error: any) {
    console.error('Error creando artículo de inventario:', error);

    if (error.message.includes('no existe')) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
});

/**
 * Update inventory item
 * PUT /api/inventory/:id
 */
router.put('/:id', authenticateToken, authorizeRoles('admin', 'kitchen'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      item_name,
      product_id,
      min_stock,
      max_stock,
      unit,
      cost_per_unit,
      supplier,
      notes
    } = req.body;

    const updateData = {
      item_name,
      product_id,
      min_stock,
      max_stock,
      unit,
      cost_per_unit,
      supplier,
      notes
    };

    const updatedItem = await DataAdapter.updateInventoryItem(parseInt(id || '0'), updateData);

    res.status(200).json({
      success: true,
      message: 'Artículo de inventario actualizado exitosamente',
      data: { item: updatedItem }
    });
  } catch (error: any) {
    console.error('Error actualizando artículo de inventario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Delete inventory item
 * DELETE /api/inventory/:id
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await DataAdapter.deleteInventoryItem(parseInt(id || '0'));

    res.status(200).json({
      success: true,
      message: 'Artículo de inventario eliminado exitosamente'
    });
  } catch (error: any) {
    console.error('Error eliminando artículo de inventario:', error);

    if (error.message.includes('no encontrado')) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
});

/**
 * Update stock (add or remove)
 * PATCH /api/inventory/:id/stock
 */
router.patch('/:id/stock', authenticateToken, authorizeRoles('admin', 'kitchen'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, movement_type, reason, cost_per_unit } = req.body;

    // Validate required fields
    if (!quantity || !movement_type || !reason) {
      res.status(400).json({
        success: false,
        error: 'Cantidad, tipo de movimiento y razón son requeridos'
      });
      return;
    }

    const movementData = {
      quantity: parseFloat(quantity),
      movement_type,
      reason,
      cost_per_unit: cost_per_unit ? parseFloat(cost_per_unit) : undefined,
      user_id: req.user?.id ? parseInt(req.user.id) : undefined
    };

    if (!movementData.user_id) {
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }

    const result = await DataAdapter.updateInventoryStock(parseInt(id || '0'), movementData);

    res.status(200).json({
      success: true,
      message: `Stock ${movement_type === 'in' ? 'agregado' : 'removido'} exitosamente`,
      data: result
    });
  } catch (error: any) {
    console.error('Error actualizando stock:', error);

    if (error.message.includes('no encontrado') || error.message.includes('insuficiente')) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
});

/**
 * Get inventory movements
 * GET /api/inventory/movements
 */
router.get('/movements/history', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { inventory_id, movement_type, start_date, end_date, page = 1, limit = 50 } = req.query;

    const filters = {
      inventory_id: inventory_id ? parseInt(inventory_id as string) : undefined,
      movement_type: movement_type as string,
      start_date: start_date as string,
      end_date: end_date as string,
      page: parseInt((page as string) || '1'),
      limit: parseInt((limit as string) || '50')
    };

    const result = await DataAdapter.getInventoryMovements(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error obteniendo movimientos de inventario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Get low stock alerts
 * GET /api/inventory/alerts/low-stock
 */
router.get('/alerts/low-stock', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await DataAdapter.getLowStockAlerts();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error obteniendo alertas de stock bajo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;
