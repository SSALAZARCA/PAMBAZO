# Arquitectura Unificada de Datos - PAMBAZO 2.1

## 🎯 Principio Fundamental: FUENTE ÚNICA DE VERDAD

**TODO viene de `backend/db.json`** - No hay listas separadas ni datos hardcodeados.

---

## 📊 Estructura de Datos Unificada

### 1. **Productos** (products)

#### Fuente Única
```javascript
// backend/server.cjs línea 433
let products = []; // Cargada SOLO desde db.json
```

#### Endpoints (Todos usan la misma lista)
```
GET    /api/v1/products           → Todos los roles
POST   /api/v1/products           → Admin/Owner (crear)
PUT    /api/v1/products/:id       → Admin/Owner (editar)
DELETE /api/v1/products/:id       → Admin/Owner (eliminar)
```

#### Quién ve qué
| Rol | Vista | Permisos | Endpoint |
|-----|-------|----------|----------|
| **Admin** | ProductsPage | Crear/Editar/Eliminar | `/api/v1/products` |
| **Owner** | ProductsPage | Crear/Editar/Eliminar | `/api/v1/products` |
| **Kitchen** | KitchenMenuView | Solo lectura | `/api/v1/products` |
| **Waiter** | (Menú en órdenes) | Solo lectura | `/api/v1/products` |
| **Customer** | (Catálogo) | Solo lectura | `/api/v1/products` |

✅ **TODOS VEN LOS MISMOS PRODUCTOS**

---

### 2. **Inventario** (inventory)

#### Fuente Única
```javascript
// backend/server.cjs línea 646
const inventory = []; // Cargada desde db.json
```

#### Endpoints
```
GET    /api/v1/inventory           → Admin/Baker/Owner
POST   /api/v1/inventory           → Admin/Owner
PATCH  /api/v1/inventory/:id       → Admin/Owner
PATCH  /api/v1/inventory/:id/stock → Admin/Baker/Owner
```

✅ **MISMO INVENTARIO PARA TODOS**

---

### 3. **Órdenes de Cocina** (kitchenOrders)

#### Fuente Única
```javascript
// backend/server.cjs línea 630
let kitchenOrders = []; // Cargada desde db.json
```

#### Endpoints
```
GET /api/kitchen/orders           → Kitchen
PUT /api/kitchen/orders/:id/start → Kitchen
PUT /api/kitchen/orders/:id/complete → Kitchen
```

#### Relación con Productos
```javascript
// Cada orden tiene items que referencian productos
{
  "id": "order-1",
  "items": [
    {
      "productId": 1,           // ← Referencia a products[0].id
      "productName": "Pan de Bono",
      "quantity": 3
    }
  ]
}
```

✅ **LAS ÓRDENES USAN LOS MISMOS PRODUCTOS DE db.json**

---

### 4. **Estadísticas de Cocina** (kitchenStats)

#### Fuente Única
```javascript
// backend/server.cjs línea 622
let kitchenStats = {}; // Cargada desde db.json
```

#### Endpoint
```
GET /api/kitchen/stats → Kitchen
```

✅ **ESTADÍSTICAS CENTRALIZADAS**

---

## 🔄 Flujo de Datos Completo

### Escenario 1: Admin crea un producto

```
1. Admin → ProductsPage → api.products.create()
2. POST /api/v1/products
3. Backend → products.push(newProduct)
4. Backend → saveData() → Guarda en db.json
5. Kitchen → Recarga menú → GET /api/v1/products
6. Kitchen → Ve el nuevo producto ✅
```

### Escenario 2: Owner edita disponibilidad

```
1. Owner → ProductsPage → api.products.update(id, {available: false})
2. PUT /api/v1/products/1
3. Backend → products[0].available = false
4. Backend → saveData() → Actualiza db.json
5. Kitchen → Recarga menú → GET /api/v1/products
6. Kitchen → Ve producto como "Agotado" ✅
```

### Escenario 3: Kitchen completa una orden

```
1. Kitchen → Click "Marcar Listo"
2. PUT /api/kitchen/orders/order-1/complete
3. Backend → kitchenOrders[0].status = 'ready'
4. Backend → saveData() → Actualiza db.json
5. (Futuro) → Descuenta inventario automáticamente
```

---

## 📁 Persistencia en db.json

### Función saveData()
```javascript
function saveData() {
    const data = {
        users,           // ← Usuarios
        products,        // ← PRODUCTOS (fuente única)
        tables,          // ← Mesas
        orders,          // ← Órdenes generales
        inventory,       // ← INVENTARIO (fuente única)
        expenses,        // ← Gastos
        reservations,    // ← Reservas
        shifts,          // ← Turnos
        payments,        // ← Pagos
        tips,            // ← Propinas
        notifications,   // ← Notificaciones
        favorites,       // ← Favoritos
        carts,           // ← Carritos
        loyaltyPoints,   // ← Puntos de lealtad
        pushSubscriptions, // ← Suscripciones push
        kitchenStats,    // ← ESTADÍSTICAS COCINA
        kitchenOrders    // ← ÓRDENES COCINA
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
```

### Función loadData()
```javascript
function loadData() {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    
    // Cargar arrays
    if (data.products) products.push(...data.products);
    if (data.inventory) inventory.push(...data.inventory);
    if (data.kitchenOrders) kitchenOrders.push(...data.kitchenOrders);
    
    // Cargar objetos
    if (data.kitchenStats) Object.assign(kitchenStats, data.kitchenStats);
    
    // ... otros datos
}
```

---

## 🚫 LO QUE NO DEBE EXISTIR

❌ **Arrays hardcodeados en el servidor**
```javascript
// MAL - NO HACER ESTO
const products = [
    { id: 1, name: 'Croissant' },
    { id: 2, name: 'Baguette' }
];
```

❌ **Listas separadas por rol**
```javascript
// MAL - NO HACER ESTO
const adminProducts = [...];
const kitchenProducts = [...];
```

❌ **Datos que no se guardan en db.json**
```javascript
// MAL - NO HACER ESTO
const tempProducts = []; // Se pierde al reiniciar
```

---

## ✅ LO QUE SÍ DEBE EXISTIR

✅ **Una sola variable por entidad**
```javascript
let products = [];        // Cargada desde db.json
let inventory = [];       // Cargada desde db.json
let kitchenOrders = [];   // Cargada desde db.json
```

✅ **Todos usan los mismos endpoints**
```javascript
// BIEN - TODOS USAN ESTO
api.products.getAll()     // Admin, Owner, Kitchen, etc.
```

✅ **Persistencia automática**
```javascript
// BIEN - CADA CAMBIO SE GUARDA
products.push(newProduct);
saveData(); // ← Guarda en db.json
```

---

## 🔍 Verificación de Integridad

### Checklist de Validación

- [x] ¿Hay solo UNA variable `products` en el servidor?
- [x] ¿Todos los roles usan `/api/v1/products`?
- [x] ¿Los cambios se guardan en `db.json`?
- [x] ¿Los datos se cargan desde `db.json` al iniciar?
- [x] ¿No hay arrays hardcodeados?
- [x] ¿Kitchen ve los mismos productos que Admin?
- [x] ¿Las órdenes referencian productos existentes?

---

## 📝 Resumen Ejecutivo

### Antes (❌ Incorrecto)
- Productos hardcodeados en servidor (6 productos)
- Productos en db.json (3 productos diferentes)
- Kitchen veía productos distintos a Admin
- Cambios no se sincronizaban

### Ahora (✅ Correcto)
- **UNA SOLA fuente**: `db.json`
- **UNA SOLA variable**: `products = []`
- **TODOS ven lo mismo**: Admin, Owner, Kitchen, Waiter
- **TODO se guarda**: Cambios persisten en `db.json`
- **TODO se carga**: Datos se restauran al reiniciar

---

## 🎯 Conclusión

**ARQUITECTURA UNIFICADA IMPLEMENTADA**

No hay listas separadas. No hay datos hardcodeados. Todo viene de `db.json`.

✅ Admin crea → Todos ven
✅ Owner edita → Todos ven
✅ Kitchen consulta → Ve lo mismo que Admin
✅ Sistema reinicia → Datos persisten

**FUENTE ÚNICA DE VERDAD: `backend/db.json`**
