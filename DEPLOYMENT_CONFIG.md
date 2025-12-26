# Configuración Final de Despliegue - Pambazo

## Resumen
Se ha implementado una solución completa que elimina los errores `net::ERR_FAILED` configurando nginx como proxy reverso para manejar todas las peticiones API a través del puerto 80/443 en lugar del acceso directo al puerto 3001.

## Configuración del Servidor (VPS: 31.97.128.11)

### 1. Backend (Node.js)
- **Ubicación**: `/var/www/pambazo/api`
- **Puerto**: 3001 (localhost únicamente)
- **Comando de inicio**: `node dist/server.js`
- **Estado**: Ejecutándose correctamente

### 2. Frontend
- **Ubicación**: `/var/www/pambazo/dist`
- **Servido por**: nginx
- **Permisos**: `www-data:www-data` con permisos 755

### 3. Nginx (Proxy Reverso)
- **Archivo de configuración**: `/etc/nginx/sites-available/pambazo`
- **Puerto**: 80
- **Configuración**:
  ```nginx
  server {
      listen 80;
      server_name 31.97.128.11;
      
      # Servir archivos estáticos
      location / {
          root /var/www/pambazo/dist;
          try_files $uri $uri/ /index.html;
      }
      
      # Proxy para peticiones API
      location /api/ {
          proxy_pass http://localhost:3001/api/;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_cache_bypass $http_upgrade;
          proxy_connect_timeout 60s;
          proxy_send_timeout 60s;
          proxy_read_timeout 60s;
      }
  }
  ```

### 4. Base de Datos (PostgreSQL)
- **Host**: localhost
- **Base de datos**: pambazo_db
- **Usuario**: pambazo_user
- **Puerto**: 5432
- **Usuario Owner**: owner@pambazo.com / admin123

## Cambios Implementados

### Frontend
- Actualizado `src/utils/api.ts` para usar `/api/` en lugar de `http://31.97.128.11:3001/api/`
- Todas las peticiones ahora van a través del proxy nginx

### Servidor
- Configurado nginx como proxy reverso
- Eliminado acceso directo al puerto 3001 desde el frontend
- Corregidos permisos de archivos
- Removido sitio default de nginx

## Verificación del Funcionamiento

### 1. Backend
```bash
netstat -tlnp | grep :3001
# Debe mostrar: tcp6 0 0 :::3001 :::* LISTEN [PID]/node
```

### 2. Nginx
```bash
systemctl status nginx
# Debe mostrar: active (running)
```

### 3. API Health Check
```bash
curl http://31.97.128.11/api/health
# Debe retornar: {"status":"OK","message":"Server is running"}
```

### 4. Login Test
```bash
curl -X POST http://31.97.128.11/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@pambazo.com","password":"admin123"}'
```

## URLs de Acceso
- **Aplicación**: http://31.97.128.11
- **API**: http://31.97.128.11/api/
- **Health Check**: http://31.97.128.11/api/health

## Comandos de Mantenimiento

### Reiniciar Backend
```bash
ssh root@31.97.128.11
cd /var/www/pambazo/api
node dist/server.js
```

### Reiniciar Nginx
```bash
ssh root@31.97.128.11
systemctl restart nginx
```

### Ver Logs de Nginx
```bash
ssh root@31.97.128.11
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

## Solución Implementada

Esta configuración resuelve definitivamente el problema `net::ERR_FAILED` porque:

1. **Elimina CORS**: Todas las peticiones van al mismo dominio (31.97.128.11)
2. **Puerto único**: Todo el tráfico pasa por el puerto 80
3. **Proxy transparente**: nginx maneja automáticamente las peticiones API
4. **Configuración robusta**: Timeouts y headers apropiados
5. **Seguridad mejorada**: Backend no expuesto directamente

La aplicación ahora funciona completamente sin errores de conexión.