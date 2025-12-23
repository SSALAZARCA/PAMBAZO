/**
 * Users API routes
 * Handle CRUD operations for user management
 */
import { Router, type Request, type Response } from 'express';
import { DataAdapter } from '../services/dataAdapter.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { convertToFrontendUser } from '../types/index.js';

const router = Router();

/**
 * Get all users
 * GET /api/users
 * Only accessible by admin and owner roles
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'owner'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, limit = '50', offset = '0' } = req.query;

    // Get all users from database
    const users = await DataAdapter.getAllUsers({
      search: search as string,
      role: role as string,
      limit: parseInt((limit as string) || '50'),
      offset: parseInt((offset as string) || '0')
    });

    // Convert backend users to frontend format
    const frontendUsers = users.map(convertToFrontendUser);

    res.status(200).json({
      success: true,
      data: {
        users: frontendUsers,
        total: frontendUsers.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching users:', error as any);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener usuarios'
    });
  }
});

/**
 * Get user by ID
 * GET /api/users/:id
 * Only accessible by admin and owner roles
 */
router.get('/:id', authenticateToken, authorizeRoles('admin', 'owner'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await DataAdapter.getUserById(parseInt(id || '0'));

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    // Convert backend user to frontend format
    const frontendUser = convertToFrontendUser(user!);

    res.status(200).json({
      success: true,
      data: {
        user: frontendUser
      }
    });
  } catch (error: any) {
    console.error('Error fetching user:', error as any);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener usuario'
    });
  }
});

/**
 * Update user
 * PUT /api/users/:id
 * Only accessible by admin and owner roles
 */
router.put('/:id', authenticateToken, authorizeRoles('admin', 'owner'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, address, is_active } = req.body;

    // Check if user exists
    const existingUser = await DataAdapter.getUserById(parseInt(id || '0'));
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    // Update user data
    const updatedUser = await DataAdapter.updateUser(parseInt(id || '0'), {
      name,
      email,
      role,
      phone,
      address,
      is_active
    });

    if (!updatedUser) {
      res.status(500).json({
        success: false,
        error: 'Error al actualizar usuario'
      });
      return;
    }

    // Convert backend user to frontend format
    const frontendUser = convertToFrontendUser(updatedUser);

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        user: frontendUser
      }
    });
  } catch (error: any) {
    console.error('Error updating user:', error as any);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al actualizar usuario'
    });
  }
});

/**
 * Delete user
 * DELETE /api/users/:id
 * Only accessible by admin and owner roles
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'owner'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Prevent users from deleting themselves
    if (currentUser?.id === id) {
      res.status(400).json({
        success: false,
        error: 'No puedes eliminar tu propia cuenta'
      });
      return;
    }

    // Check if user exists
    const existingUser = await DataAdapter.getUserById(parseInt(id || '0'));
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    // Delete user
    await DataAdapter.deleteUser(parseInt(id || '0'));

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error: any) {
    console.error('Error deleting user:', error as any);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar usuario'
    });
  }
});
