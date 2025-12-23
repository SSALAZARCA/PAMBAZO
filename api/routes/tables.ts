/**
 * Restaurant Tables API routes
 * Handle CRUD operations for restaurant tables
 */
import { Router, type Request, type Response } from 'express';
import { DataAdapter } from '../services/dataAdapter.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

/**
 * Get all tables
 * GET /api/tables
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await DataAdapter.getTables();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error obteniendo mesas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Get table by ID
 * GET /api/tables/:id
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await DataAdapter.getTableById(parseInt(id || '0'));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error obteniendo mesa:', error);

    if (error.message.includes('no encontrada')) {
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
 * Create new table
 * POST /api/tables
 */
router.post('/', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { table_number, capacity, location, is_available = true } = req.body;

    // Validate required fields
    if (!table_number || !capacity) {
      res.status(400).json({
        success: false,
        error: 'Número de mesa y capacidad son requeridos'
      });
      return;
    }

    // Validate capacity
    if (isNaN(capacity) || capacity < 1) {
      res.status(400).json({
        success: false,
        error: 'La capacidad debe ser un número mayor a 0'
      });
      return;
    }

    const tableData = {
      table_number,
      capacity: parseInt(String(capacity)),
      location,
      is_available
    };

    const result = await DataAdapter.createTable(tableData);

    res.status(201).json({
      success: true,
      message: 'Mesa creada exitosamente',
      data: result
    });
  } catch (error: any) {
    console.error('Error creando mesa:', error);

    if (error.message.includes('ya existe')) {
      res.status(409).json({
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
 * Update table
 * PUT /api/tables/:id
 */
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { table_number, capacity, location, is_available } = req.body;

    // Validate capacity if provided
    if (capacity !== undefined && (isNaN(capacity) || capacity < 1)) {
      res.status(400).json({
        success: false,
        error: 'La capacidad debe ser un número mayor a 0'
      });
      return;
    }

    const updateData = {
      table_number,
      capacity: capacity ? parseInt(String(capacity)) : undefined,
      location,
      is_available
    };

    const result = await DataAdapter.updateTable(parseInt(id || '0'), updateData);

    res.status(200).json({
      success: true,
      message: 'Mesa actualizada exitosamente',
      data: result
    });
  } catch (error: any) {
    console.error('Error actualizando mesa:', error);

    if (error.message.includes('no encontrada')) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else if (error.message.includes('ya existe')) {
      res.status(409).json({
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
 * Delete table
 * DELETE /api/tables/:id
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await DataAdapter.deleteTable(parseInt(id || '0'));

    res.status(200).json({
      success: true,
      message: 'Mesa eliminada exitosamente'
    });
  } catch (error: any) {
    console.error('Error eliminando mesa:', error);

    if (error.message.includes('no encontrada')) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else if (error.message.includes('ocupada') || error.message.includes('historial')) {
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
 * Toggle table availability
 * PATCH /api/tables/:id/status
 */
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'waiter'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    if (typeof is_available !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'is_available debe ser un valor booleano'
      });
      return;
    }

    const result = await DataAdapter.updateTableStatus(parseInt(id || '0'), is_available);

    res.status(200).json({
      success: true,
      message: `Mesa marcada como ${is_available ? 'disponible' : 'no disponible'} exitosamente`,
      data: result
    });
  } catch (error: any) {
    console.error('Error actualizando disponibilidad de mesa:', error);

    if (error.message.includes('no encontrada')) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else if (error.message.includes('pedidos activos')) {
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
 * Get table statistics
 * GET /api/tables/stats/overview
 */
router.get('/stats/overview', authenticateToken, authorizeRoles('admin', 'manager'), async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await DataAdapter.getTableStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Error obteniendo estadísticas de mesas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;
