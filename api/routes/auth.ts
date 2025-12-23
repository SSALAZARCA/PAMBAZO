/**
 * User authentication API routes
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express';
import { DataAdapter } from '../services/dataAdapter.js';
import { hashPassword, comparePassword, generateToken, validateEmail, validatePassword } from '../utils/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'customer', phone, address } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Nombre, email y contraseña son requeridos'
      });
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Contraseña no cumple los requisitos',
        details: passwordValidation.errors
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone,
      address,
      is_active: true
    };

    const newUser = await DataAdapter.createUser(userData);

    // Generate token
    const token = generateToken(newUser.id.toString(), newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          address: newUser.address,
          created_at: newUser.created_at
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Error en registro:', error);

    if (error.message && error.message.includes('ya existe')) {
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
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
      return;
    }

    // Find user by email
    const user = await DataAdapter.getUserByEmail(email.toLowerCase());

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
      return;
    }

    // Check if user is active
    if (!user.is_active) {
      res.status(401).json({
        success: false,
        error: 'Usuario inactivo. Contacta al administrador'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
      return;
    }

    // Generate token
    const token = generateToken(user.id.toString(), user.email, user.role);

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Get current user profile
 * GET /api/auth/profile
 */
router.get('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }

    const user = await DataAdapter.getUserById(parseInt(userId));

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
router.put('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, phone, address } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }

    // Validate required fields
    if (!name) {
      res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      });
      return;
    }

    const userData: Partial<import('../types/index.js').BackendUser> = { name, phone, address };
    const updatedUser = await DataAdapter.updateUser(parseInt(userId), userData);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: updatedUser
      }
    });
  } catch (error: any) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Change password
 * PUT /api/auth/change-password
 */
router.put('/change-password', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }

    // Validate required fields
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Contraseña actual y nueva contraseña son requeridas'
      });
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        error: 'La nueva contraseña no cumple los requisitos',
        details: passwordValidation.errors
      });
      return;
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password using DataAdapter
    const success = await DataAdapter.updateUserPassword(parseInt(userId), currentPassword, hashedNewPassword);

    if (!success) {
      res.status(401).json({
        success: false,
        error: 'Contraseña actual incorrecta o usuario no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * User Logout (client-side token invalidation)
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // In a JWT implementation, logout is typically handled client-side
    // by removing the token from storage. Here we just confirm the logout.
    res.status(200).json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error: any) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;
