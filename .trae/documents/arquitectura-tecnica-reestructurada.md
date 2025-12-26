# Arquitectura Técnica Reestructurada - Sistema PAMBAZO

## 1. Arquitectura de Sistema

```mermaid
graph TD
    A[Cliente Web/PWA] --> B[Load Balancer/Nginx]
    B --> C[API Gateway]
    C --> D[Servidor Express.js]
    D --> E[Middleware de Autenticación]
    E --> F[Controladores de Rutas]
    F --> G[Capa de Servicios]
    G --> H[Capa de Acceso a Datos]
    H --> I[PostgreSQL Database]
    
    D --> J[WebSocket Server]
    J --> K[Redis Cache]
    
    D --> L[Sistema de Archivos]
    L --> M[Almacenamiento de Imágenes]
    
    subgraph "Capa de Presentación"
        A
        B
    end
    
    subgraph "Capa de API"
        C
        D
        E
        F
    end
    
    subgraph "Capa de Lógica de Negocio"
        G
    end
    
    subgraph "Capa de Datos"
        H
        I
        K
        L
        M
    end
    
    subgraph "Tiempo Real"
        J
    end
```

## 2. Tecnologías Principales

### Backend
- **Framework**: Express.js 4.18+
- **Lenguaje**: TypeScript 5.0+
- **Base de Datos**: PostgreSQL 15+
- **Cache**: Redis 7.0+
- **Autenticación**: JWT + bcrypt
- **WebSockets**: Socket.io 4.7+
- **Validación**: Joi/Zod
- **ORM**: Prisma 5.0+ (recomendado para migración)

### Infraestructura
- **Servidor Web**: Nginx (proxy reverso)
- **Contenedores**: Docker + Docker Compose
- **Monitoreo**: PM2 + logs estructurados
- **Variables de Entorno**: dotenv

## 3. Estructura de Rutas API Reestructurada

### 3.1 Rutas de Autenticación
| Método | Ruta | Descripción | Middleware |
|--------|------|-------------|------------|
| POST | `/api/v1/auth/login` | Iniciar sesión | validación |
| POST | `/api/v1/auth/register` | Registrar usuario | validación |
| POST | `/api/v1/auth/logout` | Cerrar sesión | auth |
| POST | `/api/v1/auth/refresh` | Renovar token | auth |
| POST | `/api/v1/auth/forgot-password` | Recuperar contraseña | validación |
| POST | `/api/v1/auth/reset-password` | Restablecer contraseña | validación |
| GET | `/api/v1/auth/me` | Perfil actual | auth |

### 3.2 Rutas de Usuarios
| Método | Ruta | Descripción | Middleware |
|--------|------|-------------|------------|
| GET | `/api/v1/users` | Listar usuarios | auth, admin |
| GET | `/api/v1/users/:id` | Obtener usuario | auth |
| POST | `/api/v1/users` | Crear usuario | auth, admin |
| PUT | `/api/v1/users/:id` | Actualizar usuario | auth |
| DELETE | `/api/v1/users/:id` | Eliminar usuario | auth, admin |
| PATCH | `/api/v1/users/:id/status` | Cambiar estado | auth, admin |

### 3.3 Rutas de Productos
| Método | Ruta | Descripción | Middleware |
|--------|------|-------------|------------|
| GET | `/api/v1/products` | Listar productos | auth |
| GET | `/api/v1/products/:id` | Obtener producto | auth |
| POST | `/api/v1/products` | Crear producto | auth, admin |
| PUT | `/api/v1/products/:id` | Actualizar producto | auth, admin |
| DELETE | `/api/v1/products/:id` | Eliminar producto | auth, admin |
| POST | `/api/v1/products/:id/image` | Subir imagen | auth, admin |

### 3.4 Rutas de Órdenes
| Método | Ruta | Descripción | Middleware |
|--------|------|-------------|------------|
| GET | `/api/v1/orders` | Listar órdenes | auth |
| GET | `/api/v1/orders/:id` | Obtener orden | auth |
| POST | `/api/v1/orders` | Crear orden | auth |
| PUT | `/api/v1/orders/:id` | Actualizar orden | auth |
| PATCH | `/api/v1/orders/:id/status` | Cambiar estado | auth |
| DELETE | `/api/v1/orders/:id` | Cancelar orden | auth |

### 3.5 Rutas de Inventario
| Método | Ruta | Descripción | Middleware |
|--------|------|-------------|------------|
| GET | `/api/v1/inventory` | Listar inventario | auth |
| GET | `/api/v1/inventory/:id` | Obtener item | auth |
| POST | `/api/v1/inventory` | Crear item | auth, admin |
| PUT | `/api/v1/inventory/:id` | Actualizar item | auth |
| POST | `/api/v1/inventory/:id/restock` | Reabastecer | auth |
| GET | `/api/v1/inventory/low-stock` | Items con stock bajo | auth |

### 3.6 Rutas de Mesas
| Método | Ruta | Descripción | Middleware |
|--------|------|-------------|------------|
| GET | `/api/v1/tables` | Listar mesas | auth |
| GET | `/api/v1/tables/:id` | Obtener mesa | auth |
| POST | `/api/v1/tables` | Crear mesa | auth, admin |
| PUT | `/api/v1/tables/:id` | Actualizar mesa | auth |
| PATCH | `/api/v1/tables/:id/status` | Cambiar estado | auth |

### 3.7 Rutas de Reportes
| Método | Ruta | Descripción | Middleware |
|--------|------|-------------|------------|
| GET | `/api/v1/reports/sales` | Reporte de ventas | auth, admin |
| GET | `/api/v1/reports/inventory` | Reporte de inventario | auth, admin |
| GET | `/api/v1/reports/performance` | Reporte de rendimiento | auth, admin |
| GET | `/api/v1/reports/dashboard` | Datos del dashboard | auth |

## 4. Arquitectura de Base de Datos Reestructurada

```mermaid
erDiagram
    USERS ||--o{ ORDERS : creates
    USERS ||--o{ INVENTORY_ENTRIES : records
    USERS ||--o{ AUDIT_LOGS : generates
    
    CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : includes
    PRODUCTS ||--o{ INVENTORY : tracks
    PRODUCTS ||--o{ PRODUCT_INGREDIENTS : has
    
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS }o--|| TABLES : assigned_to
    ORDERS }o--|| PAYMENT_METHODS : paid_with
    
    TABLES ||--o{ TABLE_RESERVATIONS : has
    
    INVENTORY ||--o{ INVENTORY_ENTRIES : updated_by
    INVENTORY ||--o{ INVENTORY_ALERTS : triggers
    
    SUPPLIERS ||--o{ INVENTORY_ENTRIES : supplies
    
    USERS {
        uuid id PK
        string email UK
        string username UK
        string password_hash
        enum role
        string first_name
        string last_name
        string phone
        string avatar_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp last_login
    }
    
    CATEGORIES {
        serial id PK
        string name UK
        text description
        string icon_url
        integer sort_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCTS {
        serial id PK
        string name
        text description
        integer category_id FK
        decimal price
        decimal cost
        string image_url
        integer preparation_time
        jsonb nutritional_info
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    ORDERS {
        serial id PK
        uuid customer_id FK
        integer table_id FK
        enum status
        decimal total_amount
        decimal tax_amount
        decimal discount_amount
        enum payment_method
        enum payment_status
        text notes
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
        timestamp completed_at
    }
    
    ORDER_ITEMS {
        serial id PK
        integer order_id FK
        integer product_id FK
        integer quantity
        decimal unit_price
        decimal total_price
        text notes
        timestamp created_at
    }
    
    TABLES {
        serial id PK
        integer number UK
        integer capacity
        string location
        enum status
        uuid assigned_waiter_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    INVENTORY {
        serial id PK
        integer product_id FK
        integer current_stock
        integer min_stock
        integer max_stock
        string unit
        decimal unit_cost
        string location
        timestamp last_updated
        uuid updated_by FK
    }
    
    INVENTORY_ENTRIES {
        serial id PK
        integer inventory_id FK
        integer supplier_id FK
        enum entry_type
        integer quantity
        decimal unit_cost
        decimal total_cost
        string invoice_number
        text notes
        uuid created_by FK
        timestamp created_at
    }
    
    SUPPLIERS {
        serial id PK
        string name
        string contact_person
        string email
        string phone
        text address
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    AUDIT_LOGS {
        serial id PK
        uuid user_id FK
        string table_name
        string action
        jsonb old_values
        jsonb new_values
        string ip_address
        string user_agent
        timestamp created_at
    }
```

## 5. Middleware de Seguridad

### 5.1 Middleware de Autenticación
```typescript
interface AuthMiddleware {
  authenticateToken: (req: Request, res: Response, next: NextFunction) => void;
  authorizeRoles: (...roles: UserRole[]) => Middleware;
  validateOwnership: (resource: string) => Middleware;
}
```

### 5.2 Middleware de Validación
```typescript
interface ValidationMiddleware {
  validateSchema: (schema: Schema) => Middleware;
  sanitizeInput: Middleware;
  rateLimiter: (options: RateLimitOptions) => Middleware;
}
```

### 5.3 Middleware de Auditoría
```typescript
interface AuditMiddleware {
  logRequest: Middleware;
  logDataChanges: Middleware;
  trackUserActivity: Middleware;
}
```

## 6. Sistema de WebSockets para Tiempo Real

### 6.1 Eventos del Sistema
```typescript
interface SocketEvents {
  // Órdenes
  'order:created': (order: Order) => void;
  'order:updated': (order: Order) => void;
  'order:status_changed': (orderId: string, status: OrderStatus) => void;
  
  // Inventario
  'inventory:low_stock': (item: InventoryItem) => void;
  'inventory:updated': (item: InventoryItem) => void;
  
  // Mesas
  'table:status_changed': (table: Table) => void;
  'table:assigned': (table: Table, waiter: User) => void;
  
  // Notificaciones
  'notification:new': (notification: Notification) => void;
  
  // Sistema
  'system:maintenance': (message: string) => void;
}
```

### 6.2 Salas de WebSocket
- `kitchen`: Para el personal de cocina
- `waiters`: Para meseros
- `admin`: Para administradores
- `table-{id}`: Para mesas específicas
- `user-{id}`: Para usuarios específicos

## 7. Configuración de Seguridad

### 7.1 Variables de Entorno Requeridas
```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/pambaso_db
DATABASE_SSL=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Servidor
PORT=3001
NODE_ENV=production
API_VERSION=v1

# CORS
CORS_ORIGIN=https://yourdomain.com,http://localhost:5173

# Archivos
UPLOAD_MAX_SIZE=10mb
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW=15min
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info
LOG_FORMAT=json
```

### 7.2 Configuración de Seguridad
- Helmet.js para headers de seguridad
- Rate limiting por IP y usuario
- Validación y sanitización de entrada
- Encriptación de contraseñas con bcrypt (rounds: 12)
- Tokens JWT con expiración
- HTTPS obligatorio en producción
- Auditoría de todas las operaciones críticas

## 8. Plan de Migración

### Fase 1: Preparación (1-2 días)
1. Backup completo de la base de datos actual
2. Configuración del entorno de desarrollo
3. Instalación de dependencias nuevas

### Fase 2: Reestructuración de Base de Datos (2-3 días)
1. Creación del nuevo esquema
2. Migración de datos existentes
3. Configuración de índices y constraints

### Fase 3: Reestructuración del Backend (3-4 días)
1. Implementación de nueva arquitectura de rutas
2. Migración de controladores y servicios
3. Implementación de middleware de seguridad

### Fase 4: Sistema de Tiempo Real (2-3 días)
1. Configuración de WebSockets
2. Implementación de eventos en tiempo real
3. Integración con Redis

### Fase 5: Testing y Optimización (2-3 días)
1. Pruebas unitarias e integración
2. Pruebas de carga y rendimiento
3. Optimización de consultas

### Fase 6: Despliegue (1 día)
1. Despliegue en entorno de staging
2. Pruebas finales
3. Despliegue en producción

## 9. Monitoreo y Mantenimiento

### 9.1 Métricas Clave
- Tiempo de respuesta de API
- Uso de CPU y memoria
- Conexiones de base de datos
- Errores por endpoint
- Usuarios activos en tiempo real

### 9.2 Logs Estructurados
```typescript
interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  userId?: string;
  requestId: string;
  endpoint?: string;
  duration?: number;
  metadata?: Record<string, any>;
}
```

### 9.3 Alertas Automáticas
- Stock bajo en inventario
- Errores críticos del sistema
- Tiempo de respuesta elevado
- Fallos de autenticación repetidos
- Uso excesivo de recursos