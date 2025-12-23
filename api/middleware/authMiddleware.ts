import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { UserService } from '../services/UserService';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Token de autorización requerido');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Token de autorización inválido');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new ApiError(500, 'INTERNAL_SERVER_ERROR', 'Configuración de JWT no encontrada');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, 'TOKEN_EXPIRED', 'Token expirado');
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, 'TOKEN_INVALID', 'Token inválido');
      } else {
        throw new ApiError(401, 'TOKEN_ERROR', 'Error al verificar token');
      }
    }

    // Verificar que el usuario aún existe y está activo
    const userService = new UserService();
    const user = await userService.getUserById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    if (!user.is_active) {
      throw new ApiError(401, 'USER_INACTIVE', 'Usuario inactivo');
    }

    // Agregar información del usuario al request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: any) {
    next(error);
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      
      // Verificar que el usuario aún existe y está activo
      const userService = new UserService();
      const user = await userService.getUserById(decoded.id);

      if (user && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    } catch (jwtError) {
      // En autenticación opcional, ignoramos errores de JWT
    }

    next();
  } catch (error: any) {
    next(error);
  }
};
