# 📡 TODAS LAS RUTAS DEL BACKEND - PAMBAZO 2.1

## ✅ BACKEND COMPLETO CON TODAS LAS RUTAS

El backend ahora tiene **TODAS** las rutas necesarias para la aplicación completa.

---

## 🔐 AUTENTICACIÓN

### POST `/api/auth/login`
Login de usuario
```json
Request: { "email": "admin@pambazo.com", "password": "pambazo123" }
Response: { "success": true, "data": { "token": "...", "user": {...} } }
```

### GET `/api/auth/me`
Obtener perfil del usuario autenticado (requiere token)

### POST `/api/auth/logout`
Cerrar sesión (requiere token)

---

## 👥 USUARIOS (Admin)

### GET `/api/users`
Listar todos los usuarios (solo admin)

### GET `/api/users/:id`
Obtener usuario por ID

---

## 🛍️ PRODUCTOS

### GET `/api/v1/products`
Listar productos
- Query params: `?limit=6&available=true`

---

## 📦 ÓRDENES

### GET `/api/orders`
Listar órdenes (requiere token)
- Query params: `?status=pending&table=5`

### POST `/api/orders`
Crear nueva orden (requiere token)
```json
{
  "tableNumber": 5,
  "items": [{ "id": 1, "name": "Croissant", "price": 12000, "quantity": 2 }],
  "notes": "Sin azúcar"
}
```

### PATCH `/api/orders/:id`
Actualizar estado de orden (requiere token)
```json
{ "status": "ready" }
```

---

## 🍽️ MESAS

### GET `/api/tables`
Listar todas las mesas (20 mesas) (requiere token)

### PATCH `/api/tables/:id`
Actualizar estado de mesa (requiere token)
```json
{ "status": "occupied", "currentOrder": 123 }
```

---

## 📊 INVENTARIO (Admin/Baker)

### GET `/api/inventory`
Listar inventario (solo admin y baker)

### PATCH `/api/inventory/:id`
Actualizar stock (solo admin)
```json
{ "stock": 45 }
```

---

## 🔥 PRODUCCIÓN (Baker)

### GET `/api/production/batches`
Listar lotes de producción (solo baker y admin)

### POST `/api/production/batches`
Crear nuevo lote (solo baker)
```json
{
  "product": "Croissant Artesanal",
  "quantity": 50,
  "ovenNumber": 1,
  "temperature": 180
}
```

### PATCH `/api/production/batches/:id`
Actualizar estado de lote (solo baker)
```json
{ "status": "ready" }
```

---

## 📈 ANALYTICS (Owner/Admin)

### GET `/api/analytics/sales`
Estadísticas de ventas (solo owner y admin)
```json
Response: {
  "today": 2750000,
  "week": 18500000,
  "month": 75000000,
  "growth": 18.5,
  "topProducts": [...],
  "dailySales": [...]
}
```

### GET `/api/analytics/products`
Estadísticas de productos (solo owner y admin)

---

## 🔔 NOTIFICACIONES

### GET `/api/notifications`
Listar notificaciones no leídas (requiere token)

### PATCH `/api/notifications/:id`
Marcar notificación como leída (requiere token)

---

## 📄 REPORTES

### GET `/api/reports/sales`
Reporte de ventas (solo owner y admin)
- Query params: `?startDate=2024-01-01&endDate=2024-01-31`

### GET `/api/reports/inventory`
Reporte de inventario (solo admin)

---

## ⚙️ CONFIGURACIÓN

### GET `/api/config`
Obtener configuración de la aplicación (requiere token)
```json
Response: {
  "businessName": "PAMBAZO",
  "currency": "COP",
  "timezone": "America/Bogota",
  "workingHours": {...}
}
```

---

## 🏷️ CATEGORÍAS

### GET `/api/categories`
Listar categorías de productos (público)
```json
Response: [
  { "id": 1, "name": "Panadería", "description": "...", "icon": "🥖" },
  { "id": 2, "name": "Repostería", "description": "...", "icon": "🍰" },
  { "id": 3, "name": "Bebidas", "description": "...", "icon": "☕" }
]
```

---

## ❤️ HEALTH CHECK

### GET `/api/health`
Estado del servidor (público)
```json
Response: {
  "status": "ok",
  "timestamp": "2024-01-05T12:00:00.000Z",
  "service": "PAMBAZO Backend",
  "version": "2.1.0"
}
```

---

## 📊 RESUMEN DE RUTAS

| Categoría | Rutas | Autenticación | Roles |
|-----------|-------|---------------|-------|
| **Auth** | 3 | Parcial | Todos |
| **Usuarios** | 2 | Sí | Admin |
| **Productos** | 1 | No | Público |
| **Órdenes** | 3 | Sí | Todos |
| **Mesas** | 2 | Sí | Waiter, Admin |
| **Inventario** | 2 | Sí | Admin, Baker |
| **Producción** | 3 | Sí | Baker, Admin |
| **Analytics** | 2 | Sí | Owner, Admin |
| **Notificaciones** | 2 | Sí | Todos |
| **Reportes** | 2 | Sí | Owner, Admin |
| **Configuración** | 1 | Sí | Todos |
| **Categorías** | 1 | No | Público |
| **Health** | 1 | No | Público |
| **TOTAL** | **25 RUTAS** | - | - |

---

## 🎯 RUTAS POR ROL

### Admin
- ✅ Todas las rutas
- ✅ Gestión de usuarios
- ✅ Gestión de inventario
- ✅ Reportes completos

### Owner
- ✅ Analytics
- ✅ Reportes de ventas
- ✅ Productos
- ✅ Configuración

### Baker
- ✅ Producción
- ✅ Inventario (lectura)
- ✅ Lotes de producción

### Kitchen
- ✅ Órdenes
- ✅ Productos
- ✅ Notificaciones

### Waiter
- ✅ Mesas
- ✅ Órdenes
- ✅ Productos

### Customer
- ✅ Productos
- ✅ Categorías
- ✅ Órdenes propias

---

## 🔒 AUTENTICACIÓN

Todas las rutas marcadas con "requiere token" necesitan el header:
```
Authorization: Bearer <token>
```

El token se obtiene del login y expira en 24 horas.

---

## 📝 DATOS DE EJEMPLO

### Inventario (5 items)
- Harina de Trigo
- Azúcar
- Levadura
- Mantequilla
- Huevos

### Productos (6 items)
- Croissant Artesanal
- Pan de Masa Madre
- Baguette Francesa
- Roles de Canela
- Galletas de Chocolate
- Pastel de Chocolate

### Mesas (20 mesas)
- Mesas 1-10: Capacidad 4 personas
- Mesas 11-20: Capacidad 6 personas

### Categorías (3 categorías)
- Panadería
- Repostería
- Bebidas

---

## ✅ TODO FUNCIONAL

- ✅ 25 rutas implementadas
- ✅ Autenticación JWT
- ✅ Control de roles
- ✅ Datos de ejemplo
- ✅ Sin errores
- ✅ Listo para usar

---

**Última actualización**: 2026-01-05 12:04
**Estado**: ✅ **BACKEND COMPLETO AL 100%**
**Puerto**: 3001
**Archivo**: server-clean.cjs
