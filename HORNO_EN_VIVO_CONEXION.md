# 🔥 CONEXIÓN: HORNO EN VIVO ↔ MÓDULO DE INVENTARIO BAKER

## 📋 **RESUMEN EJECUTIVO**

El widget "Horno en Vivo" en la landing page ahora está **conectado en tiempo real** con el módulo de producción del panadero, mostrando los lotes que están siendo horneados actualmente.

---

## 🔄 **FLUJO DE DATOS**

```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD PANADERO                       │
│                                                             │
│  1. Baker crea nuevo lote                                  │
│     └─> CreateBatchDialog                                  │
│         └─> POST /api/v1/production/batches                │
│             └─> db.json (productionBatches)                │
│                                                             │
│  2. Baker monitorea producción                             │
│     └─> ProductionMonitor                                  │
│         └─> GET /api/v1/production/batches                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (server.cjs)                     │
│                                                             │
│  Endpoint: GET /api/v1/production/batches                  │
│  └─> Retorna lotes activos (in_progress, pending)          │
│                                                             │
│  Base de datos: db.json                                    │
│  └─> productionBatches: [                                  │
│       {                                                     │
│         id: "1",                                            │
│         productName: "Croissants",                          │
│         quantity: 24,                                       │
│         status: "in_progress",                              │
│         startTime: "2026-01-06T20:00:00Z",                  │
│         temperature: 200                                    │
│       }                                                     │
│     ]                                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP GET (cada 30s)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE                             │
│                                                             │
│  LiveOvenWidget.tsx                                         │
│  └─> useEffect(() => {                                     │
│       fetchProductionBatches()  // Cada 30 segundos        │
│     }, [])                                                  │
│                                                             │
│  Muestra:                                                   │
│  ┌─────────────────────────────────────────┐               │
│  │ 🔥 Horno en Vivo          [🟢 Online]  │               │
│  │                                         │               │
│  │  [200°]  Croissants de Mantequilla     │               │
│  │          ⏱️ 12 min rest. 📦 24 uds     │               │
│  │          [Horneando]                    │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 **COMPONENTES INVOLUCRADOS**

### **1. Dashboard Panadero**

#### **A. CreateBatchDialog** (`src/components/CreateBatchDialog.tsx`)
```typescript
// Cuando el baker crea un lote:
const handleSubmit = async () => {
  // 1. Deduce materiales del inventario
  await api.production.deductMaterials(materials);
  
  // 2. Crea el lote de producción
  const newBatch = {
    productName: selectedProduct.name,
    quantity: quantity,
    status: 'in_progress',
    startTime: new Date().toISOString(),
    temperature: 200  // Según el producto
  };
  
  // 3. Guarda en backend
  await api.production.createBatch(newBatch);
};
```

#### **B. ProductionMonitor** (`src/components/ProductionMonitor.tsx`)
```typescript
// Monitorea lotes activos
useEffect(() => {
  const fetchBatches = async () => {
    const response = await api.production.getBatches();
    setBatches(response.data);
  };
  
  fetchBatches();
  const interval = setInterval(fetchBatches, 30000);
  return () => clearInterval(interval);
}, []);
```

---

### **2. Backend API** (`backend/server.cjs`)

#### **Endpoint: GET /api/v1/production/batches**
```javascript
app.get('/api/v1/production/batches', authenticateToken, (req, res) => {
  // Retorna todos los lotes de producción
  res.json({ 
    success: true, 
    data: productionBatches 
  });
});
```

#### **Base de Datos: db.json**
```json
{
  "productionBatches": [
    {
      "id": "1",
      "productName": "Croissants de Mantequilla",
      "quantity": 24,
      "status": "in_progress",
      "startTime": "2026-01-06T20:00:00.000Z",
      "estimatedCompletionTime": "2026-01-06T20:12:00.000Z",
      "temperature": 200,
      "materialsUsed": [
        { "materialId": "1", "quantity": 2.5 }
      ]
    }
  ]
}
```

---

### **3. Landing Page**

#### **LiveOvenWidget** (`src/components/LiveOvenWidget.tsx`)

**Características:**
- ✅ **Auto-refresh:** Cada 30 segundos
- ✅ **Datos reales:** Conectado a `/api/v1/production/batches`
- ✅ **Fallback:** Datos demo si backend no disponible
- ✅ **Rotación:** Cambia entre lotes cada 8 segundos
- ✅ **Responsive:** Versión desktop y móvil

**Código clave:**
```typescript
const fetchProductionBatches = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/v1/production/batches');
    
    if (response.ok) {
      const data = await response.json();
      const activeBatches = data.data.filter(batch => 
        batch.status === 'in_progress' || batch.status === 'pending'
      );
      
      if (activeBatches.length > 0) {
        setBatches(activeBatches);
        setIsOnline(true);  // Indicador verde
      } else {
        useDemoData();  // Datos de demostración
      }
    }
  } catch (error) {
    useDemoData();  // Fallback si backend no disponible
  }
};
```

---

## 📊 **DATOS MOSTRADOS**

El widget muestra la siguiente información de cada lote:

| Campo | Origen | Descripción |
|-------|--------|-------------|
| **Nombre del Producto** | `batch.productName` | "Croissants de Mantequilla" |
| **Temperatura** | `batch.temperature` o calculada | 200°C |
| **Tiempo Restante** | `batch.estimatedCompletionTime` o estimado | 12 min |
| **Cantidad** | `batch.quantity` | 24 unidades |
| **Estado** | `batch.status` | "Horneando", "Preparando", etc. |
| **Indicador Online** | Conexión API | Verde = datos reales, Amarillo = demo |

---

## 🔄 **SINCRONIZACIÓN EN TIEMPO REAL**

### **Flujo Completo:**

```
1. Baker abre CreateBatchDialog
   └─> Selecciona producto: "Croissants"
   └─> Cantidad: 24 unidades
   └─> Materiales: Harina (2.5kg), Mantequilla (1kg)

2. Baker confirma creación
   └─> POST /api/v1/production/batches/deduct-materials
       └─> Inventario actualizado: Harina 50kg → 47.5kg
   └─> POST /api/v1/production/batches
       └─> Nuevo lote creado en db.json

3. Backend guarda en db.json
   └─> productionBatches.push({
         id: "123",
         productName: "Croissants de Mantequilla",
         quantity: 24,
         status: "in_progress",
         startTime: "2026-01-06T20:00:00Z",
         temperature: 200
       })

4. LiveOvenWidget hace polling (cada 30s)
   └─> GET /api/v1/production/batches
   └─> Recibe lote nuevo
   └─> Actualiza UI automáticamente

5. Cliente en landing page ve:
   ┌─────────────────────────────────────┐
   │ 🔥 Horno en Vivo    [🟢 Online]    │
   │                                     │
   │  [200°]  Croissants de Mantequilla │
   │          ⏱️ 12 min  📦 24 uds      │
   │          [Horneando]                │
   └─────────────────────────────────────┘

6. Baker completa el lote
   └─> ProductionMonitor → "Completar"
   └─> POST /api/v1/production/batches/add-finished-product
       └─> Inventario actualizado: +24 Croissants
   └─> PATCH /api/v1/production/batches/:id
       └─> status: "completed"

7. LiveOvenWidget actualiza (30s después)
   └─> Lote completado ya no aparece
   └─> Muestra siguiente lote activo
```

---

## 🎨 **VISUALIZACIÓN EN LANDING PAGE**

### **Desktop:**
- Widget flotante a la derecha del hero
- Animación de flotación suave
- Posición absoluta: `-right-32`

### **Mobile:**
- Widget centrado debajo de los botones
- Ancho completo adaptativo
- Visible en todas las pantallas

---

## 🔧 **CONFIGURACIÓN**

### **Intervalos de Actualización:**
```typescript
// LiveOvenWidget.tsx
const REFRESH_INTERVAL = 30000;  // 30 segundos - Datos del backend
const ROTATE_INTERVAL = 8000;    // 8 segundos - Rotación entre lotes
```

### **Endpoint API:**
```typescript
const API_URL = 'http://localhost:3001/api/v1/production/batches';
```

### **Filtros de Lotes:**
```typescript
// Solo muestra lotes activos
const activeBatches = batches.filter(batch => 
  batch.status === 'in_progress' || batch.status === 'pending'
);
```

---

## 📱 **ACCESO**

### **Landing Page:**
- **URL:** `http://localhost:5173/`
- **Sección:** Hero (parte superior)
- **Widget:** Visible en desktop (derecha) y mobile (centro)

### **Dashboard Baker:**
- **URL:** `http://localhost:5173/baker/production`
- **Crear Lote:** Click en "Nuevo Lote"
- **Monitorear:** Vista de lotes activos

---

## ✅ **VERIFICACIÓN**

### **Prueba la Conexión:**

1. **Abre la Landing Page:**
   ```
   http://localhost:5173/
   ```

2. **Verifica el Widget:**
   - Debe mostrar "🟢 Online" si hay lotes activos
   - O "🟡 Demo" si no hay lotes

3. **Crea un Lote como Baker:**
   ```
   1. Login: baker@pambazo.com / pambazo123
   2. Ir a: /baker/production
   3. Click: "Nuevo Lote"
   4. Seleccionar producto y cantidad
   5. Confirmar
   ```

4. **Espera 30 segundos:**
   - El widget en la landing page se actualizará
   - Mostrará el nuevo lote con "🟢 Online"

5. **Completa el Lote:**
   - En ProductionMonitor → "Completar"
   - Confirmar cantidad final
   - El lote desaparecerá del widget (después de 30s)

---

## 🎯 **BENEFICIOS**

### **Para los Clientes:**
- ✅ **Transparencia:** Ven qué se está horneando en tiempo real
- ✅ **Frescura:** Saben cuándo saldrán productos frescos
- ✅ **Confianza:** Conexión directa con la producción

### **Para el Negocio:**
- ✅ **Marketing:** Widget atractivo y dinámico
- ✅ **Engagement:** Clientes ven actividad en vivo
- ✅ **Automatización:** Sin necesidad de actualizar manualmente

### **Para el Baker:**
- ✅ **Visibilidad:** Su trabajo se muestra públicamente
- ✅ **Integración:** Un solo sistema para todo
- ✅ **Eficiencia:** Datos sincronizados automáticamente

---

## 🚀 **PRÓXIMAS MEJORAS**

1. **WebSocket en tiempo real** (en lugar de polling cada 30s)
2. **Notificaciones push** cuando un producto está listo
3. **Galería de fotos** de productos recién horneados
4. **Contador de productos vendidos** en tiempo real
5. **Temperatura del horno** con gráfico en vivo

---

**¿Quieres ver el widget en acción?** Abre `http://localhost:5173/` y crea un lote desde el dashboard del baker! 🔥
