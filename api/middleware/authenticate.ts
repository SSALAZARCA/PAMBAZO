import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { JwtPayload } from '../types';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'UNAUTHORIZED', 'Token no proporcionado');
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new ApiError(500, 'INTERNAL_SERVER_ERROR', 'Configuración de JWT no encontrada');
        }

        try {
            const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
            (req as any).user = decoded;
            next();
        } catch (jwtError) {
            throw new ApiError(401, 'INVALID_TOKEN', 'Token inválido o expirado');
        }
    } catch (error) {
        next(error);
    }
}
