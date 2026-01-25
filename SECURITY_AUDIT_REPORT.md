# Auditoría de Seguridad y Código - Pambazo Bakery Management System

## Resumen Ejecutivo
Se ha realizado un análisis profundo de la arquitectura, seguridad y calidad del código del backend (Node.js/TypeScript). El hallazgo más crítico es una inconsistencia arquitectónica severa donde coexisten dos capas de base de datos (SQLite y PostgreSQL) activamente, lo que provoca fragmentación de datos y posibles fallos lógicos graves (ej. usuarios creados en SQLite no visibles en reportes de PostgreSQL).

Además, se identificaron vulnerabilidades de seguridad que requieren atención inmediata, específicamente en el manejo de tokens de recuperación de contraseña y la duplicidad de lógica de autorización.

---

## 🚨 Hallazgos Críticos (Prioridad Alta)

### 1. Arquitectura "Split-Brain" de Base de Datos
El sistema intenta utilizar dos bases de datos diferentes simultáneamente para propósitos superpuestos.
- **SQLite** (`api/services/DatabaseService.ts`): Utilizado para Autenticación (`UserService`) y Productos (`ProductController`).
- **PostgreSQL** (`api/config/database.ts` y `api/services/dataAdapter.ts`): Utilizado para las rutas de gestión de Usuarios (`api/routes/users.ts`) y Órdenes (`api/services/dataAdapter.ts`).

**Impacto:**
- Un usuario registrado (`AuthController` -> SQLite) no aparecerá en el listado de usuarios del panel de administración (`users.ts` -> PostgreSQL).
- Inconsistencia de datos: Productos creados en un lado no existen en el otro.
- Imposibilidad de mantener integridad referencial (Foreign Keys) entre tablas que viven en motores distintos.

### 2. Exposición de Tokens de Seguridad
En `api/controllers/AuthController.ts`, el token de restablecimiento de contraseña se imprime en la consola (`console.log`).
**Impacto:** En un entorno de producción, los logs pueden ser accesibles por personal no autorizado o sistemas de monitoreo inseguros, permitiendo el secuestro de cuentas.

### 3. Middleware de Autenticación Duplicado e Inconsistente
Existen múltiples implementaciones de autenticación:
- `api/middleware/auth.ts`
- `api/middleware/authenticate.ts`
- `api/middleware/authMiddleware.ts`
**Impacto:** Riesgo de aplicar políticas de seguridad inconsistentes. Si se corrige un bug en uno, el otro sigue vulnerable.

---

## 🛡️ Hallazgos de Seguridad (Prioridad Media)

### 1. Dependencias Innecesarias/Confusas
El paquete `express-mongo-sanitize` está instalado y en uso, pero el proyecto utiliza bases de datos relacionales (SQL).
**Recomendación:** Eliminar y asegurar sanitización correcta para SQL (ya cubierta parcialmente por el uso de *parameterized queries*).

### 2. Validación de Entrada
Aunque se usa Joi en `orderValidators.ts`, no todas las rutas tienen validación robusta. Las rutas de productos y usuarios validan parcialmente o confían en el tipado simple.

### 3. Exposición de Errores
El middleware de manejo de errores (`errorHandler`) podría estar exponiendo stack traces completos en entornos productivos si `NODE_ENV` no está correctamente configurado.

---

## 💡 Sugerencias de Mejora de Código

### 1. Estandarización de Rutas
Existe una mezcla de `api/routes` (raíz) y `api/routes/v1`. Se recomienda mover todo a `v1` para mantener un versionado limpio.

### 2. Type Safety
Todavía hay uso frecuente de `any` (ej. `(req as any).user`).
**Solución:** Ya se ha creado `api/types/express.d.ts`, hay que asegurar que todos los archivos lo utilicen en lugar de casting manual.

### 3. Logs Estructurados
El uso de `console.log` disperso dificulta el monitoreo.
**Recomendación:** Centralizar todo el logging a través de `winston` (ya instalado) para tener niveles de log (INFO, WARN, ERROR) y formatos estructurados (JSON).

---

## 📋 Plan de Acción Recomendado

1.  **INMEDIATO:** Eliminar el log del token de password reset en `AuthController.ts`.
2.  **CRÍTICO:** Migrar toda la lógica de SQLite (`DatabaseService`, `UserService`) a PostgreSQL (`DataAdapter`).
    - *Users*: Migrar `UserService` para usar `pool` de pg.
    - *Products*: Migrar `ProductController` para usar `DataAdapter`.
    - *Limpieza*: Eliminar `sqlite3` y `sqlite` del `package.json`.
3.  **LIMPIEZA:** Unificar middlewares de autenticación en un solo archivo robusto (`authMiddleware.ts`).
4.  **OPTIMIZACIÓN:** Implementar caché o reducir llamadas a DB en `authMiddleware` (actualmente consulta DB en cada request).

¿Deseas que proceda con alguno de estos puntos críticos, por ejemplo, la migración de `UserService` a PostgreSQL o la corrección de seguridad del token?
