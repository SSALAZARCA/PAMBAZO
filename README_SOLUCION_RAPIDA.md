# 🚨 SOLUCIÓN INMEDIATA - Backend No Conecta

## ⚡ SOLUCIÓN EN 3 PASOS

### Paso 1: Ejecuta el Script Automático

**Opción A - PowerShell (RECOMENDADO)**:
```powershell
.\start-backend.ps1
```

**Opción B - Batch**:
```cmd
fix-backend.bat
```

### Paso 2: Verifica que Funcione

Abre en el navegador:
```
http://localhost:3001/api/health
```

Deberías ver:
```json
{"status":"ok","timestamp":"..."}
```

### Paso 3: Prueba el Login

```
URL: http://localhost:5173/login
Email: admin@pambazo.com
Password: pambazo123
```

---

## 🔧 SOLUCIÓN MANUAL (Si los scripts no funcionan)

### 1. Detener Todo
```powershell
Get-Process node | Stop-Process -Force
```

### 2. Abrir Nueva Terminal

Abre una nueva ventana de PowerShell o CMD

### 3. Ir al Directorio
```bash
cd "d:\DESARROLLOS\PAMBASO 2.1"
```

### 4. Iniciar Backend
```bash
npm run server:dev
```

### 5. Esperar a Ver
```
🚀 Servidor iniciado en puerto 3001
📊 Entorno: development
🔗 API disponible en: http://localhost:3001/api
❤️  Health check: http://localhost:3001/api/health
```

### 6. NO CERRAR ESA TERMINAL

Deja esa terminal abierta. El backend debe estar corriendo ahí.

---

## ❌ SI VES ERRORES

### Error: "Cannot find module"
```bash
npm install
```
Luego intenta de nuevo: `npm run server:dev`

### Error: "Port 3001 already in use"
```powershell
# Encontrar el proceso
netstat -ano | findstr :3001

# Copiar el PID (último número)
# Matar el proceso (reemplaza 1234 con el PID real)
Stop-Process -Id 1234 -Force
```

### Error: TypeScript compilation failed
```bash
# Ver los errores
npm run type-check

# Si hay muchos errores, puede ser un problema de configuración
# Intenta reinstalar:
rm -rf node_modules package-lock.json
npm install
```

### Error: Database connection
```bash
# Verifica que PostgreSQL esté corriendo
# En Windows, busca "Services" y verifica "PostgreSQL"
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] PostgreSQL corriendo
- [ ] Terminal abierta con `npm run server:dev`
- [ ] Ves "Servidor iniciado en puerto 3001"
- [ ] http://localhost:3001/api/health responde
- [ ] Frontend en http://localhost:5173 carga
- [ ] Login funciona con admin@pambazo.com

---

## 📝 ARCHIVOS CREADOS

1. **start-backend.ps1** - Script automático PowerShell
2. **fix-backend.bat** - Script automático Batch
3. **SOLUCION_BACKEND_NO_CONECTA.md** - Guía completa
4. **Este archivo** - Solución rápida

---

## 🎯 COMANDOS ÚTILES

```powershell
# Ver qué está usando el puerto 3001
netstat -ano | findstr :3001

# Ver todos los procesos Node
Get-Process node

# Matar todos los procesos Node
Get-Process node | Stop-Process -Force

# Verificar health check
curl http://localhost:3001/api/health

# O en el navegador
start http://localhost:3001/api/health
```

---

## 💡 TIPS

1. **Siempre deja la terminal del backend abierta**
2. **Si cierras la terminal, el backend se detiene**
3. **Puedes tener múltiples terminales**:
   - Terminal 1: Backend (`npm run server:dev`)
   - Terminal 2: Frontend (`npm run client:dev`)
4. **El frontend puede funcionar sin backend** (usa datos mock)
5. **Pero el login REQUIERE el backend**

---

## 🆘 ÚLTIMA OPCIÓN

Si nada funciona, ejecuta esto en orden:

```powershell
# 1. Limpiar todo
Get-Process node | Stop-Process -Force
rm -rf node_modules package-lock.json

# 2. Reinstalar
npm install

# 3. Verificar TypeScript
npm run type-check

# 4. Si no hay errores, iniciar
npm run server:dev
```

---

**Última actualización**: 2026-01-05 11:16

**¿Necesitas ayuda?** Revisa los logs en la terminal del backend para ver el error exacto.
