# PAMBAZO - Sistema de Gestión para Panadería

Sistema completo de gestión para panadería con PWA, optimizado para móvil y escritorio.

## 🚀 Despliegue Rápido en Coolify

### **Repositorio:**
```
https://github.com/SSALAZARCA/PAMBAZO.git
```

### **Configuración en Coolify:**

1. **Nuevo Proyecto → Git Repository**
   - Repository URL: `https://github.com/SSALAZARCA/PAMBAZO.git`
   - Branch: `main`
   - Build Type: `Docker Compose`

2. **Puertos:**
   - Frontend: `6001`
   - Backend: `6000`

3. **Dominios:**
   - Frontend: `tu-dominio.com`
   - Backend: `api.tu-dominio.com`

---

## 📦 Arquitectura

- **Frontend**: React + Vite + TypeScript (Puerto 6001)
- **Backend**: Node.js + Express + TypeScript (Puerto 6000)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7

---

## 🔧 Variables de Entorno Requeridas

Configura estas variables en Coolify:

```env
# Database
POSTGRES_DB=pambazo
POSTGRES_USER=pambazo
POSTGRES_PASSWORD=TU_PASSWORD_SEGURO

# JWT (Genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=TU_SECRET_AQUI
JWT_REFRESH_SECRET=TU_REFRESH_SECRET_AQUI

# URLs
FRONTEND_URL=https://tu-dominio.com
VITE_API_URL=https://api.tu-dominio.com
VITE_WS_URL=wss://api.tu-dominio.com

# Redis
REDIS_PASSWORD=TU_REDIS_PASSWORD

# Opcional: Push Notifications
VAPID_PUBLIC_KEY=tu_vapid_public_key
VAPID_PRIVATE_KEY=tu_vapid_private_key
```

---

## 🏗️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build
npm run server:build
```

---

## 🐳 Docker Local

```bash
# Copiar variables de entorno
cp .env.production.example .env

# Editar .env con tus valores
nano .env

# Levantar contenedores
docker-compose up --build

# Acceder:
# Frontend: http://localhost:6001
# Backend: http://localhost:6000
# API Docs: http://localhost:6000/api-docs
```

---

## 📚 Documentación

- **[DEPLOY_COOLIFY.md](./DEPLOY_COOLIFY.md)** - Guía completa de despliegue
- **[MEJORAS_IMPLEMENTADAS.md](./MEJORAS_IMPLEMENTADAS.md)** - Funcionalidades implementadas
- **[SISTEMA_CONFIGURACION_TIENDA.md](./SISTEMA_CONFIGURACION_TIENDA.md)** - Sistema de configuración

---

## ✨ Características

- ✅ PWA (Progressive Web App)
- ✅ Sistema de autenticación con JWT + Refresh Tokens
- ✅ WebSockets para tiempo real
- ✅ Push Notifications
- ✅ Programa de lealtad
- ✅ Sistema de reservas
- ✅ Sistema de propinas
- ✅ Gestión de inventario
- ✅ Reportes y analytics
- ✅ Multi-rol (Admin, Mesero, Cocina, Cliente)
- ✅ Responsive design
- ✅ Swagger API Documentation

---

## 🔐 Seguridad

- Rate limiting
- CORS configurado
- Refresh token rotation
- Passwords hasheadas con bcrypt
- JWT con expiración
- Health checks
- Logs estructurados

---

## 📊 API Documentation

Una vez desplegado, accede a:
```
https://api.tu-dominio.com/api-docs
```

---

## 🆘 Soporte

Para problemas o preguntas, revisa:
1. [DEPLOY_COOLIFY.md](./DEPLOY_COOLIFY.md) - Troubleshooting
2. Issues en GitHub
3. Logs de Coolify

---

## 📝 Licencia

MIT

---

**Desarrollado con ❤️ para PAMBAZO**