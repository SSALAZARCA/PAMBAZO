// Configuración de rate limits por endpoint y tipo de usuario

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Rate limits generales
export const generalLimits: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requests por ventana
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Rate limits para autenticación
export const authLimits: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos de login por ventana
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar logins exitosos
};

// Rate limits para registro
export const registerLimits: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 registros por hora
  message: 'Too many registration attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Rate limits para reset de password
export const passwordResetLimits: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 intentos por hora
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Rate limits para APIs críticas
export const criticalApiLimits: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requests por minuto
  message: 'Rate limit exceeded for critical operations.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Rate limits para operaciones de escritura
export const writeLimits: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // 60 operaciones de escritura por minuto
  message: 'Too many write operations, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Rate limits para operaciones de lectura
export const readLimits: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minuto
  max: 200, // 200 operaciones de lectura por minuto
  message: 'Too many read operations, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Rate limits por rol de usuario
export const roleLimits = {
  guest: {
    windowMs: 15 * 60 * 1000,
    max: 100, // Usuarios no autenticados: 100 requests por 15 min
  },
  user: {
    windowMs: 15 * 60 * 1000,
    max: 500, // Usuarios normales: 500 requests por 15 min
  },
  admin: {
    windowMs: 15 * 60 * 1000,
    max: 2000, // Administradores: 2000 requests por 15 min
  },
  owner: {
    windowMs: 15 * 60 * 1000,
    max: 5000, // Propietarios: 5000 requests por 15 min
  },
};

// IPs de confianza (whitelist)
export const trustedIPs = [
  '127.0.0.1',
  '::1',
  'localhost',
  // Agregar IPs de servidores de confianza aquí
];

// Rate limits para WebSockets
export const websocketLimits = {
  connectionsPerIP: 10, // Máximo 10 conexiones por IP
  messagesPerMinute: 100, // Máximo 100 mensajes por minuto por conexión
  maxMessageSize: 1024 * 10, // Máximo 10KB por mensaje
};

// Configuración de slow down (degradación gradual)
export const slowDownConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 100, // Comenzar a ralentizar después de 100 requests
  delayMs: 500, // Incrementar delay en 500ms por request
  maxDelayMs: 20000, // Máximo delay de 20 segundos
};

// Endpoints que requieren rate limiting especial
export const endpointLimits = {
  '/api/auth/login': authLimits,
  '/api/auth/register': registerLimits,
  '/api/auth/forgot-password': passwordResetLimits,
  '/api/auth/reset-password': passwordResetLimits,
  '/api/v1/orders': writeLimits,
  '/api/v1/products': readLimits,
  '/api/v1/users': criticalApiLimits,
  '/api/v1/reports': readLimits,
};

// Función para obtener límite por rol
export const getLimitByRole = (role?: string): RateLimitConfig => {
  const roleLimit = roleLimits[role as keyof typeof roleLimits] || roleLimits.guest;
  
  return {
    windowMs: roleLimit.windowMs,
    max: roleLimit.max,
    message: `Rate limit exceeded for ${role || 'guest'} role.`,
    standardHeaders: true,
    legacyHeaders: false,
  };
};

// Función para verificar si una IP está en la whitelist
export const isTrustedIP = (ip: string): boolean => {
  return trustedIPs.includes(ip);
};

// Configuración de rate limiting por entorno
export const getEnvironmentLimits = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...generalLimits,
        max: 1000,
      };
    case 'staging':
      return {
        ...generalLimits,
        max: 2000,
      };
    case 'development':
      return {
        ...generalLimits,
        max: 10000, // Más permisivo en desarrollo
      };
    default:
      return generalLimits;
  }
};
