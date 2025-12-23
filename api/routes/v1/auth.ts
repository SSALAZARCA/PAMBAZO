/**
 * API v1 - Authentication Routes
 * Rutas de autenticación siguiendo las especificaciones técnicas reestructuradas
 */

import { Router } from 'express';
import { AuthController } from '../../controllers/AuthController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validateRequest';
import {
  validateLogin,
  validateRegister,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword
} from '../../validators/authValidators';

const router = Router();
const authController = new AuthController();

/**
 * POST /api/v1/auth/login
 * Autenticación de usuario
 */
router.post('/login',
  validateLogin,
  authController.login.bind(authController)
);

/**
 * POST /api/v1/auth/register
 * Registro de nuevo usuario (solo admin/owner)
 */
router.post('/register',
  authMiddleware,
  validateRegister,
  authController.register.bind(authController)
);

/**
 * POST /api/v1/auth/refresh
 * Renovar token de acceso
 */
router.post('/refresh',
  validateRefreshToken,
  authController.refreshToken.bind(authController)
);

/**
 * POST /api/v1/auth/logout
 * Cerrar sesión
 */
router.post('/logout',
  authMiddleware,
  authController.logout.bind(authController)
);

/**
 * POST /api/v1/auth/forgot-password
 * Solicitar restablecimiento de contraseña
 */
router.post('/forgot-password',
  validateForgotPassword,
  authController.forgotPassword.bind(authController)
);

/**
 * POST /api/v1/auth/reset-password
 * Restablecer contraseña
 */
router.post('/reset-password',
  validateResetPassword,
  authController.resetPassword.bind(authController)
);

/**
 * GET /api/v1/auth/me
 * Obtener información del usuario actual
 */
router.get('/me',
  authMiddleware,
  authController.getCurrentUser.bind(authController)
);

/**
 * PUT /api/v1/auth/profile
 * Actualizar perfil del usuario actual
 */
router.put('/profile',
  authMiddleware,
  authController.updateProfile.bind(authController)
);

/**
 * POST /api/v1/auth/change-password
 * Cambiar contraseña del usuario actual
 */
router.post('/change-password',
  authMiddleware,
  authController.changePassword.bind(authController)
);

export default router;
