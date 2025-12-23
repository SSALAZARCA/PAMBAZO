import rateLimit from 'express-rate-limit';

// Rate limiter global por IP
export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter estricto para login
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Solo 5 intentos de login
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_LOGIN_ATTEMPTS',
            message: 'Demasiados intentos de inicio de sesión, por favor intente más tarde'
        }
    },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter para registro
export const registerRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // Solo 3 registros por hora
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REGISTRATIONS',
            message: 'Demasiados registros desde esta IP'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter para API endpoints
export const apiRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // 30 requests por minuto
    message: {
        success: false,
        error: {
            code: 'API_RATE_LIMIT_EXCEEDED',
            message: 'Demasiadas solicitudes a la API'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});
