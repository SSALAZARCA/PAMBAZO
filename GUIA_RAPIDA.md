# 🎯 GUÍA RÁPIDA DE USO - PAMBAZO 2.1

## 🚀 Inicio Rápido

### **1. Iniciar el Sistema**

```powershell
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm run dev
```

### **2. Acceder al Sistema**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api-docs

---

## 👥 Usuarios de Prueba

Todos los usuarios tienen la contraseña: `admin123`

| Email | Rol | Descripción |
|-------|-----|-------------|
| admin@pambazo.com | Admin | Acceso completo al sistema |
| waiter@pambazo.com | Waiter | Gestión de mesas y órdenes |
| kitchen@pambazo.com | Kitchen | Ver y preparar órdenes |
| customer@pambazo.com | Customer | Realizar pedidos y ver lealtad |

---

## 🎨 Nuevas Funcionalidades

### **1. Programa de Lealtad** 🏆

**Ubicación**: Dashboard del Cliente → Tab "Lealtad"

**Características**:
- 4 niveles: Bronze, Silver, Gold, Platinum
- Acumulación automática de puntos
- Barra de progreso al siguiente nivel
- Beneficios por tier

**Cómo usar**:
1. Inicia sesión como cliente
2. Ve al tab "Lealtad"
3. Verás tu tarjeta con puntos actuales
4. Los puntos se acumulan automáticamente con cada compra

---

### **2. Sistema de Propinas** 💰

**Ubicación**: Dashboard del Mesero → Órdenes Completadas

**Características**:
- Propina por porcentaje (10%, 15%, 20%, 25%)
- Propina personalizada
- 3 métodos de pago (efectivo, tarjeta, digital)
- Resumen diario de propinas

**Cómo usar**:
1. Inicia sesión como mesero
2. Completa una orden
3. Haz clic en "Agregar Propina"
4. Selecciona porcentaje o monto personalizado
5. Confirma

---

### **3. Sistema de Reservas** 📅

**Ubicación**: Dashboard del Admin → Sección Reservas

**Características**:
- Crear reservas con fecha y hora
- Verificación de disponibilidad
- Gestión de estados
- Cancelación de reservas

**Cómo usar**:
1. Inicia sesión como admin
2. Ve a la sección de reservas
3. Haz clic en "Nueva Reserva"
4. Completa el formulario
5. Confirma la reserva

---

### **4. Notificaciones en Tiempo Real** 🔔

**Ubicación**: Campana en la esquina superior derecha

**Características**:
- Notificaciones instantáneas vía WebSocket
- Push notifications del navegador
- Contador de no leídas
- Sonido de alerta

**Eventos por Rol**:
- **Cocina**: Nueva orden creada
- **Mesero**: Orden lista, nueva propina
- **Admin**: Nueva reserva, cambios de mesa

**Cómo activar**:
1. Al iniciar sesión, el sistema pedirá permiso para notificaciones
2. Acepta el permiso
3. Recibirás notificaciones automáticamente

---

## 🔐 Autenticación Mejorada

### **Refresh Tokens**

El sistema ahora usa refresh tokens para mantener la sesión:

- **Access Token**: Expira en 15 minutos
- **Refresh Token**: Expira en 7 días
- **Renovación Automática**: El sistema renueva el token automáticamente

**Beneficios**:
- Mayor seguridad
- Sesiones más largas
- Renovación transparente

---

## 📊 API y Documentación

### **Swagger UI**

Accede a la documentación interactiva:
- URL: http://localhost:3001/api-docs
- Prueba todos los endpoints
- Ve ejemplos de requests/responses
- Autenticación incluida

### **Nuevos Endpoints**

**Propinas**:
- `POST /api/v1/tips` - Agregar propina
- `GET /api/v1/tips/waiter/:id` - Ver propinas de mesero
- `GET /api/v1/tips/daily-summary` - Resumen diario

**Lealtad**:
- `GET /api/v1/loyalty/:customer_id` - Ver puntos
- `POST /api/v1/loyalty/add` - Agregar puntos
- `POST /api/v1/loyalty/redeem` - Canjear puntos
- `GET /api/v1/loyalty/history/:customer_id` - Historial

**Reservas**:
- `POST /api/v1/reservations` - Crear reserva
- `GET /api/v1/reservations` - Listar reservas
- `PATCH /api/v1/reservations/:id` - Actualizar
- `DELETE /api/v1/reservations/:id` - Cancelar

**Autenticación**:
- `POST /api/v1/auth/refresh` - Refrescar token

---

## 🗄️ Base de Datos

### **Ejecutar Schemas**

Si necesitas recrear las tablas:

```powershell
# Desde la raíz del proyecto
sqlite3 api/database.sqlite < api/database/tips-schema.sql
sqlite3 api/database.sqlite < api/database/loyalty-schema.sql
sqlite3 api/database.sqlite < api/database/reservations-schema.sql
```

### **Nuevas Tablas**

1. **refresh_tokens** - Gestión de tokens de refresco
2. **loyalty_points** - Puntos de lealtad por cliente
3. **loyalty_transactions** - Historial de transacciones
4. **reservations** - Sistema de reservas
5. **tips** - Registro de propinas

---

## 🔧 Configuración

### **Variables de Entorno**

Archivo `.env` en la raíz:

```env
# Backend
PORT=3001
DATABASE_URL=./api/database.sqlite

# JWT
JWT_SECRET=<tu-secret-de-256-bits>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<tu-refresh-secret-de-256-bits>
JWT_REFRESH_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001

# Opcional - Redis
REDIS_URL=redis://localhost:6379

# Opcional - Push Notifications
VAPID_PUBLIC_KEY=<tu-public-key>
VAPID_PRIVATE_KEY=<tu-private-key>
```

---

## 🐛 Solución de Problemas

### **El backend no inicia**

```powershell
# Recompilar
npm run server:build

# Verificar puerto
netstat -ano | findstr :3001

# Matar proceso si es necesario
taskkill /PID <PID> /F
```

### **El frontend no compila**

```powershell
# Limpiar cache
rm -rf node_modules/.vite

# Reinstalar dependencias
npm install

# Reiniciar
npm run dev
```

### **WebSocket no conecta**

1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador
3. Asegúrate de estar autenticado
4. Verifica VITE_WS_URL en .env

### **Push Notifications no funcionan**

1. Acepta el permiso del navegador
2. Verifica que estés en HTTPS (o localhost)
3. Revisa las claves VAPID en .env
4. Comprueba la consola del navegador

---

## 📱 Uso Móvil

El sistema es completamente responsive:

- **Dashboards móviles** para todos los roles
- **Touch-friendly** UI
- **PWA ready** (Progressive Web App)
- **Instalable** en dispositivos móviles

---

## 🎯 Flujos Comunes

### **Flujo de Orden Completa**

1. **Cliente** hace un pedido
2. **Cocina** recibe notificación
3. **Cocina** prepara y marca como "Lista"
4. **Mesero** recibe notificación
5. **Mesero** sirve la orden
6. **Cliente** paga y deja propina
7. **Mesero** recibe notificación de propina
8. **Sistema** acumula puntos de lealtad al cliente

### **Flujo de Reserva**

1. **Cliente/Admin** crea reserva
2. **Sistema** verifica disponibilidad
3. **Admin** recibe notificación
4. **Admin** confirma o modifica
5. **Cliente** recibe confirmación

---

## 📚 Documentación Adicional

- **MEJORAS_IMPLEMENTADAS.md** - Documentación técnica completa
- **GUIA_INTEGRACION_FRONTEND.md** - Guía de integración
- **IMPLEMENTACION_FINAL.md** - Resumen ejecutivo
- **CHECKLIST_INTEGRACION.md** - Lista de tareas

---

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa la consola del navegador
2. Revisa los logs del backend
3. Consulta la documentación de Swagger
4. Revisa los archivos de documentación

---

## 🎉 ¡Disfruta del Sistema!

El sistema PAMBAZO 2.1 está listo para usar con todas las funcionalidades empresariales implementadas.

**¡Buena suerte con tu panadería! 🥖**
