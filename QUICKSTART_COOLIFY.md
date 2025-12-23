# 🚀 GUÍA RÁPIDA DE DESPLIEGUE EN COOLIFY

## 📋 Pre-requisitos

- [ ] Cuenta en Coolify
- [ ] VPS configurado con Coolify
- [ ] Dominio apuntando al VPS
- [ ] Acceso SSH al VPS (opcional)

---

## ⚡ Despliegue en 5 Pasos

### **1. Conectar Repositorio**

En Coolify:
1. Click en **"New Resource"**
2. Selecciona **"Git Repository"**
3. Pega la URL: `https://github.com/SSALAZARCA/PAMBAZO.git`
4. Branch: `main`
5. Build Type: **"Docker Compose"**

---

### **2. Configurar Dominios**

En la sección **"Domains"**:

```
Frontend: tu-dominio.com
Backend: api.tu-dominio.com
```

**En tu proveedor DNS:**
```
A    tu-dominio.com        → IP_DE_TU_VPS
A    api.tu-dominio.com    → IP_DE_TU_VPS
```

---

### **3. Configurar Variables de Entorno**

Click en **"Environment Variables"** y agrega:

#### **Obligatorias:**

```env
# Database
POSTGRES_DB=pambazo
POSTGRES_USER=pambazo
POSTGRES_PASSWORD=genera_password_seguro_aqui

# JWT Secrets (genera con el comando de abajo)
JWT_SECRET=pega_secret_generado_aqui
JWT_REFRESH_SECRET=pega_otro_secret_aqui

# URLs (reemplaza con tu dominio)
FRONTEND_URL=https://tu-dominio.com
VITE_API_URL=https://api.tu-dominio.com
VITE_WS_URL=wss://api.tu-dominio.com

# Redis
REDIS_PASSWORD=genera_password_redis_aqui

# Ports
BACKEND_PORT=6000
FRONTEND_PORT=6001
```

#### **Generar Secrets:**

```bash
# En tu terminal local, ejecuta:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copia el resultado y úsalo para JWT_SECRET

# Ejecuta de nuevo para JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### **Opcionales (Push Notifications):**

```bash
# Genera VAPID keys:
npx web-push generate-vapid-keys

# Agrega a las variables:
VAPID_PUBLIC_KEY=tu_public_key
VAPID_PRIVATE_KEY=tu_private_key
```

---

### **4. Configurar SSL**

En Coolify:
1. Ve a **"SSL/TLS"**
2. Habilita **"Let's Encrypt"**
3. Marca ambos dominios:
   - ✅ `tu-dominio.com`
   - ✅ `api.tu-dominio.com`
4. Click en **"Generate Certificate"**

---

### **5. Desplegar**

1. Click en **"Deploy"**
2. Espera a que se construyan los contenedores (5-10 min)
3. Monitorea los logs en tiempo real

---

## ✅ Verificación Post-Despliegue

### **1. Verificar Backend**

```bash
# Health check
curl https://api.tu-dominio.com/api/health

# Debería responder:
# {"success":true,"data":{"status":"OK","version":"v1"}}
```

### **2. Verificar Frontend**

Abre en el navegador:
```
https://tu-dominio.com
```

Deberías ver la Landing Page de PAMBAZO.

### **3. Verificar API Docs**

```
https://api.tu-dominio.com/api-docs
```

Deberías ver Swagger UI.

### **4. Verificar Base de Datos**

En Coolify, ve a **"Logs"** → **"database"**

Deberías ver:
```
database system is ready to accept connections
```

---

## 🔧 Configuración Inicial de BD

### **Opción 1: Desde Coolify Terminal**

1. En Coolify, ve a **"Terminal"**
2. Selecciona el contenedor **"pambazo-db"**
3. Ejecuta:

```bash
psql -U pambazo -d pambazo

# Dentro de psql, ejecuta los schemas:
\i /docker-entrypoint-initdb.d/init.sql
```

### **Opción 2: Desde tu máquina local**

```bash
# Conéctate al VPS
ssh user@tu-vps-ip

# Accede al contenedor
docker exec -it pambazo-db psql -U pambazo -d pambazo

# Ejecuta los schemas
\i /path/to/schema.sql
```

---

## 📊 Monitoreo

### **Ver Logs en Tiempo Real**

En Coolify:
1. Ve a tu proyecto
2. Click en **"Logs"**
3. Selecciona el servicio:
   - `backend` - Logs de la API
   - `frontend` - Logs de Nginx
   - `database` - Logs de PostgreSQL
   - `redis` - Logs de Redis

### **Health Checks**

Coolify monitorea automáticamente:
- ✅ Backend: `GET /api/health` cada 30s
- ✅ Frontend: `GET /` cada 30s
- ✅ Database: `pg_isready` cada 10s
- ✅ Redis: `redis-cli ping` cada 10s

---

## 🔄 Actualizar la Aplicación

### **Desde Coolify (Automático):**

1. Haz push a GitHub:
   ```bash
   git add .
   git commit -m "Update"
   git push origin main
   ```

2. En Coolify:
   - Si tienes **Auto Deploy** habilitado, se desplegará automáticamente
   - Si no, click en **"Redeploy"**

### **Manualmente:**

En Coolify, click en **"Redeploy"** → **"Force Rebuild"**

---

## 🐛 Troubleshooting

### **Error: "Failed to connect to database"**

```bash
# Verifica que PostgreSQL esté corriendo
docker ps | grep pambazo-db

# Verifica las credenciales en las variables de entorno
# En Coolify → Environment Variables
```

### **Error: "Frontend shows 502 Bad Gateway"**

```bash
# Verifica que el backend esté corriendo
curl https://api.tu-dominio.com/api/health

# Verifica los logs del backend
# En Coolify → Logs → backend
```

### **Error: "SSL Certificate not working"**

```bash
# Verifica que el dominio apunte al VPS
nslookup tu-dominio.com

# Regenera el certificado en Coolify
# SSL/TLS → Regenerate Certificate
```

### **Error: "WebSocket connection failed"**

Verifica que `VITE_WS_URL` use `wss://` (no `ws://`):
```env
VITE_WS_URL=wss://api.tu-dominio.com
```

---

## 📈 Optimizaciones

### **Habilitar Redis Cache**

Ya está configurado por defecto. Verifica en:
```
https://api.tu-dominio.com/api/health
```

### **Configurar Backups Automáticos**

En Coolify:
1. Ve a **"Backups"**
2. Habilita **"Automatic Backups"**
3. Configura frecuencia: **Diario**
4. Retención: **7 días**

### **Escalar Horizontalmente**

Edita `docker-compose.yml`:
```yaml
backend:
  deploy:
    replicas: 3  # 3 instancias del backend
```

---

## ✅ Checklist Final

- [ ] Dominios configurados y apuntando al VPS
- [ ] SSL habilitado y funcionando
- [ ] Variables de entorno configuradas
- [ ] Backend respondiendo en `/api/health`
- [ ] Frontend accesible
- [ ] Swagger UI funcionando
- [ ] Base de datos inicializada
- [ ] Backups configurados
- [ ] Logs monitoreándose

---

## 🎉 ¡Listo!

Tu aplicación PAMBAZO está ahora en producción:

- 🌐 Frontend: https://tu-dominio.com
- 🔧 Backend: https://api.tu-dominio.com
- 📚 API Docs: https://api.tu-dominio.com/api-docs

**¡Felicitaciones! 🚀**
