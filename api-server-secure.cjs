// ==================== SERVIDOR API PAMBAZO v1 - SEGURO Y OPTIMIZADO ====================
// Servidor completo con todas las funcionalidades de seguridad y optimización

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const joi = require('joi');

// Importar configuraciones y middleware personalizados
const { getSecurityConfig } = require('./api/config/security.cjs');
const { getCorsOptions } = require('./api/config/cors.cjs');
const { getRateLimitByRole, getGeneralRateLimit } = require('./api/config/rateLimits.cjs');
const { logger, logSecurityEvent, logWebSocketEvent, logPerformance } = require('./api/utils/logger.cjs');
const { MetricsCollector } = require('./api/utils/metrics.cjs');
const { HealthMonitor, performanceMonitor } = require('./api/utils/monitoring.cjs');

// Importar middleware de seguridad
const { helmetMiddleware, additionalSecurityMiddleware, inputSanitizationMiddleware, 
        inputValidationMiddleware, suspiciousActivityDetection } = require('./api/middleware/security.cjs');
const { httpLogger, errorLogger, authLogger, accessLogger } = require('./api/middleware/logging.cjs');
const { generalRateLimit, authRateLimit, registrationRateLimit, 
        slowDownMiddleware, roleBasedRateLimit } = require('./api/middleware/rateLimiting.cjs');

// Importar validadores
const { validateAuth } = require('./api/validators/authValidators.cjs');
const { validateUser } = require('./api/validators/userValidators.cjs');
const { validateProduct } = require('./api/validators/productValidators.cjs');
const { validateOrder } = require('./api/validators/orderValidators.cjs');

const app = express();
const PORT = process.env.PORT || 3002;

// Inicializar métricas y monitoreo
const metrics = new MetricsCollector();
const healthMonitor = new HealthMonitor();

// ==================== CONFIGURACIÓN DE SEGURIDAD ====================

// Configurar Helmet para seguridad
app.use(helmetMiddleware);

// Middleware de seguridad adicional
app.use(additionalSecurityMiddleware);

// Configurar CORS
const corsOptions = getCorsOptions();
app.use(cors(corsOptions));

// Rate limiting general
app.use(generalRateLimit);

// Logging de HTTP requests
app.use(httpLogger);

// Monitoreo de performance
app.use(performanceMonitor);

// Detección de actividad sospechosa
app.use(suspiciousActivityDetection);

// Parsing de JSON con límites de seguridad
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Verificar tamaño del payload
    if (buf.length > 10 * 1024 * 1024) {
      const error = new Error('Payload demasiado grande');
      error.status = 413;
      throw error;
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitización de entrada
app.use(inputSanitizationMiddleware);

// Validación de entrada
app.use(inputValidationMiddleware);

// ==================== CONFIGURACIÓN DE BASE DE DATOS ====================

const pool = new Pool({
  user: process.env.DB_USER || 'pambazo_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pambazo_db',
  password: process.env.DB_PASSWORD || 'pambazo_2024',
  port: process.env.DB_PORT || 5432,
  max: 20, // máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // tiempo antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // tiempo máximo para obtener conexión
});

// ==================== DATOS MOCK PARA PRUEBAS ====================

const mockUsers = [
  {
    id: 1,
    username: 'owner',
    email: 'owner@pambazo.com',
    password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'owner',
    first_name: 'Admin',
    last_name: 'Owner',
    phone: '+1234567890',
    is_active: true,
    created_at: new Date(),
    last_login: new Date()
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@pambazo.com',
    password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    phone: '+1234567891',
    is_active: true,
    created_at: new Date(),
    last_login: new Date()
  }
];

// Test de conexión a la base de datos
let dbConnected = false;
pool.connect()
  .then(client => {
    logger.info('✅ Conexión a PostgreSQL establecida correctamente');
    dbConnected = true;
    client.release();
  })
  .catch(err => {
    logger.warn('⚠️ PostgreSQL no disponible, usando datos mock:', err.message);
    dbConnected = false;
  });

// ==================== CLASE DE RESPUESTA API ====================

class ApiResponse {
  static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    // Log de respuesta exitosa
    logger.info('API Response Success', {
      statusCode,
      message,
      hasData: !!data,
      requestId: res.locals.requestId
    });
    
    return res.status(statusCode).json(response);
  }

  static error(res, statusCode = 500, errorCode = 'INTERNAL_ERROR', message = 'Error interno', details = null) {
    const response = {
      success: false,
      error: {
        code: errorCode,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    };

    // Log de error
    logger.error('API Response Error', {
      statusCode,
      errorCode,
      message,
      details,
      requestId: res.locals.requestId
    });

    // Log de evento de seguridad si es necesario
    if (statusCode === 401 || statusCode === 403) {
      logSecurityEvent('unauthorized_access', {
        statusCode,
        errorCode,
        message,
        requestId: res.locals.requestId
      });
    }

    return res.status(statusCode).json(response);
  }
}

// ==================== MIDDLEWARE DE AUTENTICACIÓN ====================

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityEvent('missing_auth_token', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'),
        requestId: res.locals.requestId
      });
      return ApiResponse.error(res, 401, 'MISSING_TOKEN', 'Token de acceso requerido');
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'pambazo_secret_key_2024';

    const decoded = jwt.verify(token, jwtSecret);
    
    // Verificar que el usuario existe y está activo
    let user;
    if (dbConnected) {
      const userQuery = 'SELECT id, email, role, is_active FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [decoded.id]);
      user = userResult.rows[0];
    } else {
      user = mockUsers.find(u => u.id === decoded.id);
    }

    if (!user || !user.is_active) {
      logSecurityEvent('invalid_user_token', { 
        userId: decoded.id, 
        ip: req.ip,
        requestId: res.locals.requestId
      });
      return ApiResponse.error(res, 401, 'INVALID_TOKEN', 'Token inválido o usuario inactivo');
    }

    req.user = user;
    
    // Log de autenticación exitosa
    authLogger(req, res, () => {});
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logSecurityEvent('invalid_jwt_token', { 
        error: error.message, 
        ip: req.ip,
        requestId: res.locals.requestId
      });
      return ApiResponse.error(res, 401, 'INVALID_TOKEN', 'Token inválido');
    }
    
    if (error.name === 'TokenExpiredError') {
      logSecurityEvent('expired_jwt_token', { 
        ip: req.ip,
        requestId: res.locals.requestId
      });
      return ApiResponse.error(res, 401, 'TOKEN_EXPIRED', 'Token expirado');
    }

    logger.error('Auth middleware error:', error);
    return ApiResponse.error(res, 500, 'AUTH_ERROR', 'Error de autenticación');
  }
};

// ==================== MIDDLEWARE DE AUTORIZACIÓN ====================

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 401, 'UNAUTHORIZED', 'Usuario no autenticado');
    }

    if (!allowedRoles.includes(req.user.role)) {
      logSecurityEvent('insufficient_permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
        requestId: res.locals.requestId
      });
      return ApiResponse.error(res, 403, 'FORBIDDEN', 'Sin permisos para esta operación');
    }

    // Log de acceso autorizado
    accessLogger(req, res, () => {});
    
    next();
  };
};

// ==================== RUTAS DE MONITOREO Y SALUD ====================

// Health check básico
app.get('/api/v1/health', (req, res) => {
  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbConnected ? 'connected' : 'mock',
      version: '1.0.0'
    };
    ApiResponse.success(res, healthData);
  } catch (error) {
    logger.error('Health check error:', error);
    ApiResponse.error(res, 500, 'HEALTH_ERROR', 'Error en health check');
  }
});

// Health check detallado (solo para admins)
app.get('/api/v1/health/detailed', authMiddleware, authorize(['owner', 'admin']), async (req, res) => {
  try {
    const detailedHealth = await healthMonitor.getDetailedHealth();
    ApiResponse.success(res, detailedHealth);
  } catch (error) {
    logger.error('Detailed health check error:', error);
    ApiResponse.error(res, 500, 'HEALTH_CHECK_ERROR', 'Error en verificación de salud');
  }
});

// Métricas del sistema (solo para admins)
app.get('/api/v1/metrics', authMiddleware, authorize(['owner', 'admin']), (req, res) => {
  const metricsData = metrics.getMetrics();
  ApiResponse.success(res, metricsData);
});

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Login con rate limiting específico
app.post('/api/v1/auth/login', 
  authRateLimit,
  validateAuth('login'),
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { email, password } = req.body;
      let user;

      if (dbConnected) {
        // Buscar usuario en base de datos
        const userQuery = `
          SELECT id, username, email, password_hash, role, first_name, last_name, 
                 phone, is_active, created_at, last_login
          FROM users 
          WHERE email = $1
        `;
        const userResult = await pool.query(userQuery, [email]);
        user = userResult.rows[0];
      } else {
        // Usar datos mock
        user = mockUsers.find(u => u.email === email);
      }

      if (!user) {
        logSecurityEvent('login_attempt_invalid_user', { 
          email, 
          ip: req.ip, 
          userAgent: req.get('User-Agent'),
          requestId: res.locals.requestId
        });
        
        // Simular tiempo de verificación para prevenir timing attacks
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
        
        return ApiResponse.error(res, 401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
      }

      if (!user.is_active) {
        logSecurityEvent('login_attempt_inactive_user', { 
          userId: user.id, 
          email, 
          ip: req.ip,
          requestId: res.locals.requestId
        });
        return ApiResponse.error(res, 401, 'USER_INACTIVE', 'Usuario inactivo');
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        logSecurityEvent('login_attempt_invalid_password', { 
          userId: user.id, 
          email, 
          ip: req.ip,
          requestId: res.locals.requestId
        });
        return ApiResponse.error(res, 401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
      }

      // Generar tokens
      const jwtSecret = process.env.JWT_SECRET || 'pambazo_secret_key_2024';
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
      const refreshToken = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

      // Actualizar último login
      if (dbConnected) {
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
      } else {
        user.last_login = new Date();
      }

      // Log de login exitoso
      logSecurityEvent('successful_login', { 
        userId: user.id, 
        email, 
        role: user.role, 
        ip: req.ip,
        requestId: res.locals.requestId
      });

      // Registrar métricas
      metrics.recordRequest(req.method, req.route?.path || req.path, 200, Date.now() - startTime);
      metrics.recordSecurityEvent('successful_login');

      ApiResponse.success(res, {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 86400 // 24 horas en segundos
        }
      }, 'Login exitoso');

    } catch (error) {
      logger.error('Login error:', error);
      metrics.recordRequest(req.method, req.route?.path || req.path, 500, Date.now() - startTime);
      ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error interno del servidor');
    }
  }
);

// Get current user
app.get('/api/v1/auth/me', authMiddleware, async (req, res) => {
  try {
    const userQuery = `
      SELECT id, username, email, role, first_name, last_name, 
             phone, created_at, last_login
      FROM users 
      WHERE id = $1
    `;
    const userResult = await pool.query(userQuery, [req.user.id]);
    const user = userResult.rows[0];

    if (!user) {
      return ApiResponse.error(res, 404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    ApiResponse.success(res, {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      createdAt: user.created_at,
      lastLogin: user.last_login
    });

  } catch (error) {
    logger.error('Get current user error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error interno del servidor');
  }
});

// Logout
app.post('/api/v1/auth/logout', authMiddleware, (req, res) => {
  logSecurityEvent('user_logout', { 
    userId: req.user.id, 
    ip: req.ip,
    requestId: res.locals.requestId
  });
  
  // En una implementación real, aquí invalidaríamos el token en una blacklist
  ApiResponse.success(res, null, 'Logout exitoso');
});

// ==================== RUTAS DE USUARIOS ====================

// Get all users
app.get('/api/v1/users', 
  authMiddleware, 
  authorize(['owner', 'admin']),
  validateUser('pagination'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search, role } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT id, username, email, role, first_name, last_name, 
               phone, is_active, created_at, last_login
        FROM users
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        query += ` AND (email ILIKE $${paramCount} OR username ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      if (role) {
        paramCount++;
        query += ` AND role = $${paramCount}`;
        params.push(role);
      }

      // Count total
      const countQuery = query.replace('SELECT id, username, email, role, first_name, last_name, phone, is_active, created_at, last_login', 'SELECT COUNT(*)');
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Add pagination
      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      ApiResponse.success(res, {
        users: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get users error:', error);
      ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener usuarios');
    }
  }
);

// ==================== MIDDLEWARE DE MANEJO DE ERRORES ====================

// 404 handler
app.use('*', (req, res) => {
  logSecurityEvent('endpoint_not_found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: res.locals.requestId
  });
  
  ApiResponse.error(res, 404, 'ENDPOINT_NOT_FOUND', `Endpoint ${req.method} ${req.originalUrl} no encontrado`);
});

// Error handler global
app.use(errorLogger);

// ==================== INICIALIZACIÓN DEL SERVIDOR ====================

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    pool.end(() => {
      logger.info('Pool de base de datos cerrado');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    pool.end(() => {
      logger.info('Pool de base de datos cerrado');
      process.exit(0);
    });
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor API v1 SEGURO iniciado en puerto ${PORT}`);
  logger.info(`🔗 API v1 disponible en: http://localhost:${PORT}/api/v1`);
  logger.info(`🛡️  Seguridad: Helmet, CORS, Rate Limiting, Input Validation activados`);
  logger.info(`📊 Monitoreo: Winston Logging, Métricas, Health Checks activados`);
  logger.info(`❤️  Health check: http://localhost:${PORT}/api/v1/health`);
  
  console.log(`🚀 Servidor API v1 SEGURO iniciado en puerto ${PORT}`);
  console.log(`🔗 API v1 disponible en: http://localhost:${PORT}/api/v1`);
  console.log(`🛡️  Características de seguridad activadas:`);
  console.log(`   ✅ Helmet.js - Headers de seguridad`);
  console.log(`   ✅ CORS configurado por entorno`);
  console.log(`   ✅ Rate Limiting avanzado`);
  console.log(`   ✅ Validación de entrada con Joi`);
  console.log(`   ✅ Sanitización de datos`);
  console.log(`   ✅ Logging estructurado con Winston`);
  console.log(`   ✅ Monitoreo y métricas`);
  console.log(`   ✅ Detección de actividad sospechosa`);
  console.log(`📚 Endpoints principales:`);
  console.log(`   - GET  /api/v1/health - Health check básico`);
  console.log(`   - GET  /api/v1/health/detailed - Health check detallado (admin)`);
  console.log(`   - GET  /api/v1/metrics - Métricas del sistema (admin)`);
  console.log(`   - POST /api/v1/auth/login - Login con rate limiting`);
  console.log(`   - GET  /api/v1/auth/me - Usuario actual`);
  console.log(`   - POST /api/v1/auth/logout - Logout`);
  console.log(`   - GET  /api/v1/users - Lista de usuarios (admin)`);
});

module.exports = app;