/**
 * Orders API routes
 * Handle CRUD operations for orders
 */
import { Router, type Request, type Response } from 'express';
import { DataAdapter } from '../services/dataAdapter.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

/**
 * Get all orders
 * GET /api/orders
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, table_id, user_id, date_from, date_to, limit = '50', offset = '0' } = req.query;
    const currentUser = req.user;

    const filters = {
      status: status as string,
      table_id: table_id as string,
      user_id: currentUser?.role === 'customer' ? currentUser.id : (user_id as string),
      date_from: date_from as string,
      date_to: date_to as string,
      limit: parseInt((limit as string) || '50'),
      offset: parseInt((offset as string) || '0')
    };

    const orders = await DataAdapter.getAllOrders();

    res.status(200).json({
      success: true,
      data: {
        orders
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Get order by ID
 * GET /api/orders/:id
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const order = await DataAdapter.getOrderById(parseInt(id || '0'));

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
      return;
    }

    // If customer, only allow access to their own orders
    if (currentUser?.role === 'customer' && order.user_id !== parseInt(currentUser.id)) {
      res.status(403).json({
        success: false,
        error: 'No tienes permisos para ver este pedido'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error: any) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Create new order
 * POST /api/orders
 */
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { table_id, items, notes, order_type = 'dine_in' } = req.body;
    const user_id = req.user?.id;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Los items del pedido son requeridos'
      });
      return;
    }

    // Validate table if dine_in
    if (order_type === 'dine_in' && !table_id) {
      res.status(400).json({
        success: false,
        error: 'Mesa es requerida para pedidos en el restaurante'
      });
      return;
    }

    // Calculate total amount from items
    let total_amount = 0;
    if (items && Array.isArray(items)) {
      total_amount = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);
    }

    const orderData = {
      user_id: parseInt(user_id || '0'),
      table_id,
      items,
      notes,
      order_type,
      status: 'pending' as 'pending' | 'completed' | 'cancelled',
      total_amount
    };

    const newOrder = await DataAdapter.createOrder(orderData);

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: { order: newOrder }
    });
  } catch (error: any) {
    console.error('Error creando pedido:', error);

    if (error.message.includes('no válida') || error.message.includes('no disponible') || error.message.includes('no encontrado')) {
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
 * Update order status
 * PATCH /api/orders/:id/status
 */
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'kitchen', 'waiter'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Estado no válido',
        validStatuses
      });
      return;
    }

    const updatedOrder = await DataAdapter.updateOrder(parseInt(id || '0'), { status });

    if (!updatedOrder) {
      res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Estado del pedido actualizado exitosamente',
      data: { order: updatedOrder }
    });
  } catch (error: any) {
    console.error('Error actualizando estado del pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Cancel order
 * DELETE /api/orders/:id
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser || !currentUser.id) {
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }

    const success = await DataAdapter.deleteOrder(parseInt(id || '0'), parseInt(currentUser.id), currentUser.role);

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Pedido no encontrado o no tienes permisos para cancelarlo'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Pedido cancelado exitosamente'
    });
  } catch (error: any) {
    console.error('Error cancelando pedido:', error);

    if (error.message.includes('no se puede cancelar')) {
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
 * Get order statistics
 * GET /api/orders/stats
 */
router.get('/stats/overview', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { date_from, date_to } = req.query;

    const filters = {
      date_from: date_from as string,
      date_to: date_to as string
    };

    const stats = await DataAdapter.getOrderStats(filters);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;
