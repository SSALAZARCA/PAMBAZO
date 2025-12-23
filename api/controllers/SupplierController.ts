import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export class SupplierController {
  getSuppliers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, [], 'Proveedores obtenidos exitosamente');
    } catch (error: any) {
      next(error);
    }
  };

  getSupplierById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(404, 'SUPPLIER_NOT_FOUND', 'Proveedor no encontrado');
    } catch (error: any) {
      next(error);
    }
  };

  createSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  updateSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  deleteSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };

  updateSupplierStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Funcionalidad no implementada');
    } catch (error: any) {
      next(error);
    }
  };
}
