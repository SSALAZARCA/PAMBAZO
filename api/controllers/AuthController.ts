import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { UserService } from '../services/UserService';
import { RefreshTokenService } from '../services/RefreshTokenService';
import { JwtPayload } from '../types';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Buscar usuario por email
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
      }

      // Verificar que el usuario esté activo
      if (!user.is_active) {
        throw new ApiError(401, 'USER_INACTIVE', 'Usuario inactivo');
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
      }

      // Generar access token
      const accessToken = this.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Generar refresh token
      const refreshToken = await RefreshTokenService.createRefreshToken(user.id);

      // Actualizar último login
      await this.userService.updateLastLogin(user.id);

      const tokens = {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      };

      // Respuesta exitosa
      ApiResponse.success(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          created_at: user.created_at,
          last_login: new Date().toISOString(),
        },
        tokens,
      }, 'Inicio de sesión exitoso');

    } catch (error: any) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, email, password, role, first_name, last_name, phone } = req.body;

      // Verificar si el email ya existe
      const existingUser = await this.userService.getUserByEmail(email);
      if (existingUser) {
        throw new ApiError(409, 'EMAIL_EXISTS', 'El email ya está registrado');
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear usuario
      const newUser = await this.userService.createUser({
        username,
        email,
        password_hash: hashedPassword,
        role: role || 'waiter',
        first_name,
        last_name,
        phone,
        is_active: true,
      });

      // Generar access token
      const accessToken = this.generateAccessToken({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      // Generar refresh token
      const refreshToken = await RefreshTokenService.createRefreshToken(newUser.id);

      const tokens = {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      };

      // Respuesta exitosa
      ApiResponse.created(res, {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          phone: newUser.phone,
          created_at: newUser.created_at,
        },
        tokens,
      }, 'Usuario registrado exitosamente');

    } catch (error: any) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ApiError(401, 'REFRESH_TOKEN_REQUIRED', 'Refresh token requerido');
      }

      // Verificar refresh token
      const userId = await RefreshTokenService.verifyRefreshToken(refreshToken);
      if (!userId) {
        throw new ApiError(401, 'REFRESH_TOKEN_INVALID', 'Refresh token inválido o expirado');
      }

      // Verificar que el usuario aún existe y está activo
      const user = await this.userService.getUserById(userId);
      if (!user || !user.is_active) {
        throw new ApiError(401, 'USER_NOT_FOUND', 'Usuario no encontrado o inactivo');
      }

      // Generar nuevo access token
      const newAccessToken = this.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Rotar refresh token (revocar el anterior y crear uno nuevo)
      const newRefreshToken = await RefreshTokenService.rotateRefreshToken(refreshToken);
      if (!newRefreshToken) {
        throw new ApiError(401, 'REFRESH_TOKEN_ROTATION_FAILED', 'Error al rotar refresh token');
      }

      const tokens = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      };

      ApiResponse.success(res, { tokens }, 'Tokens renovados exitosamente');

    } catch (error: any) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      // Revocar todos los refresh tokens del usuario
      if (userId) {
        await RefreshTokenService.revokeAllUserTokens(userId);
      }

      ApiResponse.success(res, null, 'Sesión cerrada exitosamente');
    } catch (error: any) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        // Por seguridad, no revelamos si el email existe
        ApiResponse.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
        return;
      }

      // Aquí se implementaría el envío de email con token de reset
      // Por ahora, solo simulamos la respuesta
      ApiResponse.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');

    } catch (error: any) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = req.body;

      // Aquí se verificaría el token de reset
      // Por ahora, simulamos la implementación
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');

    } catch (error: any) {
      next(error);
    }
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Usuario no autenticado');
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
      }

      ApiResponse.success(res, {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        is_active: user.is_active,
        created_at: user.created_at,
        last_login: user.last_login,
      }, 'Información del usuario obtenida exitosamente');

    } catch (error: any) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Usuario no autenticado');
      }

      const { first_name, last_name, phone, username } = req.body;

      const updatedUser = await this.userService.updateUser(userId, {
        first_name,
        last_name,
        phone,
        username,
      });

      if (!updatedUser) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
      }

      ApiResponse.success(res, {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        phone: updatedUser.phone,
        updated_at: updatedUser.updated_at,
      }, 'Perfil actualizado exitosamente');

    } catch (error: any) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Usuario no autenticado');
      }

      const { currentPassword, newPassword } = req.body;

      // Obtener usuario actual
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        throw new ApiError(400, 'INVALID_CURRENT_PASSWORD', 'Contraseña actual incorrecta');
      }

      // Hash de la nueva contraseña
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Actualizar contraseña
      await this.userService.updateUser(userId, {
        password_hash: hashedNewPassword,
      });

      ApiResponse.success(res, null, 'Contraseña actualizada exitosamente');

    } catch (error: any) {
      next(error);
    }
  };

  private generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new ApiError(500, 'INTERNAL_SERVER_ERROR', 'Configuración de JWT no encontrada');
    }

    const accessToken = jwt.sign(payload, jwtSecret as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    } as jwt.SignOptions);

    return accessToken;
  }
}
