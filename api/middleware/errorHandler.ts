import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}

export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Si ya se envió una respuesta, delegar al error handler por defecto
  if (res.headersSent) {
    return next(error);
  }

  // Log del error
  console.error('Error Handler:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Determinar si es un ApiError personalizado
  if (error instanceof ApiError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    };

    res.status(error.statusCode).json(response);
    return;
  }

  // Manejo de errores específicos
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Error interno del servidor';
  let details: any = undefined;

  // Error de validación de Joi/Zod
  if (error.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Error de validación de datos';
    details = (error as any).details || error.message;
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Token de autenticación inválido';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token de autenticación expirado';
  }

  // Error de base de datos
  if (error.message.includes('duplicate key')) {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'El recurso ya existe';
  }

  if (error.message.includes('foreign key constraint')) {
    statusCode = 400;
    code = 'FOREIGN_KEY_CONSTRAINT';
    message = 'Violación de restricción de clave foránea';
  }

  // Error de sintaxis JSON
  if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'JSON malformado en el cuerpo de la solicitud';
  }

  // Error de límite de tamaño
  if (error.message.includes('request entity too large')) {
    statusCode = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'El tamaño de la solicitud excede el límite permitido';
  }

  // En desarrollo, incluir stack trace
  if (process.env.NODE_ENV === 'development') {
    details = {
      stack: error.stack,
      ...details,
    };
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string,
    },
  };

  res.status(statusCode).json(response);
};
