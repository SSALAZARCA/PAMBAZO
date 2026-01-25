// ==================== SERVIDOR DE PRUEBAS DE SEGURIDAD ====================
// Servidor simplificado para probar las funcionalidades de seguridad

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3002;

// ==================== DATOS MOCK ====================
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
  }
];

// ==================== CONFIGURACIÓN DE SEGURIDAD ====================

// Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting general
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    error: 'Demasiadas peticiones, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para autenticación
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por ventana
  message: {
    error: 'Demasiados intentos de login, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalRateLimit);

// Parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== CLASE DE RESPUESTA API ====================
class ApiResponse {
  static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
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
    return res.status(statusCode).json(response);
  }
}

// ==================== MIDDLEWARE DE AUTENTICACIÓN ====================
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 401, 'MISSING_TOKEN', 'Token de acceso requerido');
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'pambazo_secret_key_2024';

    const decoded = jwt.verify(token, jwtSecret);
    const user = mockUsers.find(u => u.id === decoded.id);

    if (!user || !user.is_active) {
      return ApiResponse.error(res, 401, 'INVALID_TOKEN', 'Token inválido o usuario inactivo');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, 401, 'INVALID_TOKEN', 'Token inválido');
    }
    
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 401, 'TOKEN_EXPIRED', 'Token expirado');
    }

    return ApiResponse.error(res, 500, 'AUTH_ERROR', 'Error de autenticación');
  }
};

// ==================== RUTAS ====================

// Health check
app.get('/api/v1/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'mock',
    version: '1.0.0',
    security: {
      helmet: true,
      cors: true,
      rateLimit: true
    }
  };
  ApiResponse.success(res, healthData);
});

// Login
app.post('/api/v1/auth/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return ApiResponse.error(res, 400, 'MISSING_FIELDS', 'Email y contraseña son requeridos');
    }

    // Buscar usuario
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      // Simular tiempo de verificación para prevenir timing attacks
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      return ApiResponse.error(res, 401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
    }

    if (!user.is_active) {
      return ApiResponse.error(res, 401, 'USER_INACTIVE', 'Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return ApiResponse.error(res, 401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
    }

    // Generar token
    const jwtSecret = process.env.JWT_SECRET || 'pambazo_secret_key_2024';
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

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
        expiresIn: 86400 // 24 horas en segundos
      }
    }, 'Login exitoso');

  } catch (error) {
    console.error('Login error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error interno del servidor');
  }
});

// Get current user
app.get('/api/v1/auth/me', authMiddleware, (req, res) => {
  ApiResponse.success(res, {
    id: req.user.id,
    email: req.user.email,
    username: req.user.username,
    role: req.user.role,
    firstName: req.user.first_name,
    lastName: req.user.last_name,
    phone: req.user.phone,
    createdAt: req.user.created_at,
    lastLogin: req.user.last_login
  });
});

// Test endpoint para validación de entrada
app.post('/api/v1/test/validation', (req, res) => {
  const { name, email, age } = req.body;
  
  // Validación básica
  if (!name || !email) {
    return ApiResponse.error(res, 400, 'VALIDATION_ERROR', 'Nombre y email son requeridos');
  }
  
  if (age && (isNaN(age) || age < 0 || age > 150)) {
    return ApiResponse.error(res, 400, 'VALIDATION_ERROR', 'Edad debe ser un número entre 0 y 150');
  }
  
  // Validación de email básica
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return ApiResponse.error(res, 400, 'VALIDATION_ERROR', 'Email inválido');
  }
  
  ApiResponse.success(res, { name, email, age }, 'Validación exitosa');
});

// Test endpoint para XSS
app.post('/api/v1/test/xss', (req, res) => {
  const { content } = req.body;
  
  // Detectar scripts maliciosos
  if (content && content.includes('<script>')) {
    return ApiResponse.error(res, 400, 'XSS_DETECTED', 'Contenido malicioso detectado');
  }
  
  ApiResponse.success(res, { content }, 'Contenido seguro');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  ApiResponse.error(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  ApiResponse.error(res, 404, 'NOT_FOUND', 'Ruta no encontrada');
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`🚀 Servidor de pruebas de seguridad iniciado en puerto ${PORT}`);
  console.log(`🔗 API disponible en: http://localhost:${PORT}/api/v1`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🛡️  Características de seguridad activadas:`);
  console.log(`   ✅ Helmet.js - Headers de seguridad`);
  console.log(`   ✅ CORS configurado`);
  console.log(`   ✅ Rate Limiting`);
  console.log(`   ✅ Validación de entrada`);
  console.log(`   ✅ Protección XSS básica`);
});