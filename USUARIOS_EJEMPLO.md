# 👥 USUARIOS DE EJEMPLO - SISTEMA PAMBAZO

## 🔐 Credenciales de Acceso

Todos los usuarios utilizan la misma contraseña: **`123456`**

---

## 📋 Lista de Usuarios por Rol

### 👑 **PROPIETARIO (Owner)**
- **Email:** `owner@pambazo.com`
- **Nombre:** Luis Rodríguez
- **Teléfono:** +57 300 123 4567
- **Funciones:**
  - ✅ Gestión completa de usuarios (crear, editar, eliminar)
  - ✅ Acceso a inventario y reportes
  - ✅ Control total del sistema
  - ✅ Asignación de roles

### 🔧 **ADMINISTRADOR (Admin)**
- **Email:** `admin@pambazo.com`
- **Nombre:** Ana García
- **Teléfono:** +57 300 234 5678
- **Funciones:**
  - ✅ Gestión de inventario
  - ✅ Reportes y estadísticas
  - ✅ Gestión de pedidos
  - ❌ NO puede crear usuarios

### 🍽️ **MESERO (Waiter)**
- **Email:** `mesero@pambazo.com`
- **Nombre:** Carlos Mendoza
- **Teléfono:** +57 300 345 6789
- **Funciones:**
  - ✅ Gestión de mesas y pedidos
  - ✅ Tomar órdenes de clientes
  - ✅ Actualizar estado de mesas
  - ✅ Dashboard móvil optimizado

### 🥖 **PANADERO (Baker)**
- **Email:** `baker@pambazo.com`
- **Nombre:** María González
- **Teléfono:** +57 300 456 7890
- **Funciones:**
  - ✅ Panel de control de producción
  - ✅ Monitoreo de hornos en tiempo real
  - ✅ Gestión de salidas de materiales
  - ✅ KPIs de producción
  - ✅ Alertas de stock bajo
  - ✅ Gráficos de eficiencia

### 👥 **EMPLEADO (Employee)**
- **Email:** `employee@pambazo.com`
- **Nombre:** Sofia Martínez
- **Teléfono:** +57 300 567 8901
- **Funciones:**
  - ✅ Dashboard básico de empleado
  - ✅ Funciones generales del sistema
  - ✅ Acceso limitado según permisos

### 🛒 **CLIENTE (Customer)**
- **Email:** `customer@pambazo.com`
- **Nombre:** Juan Pérez
- **Teléfono:** +57 300 678 9012
- **Puntos de Lealtad:** 1,250 puntos
- **Nivel:** Silver
- **Funciones:**
  - ✅ Ver menú y realizar pedidos
  - ✅ Sistema de puntos de lealtad
  - ✅ Historial de pedidos
  - ✅ Experiencia de cliente optimizada

---

## 🚀 Cómo Usar los Usuarios de Ejemplo

### **Método 1: Login Manual**
1. Ve a http://localhost:3000
2. Ingresa cualquier email de la lista
3. Usa la contraseña: `123456`
4. Haz clic en "Iniciar Sesión"

### **Método 2: Acceso Rápido (Recomendado)**
1. Ve a http://localhost:3000
2. En la sección "Acceso Rápido (Demo)"
3. Haz clic directamente en el usuario que deseas probar
4. ¡Acceso inmediato!

---

## 💰 Información Adicional

- **Moneda:** Todos los precios están en **Pesos Colombianos (COP)**
- **Formato:** $X,XXX COP
- **Datos:** Información realista para el contexto colombiano
- **Teléfonos:** Números colombianos válidos (+57)

---

## 🎯 Funcionalidades por Rol

| Funcionalidad | Owner | Admin | Waiter | Baker | Employee | Customer |
|---------------|-------|-------|--------|-------|----------|----------|
| Crear Usuarios | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gestión Inventario | ✅ | ✅ | ❌ | ✅* | ❌ | ❌ |
| Gestión Mesas | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tomar Pedidos | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Dashboard Producción | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Reportes Financieros | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Puntos Lealtad | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |

*\* Solo salidas de materiales, sin capacidad de agregar*

---

## 🔧 Notas Técnicas

- **Persistencia:** Los datos se guardan en localStorage
- **Autenticación:** Sistema mock para demostración
- **Roles:** Implementados con control de acceso granular
- **Responsivo:** Optimizado para desktop, tablet y móvil
- **PWA:** Funciona como aplicación web progresiva

---

## 📱 Acceso Móvil

Todos los usuarios tienen acceso optimizado para dispositivos móviles con:
- Navegación inferior táctil
- Interfaces adaptadas por rol
- Funcionalidades específicas para cada tipo de usuario
- Experiencia nativa en dispositivos móviles

---

**¡Explora todas las funcionalidades del sistema PAMBAZO con estos usuarios de ejemplo!** 🥖✨