# 🔍 AUDITORÍA DE RUTAS - BACKEND PAMBAZO 2.1

## 📊 ANÁLISIS COMPLETO

He analizado el frontend y comparado con el backend actual. Aquí están las rutas que **FALTAN**:

---

## ❌ RUTAS QUE FALTAN

### 1. **Autenticación Avanzada**
```javascript
// FALTA
POST /api/v1/auth/register - Registro de nuevos usuarios
POST /api/v1/auth/refresh - Refresh token
POST /api/v1/auth/forgot-password - Recuperar contraseña
POST /api/v1/auth/reset-password - Resetear contraseña
```

**Usado en**: `authService.ts`, `useStore.ts`

---

### 2. **Lealtad/Loyalty**
```javascript
// FALTA
GET /api/v1/loyalty/:customerId - Obtener puntos de lealtad
POST /api/v1/loyalty/redeem - Canjear puntos
GET /api/v1/loyalty/rewards - Listar recompensas
```

**Usado en**: `LoyaltyCard.tsx`, `CustomerDashboard.tsx`

---

### 3. **Propinas/Tips**
```javascript
// FALTA
POST /api/v1/tips - Registrar propina
GET /api/v1/tips - Listar propinas
GET /api/v1/tips/stats - Estadísticas de propinas
```

**Usado en**: `TipModal.tsx`

---

### 4. **Reservaciones**
```javascript
// FALTA
POST /api/v1/reservations - Crear reservación
GET /api/v1/reservations - Listar reservaciones
PATCH /api/v1/reservations/:id - Actualizar reservación
DELETE /api/v1/reservations/:id - Cancelar reservación
```

**Usado en**: `ReservationForm.tsx`

---

### 5. **Estadísticas Generales**
```javascript
// FALTA
GET /api/stats/sales - Estadísticas de ventas
GET /api/stats/products - Estadísticas de productos
GET /api/stats/overview - Resumen general
```

**Usado en**: `StatsOverview.tsx`

---

### 6. **Notificaciones Push**
```javascript
// FALTA
POST /api/v1/notifications/subscribe - Suscribirse a push
POST /api/v1/notifications/unsubscribe - Desuscribirse
POST /api/v1/notifications/send - Enviar notificación
```

**Usado en**: `pushNotifications.ts`

---

### 7. **Productos Avanzados**
```javascript
// EXISTE PERO INCOMPLETO
GET /api/v1/products - ✅ Existe
POST /api/v1/products - ❌ FALTA (crear producto)
PUT /api/v1/products/:id - ❌ FALTA (actualizar producto)
DELETE /api/v1/products/:id - ❌ FALTA (eliminar producto)
GET /api/v1/products/:id - ❌ FALTA (obtener por ID)
```

**Usado en**: Admin dashboard, Product management

---

### 8. **Órdenes Avanzadas**
```javascript
// EXISTE PERO INCOMPLETO
GET /api/v1/orders?userId=X - ❌ FALTA (filtro por usuario)
DELETE /api/orders/:id - ❌ FALTA (cancelar orden)
GET /api/orders/:id - ❌ FALTA (obtener por ID)
```

**Usado en**: `CustomerDashboard.tsx`

---

### 9. **Usuarios CRUD Completo**
```javascript
// EXISTE PERO INCOMPLETO
POST /api/users - ❌ FALTA (crear usuario)
PUT /api/users/:id - ❌ FALTA (actualizar usuario)
DELETE /api/users/:id - ❌ FALTA (eliminar usuario)
PATCH /api/users/:id/role - ❌ FALTA (cambiar rol)
```

**Usado en**: Admin dashboard, User management

---

### 10. **Mesas Avanzadas**
```javascript
// EXISTE PERO INCOMPLETO
POST /api/tables - ❌ FALTA (crear mesa)
DELETE /api/tables/:id - ❌ FALTA (eliminar mesa)
GET /api/tables/available - ❌ FALTA (solo disponibles)
```

**Usado en**: Waiter dashboard, Table management

---

### 11. **Inventario Avanzado**
```javascript
// EXISTE PERO INCOMPLETO
POST /api/inventory - ❌ FALTA (agregar item)
DELETE /api/inventory/:id - ❌ FALTA (eliminar item)
POST /api/inventory/:id/entry - ❌ FALTA (registrar entrada)
GET /api/inventory/low-stock - ❌ FALTA (items con stock bajo)
```

**Usado en**: Admin dashboard, Inventory management

---

### 12. **Reportes Avanzados**
```javascript
// EXISTE PERO INCOMPLETO
GET /api/reports/daily - ❌ FALTA (reporte diario)
GET /api/reports/monthly - ❌ FALTA (reporte mensual)
GET /api/reports/products - ❌ FALTA (reporte de productos)
GET /api/reports/employees - ❌ FALTA (reporte de empleados)
POST /api/reports/export - ❌ FALTA (exportar reporte)
```

**Usado en**: Owner dashboard, Reports section

---

### 13. **Carrito de Compras**
```javascript
// FALTA COMPLETAMENTE
GET /api/cart - Obtener carrito
POST /api/cart/items - Agregar item
DELETE /api/cart/items/:id - Eliminar item
PATCH /api/cart/items/:id - Actualizar cantidad
POST /api/cart/checkout - Procesar compra
```

**Usado en**: Customer dashboard, Shopping cart

---

### 14. **Favoritos**
```javascript
// FALTA COMPLETAMENTE
GET /api/favorites - Listar favoritos
POST /api/favorites - Agregar favorito
DELETE /api/favorites/:id - Eliminar favorito
```

**Usado en**: Customer dashboard

---

### 15. **Pagos**
```javascript
// FALTA COMPLETAMENTE
POST /api/payments - Procesar pago
GET /api/payments/:id - Estado de pago
POST /api/payments/refund - Reembolso
```

**Usado en**: Checkout, Payment processing

---

### 16. **Horarios/Shifts**
```javascript
// FALTA COMPLETAMENTE
GET /api/shifts - Listar turnos
POST /api/shifts - Crear turno
PATCH /api/shifts/:id - Actualizar turno
DELETE /api/shifts/:id - Eliminar turno
```

**Usado en**: Admin dashboard, Employee management

---

### 17. **Métricas en Tiempo Real**
```javascript
// FALTA COMPLETAMENTE
GET /api/metrics/realtime - Métricas en tiempo real
GET /api/metrics/dashboard - Dashboard metrics
```

**Usado en**: Owner dashboard, Analytics

---

## 📊 RESUMEN DE LA AUDITORÍA

| Categoría | Rutas Actuales | Rutas Faltantes | Total Necesarias |
|-----------|----------------|-----------------|------------------|
| **Autenticación** | 3 | 4 | 7 |
| **Usuarios** | 2 | 4 | 6 |
| **Productos** | 1 | 4 | 5 |
| **Órdenes** | 3 | 3 | 6 |
| **Mesas** | 2 | 3 | 5 |
| **Inventario** | 2 | 4 | 6 |
| **Producción** | 3 | 0 | 3 |
| **Analytics** | 2 | 0 | 2 |
| **Notificaciones** | 2 | 3 | 5 |
| **Reportes** | 2 | 5 | 7 |
| **Configuración** | 1 | 0 | 1 |
| **Categorías** | 1 | 0 | 1 |
| **Lealtad** | 0 | 3 | 3 |
| **Propinas** | 0 | 3 | 3 |
| **Reservaciones** | 0 | 4 | 4 |
| **Estadísticas** | 0 | 3 | 3 |
| **Carrito** | 0 | 5 | 5 |
| **Favoritos** | 0 | 3 | 3 |
| **Pagos** | 0 | 3 | 3 |
| **Turnos** | 0 | 4 | 4 |
| **Métricas** | 0 | 2 | 2 |
| **Health** | 1 | 0 | 1 |
| **TOTAL** | **25** | **57** | **82** |

---

## 🎯 PRIORIDADES

### 🔴 CRÍTICAS (Necesarias para funcionalidad básica)
1. ✅ **Auth Register** - Para crear nuevos usuarios
2. ✅ **Productos CRUD** - Para gestionar productos
3. ✅ **Usuarios CRUD** - Para gestionar usuarios
4. ✅ **Órdenes por usuario** - Para historial de clientes
5. ✅ **Carrito** - Para compras de clientes

### 🟡 IMPORTANTES (Mejoran la experiencia)
6. ✅ **Lealtad** - Programa de puntos
7. ✅ **Favoritos** - Lista de deseos
8. ✅ **Reservaciones** - Sistema de reservas
9. ✅ **Propinas** - Gestión de propinas
10. ✅ **Estadísticas** - Métricas del negocio

### 🟢 OPCIONALES (Nice to have)
11. ⭕ **Pagos** - Integración de pagos
12. ⭕ **Turnos** - Gestión de horarios
13. ⭕ **Notificaciones Push** - Push notifications
14. ⭕ **Métricas en tiempo real** - Real-time analytics
15. ⭕ **Exportar reportes** - Export functionality

---

## 💡 RECOMENDACIÓN

### Opción 1: Implementar TODAS (Completo)
- **Tiempo**: 4-6 horas
- **Rutas**: 57 adicionales
- **Total**: 82 rutas
- **Ventaja**: Backend 100% completo

### Opción 2: Solo CRÍTICAS (Funcional)
- **Tiempo**: 1-2 horas
- **Rutas**: 20 adicionales
- **Total**: 45 rutas
- **Ventaja**: Funcionalidad básica completa

### Opción 3: CRÍTICAS + IMPORTANTES (Balanceado) ⭐
- **Tiempo**: 2-3 horas
- **Rutas**: 35 adicionales
- **Total**: 60 rutas
- **Ventaja**: Mejor balance funcionalidad/tiempo

---

## 🚀 SIGUIENTE PASO

¿Qué prefieres?

1. **Implementar TODAS las rutas** (backend 100% completo)
2. **Solo las CRÍTICAS** (funcionalidad básica)
3. **CRÍTICAS + IMPORTANTES** (balanceado) ⭐ RECOMENDADO

---

**Última actualización**: 2026-01-05 12:17
**Rutas actuales**: 25
**Rutas faltantes**: 57
**Total necesarias**: 82
