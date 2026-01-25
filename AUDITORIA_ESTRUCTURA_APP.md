# Auditoría de Estructura y Rutas - PAMBAZO 2.1

## Estado Actual (Diagnóstico)

El proyecto presenta una arquitectura híbrida donde el Backend está bien contenido, pero el Frontend sufre de una dispersión severa de archivos en la raíz del proyecto.

### 1. Estructura de Directorios (Frontend)
Actualmente existe una **duplicidad confusa** entre la raíz y la carpeta `src/`:

*   **Raíz (`/`):** Contiene archivos fuente críticos que deberían estar en `src`:
    *   `App.tsx` (Componente principal)
    *   `main.tsx` (Punto de entrada)
    *   `components/` (Componentes legados/viejos)
    *   `store/` (Estado global)
    *   `hooks/`, `lib/`, `styles/`
*   **Carpeta `src/`:** Contiene la "nueva" estructura o archivos mezclados:
    *   `pages/` (LandingPage, BakerDashboard)
    *   `components/` (NotificationCenter, LiveOvenWidget)
    *   `globals.css`
    *   `services/`, `utils/`, `contexts/`

**Impacto:** Esto hace que el mantenimiento sea pesadilla. Importaciones como `../../components` vs `../components` son propensas a errores.

### 2. Análisis de Rutas (Frontend)
El sistema de navegación en `App.tsx` es **monolítico y frágil**:

*   **Ruta Única `/dashboard`:**
    *   Depende de un `switch(role)` gigante para renderizar componentes completamente diferentes (`AdminDashboard` vs `BakerDashboard`).
    *   **Problema:** No puedes compartir un link a una sección específica (ej: `pambazo.com/dashboard/orders`). Si recargas, vuelves al inicio del dashboard.
*   **Separación Mobile/Desktop:**
    *   Se hace a nivel de ruta (`MobileAdminDashboard` vs `AdminDashboard`).
    *   **Problema:** Duplicación de lógica de negocio. Lo ideal es componentes responsivos o layouts adaptativos, no páginas enteras separadas.

### 3. Backend (API)
El backend en `api/` está **bien estructurado**:
*   Sigue el estándar MVC (Controllers, Routes, Services).
*   API v1 claramente definida en `api/routes/v1/index.ts`.
*   Rutas RESTful (`/auth`, `/products`, `/orders`).

---

## Plan de Acción Recomendado

Para llevar la app al nivel "Premium" de la Landing Page, recomiendo ejecutar este plan en orden:

### Fase 1: La Gran Migración (Limpieza) 🧹
Mover todo el código fuente del frontend dentro de `src/` para tener una estructura estándar de Vite/React.
1.  Mover `App.tsx`, `main.tsx` a `src/`.
2.  Fusionar `components/` (raíz) con `src/components/`.
3.  Mover `store`, `hooks`, `lib` a `src/`.
4.  Actualizar todas las importaciones (automático con VS Code o script).

### Fase 2: Ruteo Inteligente 🧭
Refactorizar `App.tsx` para usar rutas anidadas y roles.
*   `/admin/*` -> Layout Admin + Subrutas (Usuarios, Reportes).
*   `/baker/*` -> Layout Panadero + Subrutas (Producción, Recetas).
*   `/kitchen/*` -> Layout Cocina.
Esto permite URLs amigables: `pambazo.com/baker/active-batches`.

### Fase 3: Unificación UI (Diseño Premium) 🎨
Aplicar el diseño de la Landing (Glassmorphism, Tailwind, Lucide Icons) a los Dashboards internos.
*   Crear un `Layout` base (Sidebar + Header) común.
*   Reemplazar componentes viejos por los de `src/components/ui` (shadcn/ui o similares si existen).

---

**¿Por dónde empezamos?**
Recomiendo fuertemente la **Fase 1 (Migración)** para trabajar sobre terreno limpio.
