# 🚨 AUDITORÍA PROFUNDA DE FUNCIONALIDAD (Operatividad)

## 📋 Resumen Ejecutivo
Aunque la visualización de datos (lectura) ha sido conectada exitosamente en los dashboards principales, la aplicación **carece de capacidad operativa (escritura)**. Los usuarios pueden ver datos, pero NO pueden realizar las acciones fundamentales de su rol (crear productos, tomar pedidos, registrar producción).

---

## 🛑 FALTANTES CRÍTICOS (Bloqueantes)

### 1. 👑 ADMIN: Sin Control del Menú
*   **Gestión de Productos (INEXISTENTE)**: No existe la página para crear, editar o eliminar productos.
    *   *Consecuencia*: El menú está fijo con datos semilla o vacío.
*   **Gestión de Inventario (INEXISTENTE)**: No hay interfaz para registrar entradas de insumos.
*   **Crear Usuarios (VISUAL)**: El botón "Nuevo Usuario" en `UsersPage` no abre ningún formulario.

### 2. 💁 WAITER: Sin Capacidad de Venta
*   **Tomar Pedidos (MOCK)**: Los botones "Tomar Pedido" o "Nuevo Pedido" son puramente visuales.
    *   *Falta*: Un modal/pantalla selector de productos conectado al catálogo real.
    *   *Falta*: Lógica para enviar la orden (`POST /api/orders`) al backend.
*   **Cerrar Mesa (INEXISTENTE)**: No hay flujo para cobrar y liberar la mesa.

### 3. 🥖 BAKER: Pantalla Fantasma
*   **Producción (MOCK)**: `ProductionPage.tsx` usa datos falsos (`mockBatches`). No refleja las órdenes reales que entran a cocina.
*   **Flujo de Trabajo**: No puede cambiar el estado de una orden (ej. de "Pendiente" a "En Horno").

---

## 🛠️ PLAN DE IMPLEMENTACIÓN RECOMENDADO

Para remediar esto, debemos desarrollar las funcionalidades de escritura en el siguiente orden lógico:

### FASE 1: La Base (ADMIN)
1.  **Crear `ProductsPage.tsx`**: Permitir al admin llenar la base de datos de productos reales (Panes, Bebidas, etc.).
2.  **Activar Creación de Usuarios**: Habilitar el formulario para crear nuevos empleados.

### FASE 2: La Venta (WAITER)
3.  **Implementar `OrderCreationModal`**:
    *   Selector de productos (traído de la BD).
    *   Carrito temporal de la mesa.
    *   Botón "Enviar a Cocina" (conecta con API).

### FASE 3: La Producción (BAKER)
4.  **Conectar `ProductionPage`**:
    *   Listar órdenes con estado `pending` o `preparing`.
    *   Botones para avanzar estado (`Start Baking`, `Mark Ready`).

---

## 💡 CONCLUSIÓN
El sistema es un "visor de datos" actualmente. Necesitamos convertirlo en una "herramienta de trabajo" implementando los formularios y acciones de escritura descritos arriba.

**¿Autorizas comenzar por la FASE 1 (Gestión de Productos) para tener qué vender?**
