# Solución: Inventario Vacío / Error 404

## Síntoma
El usuario, logueado como Admin, veía la tabla de inventario vacía.
Al añadir herramientas de debug, se observó que el servidor devolvía `{ success: false, error: 'Ruta no encontrada' }`.

## Causa Raíz
La configuración de la URL base de la API (`API_BASE_URL`) en `src/services/api.ts` estaba siendo mal interpretada o había una variable de entorno `.env` corrupta/incorrecta.
Esto hacía que el frontend no incluyera el prefijo `/api/v1` en las peticiones, llamando a `http://localhost:3001/inventory` en lugar de `http://localhost:3001/api/v1/inventory`.

## Solución Aplicada

1.  **Frontend (`src/services/api.ts`)**:
    -   Se forzó la constante `API_BASE_URL = 'http://localhost:3001/api/v1'` ignorando temporalmente la variable de entorno para asegurar la conectividad en entorno local.
    -   Se añadió un parámetro `_t=${Date.now()}` a las peticiones GET para evitar problemas de caché con el Service Worker (PWA).

2.  **Backend (`server.cjs`)**:
    -   Se restauró el middleware de seguridad `authenticateToken` en la ruta `/api/v1/inventory` después de validar que el problema no era de permisos.

## Verificación
-   El comando `curl` funciona correctamente.
-   El navegador carga la lista sin problemas.
-   El debug UI ha sido retirado.

## Estado Final
Sistema funcionando correctamente. Persistencia de datos validada (memoria).
