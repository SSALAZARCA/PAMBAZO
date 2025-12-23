import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const response = {
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    },
    meta: {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      availableEndpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        products: '/api/v1/products',
        categories: '/api/v1/categories',
        orders: '/api/v1/orders',
        tables: '/api/v1/tables',
        inventory: '/api/v1/inventory',
        suppliers: '/api/v1/suppliers',
        reports: '/api/v1/reports',
        notifications: '/api/v1/notifications',
        health: '/health',
        apiInfo: '/api',
      },
    },
  };

  res.status(404).json(response);
};
