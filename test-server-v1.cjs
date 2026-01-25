const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || '31.97.128.11',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pambaso_db',
  user: process.env.DB_USER || 'pambaso_user',
  password: process.env.DB_PASSWORD || 'pambaso123',
});

// Middleware
app.use(cors());
app.use(express.json());

// Utilidades de respuesta
class ApiResponse {
  static success(res, data = null, message = 'Operación exitosa') {
    res.json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, statusCode, error, message, details = null) {
    res.status(statusCode).json({
      success: false,
      error,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }
}

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return ApiResponse.error(res, 401, 'UNAUTHORIZED', 'Token de autorización requerido');
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) {
      return ApiResponse.error(res, 401, 'UNAUTHORIZED', 'Token de autorización inválido');
    }

    const jwtSecret = process.env.JWT_SECRET || 'pambazo_secret_key_2024';
    const decoded = jwt.verify(token, jwtSecret);

    // Verificar que el usuario aún existe
    const userQuery = 'SELECT id, email, role, is_active FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.id]);
    
    if (!userResult.rows[0] || !userResult.rows[0].is_active) {
      return ApiResponse.error(res, 401, 'USER_NOT_FOUND', 'Usuario no encontrado o inactivo');
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 401, 'TOKEN_EXPIRED', 'Token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, 401, 'TOKEN_INVALID', 'Token inválido');
    }
    return ApiResponse.error(res, 401, 'TOKEN_ERROR', 'Error al verificar token');
  }
};

// Rutas API v1

// Health check
app.get('/api/v1/health', (req, res) => {
  ApiResponse.success(res, {
    status: 'OK',
    version: 'v1',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, 400, 'VALIDATION_ERROR', 'Email y contraseña son requeridos');
    }

    // Buscar usuario
    const userQuery = `
      SELECT id, username, email, password_hash, role, first_name, last_name, 
             phone, is_active, created_at, last_login
      FROM users 
      WHERE email = $1
    `;
    const userResult = await pool.query(userQuery, [email]);
    const user = userResult.rows[0];

    if (!user) {
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

    // Generar tokens
    const jwtSecret = process.env.JWT_SECRET || 'pambazo_secret_key_2024';
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    // Actualizar último login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    ApiResponse.success(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        created_at: user.created_at,
        last_login: new Date().toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '15m'
      }
    }, 'Inicio de sesión exitoso');

  } catch (error) {
    console.error('Login error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error interno del servidor');
  }
});

// Get current user
app.get('/api/v1/auth/me', authMiddleware, async (req, res) => {
  try {
    const userQuery = `
      SELECT id, username, email, role, first_name, last_name, phone, 
             is_active, created_at, last_login
      FROM users 
      WHERE id = $1
    `;
    const userResult = await pool.query(userQuery, [req.user.id]);
    const user = userResult.rows[0];

    if (!user) {
      return ApiResponse.error(res, 404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    ApiResponse.success(res, user, 'Información del usuario obtenida exitosamente');

  } catch (error) {
    console.error('Get current user error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error interno del servidor');
  }
});

// 404 handler
app.use('*', (req, res) => {
  ApiResponse.error(res, 404, 'ENDPOINT_NOT_FOUND', `Endpoint ${req.method} ${req.originalUrl} no encontrado`);
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error interno del servidor');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba API v1 iniciado en puerto ${PORT}`);
  console.log(`🔗 API v1 disponible en: http://localhost:${PORT}/api/v1`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/v1/health`);
});