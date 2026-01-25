# ⏱️ TIEMPO ESTIMADO DE HORNEADO - MANUAL Y AUTOMÁTICO

## 📋 **NUEVA FUNCIONALIDAD**

El panadero ahora puede especificar manualmente el tiempo estimado de horneado cuando crea un nuevo lote, o dejar que el sistema lo calcule automáticamente según el tipo de producto.

---

## 🎯 **CASOS DE USO**

### **Caso 1: Sin Conexión al Horno**
Si el horno no tiene conexión o sensores automáticos, el panadero puede ingresar manualmente el tiempo estimado basándose en su experiencia.

### **Caso 2: Receta Personalizada**
Para recetas especiales o variaciones que requieren tiempos diferentes a los estándar.

### **Caso 3: Condiciones Especiales**
Cuando hay factores externos que afectan el tiempo (temperatura ambiente, humedad, etc.).

### **Caso 4: Modo Automático**
Para productos estándar, el sistema calcula automáticamente el tiempo basándose en el tipo de producto.

---

## 🔧 **CÓMO FUNCIONA**

### **En el CreateBatchDialog:**

```typescript
// Estado del formulario
const [formData, setFormData] = useState({
    productId: '',
    quantity: 20,
    notes: '',
    estimatedBakingTime: 0  // 0 = Automático
});

// Función de cálculo automático
const getDefaultBakingTime = (productName: string): number => {
    const name = productName.toLowerCase();
    if (name.includes('croissant')) return 12;
    if (name.includes('masa madre')) return 25;
    if (name.includes('baguette')) return 8;
    if (name.includes('rol') || name.includes('canela')) return 15;
    if (name.includes('pan')) return 20;
    if (name.includes('buñuelo')) return 5;
    if (name.includes('pastel')) return 18;
    return 15; // Default
};

// Al crear el lote
const estimatedMinutes = formData.estimatedBakingTime > 0 
    ? formData.estimatedBakingTime  // Usa el valor manual
    : getDefaultBakingTime(product.name);  // Calcula automáticamente
```

---

## 📊 **TIEMPOS POR DEFECTO**

| Producto | Tiempo (min) | Temperatura (°C) |
|----------|--------------|------------------|
| **Croissant** | 12 | 200 |
| **Masa Madre / Hogaza** | 25 | 230 |
| **Baguette** | 8 | 240 |
| **Rol de Canela** | 15 | 180 |
| **Pan (general)** | 20 | 200 |
| **Buñuelo** | 5 | 190 |
| **Pastel** | 18 | 200 |
| **Otros** | 15 | 200 |

---

## 🎨 **INTERFAZ DE USUARIO**

### **Campo en el Formulario:**

```
┌─────────────────────────────────────────────────────┐
│ Tiempo de Horneado (minutos)    (Automático)       │
├─────────────────────────────────────────────────────┤
│ [  0  ]  ← Input numérico                          │
├─────────────────────────────────────────────────────┤
│ 💡 Deja en 0 para calcular automáticamente según   │
│    el producto. Tiempo estimado: 12 min            │
└─────────────────────────────────────────────────────┘
```

### **Comportamiento:**

1. **Valor = 0:**
   - Muestra "(Automático)"
   - Calcula tiempo según el producto seleccionado
   - Muestra preview: "Tiempo estimado: X min"

2. **Valor > 0:**
   - Muestra "X min"
   - Usa el valor ingresado manualmente
   - No muestra preview automático

---

## 🔄 **FLUJO COMPLETO**

### **Opción 1: Modo Automático (Recomendado)**

```
1. Baker abre "Nuevo Lote"
   └─> Selecciona producto: "Croissant"
   └─> Cantidad: 24
   └─> Tiempo de horneado: 0 (Automático)
   └─> Sistema muestra: "Tiempo estimado: 12 min"

2. Baker confirma
   └─> Sistema calcula: 12 minutos
   └─> Hora de finalización: Ahora + 12 min
   └─> Temperatura: 200°C (automática)

3. Widget "Horno en Vivo" muestra:
   ┌─────────────────────────────────────┐
   │ 🔥 Horno en Vivo    [🟢 Online]    │
   │                                     │
   │  [200°]  Croissants                │
   │          ⏱️ 12 min  📦 24 uds      │
   │          [Horneando]                │
   └─────────────────────────────────────┘
```

### **Opción 2: Modo Manual**

```
1. Baker abre "Nuevo Lote"
   └─> Selecciona producto: "Pan Especial"
   └─> Cantidad: 10
   └─> Tiempo de horneado: 18 (Manual)
   └─> Sistema muestra: "18 min"

2. Baker confirma
   └─> Sistema usa: 18 minutos (valor manual)
   └─> Hora de finalización: Ahora + 18 min
   └─> Temperatura: 200°C (automática)

3. Widget "Horno en Vivo" muestra:
   ┌─────────────────────────────────────┐
   │ 🔥 Horno en Vivo    [🟢 Online]    │
   │                                     │
   │  [200°]  Pan Especial              │
   │          ⏱️ 18 min  📦 10 uds      │
   │          [Horneando]                │
   └─────────────────────────────────────┘
```

---

## 💾 **DATOS GUARDADOS**

### **En el Lote de Producción:**

```json
{
  "id": "123",
  "productName": "Croissants de Mantequilla",
  "quantity": 24,
  "status": "in_progress",
  "startTime": "2026-01-06T20:00:00Z",
  "estimatedEndTime": "2026-01-06T20:12:00Z",  // ← Calculado con el tiempo
  "estimatedBakingTime": 12,  // ← Tiempo usado (manual o automático)
  "temperature": 200,  // ← Temperatura automática
  "bakerId": "user-123",
  "bakerName": "Juan Panadero"
}
```

---

## 🌐 **INTEGRACIÓN CON LANDING PAGE**

El tiempo estimado se sincroniza automáticamente con el widget "Horno en Vivo":

```typescript
// En LiveOvenWidget.tsx
const getTimeRemaining = (batch: ProductionBatch) => {
    if (batch.estimatedCompletionTime) {
        const now = new Date();
        const completion = new Date(batch.estimatedCompletionTime);
        const diff = Math.max(0, Math.floor((completion.getTime() - now.getTime()) / 60000));
        return diff;  // Minutos restantes
    }
    return batch.estimatedBakingTime || 15;  // Fallback
};
```

---

## ✅ **VENTAJAS**

### **Para el Panadero:**
- ✅ **Flexibilidad:** Puede ajustar tiempos según necesidad
- ✅ **Autonomía:** No depende de sensores automáticos
- ✅ **Precisión:** Puede usar su experiencia para tiempos exactos
- ✅ **Simplicidad:** Modo automático para productos estándar

### **Para el Sistema:**
- ✅ **Inteligente:** Calcula tiempos automáticamente
- ✅ **Preciso:** Tiempos basados en tipo de producto
- ✅ **Flexible:** Acepta valores manuales
- ✅ **Sincronizado:** Se refleja en tiempo real en la landing page

### **Para los Clientes:**
- ✅ **Información Real:** Ven tiempos precisos en el widget
- ✅ **Transparencia:** Saben cuándo estará listo su pedido
- ✅ **Confianza:** Tiempos basados en experiencia real

---

## 🎯 **EJEMPLO PRÁCTICO**

### **Escenario: Horno Sin Conexión**

```
Situación:
- El horno no tiene sensores automáticos
- El panadero conoce que sus croissants tardan 15 min (no 12)
- Hay alta humedad hoy, necesita 2 minutos extra

Solución:
1. Baker crea lote de Croissants
2. Ingresa manualmente: 17 minutos
3. Sistema guarda: estimatedBakingTime = 17
4. Widget muestra: "⏱️ 17 min rest."
5. Clientes ven tiempo real y preciso
```

---

## 📱 **CÓMO USARLO**

### **Paso 1: Crear Lote**
```
1. Login: baker@pambazo.com / pambazo123
2. Ir a: /baker/production
3. Click: "Nuevo Lote"
```

### **Paso 2: Configurar Tiempo**
```
Opción A - Automático:
  - Dejar en 0
  - Sistema calcula según producto
  
Opción B - Manual:
  - Ingresar minutos deseados
  - Ej: 15, 20, 25, etc.
```

### **Paso 3: Confirmar**
```
- Click "Siguiente"
- Agregar materiales
- Click "Confirmar y Producir"
```

### **Paso 4: Verificar**
```
- Ir a: http://localhost:5173/
- Ver widget "Horno en Vivo"
- Tiempo mostrado = tiempo configurado
```

---

## 🔧 **CONFIGURACIÓN TÉCNICA**

### **Tiempos por Defecto (Modificables):**

```typescript
// En CreateBatchDialog.tsx línea ~125
const getDefaultBakingTime = (productName: string): number => {
    const name = productName.toLowerCase();
    if (name.includes('croissant')) return 12;  // ← Modificar aquí
    if (name.includes('masa madre')) return 25;
    // ... más productos
    return 15; // Default
};
```

### **Temperaturas por Defecto:**

```typescript
const getDefaultTemperature = (productName: string): number => {
    const name = productName.toLowerCase();
    if (name.includes('croissant')) return 200;  // ← Modificar aquí
    if (name.includes('baguette')) return 240;
    // ... más productos
    return 200; // Default
};
```

---

## 🚀 **PRÓXIMAS MEJORAS**

1. **Historial de Tiempos:** Guardar tiempos reales vs estimados
2. **Aprendizaje:** Ajustar tiempos automáticos basándose en historial
3. **Alertas:** Notificar cuando falten X minutos
4. **Gráficos:** Mostrar curva de temperatura en tiempo real
5. **Recetas:** Guardar tiempos personalizados por receta

---

**¿Necesitas ajustar los tiempos por defecto o agregar más productos?** 🎯
