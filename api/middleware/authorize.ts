import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'No autenticado');
    }

    if (!roles.includes(user.role)) {
      throw new ApiError(403, 'FORBIDDEN', 'No tiene permisos para realizar esta acción');
    }

    next();
  };
}
