const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const PORT = 3001;

// Configuración de CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Configuración de Socket.io con CORS
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

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

// ==================== WEBSOCKET CONFIGURATION ====================

// Simple room manager for WebSockets
class SimpleRoomManager {
  constructor() {
    this.connectedUsers = new Map(); // socketId -> userInfo
    this.userSockets = new Map(); // userId -> Set of socketIds
    this.rooms = new Map(); // roomName -> Set of socketIds
  }

  addUser(socket, userInfo) {
    this.connectedUsers.set(socket.id, userInfo);
    
    if (!this.userSockets.has(userInfo.id)) {
      this.userSockets.set(userInfo.id, new Set());
    }
    this.userSockets.get(userInfo.id).add(socket.id);

    // Join role-based rooms
    this.joinRoleRooms(socket, userInfo.role);
    
    console.log(`👤 User connected: ${userInfo.email} (${userInfo.role})`);
  }

  removeUser(socket) {
    const userInfo = this.connectedUsers.get(socket.id);
    if (userInfo) {
      this.connectedUsers.delete(socket.id);
      
      const userSocketSet = this.userSockets.get(userInfo.id);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userInfo.id);
        }
      }

      // Remove from all rooms
      this.rooms.forEach((socketSet, roomName) => {
        socketSet.delete(socket.id);
      });

      console.log(`👤 User disconnected: ${userInfo.email}`);
    }
  }

  joinRoleRooms(socket, role) {
    // Join general staff room
    this.joinRoom(socket.id, 'all_staff');
    
    // Join role-specific rooms
    this.joinRoom(socket.id, role);
    
    // Join combined rooms based on role
    switch (role) {
      case 'owner':
      case 'admin':
        this.joinRoom(socket.id, 'admin');
        this.joinRoom(socket.id, 'orders');
        this.joinRoom(socket.id, 'inventory');
        this.joinRoom(socket.id, 'tables');
        this.joinRoom(socket.id, 'users');
        break;
      case 'waiter':
        this.joinRoom(socket.id, 'orders');
        this.joinRoom(socket.id, 'tables');
        break;
      case 'kitchen':
        this.joinRoom(socket.id, 'orders');
        this.joinRoom(socket.id, 'inventory');
        break;
      case 'customer':
        this.joinRoom(socket.id, 'customers');
        break;
    }
  }

  joinRoom(socketId, roomName) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName).add(socketId);
  }

  emitToRoom(roomName, event, data) {
    const socketSet = this.rooms.get(roomName);
    if (socketSet) {
      socketSet.forEach(socketId => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit(event, data);
        }
      });
    }
  }

  emitToUser(userId, event, data) {
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.forEach(socketId => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit(event, data);
        }
      });
    }
  }

  getOnlineUsers() {
    const users = [];
    this.connectedUsers.forEach((userInfo, socketId) => {
      users.push({
        id: userInfo.id,
        email: userInfo.email,
        role: userInfo.role,
        status: 'online',
        connectedAt: userInfo.connectedAt
      });
    });
    return users;
  }
}

const roomManager = new SimpleRoomManager();

// WebSocket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const jwtSecret = process.env.JWT_SECRET || 'pambazo_secret_key_2024';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Verify user exists and is active
    const userQuery = 'SELECT id, email, role, first_name, last_name, is_active FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.id]);
    const user = userResult.rows[0];

    if (!user || !user.is_active) {
      return next(new Error('Invalid or inactive user'));
    }

    // Attach user info to socket
    socket.userId = user.id;
    socket.userEmail = user.email;
    socket.userRole = user.role;
    socket.userName = `${user.first_name} ${user.last_name}`.trim();
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
};

// Socket.io connection handling
io.use(authenticateSocket);

io.on('connection', (socket) => {
  const userInfo = {
    id: socket.userId,
    email: socket.userEmail,
    role: socket.userRole,
    name: socket.userName,
    connectedAt: new Date().toISOString()
  };

  // Add user to room manager
  roomManager.addUser(socket, userInfo);

  // Emit user connected event
  roomManager.emitToRoom('all_staff', 'user:connected', {
    userId: userInfo.id,
    email: userInfo.email,
    role: userInfo.role,
    timestamp: new Date().toISOString()
  });

  // Handle basic events
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });

  // Order events
  socket.on('order:create', (data) => {
    console.log(`📝 Order create event from ${socket.userEmail}:`, data);
    roomManager.emitToRoom('orders', 'order:created', {
      ...data,
      createdBy: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('order:update', (data) => {
    console.log(`📝 Order update event from ${socket.userEmail}:`, data);
    roomManager.emitToRoom('orders', 'order:updated', {
      ...data,
      updatedBy: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('order:status_change', (data) => {
    console.log(`📝 Order status change from ${socket.userEmail}:`, data);
    roomManager.emitToRoom('orders', 'order:status_changed', {
      ...data,
      updatedBy: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Inventory events
  socket.on('inventory:update', (data) => {
    console.log(`📦 Inventory update from ${socket.userEmail}:`, data);
    roomManager.emitToRoom('inventory', 'inventory:updated', {
      ...data,
      updatedBy: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('inventory:low_stock', (data) => {
    console.log(`📦 Low stock alert from ${socket.userEmail}:`, data);
    roomManager.emitToRoom('admin', 'inventory:low_stock_alert', {
      ...data,
      alertedBy: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Table events
  socket.on('table:status_change', (data) => {
    console.log(`🪑 Table status change from ${socket.userEmail}:`, data);
    roomManager.emitToRoom('tables', 'table:status_changed', {
      ...data,
      updatedBy: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('table:reservation', (data) => {
    console.log(`🪑 Table reservation from ${socket.userEmail}:`, data);
    roomManager.emitToRoom('tables', 'table:reserved', {
      ...data,
      reservedBy: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  // User events
  socket.on('user:status_update', (data) => {
    console.log(`👤 User status update from ${socket.userEmail}:`, data);
    roomManager.emitToRoom('all_staff', 'user:status_changed', {
      userId: socket.userId,
      email: socket.userEmail,
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Get online users
  socket.on('user:get_online', () => {
    const onlineUsers = roomManager.getOnlineUsers();
    socket.emit('user:online_users', {
      users: onlineUsers,
      count: onlineUsers.length,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`👤 Socket disconnected: ${socket.userEmail} (${reason})`);
    
    // Emit user disconnected event
    roomManager.emitToRoom('all_staff', 'user:disconnected', {
      userId: socket.userId,
      email: socket.userEmail,
      role: socket.userRole,
      reason,
      timestamp: new Date().toISOString()
    });

    // Remove user from room manager
    roomManager.removeUser(socket);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.userEmail}:`, error);
  });
});

// ==================== API RESPONSE CLASS ====================

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

// ==================== MIDDLEWARE ====================

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

// ==================== API ROUTES ====================

// Health check
app.get('/api/v1/health', (req, res) => {
  ApiResponse.success(res, {
    status: 'OK',
    version: 'v1',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    websockets: {
      enabled: true,
      connectedUsers: roomManager.getOnlineUsers().length
    }
  });
});

// WebSocket status endpoint
app.get('/api/v1/websocket/status', authMiddleware, (req, res) => {
  const onlineUsers = roomManager.getOnlineUsers();
  ApiResponse.success(res, {
    connected: true,
    onlineUsers: onlineUsers.length,
    users: onlineUsers,
    rooms: Array.from(roomManager.rooms.keys()),
    timestamp: new Date().toISOString()
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
      },
      websocket: {
        enabled: true,
        endpoint: `ws://localhost:${PORT}`
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
    const result = await pool.query(userQuery, [req.user.id]);
    const user = result.rows[0];

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
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener información del usuario');
  }
});

// Logout
app.post('/api/v1/auth/logout', authMiddleware, (req, res) => {
  // En una implementación real, aquí invalidarías el token
  ApiResponse.success(res, null, 'Logout exitoso');
});

// Get all users (admin only)
app.get('/api/v1/users', authMiddleware, authorize(['owner', 'admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, username, email, role, first_name, last_name, 
             phone, is_active, created_at, last_login
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (search) {
      paramCount++;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
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

    const userQuery = `
      SELECT id, username, email, role, first_name, last_name, 
             phone, is_active, created_at, last_login
      FROM users 
      WHERE id = $1
    `;
    const result = await pool.query(userQuery, [id]);
    const user = result.rows[0];

    if (!user) {
      return ApiResponse.error(res, 404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    ApiResponse.success(res, user);

  } catch (error) {
    console.error('Get user by ID error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener usuario');
  }
});

// Get all products
app.get('/api/v1/products', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, search, available_only } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.id, p.name, p.description, p.price, p.category_id, 
             p.image_url, p.is_available, p.preparation_time,
             p.created_at, p.updated_at, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (category_id) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      params.push(category_id);
    }

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (available_only === 'true') {
      query += ` AND p.is_available = true`;
    }

    // Count total
    const countQuery = query.replace('SELECT p.id, p.name, p.description, p.price, p.category_id, p.image_url, p.is_available, p.preparation_time, p.created_at, p.updated_at, c.name as category_name', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY p.name ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

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
app.get('/api/v1/products/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const productQuery = `
      SELECT p.id, p.name, p.description, p.price, p.category_id, 
             p.image_url, p.is_available, p.preparation_time,
             p.created_at, p.updated_at, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    const result = await pool.query(productQuery, [id]);
    const product = result.rows[0];

    if (!product) {
      return ApiResponse.error(res, 404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
    }

    ApiResponse.success(res, product);

  } catch (error) {
    console.error('Get product by ID error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener producto');
  }
});

// Get all categories
app.get('/api/v1/categories', authMiddleware, async (req, res) => {
  try {
    const categoriesQuery = `
      SELECT id, name, description, display_order, is_active, created_at
      FROM categories
      WHERE is_active = true
      ORDER BY display_order ASC, name ASC
    `;
    const result = await pool.query(categoriesQuery);

    ApiResponse.success(res, {
      categories: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Get categories error:', error);
    ApiResponse.error(res, 500, 'INTERNAL_SERVER_ERROR', 'Error al obtener categorías');
  }
});

// Get all orders
app.get('/api/v1/orders', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, table_id, user_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.id, o.table_id, o.user_id, o.status, o.total_amount,
             o.notes, o.created_at, o.updated_at,
             u.first_name, u.last_name, u.email,
             t.number as table_number
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
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
      query += ` AND o.user_id = $${paramCount}`;
      params.push(user_id);
    }

    // Count total
    const countQuery = query.replace('SELECT o.id, o.table_id, o.user_id, o.status, o.total_amount, o.notes, o.created_at, o.updated_at, u.first_name, u.last_name, u.email, t.number as table_number', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
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

    // Count total
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
      lowStockItems: parseInt(statsQueries[3].rows[0].low_stock_items),
      onlineUsers: roomManager.getOnlineUsers().length
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

// ==================== START SERVER ====================

// Iniciar servidor con WebSockets
server.listen(PORT, () => {
  console.log(`🚀 Servidor API v1 + WebSockets iniciado en puerto ${PORT}`);
  console.log(`🔗 API v1 disponible en: http://localhost:${PORT}/api/v1`);
  console.log(`🔌 WebSockets disponible en: ws://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`📊 WebSocket status: http://localhost:${PORT}/api/v1/websocket/status`);
  console.log(`📚 Endpoints disponibles:`);
  console.log(`   - GET  /api/v1/health`);
  console.log(`   - GET  /api/v1/websocket/status`);
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
  console.log(`🔌 WebSocket Events:`);
  console.log(`   - order:create, order:update, order:status_change`);
  console.log(`   - inventory:update, inventory:low_stock`);
  console.log(`   - table:status_change, table:reservation`);
  console.log(`   - user:status_update, user:get_online`);
});