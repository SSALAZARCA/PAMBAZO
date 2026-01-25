const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Configuración de base de datos
const pool = new Pool({
  host: '31.97.128.11',
  port: 5432,
  database: 'pambaso_db',
  user: 'pambaso_user',
  password: 'pambaso123',
});

// Test de conexión a la base de datos
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
  } else {
    console.log('✅ Conexión a la base de datos exitosa:', result.rows[0]);
  }
});

// Test de productos
pool.query('SELECT COUNT(*) as count FROM products', (err, result) => {
  if (err) {
    console.error('❌ Error consultando productos:', err);
  } else {
    console.log('📦 Total de productos en DB:', result.rows[0].count);
  }
});

// Clase ApiResponse para respuestas consistentes
class ApiResponse {
  static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, statusCode = 500, errorCode = 'INTERNAL_ERROR', message = 'Error interno', details = null) {
    return res.status(statusCode).json({
      success: false,
      error: errorCode,
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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 401, 'UNAUTHORIZED', 'Token de acceso requerido');
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'pambazo_secret_key_2024';
    
    const decoded = jwt.verify(token, jwtSecret);
    
    // Verificar que el usuario existe y está activo
    const userQuery = 'SELECT id, email, role, is_active FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.id]);
    const user = userResult.rows[0];

    if (!user || !user.is_active) {
      return ApiResponse.error(res, 401, 'UNAUTHORIZED', 'Usuario no válido o inactivo');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return ApiResponse.error(res, 401, 'UNAUTHORIZED', 'Token inválido');
  }
};

// Middleware de autorización por roles
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 401, 'UNAUTHORIZED', 'Usuario no autenticado');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(res, 403, 'FORBIDDEN', 'Sin permisos para esta operación');
    }

    next();
  };
};

// ==================== RUTAS DE AUTENTICACIÓN ====================

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

    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
    const refreshToken = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    // Actualizar último login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

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
    console.error('Login error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error interno del servidor');
  }
});

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
    console.error('Get current user error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error interno del servidor');
  }
});

// Logout
app.post('/api/v1/auth/logout', authMiddleware, (req, res) => {
  // En una implementación real, aquí invalidaríamos el token en una blacklist
  ApiResponse.success(res, null, 'Logout exitoso');
});

// ==================== RUTAS DE USUARIOS ====================

// Get all users
app.get('/api/v1/users', authMiddleware, authorize(['owner', 'admin']), async (req, res) => {
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
    console.error('Get users error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener usuarios');
  }
});

// Get user by ID
app.get('/api/v1/users/:id', authMiddleware, authorize(['owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT id, username, email, role, first_name, last_name, 
             phone, is_active, created_at, last_login
      FROM users 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return ApiResponse.error(res, 404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    ApiResponse.success(res, result.rows[0]);

  } catch (error) {
    console.error('Get user error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener usuario');
  }
});

// ==================== RUTAS DE PRODUCTOS ====================

// Get all products
app.get('/api/v1/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category_id, is_available } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.id, p.name, p.description, p.price, p.category_id, 
             p.image_url, p.is_active, p.preparation_time, 
             p.created_at, p.updated_at, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (category_id) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      params.push(category_id);
    }

    if (is_available !== undefined) {
      paramCount++;
      query += ` AND p.is_active = $${paramCount}`;
      params.push(is_available === 'true');
    }

    // Count total - simplified approach
    let countQuery = `
      SELECT COUNT(*) as count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    
    let countParams = [];
    let countParamCount = 0;
    
    if (category_id) {
      countParamCount++;
      countQuery += ` AND p.category_id = $${countParamCount}`;
      countParams.push(category_id);
    }
    
    if (search) {
      countParamCount++;
      countQuery += ` AND (p.name ILIKE $${countParamCount} OR p.description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }
    
    if (is_available !== undefined) {
      countParamCount++;
      countQuery += ` AND p.is_active = $${countParamCount}`;
      countParams.push(is_available === 'true');
    }
    
    const countResult = await pool.query(countQuery, countParams);
    console.log('Count result:', countResult.rows[0]);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    console.log('Final query:', query);
    console.log('Final params:', params);
    const result = await pool.query(query, params);
    console.log('Products result count:', result.rows.length);

    ApiResponse.success(res, {
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener productos');
  }
});

// Get product by ID
app.get('/api/v1/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT p.id, p.name, p.description, p.price, p.category_id, 
             p.image_url, p.is_active, p.preparation_time, 
             p.created_at, p.updated_at, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return ApiResponse.error(res, 404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
    }

    ApiResponse.success(res, result.rows[0]);

  } catch (error) {
    console.error('Get product error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener producto');
  }
});

// ==================== RUTAS DE CATEGORÍAS ====================

// Get all categories
app.get('/api/v1/categories', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, is_active } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.id, c.name, c.description, c.is_active, 
             c.created_at, c.updated_at,
             COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (c.name ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (is_active !== undefined) {
      paramCount++;
      query += ` AND c.is_active = $${paramCount}`;
      params.push(is_active === 'true');
    }

    query += ` GROUP BY c.id, c.name, c.description, c.is_active, c.created_at, c.updated_at`;

    // Count total
    const countQuery = `SELECT COUNT(*) FROM (${query}) as subquery`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    ApiResponse.success(res, {
      categories: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener categorías');
  }
});

// ==================== RUTAS DE ÓRDENES ====================

// Get all orders
app.get('/api/v1/orders', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, table_id, user_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.id, o.customer_id, o.table_id, o.status, o.total_amount, 
             o.notes, o.created_at, o.updated_at,
             u.username as user_name, t.number as table_number
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    if (table_id) {
      paramCount++;
      query += ` AND o.table_id = $${paramCount}`;
      params.push(table_id);
    }

    if (user_id) {
      paramCount++;
      query += ` AND o.customer_id = $${paramCount}`;
      params.push(user_id);
    }

    // Count total - simplified approach
    let countQuery = `
      SELECT COUNT(*) as count
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE 1=1
    `;
    
    let countParams = [];
    let countParamCount = 0;
    
    if (status) {
      countParamCount++;
      countQuery += ` AND o.status = $${countParamCount}`;
      countParams.push(status);
    }
    
    if (table_id) {
      countParamCount++;
      countQuery += ` AND o.table_id = $${countParamCount}`;
      countParams.push(table_id);
    }
    
    if (user_id) {
      countParamCount++;
      countQuery += ` AND o.customer_id = $${countParamCount}`;
      countParams.push(user_id);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    ApiResponse.success(res, {
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener órdenes');
  }
});

// ==================== RUTAS DE MESAS ====================

// Get all tables
app.get('/api/v1/tables', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, capacity } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, number, capacity, status, location, 
             created_at, updated_at
      FROM tables
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (capacity) {
      paramCount++;
      query += ` AND capacity >= $${paramCount}`;
      params.push(capacity);
    }

    // Count total
    const countQuery = query.replace('SELECT id, number, capacity, status, location, created_at, updated_at', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY number ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    ApiResponse.success(res, {
      tables: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get tables error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener mesas');
  }
});

// ==================== RUTAS DE INVENTARIO ====================

// Get all inventory items
app.get('/api/v1/inventory', authMiddleware, authorize(['owner', 'admin', 'kitchen']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, low_stock } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT i.id, i.product_id, i.current_stock, i.min_stock, 
             i.max_stock, i.unit, i.unit_cost, i.location,
             i.last_restock_date, i.last_updated, p.name as product_name,
             p.description as product_description
      FROM inventory i
      LEFT JOIN products p ON i.product_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (low_stock === 'true') {
      query += ` AND i.current_stock <= i.min_stock`;
    }

    // Count total - simplified approach
    let countQuery = `
      SELECT COUNT(*) as count
      FROM inventory i
      LEFT JOIN products p ON i.product_id = p.id
      WHERE 1=1
    `;
    
    let countParams = [];
    let countParamCount = 0;
    
    if (search) {
      countParamCount++;
      countQuery += ` AND (p.name ILIKE $${countParamCount} OR p.description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (low_stock === 'true') {
      countQuery += ` AND i.current_stock <= i.min_stock`;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY p.name ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    ApiResponse.success(res, {
      inventory: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener inventario');
  }
});

// ==================== RUTAS DE REPORTES ====================

// Dashboard report
app.get('/api/v1/reports/dashboard', authMiddleware, authorize(['owner', 'admin']), async (req, res) => {
  try {
    // Estadísticas básicas
    const statsQueries = await Promise.all([
      pool.query('SELECT COUNT(*) as total_orders FROM orders WHERE DATE(created_at) = CURRENT_DATE'),
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as daily_revenue FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status = $1', ['completed']),
      pool.query('SELECT COUNT(*) as active_tables FROM tables WHERE status = $1', ['occupied']),
      pool.query('SELECT COUNT(*) as low_stock_items FROM inventory WHERE current_stock <= min_stock')
    ]);

    const dashboard = {
      todayOrders: parseInt(statsQueries[0].rows[0].total_orders),
      dailyRevenue: parseFloat(statsQueries[1].rows[0].daily_revenue),
      activeTables: parseInt(statsQueries[2].rows[0].active_tables),
      lowStockItems: parseInt(statsQueries[3].rows[0].low_stock_items)
    };

    ApiResponse.success(res, dashboard);

  } catch (error) {
    console.error('Dashboard report error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener reporte del dashboard');
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
  console.log(`🚀 Servidor API v1 completo iniciado en puerto ${PORT}`);
  console.log(`🔗 API v1 disponible en: http://localhost:${PORT}/api/v1`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`📚 Endpoints disponibles:`);
  console.log(`   - GET  /api/v1/health`);
  console.log(`   - POST /api/v1/auth/login`);
  console.log(`   - GET  /api/v1/auth/me`);
  console.log(`   - POST /api/v1/auth/logout`);
  console.log(`   - GET  /api/v1/users`);
  console.log(`   - GET  /api/v1/users/:id`);
  console.log(`   - GET  /api/v1/products`);
  console.log(`   - GET  /api/v1/products/:id`);
  console.log(`   - GET  /api/v1/categories`);
  console.log(`   - GET  /api/v1/orders`);
  console.log(`   - GET  /api/v1/tables`);
  console.log(`   - GET  /api/v1/inventory`);
  console.log(`   - GET  /api/v1/reports/dashboard`);
});