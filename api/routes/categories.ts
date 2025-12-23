/**
 * Categories API routes
 * Handle CRUD operations for product categories
 */
import { Router, type Request, type Response } from 'express';
import { DataAdapter } from '../services/dataAdapter.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

/**
 * Get all categories
 * GET /api/categories
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { active_only } = req.query;

    const filters = {
      active_only: active_only === 'true'
    };

    const categories = await DataAdapter.getAllCategories();

    res.status(200).json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Get category by ID
 * GET /api/categories/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await DataAdapter.getCategoryById(parseInt(id || '0'));

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { category }
    });
  } catch (error: any) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Create new category
 * POST /api/categories
 */
router.post('/', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, image_url, is_active = true } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      });
      return;
    }

    const categoryData: Omit<import('../types/index.js').BackendCategory, 'id' | 'created_at' | 'updated_at'> = {
      name,
      description,
      image_url,
      is_active
    };

    const newCategory = await DataAdapter.createCategory(categoryData);

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { category: newCategory }
    });
  } catch (error: any) {
    console.error('Error creando categoría:', error);

    if (error.message && error.message.includes('Ya existe')) {
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
 * Update category
 * PUT /api/categories/:id
 */
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, image_url, is_active } = req.body;

    const categoryData: Partial<import('../types/index.js').BackendCategory> = {
      name,
      description,
      image_url,
      is_active
    };

    const updatedCategory = await DataAdapter.updateCategory(parseInt(id || '0'), categoryData);

    if (!updatedCategory) {
      res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: { category: updatedCategory }
    });
  } catch (error: any) {
    console.error('Error actualizando categoría:', error);

    if (error.message && error.message.includes('Ya existe')) {
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
 * Delete category
 * DELETE /api/categories/:id
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await DataAdapter.deleteCategory(parseInt(id || '0'));

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error: any) {
    console.error('Error eliminando categoría:', error);

    if (error.message && error.message.includes('productos asociados')) {
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
 * Toggle category status
 * PATCH /api/categories/:id/status
 */
router.patch('/:id/status', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'is_active debe ser un valor booleano'
      });
      return;
    }

    const categoryData: Partial<import('../types/index.js').BackendCategory> = { is_active };
    const updatedCategory = await DataAdapter.updateCategory(parseInt(id || '0'), categoryData);

    if (!updatedCategory) {
      res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Categoría ${is_active ? 'activada' : 'desactivada'} exitosamente`,
      data: { category: updatedCategory }
    });
  } catch (error: any) {
    console.error('Error actualizando estado de categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;
