# 👥 USUARIOS DE PRUEBA - PAMBAZO 2.1

## 📋 Usuarios por Rol

### 🔐 Credenciales de Acceso

Todos los usuarios tienen la misma contraseña para facilitar las pruebas:
**Contraseña**: `pambazo123`

---

## 👨‍💼 ADMIN - Administrador del Sistema

### Usuario 1: Super Admin
- **Email**: `admin@pambazo.com`
- **Nombre**: `Carlos Administrador`
- **Rol**: `admin`
- **Contraseña**: `pambazo123`
- **Permisos**: Acceso total al sistema

**Acceso a**:
- `/admin` - Dashboard principal
- `/admin/users` - Gestión de usuarios
- Todos los reportes y configuraciones

---

## 👨‍🍳 BAKER - Panadero

### Usuario 2: Panadero Principal
- **Email**: `baker@pambazo.com`
- **Nombre**: `Juan Panadero`
- **Rol**: `baker`
- **Contraseña**: `pambazo123`
- **Especialidad**: Masa madre y croissants

**Acceso a**:
- `/baker` - Dashboard de panadería
- `/baker/production` - Control de producción
- Gestión de hornos y lotes

### Usuario 3: Panadero Asistente
- **Email**: `baker2@pambazo.com`
- **Nombre**: `Pedro Hornero`
- **Rol**: `baker`
- **Contraseña**: `pambazo123`
- **Especialidad**: Pan tradicional

---

## 💼 OWNER - Propietario

### Usuario 4: Propietario
- **Email**: `owner@pambazo.com`
- **Nombre**: `María Propietaria`
- **Rol**: `owner`
- **Contraseña**: `pambazo123`
- **Función**: Análisis de negocio

**Acceso a**:
- `/owner` - Dashboard con analytics
- Reportes financieros
- Gráficos de ventas
- KPIs del negocio

---

## 🍳 KITCHEN - Cocina

### Usuario 5: Chef de Cocina
- **Email**: `kitchen@pambazo.com`
- **Nombre**: `Ana Cocinera`
- **Rol**: `kitchen`
- **Contraseña**: `pambazo123`
- **Función**: Preparación de pedidos

**Acceso a**:
- `/kitchen` - Dashboard de cocina
- Órdenes pendientes
- Gestión de tiempos
- Recetas

### Usuario 6: Ayudante de Cocina
- **Email**: `kitchen2@pambazo.com`
- **Nombre**: `Luis Ayudante`
- **Rol**: `kitchen`
- **Contraseña**: `pambazo123`

---

## 🍽️ WAITER - Mesero

### Usuario 7: Mesero Principal
- **Email**: `waiter@pambazo.com`
- **Nombre**: `Sofia Mesera`
- **Rol**: `waiter`
- **Contraseña**: `pambazo123`
- **Zona**: Mesas 1-10

**Acceso a**:
- `/waiter` - Dashboard de mesero
- Gestión de mesas
- Toma de pedidos
- Cierre de cuentas

### Usuario 8: Mesero Turno Noche
- **Email**: `waiter2@pambazo.com`
- **Nombre**: `Diego Camarero`
- **Rol**: `waiter`
- **Contraseña**: `pambazo123`
- **Zona**: Mesas 11-20

---

## 👤 CUSTOMER - Cliente

### Usuario 9: Cliente VIP
- **Email**: `customer@pambazo.com`
- **Nombre**: `Roberto Cliente`
- **Rol**: `customer`
- **Contraseña**: `pambazo123`
- **Puntos**: 450
- **Nivel**: Gold

**Acceso a**:
- `/customer` - Dashboard de cliente
- Menú de productos
- Historial de pedidos
- Programa de lealtad

### Usuario 10: Cliente Regular
- **Email**: `customer2@pambazo.com`
- **Nombre**: `Laura Compradora`
- **Rol**: `customer`
- **Contraseña**: `pambazo123`
- **Puntos**: 120
- **Nivel**: Silver

### Usuario 11: Cliente Nuevo
- **Email**: `customer3@pambazo.com`
- **Nombre**: `Miguel Nuevo`
- **Rol**: `customer`
- **Contraseña**: `pambazo123`
- **Puntos**: 0
- **Nivel**: Bronze

---

## 📊 RESUMEN

| Rol | Cantidad | Emails |
|-----|----------|--------|
| **Admin** | 1 | admin@pambazo.com |
| **Baker** | 2 | baker@pambazo.com, baker2@pambazo.com |
| **Owner** | 1 | owner@pambazo.com |
| **Kitchen** | 2 | kitchen@pambazo.com, kitchen2@pambazo.com |
| **Waiter** | 2 | waiter@pambazo.com, waiter2@pambazo.com |
| **Customer** | 3 | customer@pambazo.com, customer2@pambazo.com, customer3@pambazo.com |
| **TOTAL** | **11** | |

---

## 🔑 ACCESO RÁPIDO

### Para Probar Admin
```
Email: admin@pambazo.com
Password: pambazo123
URL: http://localhost:5173/login
```

### Para Probar Baker
```
Email: baker@pambazo.com
Password: pambazo123
URL: http://localhost:5173/login
```

### Para Probar Owner
```
Email: owner@pambazo.com
Password: pambazo123
URL: http://localhost:5173/login
```

### Para Probar Kitchen
```
Email: kitchen@pambazo.com
Password: pambazo123
URL: http://localhost:5173/login
```

### Para Probar Waiter
```
Email: waiter@pambazo.com
Password: pambazo123
URL: http://localhost:5173/login
```

### Para Probar Customer
```
Email: customer@pambazo.com
Password: pambazo123
URL: http://localhost:5173/login
```

---

## 🎯 CASOS DE USO POR ROL

### Admin
1. Gestionar usuarios en `/admin/users`
2. Ver estadísticas generales
3. Configurar el sistema
4. Generar reportes

### Baker
1. Ver hornos activos
2. Gestionar lotes de producción en `/baker/production`
3. Controlar temperaturas
4. Completar lotes

### Owner
1. Ver gráficos de ventas
2. Analizar productos más vendidos
3. Revisar KPIs
4. Exportar reportes

### Kitchen
1. Ver órdenes pendientes
2. Marcar órdenes en preparación
3. Completar órdenes
4. Gestionar tiempos

### Waiter
1. Ver estado de mesas
2. Asignar mesas
3. Tomar pedidos
4. Cerrar cuentas

### Customer
1. Ver menú de productos
2. Agregar al carrito
3. Ver historial de pedidos
4. Revisar puntos de lealtad

---

## 🚀 CÓMO USAR

### Opción 1: Login Manual
1. Ir a `http://localhost:5173/login`
2. Ingresar email del rol deseado
3. Ingresar contraseña: `pambazo123`
4. Explorar el dashboard correspondiente

### Opción 2: Navegación Directa
Si ya estás logueado, puedes navegar directamente a:
- `/admin` - Dashboard de admin
- `/baker` - Dashboard de panadero
- `/owner` - Dashboard de propietario
- `/kitchen` - Dashboard de cocina
- `/waiter` - Dashboard de mesero
- `/customer` - Dashboard de cliente

---

## 📝 NOTAS

- Todos los usuarios tienen la misma contraseña para facilitar las pruebas
- Los datos son de ejemplo y pueden ser modificados
- En producción, usar contraseñas seguras y únicas
- Los puntos de lealtad son ficticios

---

**Última actualización**: 2026-01-05 10:58
**Contraseña universal**: `pambazo123`
