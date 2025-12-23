import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export class CategoryController {
  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, [], 'Categorías obtenidas exitosamente');
    } catch (error: any) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Categoría no encontrada');
    } catch (error: any) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  updateCategoryStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };
}
