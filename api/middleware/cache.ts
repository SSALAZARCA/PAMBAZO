import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/CacheService';

/**
 * Middleware to cache GET requests
 */
export function cacheMiddleware(ttl: number = 300) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl}`;

        try {
            const cached = await CacheService.get(key);

            if (cached) {
                return res.json(cached);
            }

            // Store original json method
            const originalJson = res.json.bind(res);

            // Override json method to cache response
            res.json = function (body: any) {
                CacheService.set(key, body, ttl);
                return originalJson(body);
            };

            next();
        } catch (error) {
            next();
        }
    };
}

/**
 * Middleware to invalidate cache on mutations
 */
export function invalidateCacheMiddleware(patterns: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to invalidate cache after successful response
        res.json = function (body: any) {
            if (res.statusCode < 400) {
                patterns.forEach(pattern => {
                    CacheService.invalidatePattern(pattern);
                });
            }
            return originalJson(body);
        };

        next();
    };
}
