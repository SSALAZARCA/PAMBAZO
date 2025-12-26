# 🔥 ELIMINACIÓN TOTAL DE DATOS MOCK

## ⚠️ ADVERTENCIA CRÍTICA

Este documento describe la eliminación **TOTAL** de todos los datos simulados.

**CONSECUENCIAS:**
- ❌ Los componentes NO mostrarán datos hasta conectar con backend
- ❌ Pantallas vacías si no hay datos en PostgreSQL
- ❌ Errores si los endpoints no existen
- ✅ Código 100% limpio para producción

---

## 📋 ARCHIVOS CON DATOS MOCK ENCONTRADOS

### **Components Principales:**
1. `InventorySystem.tsx` - mockInventoryItems
2. `LoyaltyProgram.tsx` - mockUserLoyalty
3. `QRMenuSystem.tsx` - mockQRMenus
4. `TableManagementDialog.tsx` - mockProducts
5. `WaiterDashboard.tsx` - mockTables, mockOrders, mockProducts
6. `PaymentManagement.tsx` - Mock data for charts
7. `OwnerDashboard.tsx` - Mock data for owner stats
8. `MobileEmployeeDashboard.tsx` - Mock employee data
9. `EmployeeDashboard.tsx` - Mock employee dashboard
10. `AdminDashboard.tsx` - Mock admin stats

### **Mobile Components:**
11. `mobile/MobileAdminDashboard.tsx` - Mock data
12. `mobile/MobileOwnerDashboard.tsx` - Mock data with time ranges
13. `mobile/MobileCustomerDashboard.tsx` - Mock products/orders
14. `mobile/MobileWaiterDashboard.tsx` - Mock products

---

## 🔧 OPCIONES DE LIMPIEZA

### **OPCIÓN 1: Eliminación Automática (Agresiva)**

```bash
# Ejecutar script de limpieza
node remove-all-mocks.js
```

**Resultado:**
- ✅ Elimina TODOS los `const mock...`
- ✅ Elimina comentarios `// Mock data`
- ⚠️ Puede romper componentes temporalmente
- ⚠️ Requiere revisión manual después

---

### **OPCIÓN 2: Eliminación Manual (Recomendada)**

Para cada componente:

1. **Eliminar declaraciones mock:**
   ```typescript
   // ELIMINAR:
   const mockProducts = [...];
   const mockOrders = [...];
   ```

2. **Agregar fetch real:**
   ```typescript
   // AGREGAR:
   const [products, setProducts] = useState([]);
   
   useEffect(() => {
     fetch('/api/v1/products')
       .then(res => res.json())
       .then(data => setProducts(data.data || []));
   }, []);
   ```

3. **Manejar estados vacíos:**
   ```typescript
   {products.length === 0 ? (
     <p>No hay productos disponibles</p>
   ) : (
     products.map(product => ...)
   )}
   ```

---

## 📊 PLAN DE LIMPIEZA POR COMPONENTE

### **1. AdminDashboard.tsx**
```typescript
// ANTES:
const adminStats = [
  { title: 'Total Materias Primas', value: '45', ... }
];

// DESPUÉS:
const [adminStats, setAdminStats] = useState([]);

useEffect(() => {
  fetch('/api/v1/admin/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => setAdminStats(data.data.stats || []));
}, []);
```

### **2. EmployeeDashboard.tsx**
```typescript
// ELIMINAR:
const todayStats = { ordersServed: 23, ... };
const currentOrders = [...];
const schedule = [...];

// AGREGAR:
const [employeeData, setEmployeeData] = useState(null);

useEffect(() => {
  fetch(`/api/v1/employee/stats/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => setEmployeeData(data.data));
}, [userId]);
```

### **3. WaiterDashboard.tsx**
```typescript
// ELIMINAR:
const mockTables = [...];
const mockOrders = [...];
const mockProducts = [...];

// AGREGAR:
const [tables, setTables] = useState([]);
const [orders, setOrders] = useState([]);
const [products, setProducts] = useState([]);

useEffect(() => {
  Promise.all([
    fetch('/api/v1/tables').then(r => r.json()),
    fetch('/api/v1/orders').then(r => r.json()),
    fetch('/api/v1/products').then(r => r.json()),
  ]).then(([tablesData, ordersData, productsData]) => {
    setTables(tablesData.data || []);
    setOrders(ordersData.data || []);
    setProducts(productsData.data || []);
  });
}, []);
```

### **4. LoyaltyProgram.tsx**
```typescript
// ELIMINAR:
const mockUserLoyalty = { points: 1250, ... };

// AGREGAR:
const [userLoyalty, setUserLoyalty] = useState(null);

useEffect(() => {
  fetch(`/api/v1/loyalty/${userId}`)
    .then(res => res.json())
    .then(data => setUserLoyalty(data.data));
}, [userId]);
```

### **5. InventorySystem.tsx**
```typescript
// ELIMINAR:
const mockInventoryItems = [...];

// AGREGAR:
const [inventoryItems, setInventoryItems] = useState([]);

useEffect(() => {
  fetch('/api/v1/inventory')
    .then(res => res.json())
    .then(data => setInventoryItems(data.data || []));
}, []);
```

### **6. QRMenuSystem.tsx**
```typescript
// ELIMINAR:
const mockQRMenus = [...];

// AGREGAR:
const [qrMenus, setQRMenus] = useState([]);

useEffect(() => {
  fetch('/api/v1/qr-menus')
    .then(res => res.json())
    .then(data => setQRMenus(data.data || []));
}, []);
```

---

## ✅ CHECKLIST DE LIMPIEZA

### **Por cada componente:**
- [ ] Eliminar `const mock...`
- [ ] Agregar `useState` para datos reales
- [ ] Agregar `useEffect` con fetch
- [ ] Manejar loading state
- [ ] Manejar error state
- [ ] Manejar empty state
- [ ] Probar con backend real
- [ ] Probar sin datos

---

## 🚨 ENDPOINTS BACKEND REQUERIDOS

Para que los componentes funcionen sin mocks, necesitas estos endpoints:

```typescript
✅ GET /api/v1/admin/stats
✅ GET /api/v1/employee/stats/:userId
✅ GET /api/v1/products
✅ GET /api/v1/orders
⏳ GET /api/v1/tables
⏳ GET /api/v1/inventory
⏳ GET /api/v1/loyalty/:userId
⏳ GET /api/v1/qr-menus
⏳ GET /api/v1/payments/stats
```

**Leyenda:**
- ✅ Ya existe
- ⏳ Necesita crearse

---

## 📝 TEMPLATE GENÉRICO

Para cualquier componente con mocks:

```typescript
import { useState, useEffect } from 'react';

function Component() {
  // 1. Estado
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/endpoint', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        const result = await response.json();
        
        if (result.success) {
          setData(result.data || []);
        } else {
          setError(result.error?.message || 'Error');
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 3. Render
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (data.length === 0) return <div>No hay datos</div>;

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

---

## 🎯 RESULTADO ESPERADO

**Después de la limpieza:**

- ✅ Cero datos hardcodeados
- ✅ Todos los datos desde backend
- ✅ Manejo de loading/error/empty
- ✅ Código production-ready
- ⚠️ Pantallas vacías si no hay datos en BD

---

**¿Ejecuto la limpieza automática o prefieres hacerlo manualmente?**
