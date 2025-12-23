import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Si no hay API_KEY configurada, saltar validación
  if (!process.env.API_KEY) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    throw new ApiError(401, 'API_KEY_MISSING', 'API Key requerida');
  }

  if (apiKey !== process.env.API_KEY) {
    throw new ApiError(401, 'API_KEY_INVALID', 'API Key inválida');
  }

  next();
};
