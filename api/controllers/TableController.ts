import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export class TableController {
  getTables = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, [], 'Mesas obtenidas exitosamente');
    } catch (error: any) {
      next(error);
    }
  };

  getTableById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(404, 'TABLE_NOT_FOUND', 'Mesa no encontrada');
    } catch (error: any) {
      next(error);
    }
  };

  createTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  updateTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  deleteTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  updateTableStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  getTablesByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };
}
