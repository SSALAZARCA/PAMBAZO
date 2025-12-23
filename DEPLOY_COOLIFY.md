# 🚀 GUÍA DE DESPLIEGUE EN COOLIFY CON DOCKER

## 📦 **Arquitectura de Contenedores**

El proyecto está dividido en **4 contenedores independientes**:

1. **Frontend** (Nginx) - Puerto 6001
2. **Backend** (Node.js API) - Puerto 6000
3. **Database** (PostgreSQL) - Puerto 5432
4. **Redis** (Cache) - Puerto 6379

---

## 🔧 **Configuración en Coolify**

### **Opción 1: Despliegue con Docker Compose (RECOMENDADO)**

1. **Conecta tu repositorio Git a Coolify**
   - Ve a Coolify → New Resource → Git Repository
   - Conecta tu repo de GitHub/GitLab

2. **Configura el proyecto**
   - Type: Docker Compose
   - Branch: main
   - Docker Compose File: `docker-compose.yml`

3. **Configura las variables de entorno**
   - Copia el contenido de `.env.production.example`
   - Pega en Coolify → Environment Variables
   - **IMPORTANTE**: Cambia todos los valores por defecto:
     - `POSTGRES_PASSWORD`
     - `JWT_SECRET`
     - `JWT_REFRESH_SECRET`
     - `REDIS_PASSWORD`
     - `FRONTEND_URL` (tu dominio)
     - `VITE_API_URL` (tu dominio de API)

4. **Configura los dominios**
   - Frontend: `yourdomain.com`
   - Backend: `api.yourdomain.com`

5. **Despliega**
   - Click en "Deploy"
   - Coolify construirá y desplegará los 4 contenedores

---

### **Opción 2: Despliegue de Contenedores Separados**

Si prefieres desplegar cada servicio por separado en Coolify:

#### **1. Base de Datos (PostgreSQL)**
```bash
# En Coolify → New Resource → Database → PostgreSQL
Name: pambazo-db
Version: 15
Database: pambazo
User: pambazo
Password: [genera una segura]
```

#### **2. Redis**
```bash
# En Coolify → New Resource → Database → Redis
Name: pambazo-redis
Version: 7
Password: [genera una segura]
```

#### **3. Backend**
```bash
# En Coolify → New Resource → Docker Image
Name: pambazo-backend
Dockerfile: Dockerfile.backend
Port: 6000
Domain: api.yourdomain.com

# Variables de entorno:
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://pambazo:PASSWORD@pambazo-db:5432/pambazo
JWT_SECRET=[tu secret]
JWT_REFRESH_SECRET=[tu secret]
REDIS_URL=redis://:PASSWORD@pambazo-redis:6379
FRONTEND_URL=https://yourdomain.com
```

#### **4. Frontend**
```bash
# En Coolify → New Resource → Docker Image
Name: pambazo-frontend
Dockerfile: Dockerfile.frontend
Port: 6001
Domain: yourdomain.com

# Variables de entorno:
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

---

## 🔐 **Generación de Secrets**

### **JWT Secrets**
```bash
# Ejecuta en tu terminal local:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **VAPID Keys (Push Notifications)**
```bash
npx web-push generate-vapid-keys
```

---

## 📝 **Configuración de Dominios**

### **En Coolify:**

1. **Frontend**: `yourdomain.com`
   - SSL: Habilitado (Let's Encrypt)
   - Redirect HTTP → HTTPS: Sí

2. **Backend**: `api.yourdomain.com`
   - SSL: Habilitado (Let's Encrypt)
   - Redirect HTTP → HTTPS: Sí

### **En tu DNS:**

```
A     yourdomain.com        → IP_DE_TU_VPS
A     api.yourdomain.com    → IP_DE_TU_VPS
```

---

## 🗄️ **Inicialización de Base de Datos**

### **Opción 1: Automática (con init.sql)**

Crea `api/database/init.sql` con todos tus schemas:

```sql
-- Ejecuta todos los schemas
\i tips-schema.sql
\i loyalty-schema.sql
\i reservations-schema.sql
\i settings-schema.sql
```

### **Opción 2: Manual**

Después del primer despliegue:

```bash
# Conéctate al contenedor de la BD
docker exec -it pambazo-db psql -U pambazo -d pambazo

# Ejecuta los schemas
\i /path/to/schema.sql
```

---

## 🔄 **Comandos Útiles**

### **Ver logs**
```bash
# En Coolify, ve a cada servicio → Logs

# O desde terminal:
docker logs pambazo-backend -f
docker logs pambazo-frontend -f
docker logs pambazo-db -f
```

### **Reiniciar servicios**
```bash
docker-compose restart backend
docker-compose restart frontend
```

### **Acceder a la base de datos**
```bash
docker exec -it pambazo-db psql -U pambazo -d pambazo
```

### **Backup de base de datos**
```bash
docker exec pambazo-db pg_dump -U pambazo pambazo > backup.sql
```

### **Restaurar backup**
```bash
docker exec -i pambazo-db psql -U pambazo pambazo < backup.sql
```

---

## 🧪 **Testing Local**

Antes de desplegar, prueba localmente:

```bash
# 1. Copia el archivo de entorno
cp .env.production.example .env

# 2. Edita .env con tus valores locales

# 3. Construye y levanta los contenedores
docker-compose up --build

# 4. Accede a:
# Frontend: http://localhost:6001
# Backend: http://localhost:6000
# API Docs: http://localhost:6000/api-docs
```

---

## 📊 **Monitoreo**

### **Health Checks**

Todos los servicios tienen health checks configurados:

- **Backend**: `GET /api/health`
- **Frontend**: `GET /`
- **Database**: `pg_isready`
- **Redis**: `redis-cli ping`

### **Logs**

Los logs se guardan en:
- Backend: `./logs/` (montado como volumen)
- Nginx: Logs de Coolify
- PostgreSQL: Logs de Coolify

---

## 🔒 **Seguridad**

### **Checklist de Seguridad:**

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Generar nuevos JWT secrets
- [ ] Configurar SSL/TLS (Let's Encrypt)
- [ ] Configurar firewall en el VPS
- [ ] Habilitar solo puertos necesarios (80, 443)
- [ ] Configurar backups automáticos de BD
- [ ] Habilitar logs de auditoría
- [ ] Configurar rate limiting en Nginx

---

## 🚨 **Troubleshooting**

### **Frontend no carga**
```bash
# Verifica que el contenedor esté corriendo
docker ps | grep pambazo-frontend

# Verifica logs
docker logs pambazo-frontend

# Verifica que VITE_API_URL esté correcto
docker exec pambazo-frontend env | grep VITE
```

### **Backend no responde**
```bash
# Verifica conexión a BD
docker exec pambazo-backend node -e "console.log(process.env.DATABASE_URL)"

# Verifica health check
curl http://api.yourdomain.com/api/health
```

### **Base de datos no conecta**
```bash
# Verifica que PostgreSQL esté corriendo
docker ps | grep pambazo-db

# Prueba conexión
docker exec pambazo-db pg_isready -U pambazo
```

---

## 📈 **Escalabilidad**

Para escalar horizontalmente:

```yaml
# En docker-compose.yml
backend:
  deploy:
    replicas: 3
  
frontend:
  deploy:
    replicas: 2
```

---

## ✅ **Checklist de Despliegue**

- [ ] Repositorio Git configurado
- [ ] Variables de entorno configuradas
- [ ] Dominios apuntando al VPS
- [ ] SSL configurado
- [ ] Base de datos inicializada
- [ ] Schemas ejecutados
- [ ] Health checks pasando
- [ ] Frontend accesible
- [ ] Backend API respondiendo
- [ ] WebSockets funcionando
- [ ] Push Notifications configuradas (opcional)
- [ ] Backups configurados

---

## 🎉 **¡Listo para Producción!**

Una vez completado el checklist, tu aplicación PAMBAZO estará corriendo en producción con:

- ✅ Alta disponibilidad
- ✅ Escalabilidad
- ✅ Seguridad
- ✅ Monitoreo
- ✅ Backups automáticos

**¡Buena suerte con tu despliegue! 🚀**
