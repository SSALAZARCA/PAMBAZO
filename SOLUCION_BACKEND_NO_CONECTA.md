# 🔧 SOLUCIÓN RÁPIDA - Backend No Conecta

## ❌ Problema Detectado

El backend en el puerto 3001 no está corriendo, causando errores:
```
ERR_CONNECTION_REFUSED
Failed to fetch
```

## 🚀 SOLUCIONES

### Solución 1: Reiniciar Backend (RÁPIDO)

1. **Detener todos los procesos Node**:
```powershell
# En PowerShell
Get-Process node | Stop-Process -Force
```

2. **Iniciar solo el backend**:
```bash
npm run server:dev
```

3. **Verificar que esté corriendo**:
```bash
# Debería mostrar el puerto 3001
netstat -ano | findstr :3001
```

4. **Verificar en el navegador**:
```
http://localhost:3001/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

### Solución 2: Iniciar Backend y Frontend por Separado

**Terminal 1 - Backend**:
```bash
cd "d:\DESARROLLOS\PAMBASO 2.1"
npm run server:dev
```

Espera a ver:
```
🚀 Servidor iniciado en puerto 3001
📊 Entorno: development
🔗 API disponible en: http://localhost:3001/api
❤️  Health check: http://localhost:3001/api/health
```

**Terminal 2 - Frontend**:
```bash
cd "d:\DESARROLLOS\PAMBASO 2.1"
npm run client:dev
```

Espera a ver:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### Solución 3: Usar el Script Combinado

```bash
npm run dev
```

Este comando inicia backend y frontend simultáneamente.

---

## 🔍 VERIFICAR QUE FUNCIONA

### 1. Backend Health Check
```bash
curl http://localhost:3001/api/health
```

O abre en el navegador:
```
http://localhost:3001/api/health
```

### 2. Frontend
```
http://localhost:5173
```

### 3. Login de Prueba
```
URL: http://localhost:5173/login
Email: admin@pambazo.com
Password: pambazo123
```

---

## 🐛 SI AÚN NO FUNCIONA

### Verificar Puertos en Uso

```powershell
# Ver qué está usando el puerto 3001
netstat -ano | findstr :3001

# Ver qué está usando el puerto 5173
netstat -ano | findstr :5173
```

### Matar Procesos Específicos

Si encuentras un proceso bloqueando el puerto:
```powershell
# Reemplaza PID con el número del proceso
Stop-Process -Id PID -Force
```

### Verificar Variables de Entorno

Asegúrate de tener un archivo `.env` en la raíz:
```env
# Backend
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pambazo
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secret_key_aqui

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Reinstalar Dependencias

Si hay errores de módulos:
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

---

## 📝 ERRORES COMUNES

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Port 3001 already in use"
```powershell
# Encontrar el proceso
netstat -ano | findstr :3001

# Matar el proceso (reemplaza PID)
Stop-Process -Id PID -Force
```

### Error: "Database connection failed"
```bash
# Verificar que PostgreSQL esté corriendo
pg_ctl status

# Iniciar PostgreSQL si está detenido
pg_ctl start
```

### Error: TypeScript compilation failed
```bash
# Verificar errores de TypeScript
npm run type-check

# Si hay errores, corregirlos antes de iniciar
```

---

## ✅ CHECKLIST

- [ ] PostgreSQL corriendo
- [ ] Archivo `.env` configurado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Puerto 3001 libre
- [ ] Puerto 5173 libre
- [ ] Backend iniciado (`npm run server:dev`)
- [ ] Frontend iniciado (`npm run client:dev`)
- [ ] Health check funciona (`http://localhost:3001/api/health`)
- [ ] Login funciona con usuario de prueba

---

## 🎯 INICIO RÁPIDO (COPY-PASTE)

```powershell
# 1. Detener todo
Get-Process node | Stop-Process -Force

# 2. Ir al directorio
cd "d:\DESARROLLOS\PAMBASO 2.1"

# 3. Iniciar backend (Terminal 1)
npm run server:dev

# En otra terminal (Terminal 2)
# 4. Iniciar frontend
npm run client:dev

# 5. Abrir navegador
start http://localhost:5173/login
```

---

**Última actualización**: 2026-01-05 11:03
