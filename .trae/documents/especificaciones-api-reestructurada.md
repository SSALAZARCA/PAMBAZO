# Especificaciones API Reestructurada - Sistema PAMBAZO

## 1. Arquitectura de API

### 1.1 Principios de Diseño
- **RESTful**: Seguimiento estricto de principios REST
- **Consistencia**: Estructura uniforme en todas las rutas
- **Versionado**: API versionada para compatibilidad futura
- **Seguridad**: Autenticación JWT y autorización por roles
- **Validación**: Validación exhaustiva de datos de entrada
- **Documentación**: Documentación automática con Swagger/OpenAPI

### 1.2 Estructura Base de Respuestas
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    version: string;
  };
}
```

### 1.3 Códigos de Estado HTTP
- `200` - OK (Operación exitosa)
- `201` - Created (Recurso creado)
- `204` - No Content (Operación exitosa sin contenido)
- `400` - Bad Request (Error en la solicitud)
- `401` - Unauthorized (No autenticado)
- `403` - Forbidden (Sin permisos)
- `404` - Not Found (Recurso no encontrado)
- `409` - Conflict (Conflicto de datos)
- `422` - Unprocessable Entity (Error de validación)
- `500` - Internal Server Error (Error del servidor)

## 2. Autenticación y Autorización

### 2.1 Rutas de Autenticación

#### POST /api/v1/auth/login
Autenticación de usuario

**Request:**
```typescript
{
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      role: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  }
}
```

#### POST /api/v1/auth/register
Registro de nuevo usuario (solo admin/owner)

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'waiter' | 'kitchen';
  firstName: string;
  lastName: string;
  phone?: string;
}
```

#### POST /api/v1/auth/refresh
Renovar token de acceso

**Request:**
```typescript
{
  refreshToken: string;
}
```

#### POST /api/v1/auth/logout
Cerrar sesión

**Headers:** `Authorization: Bearer <token>`

#### POST /api/v1/auth/forgot-password
Solicitar restablecimiento de contraseña

**Request:**
```typescript
{
  email: string;
}
```

#### POST /api/v1/auth/reset-password
Restablecer contraseña

**Request:**
```typescript
{
  token: string;
  newPassword: string;
}
```

#### GET /api/v1/auth/me
Obtener información del usuario actual

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  success: true,
  data: {
    id: string;
    email: string;
    username: string;
    role: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    lastLogin: string;
    createdAt: string;
  }
}
```

### 2.2 Middleware de Autorización

#### Roles y Permisos
```typescript
enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  WAITER = 'waiter',
  KITCHEN = 'kitchen',
  CUSTOMER = 'customer'
}

interface Permission {
  resource: string;
  actions: string[];
}

const rolePermissions: Record<UserRole, Permission[]> = {
  owner: [{ resource: '*', actions: ['*'] }],
  admin: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'products', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'orders', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['read'] }
  ],
  waiter: [
    { resource: 'orders', actions: ['create', 'read', 'update'] },
    { resource: 'tables', actions: ['read', 'update'] },
    { resource: 'products', actions: ['read'] }
  ],
  kitchen: [
    { resource: 'orders', actions: ['read', 'update'] },
    { resource: 'products', actions: ['read'] },
    { resource: 'inventory', actions: ['read'] }
  ],
  customer: [
    { resource: 'orders', actions: ['create', 'read'] },
    { resource: 'products', actions: ['read'] }
  ]
};
```

## 3. Rutas de Usuarios

### 3.1 GET /api/v1/users
Listar usuarios (admin/owner)

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page?: number` (default: 1)
- `limit?: number` (default: 10, max: 100)
- `role?: string`
- `isActive?: boolean`
- `search?: string`

**Response:**
```typescript
{
  success: true,
  data: User[],
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  }
}
```

### 3.2 GET /api/v1/users/:id
Obtener usuario por ID

**Headers:** `Authorization: Bearer <token>`

### 3.3 PUT /api/v1/users/:id
Actualizar usuario

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}
```

### 3.4 DELETE /api/v1/users/:id
Eliminar usuario (soft delete)

**Headers:** `Authorization: Bearer <token>`

### 3.5 PUT /api/v1/users/:id/password
Cambiar contraseña de usuario

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  currentPassword?: string; // Requerido si es el propio usuario
  newPassword: string;
}
```

## 4. Rutas de Productos

### 4.1 GET /api/v1/products
Listar productos

**Query Parameters:**
- `page?: number`
- `limit?: number`
- `categoryId?: number`
- `isActive?: boolean`
- `isFeatured?: boolean`
- `search?: string`
- `sortBy?: string` (name, price, createdAt)
- `sortOrder?: 'asc' | 'desc'`

### 4.2 GET /api/v1/products/:id
Obtener producto por ID

### 4.3 POST /api/v1/products
Crear producto (admin/owner)

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  name: string;
  description?: string;
  categoryId: number;
  price: number;
  cost?: number;
  imageUrl?: string;
  preparationTime?: number;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  isActive?: boolean;
  isFeatured?: boolean;
  ingredients?: Array<{
    name: string;
    quantity: number;
    unit: string;
    isAllergen?: boolean;
  }>;
}
```

### 4.4 PUT /api/v1/products/:id
Actualizar producto

**Headers:** `Authorization: Bearer <token>`

### 4.5 DELETE /api/v1/products/:id
Eliminar producto

**Headers:** `Authorization: Bearer <token>`

### 4.6 POST /api/v1/products/:id/upload-image
Subir imagen de producto

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

## 5. Rutas de Categorías

### 5.1 GET /api/v1/categories
Listar categorías

**Query Parameters:**
- `isActive?: boolean`
- `sortBy?: 'name' | 'sortOrder'`

### 5.2 POST /api/v1/categories
Crear categoría (admin/owner)

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  name: string;
  description?: string;
  iconUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}
```

### 5.3 PUT /api/v1/categories/:id
Actualizar categoría

### 5.4 DELETE /api/v1/categories/:id
Eliminar categoría

## 6. Rutas de Órdenes

### 6.1 GET /api/v1/orders
Listar órdenes

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page?: number`
- `limit?: number`
- `status?: string`
- `orderType?: string`
- `paymentStatus?: string`
- `tableId?: number`
- `dateFrom?: string` (ISO date)
- `dateTo?: string` (ISO date)
- `customerId?: string`

### 6.2 GET /api/v1/orders/:id
Obtener orden por ID

**Headers:** `Authorization: Bearer <token>`

### 6.3 POST /api/v1/orders
Crear nueva orden

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  customerId?: string;
  tableId?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  orderType: 'dine_in' | 'takeout' | 'delivery';
  items: Array<{
    productId: number;
    quantity: number;
    notes?: string;
  }>;
  notes?: string;
  specialInstructions?: string;
}
```

### 6.4 PUT /api/v1/orders/:id
Actualizar orden

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  specialInstructions?: string;
  assignedTo?: string;
}
```

### 6.5 PUT /api/v1/orders/:id/items/:itemId
Actualizar item de orden

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  quantity?: number;
  status?: string;
  notes?: string;
}
```

### 6.6 DELETE /api/v1/orders/:id
Cancelar orden

**Headers:** `Authorization: Bearer <token>`

### 6.7 POST /api/v1/orders/:id/payment
Procesar pago de orden

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  paymentMethod: 'cash' | 'card' | 'transfer' | 'digital_wallet';
  amount: number;
  reference?: string;
}
```

## 7. Rutas de Mesas

### 7.1 GET /api/v1/tables
Listar mesas

**Query Parameters:**
- `status?: string`
- `assignedWaiterId?: string`

### 7.2 GET /api/v1/tables/:id
Obtener mesa por ID

### 7.3 POST /api/v1/tables
Crear mesa (admin/owner)

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  number: number;
  capacity: number;
  location?: string;
  assignedWaiterId?: string;
}
```

### 7.4 PUT /api/v1/tables/:id
Actualizar mesa

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  capacity?: number;
  location?: string;
  status?: string;
  assignedWaiterId?: string;
}
```

### 7.5 DELETE /api/v1/tables/:id
Eliminar mesa

**Headers:** `Authorization: Bearer <token>`

### 7.6 GET /api/v1/tables/:id/qr
Generar código QR para mesa

**Headers:** `Authorization: Bearer <token>`

## 8. Rutas de Inventario

### 8.1 GET /api/v1/inventory
Listar inventario

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page?: number`
- `limit?: number`
- `lowStock?: boolean`
- `productId?: number`
- `location?: string`

### 8.2 GET /api/v1/inventory/:id
Obtener item de inventario

**Headers:** `Authorization: Bearer <token>`

### 8.3 PUT /api/v1/inventory/:id
Actualizar inventario

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  unitCost?: number;
  location?: string;
}
```

### 8.4 POST /api/v1/inventory/entries
Registrar entrada de inventario

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  inventoryId: number;
  supplierId?: number;
  entryType: 'purchase' | 'adjustment' | 'return' | 'waste' | 'transfer';
  quantity: number;
  unitCost?: number;
  invoiceNumber?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}
```

### 8.5 GET /api/v1/inventory/entries
Listar entradas de inventario

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page?: number`
- `limit?: number`
- `inventoryId?: number`
- `entryType?: string`
- `dateFrom?: string`
- `dateTo?: string`

### 8.6 GET /api/v1/inventory/alerts
Obtener alertas de inventario

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  success: true,
  data: {
    lowStock: Array<{
      productId: number;
      productName: string;
      currentStock: number;
      minStock: number;
      difference: number;
    }>;
    expiringSoon: Array<{
      entryId: number;
      productName: string;
      expiryDate: string;
      daysUntilExpiry: number;
    }>;
  }
}
```

## 9. Rutas de Reportes

### 9.1 GET /api/v1/reports/sales
Reporte de ventas

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `dateFrom: string` (ISO date)
- `dateTo: string` (ISO date)
- `groupBy?: 'day' | 'week' | 'month'`

**Response:**
```typescript
{
  success: true,
  data: {
    summary: {
      totalSales: number;
      totalOrders: number;
      averageOrderValue: number;
      completedOrders: number;
      cancelledOrders: number;
    };
    breakdown: Array<{
      date: string;
      sales: number;
      orders: number;
      averageValue: number;
    }>;
    topProducts: Array<{
      productId: number;
      productName: string;
      quantitySold: number;
      revenue: number;
    }>;
  }
}
```

### 9.2 GET /api/v1/reports/inventory
Reporte de inventario

**Headers:** `Authorization: Bearer <token>`

### 9.3 GET /api/v1/reports/performance
Reporte de rendimiento

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `dateFrom: string`
- `dateTo: string`
- `userId?: string`

## 10. WebSocket Events

### 10.1 Conexión
```typescript
// Cliente se conecta
socket.emit('join', { userId: string, role: string });

// Servidor confirma conexión
socket.emit('connected', { userId: string, timestamp: string });
```

### 10.2 Eventos de Órdenes
```typescript
// Nueva orden creada
socket.emit('order:created', {
  orderId: number;
  orderNumber: string;
  tableId?: number;
  status: string;
  items: OrderItem[];
});

// Estado de orden actualizado
socket.emit('order:updated', {
  orderId: number;
  status: string;
  updatedBy: string;
  timestamp: string;
});

// Item de orden listo
socket.emit('order:item_ready', {
  orderId: number;
  itemId: number;
  productName: string;
});
```

### 10.3 Eventos de Mesas
```typescript
// Estado de mesa actualizado
socket.emit('table:updated', {
  tableId: number;
  status: string;
  assignedWaiterId?: string;
});
```

### 10.4 Eventos de Inventario
```typescript
// Alerta de stock bajo
socket.emit('inventory:low_stock', {
  productId: number;
  productName: string;
  currentStock: number;
  minStock: number;
});

// Producto próximo a vencer
socket.emit('inventory:expiring_soon', {
  entryId: number;
  productName: string;
  expiryDate: string;
  daysUntilExpiry: number;
});
```

### 10.5 Eventos de Notificaciones
```typescript
// Nueva notificación
socket.emit('notification:new', {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: string;
  userId?: string;
});
```

## 11. Middleware y Validaciones

### 11.1 Middleware de Autenticación
```typescript
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'NO_TOKEN', message: 'Token de acceso requerido' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await getUserById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_USER', message: 'Usuario inválido o inactivo' }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token inválido' }
    });
  }
};
```

### 11.2 Middleware de Autorización
```typescript
export const authorize = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!hasPermission(user.role, resource, action)) {
      return res.status(403).json({
        success: false,
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Permisos insuficientes' }
      });
    }
    
    next();
  };
};
```

### 11.3 Middleware de Validación
```typescript
export const validate = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos de entrada inválidos',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }
    
    next();
  };
};
```

### 11.4 Esquemas de Validación
```typescript
export const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    rememberMe: Joi.boolean().optional()
  }),
  
  createUser: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('admin', 'waiter', 'kitchen').required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
  }),
  
  createProduct: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    categoryId: Joi.number().integer().positive().required(),
    price: Joi.number().positive().precision(2).required(),
    cost: Joi.number().positive().precision(2).optional(),
    imageUrl: Joi.string().uri().optional(),
    preparationTime: Joi.number().integer().min(0).optional(),
    nutritionalInfo: Joi.object({
      calories: Joi.number().min(0).optional(),
      protein: Joi.number().min(0).optional(),
      carbs: Joi.number().min(0).optional(),
      fat: Joi.number().min(0).optional(),
      fiber: Joi.number().min(0).optional(),
      sugar: Joi.number().min(0).optional(),
      sodium: Joi.number().min(0).optional()
    }).optional(),
    isActive: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional()
  }),
  
  createOrder: Joi.object({
    customerId: Joi.string().uuid().optional(),
    tableId: Joi.number().integer().positive().optional(),
    customerName: Joi.string().max(200).optional(),
    customerPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    customerEmail: Joi.string().email().optional(),
    orderType: Joi.string().valid('dine_in', 'takeout', 'delivery').required(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        notes: Joi.string().max(500).optional()
      })
    ).min(1).required(),
    notes: Joi.string().max(1000).optional(),
    specialInstructions: Joi.string().max(1000).optional()
  })
};
```

## 12. Manejo de Errores

### 12.1 Middleware de Manejo de Errores
```typescript
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof ValidationError) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details
      }
    });
  }

  if (error instanceof DatabaseError) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Error en la base de datos'
      }
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    }
  });
};
```

### 12.2 Clases de Error Personalizadas
```typescript
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'No autenticado') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Sin permisos') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} no encontrado`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
```

## 13. Rate Limiting y Seguridad

### 13.1 Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

// Rate limiting general
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes, intenta más tarde'
    }
  }
});

// Rate limiting para login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por ventana
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'LOGIN_RATE_LIMIT_EXCEEDED',
      message: 'Demasiados intentos de login, intenta más tarde'
    }
  }
});
```

### 13.2 Middleware de Seguridad
```typescript
import helmet from 'helmet';
import cors from 'cors';

// Configuración de CORS
export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Configuración de Helmet
export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
};
```