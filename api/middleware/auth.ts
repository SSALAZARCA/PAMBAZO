/**
 * Authentication middleware for JWT token validation
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DataAdapter } from '../services/dataAdapter.js';

// Extend Request interface to include user


/**
 * Verify JWT token middleware
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'] as string;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de acceso requerido'
      });
      return;
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        error: 'Configuración del servidor incorrecta'
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Get user from database or mock data
    const user = await DataAdapter.getUserById(parseInt(decoded.userId));

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    if (!user.is_active) {
      res.status(401).json({
        success: false,
        error: 'Usuario inactivo'
      });
      return;
    }

    // Add user to request
    (req as any).user = {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error: any) {
    console.error('Error en autenticación:', error as any);
    res.status(403).json({
      success: false,
      error: 'Token inválido'
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!(req as any).user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    if (!roles.includes((req as any).user.role)) {
      res.status(403).json({
        success: false,
        error: 'No tienes permisos para realizar esta acción'
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as any;

    const user = await DataAdapter.getUserById(parseInt(decoded.userId));

    if (user && user.is_active) {
      (req as any).user = {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      };
    }

    next();
  } catch (error: any) {
    // If token is invalid, just continue without user
    const _ = error as any;
    next();
  }
};
