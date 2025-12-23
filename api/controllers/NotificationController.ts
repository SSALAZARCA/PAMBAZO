import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export class NotificationController {
  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, [], 'Notificaciones obtenidas exitosamente');
    } catch (error: any) {
      next(error);
    }
  };

  getNotificationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', 'Notificación no encontrada');
    } catch (error: any) {
      next(error);
    }
  };

  createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, null, 'Todas las notificaciones marcadas como leídas');
    } catch (error: any) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, { count: 0 }, 'Contador de notificaciones no leídas obtenido');
    } catch (error: any) {
      next(error);
    }
  };
}
