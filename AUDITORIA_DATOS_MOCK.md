# 🧹 AUDITORÍA Y LIMPIEZA DE DATOS MOCK PARA PRODUCCIÓN

## ❌ DATOS MOCK ENCONTRADOS

### **1. Frontend Components**

#### **CustomerDashboard.tsx** (Líneas 202-230)
- ❌ Mock order history con datos hardcodeados
- ❌ Usa COLOMBIA_PRICES (constantes de desarrollo)
- **ACCIÓN**: Eliminar y reemplazar con fetch a `/api/v1/orders/history`

#### **AdminDashboard.tsx** (Líneas 36-60)
- ❌ Mock admin stats (Total Materias Primas, Stock Bajo, etc.)
- **ACCIÓN**: Eliminar y reemplazar con fetch a `/api/v1/admin/stats`

#### **EmployeeDashboard.tsx** (Líneas 28-48)
- ❌ Mock todayStats (ordersServed, tablesAssigned, hoursWorked, tips)
- ❌ Mock currentOrders
- ❌ Mock schedule
- **ACCIÓN**: Eliminar y reemplazar con fetch a `/api/v1/employee/stats`

#### **WaiterDashboard.tsx** (Líneas 50-120)
- ❌ Mock orders con datos hardcodeados
- ❌ Mock products (líneas 116-121)
- **ACCIÓN**: Eliminar y reemplazar con fetch a `/api/v1/orders` y `/api/v1/products`

#### **TableManagementDialog.tsx** (Líneas 29-36)
- ❌ Mock products
- **ACCIÓN**: Reemplazar con fetch a `/api/v1/products`

#### **Mobile Components**
- **MobileWaiterDashboard.tsx** (Líneas 9-16): ❌ Mock products
- **MobileCustomerDashboard.tsx** (Líneas 70-108): ❌ Mock products y orders
- **ACCIÓN**: Reemplazar con fetch al backend

---

### **2. Backend Services**

#### **api/services/mockDataService.ts**
- ❌ Servicio completo de datos simulados
- **ACCIÓN**: **ELIMINAR COMPLETAMENTE** (solo para desarrollo)

#### **api/config/database.ts** (Líneas 10, 46-58, 70-122)
- ❌ Lógica de fallback a mock data
- **ACCIÓN**: Eliminar fallback, forzar PostgreSQL en producción

#### **api/services/dataAdapter.ts**
- ❌ Adapter que alterna entre PostgreSQL y mock
- **ACCIÓN**: Simplificar para usar solo PostgreSQL

---

### **3. Archivos de Debug/Test**

- ❌ `api/debug-auth.js` - Script de debugging
- ❌ `api/test-auth.js` - Script de testing
- **ACCIÓN**: ELIMINAR (no necesarios en producción)

---

### **4. Constantes de Desarrollo**

#### **src/utils/currency.ts**
- ⚠️ `COLOMBIA_PRICES` - Constantes hardcodeadas
- **ACCIÓN**: **MANTENER** pero documentar que son solo para fallback

---

## ✅ PLAN DE LIMPIEZA

### **FASE 1: Backend (Crítico)**

1. **Eliminar archivos de desarrollo:**
   ```bash
   rm api/debug-auth.js
   rm api/test-auth.js
   rm api/services/mockDataService.ts
   ```

2. **Actualizar `database.ts`:**
   - Eliminar lógica de fallback a mock
   - Forzar PostgreSQL en producción
   - Lanzar error si no hay conexión

3. **Simplificar `dataAdapter.ts`:**
   - Eliminar referencias a mockDataService
   - Usar solo PostgreSQL queries

---

### **FASE 2: Frontend Components**

1. **CustomerDashboard.tsx:**
   - Eliminar mock orderHistory
   - Agregar `useEffect` para fetch real orders

2. **AdminDashboard.tsx:**
   - Eliminar mock adminStats
   - Agregar fetch a `/api/v1/admin/stats`

3. **EmployeeDashboard.tsx:**
   - Eliminar todos los mocks
   - Agregar fetches a endpoints reales

4. **WaiterDashboard.tsx:**
   - Eliminar mock orders y products
   - Usar solo datos del backend

5. **TableManagementDialog.tsx:**
   - Eliminar mock products
   - Fetch desde `/api/v1/products`

6. **Mobile Components:**
   - Limpiar todos los mocks
   - Usar mismos endpoints que desktop

---

### **FASE 3: Variables de Entorno**

Agregar a `.env.production`:
```env
# Forzar producción
NODE_ENV=production
FORCE_POSTGRESQL=true
DISABLE_MOCK_DATA=true
```

---

## 🚨 ARCHIVOS A ELIMINAR COMPLETAMENTE

```
api/debug-auth.js
api/test-auth.js
api/services/mockDataService.ts
```

---

## 📝 ARCHIVOS A MODIFICAR

```
✏️ api/config/database.ts
✏️ api/services/dataAdapter.ts
✏️ components/CustomerDashboard.tsx
✏️ components/AdminDashboard.tsx
✏️ components/EmployeeDashboard.tsx
✏️ components/WaiterDashboard.tsx
✏️ components/TableManagementDialog.tsx
✏️ components/mobile/MobileWaiterDashboard.tsx
✏️ components/mobile/MobileCustomerDashboard.tsx
```

---

## ✅ VERIFICACIÓN POST-LIMPIEZA

### **Checklist:**
- [ ] No hay imports de `mockDataService`
- [ ] No hay constantes hardcodeadas de productos
- [ ] Todos los dashboards usan fetch real
- [ ] Database.ts solo acepta PostgreSQL
- [ ] No hay archivos de debug/test
- [ ] Variables de entorno configuradas
- [ ] Build exitoso sin warnings
- [ ] Tests de integración pasan

---

## 🎯 RESULTADO ESPERADO

**Antes:**
- ❌ Datos simulados en frontend
- ❌ Fallback a mock en backend
- ❌ Archivos de debug incluidos

**Después:**
- ✅ 100% datos reales desde PostgreSQL
- ✅ Error claro si no hay BD
- ✅ Código limpio para producción
- ✅ Sin dependencias de desarrollo

---

**¿Procedo con la limpieza automática?**
