/**
 * Products API routes
 * Handle CRUD operations for products
 */
import { Router, type Request, type Response } from 'express';
import { DataAdapter } from '../services/dataAdapter.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

/**
 * Get all products
 * GET /api/products
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, available, search, limit = '50', offset = '0' } = req.query;

    const filters = {
      category: category as string,
      available: available === 'true' ? true : available === 'false' ? false : undefined,
      search: search as string,
      limit: parseInt((limit as string) || '50'),
      offset: parseInt((offset as string) || '0')
    };

    const result = await DataAdapter.getAllProducts();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Get product by ID
 * GET /api/products/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await DataAdapter.getProductById(parseInt(id || '0'));

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error: any) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Create new product
 * POST /api/products
 */
router.post('/', authenticateToken, authorizeRoles('admin', 'kitchen'), async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      category_id,
      image_url,
      preparation_time,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      is_available = true,
      ingredients = []
    } = req.body;

    // Validate required fields
    if (!name || !price || !category_id) {
      res.status(400).json({
        success: false,
        error: 'Nombre, precio y categoría son requeridos'
      });
      return;
    }

    // Validate price
    if (isNaN(price) || price < 0) {
      res.status(400).json({
        success: false,
        error: 'El precio debe ser un número válido mayor o igual a 0'
      });
      return;
    }

    const productData = {
      name,
      description,
      price,
      category_id,
      image_url,
      preparation_time,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      is_available,
      is_active: true,
      ingredients
    };

    const newProduct = await DataAdapter.createProduct(productData);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product: newProduct }
    });
  } catch (error: any) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Update product
 * PUT /api/products/:id
 */
router.put('/:id', authenticateToken, authorizeRoles('admin', 'kitchen'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category_id,
      image_url,
      preparation_time,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      is_available,
      ingredients = []
    } = req.body;

    // Validate price if provided
    if (price !== undefined && (isNaN(price) || price < 0)) {
      res.status(400).json({
        success: false,
        error: 'El precio debe ser un número válido mayor o igual a 0'
      });
      return;
    }

    const updateData = {
      name,
      description,
      price,
      category_id,
      image_url,
      preparation_time,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      is_available,
      ingredients
    };

    const updatedProduct = await DataAdapter.updateProduct(parseInt(id || '0'), updateData);

    if (!updatedProduct) {
      res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { product: updatedProduct }
    });
  } catch (error: any) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Delete product
 * DELETE /api/products/:id
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await DataAdapter.deleteProduct(parseInt(id || '0'));

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error: any) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Toggle product availability
 * PATCH /api/products/:id/availability
 */
router.patch('/:id/availability', authenticateToken, authorizeRoles('admin', 'kitchen'), async (req: Request, res: Response): Promise<void> => {
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

    const updatedProduct = await DataAdapter.updateProduct(parseInt(id || '0'), { is_active: is_available });

    if (!updatedProduct) {
      res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Producto ${is_available ? 'habilitado' : 'deshabilitado'} exitosamente`,
      data: { product: updatedProduct }
    });
  } catch (error: any) {
    console.error('Error actualizando disponibilidad:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;
