# Script para desplegar la solución de persistencia de usuarios al VPS

$serverIP = "31.97.128.11"
$serverUser = "root"
$remotePath = "/var/www/pambazo"

Write-Host "=== Desplegando solución de persistencia de usuarios ===" -ForegroundColor Green

# 1. Subir archivo de rutas de usuarios
Write-Host "1. Subiendo api/routes/users.ts..." -ForegroundColor Yellow
scp "api/routes/users.ts" "${serverUser}@${serverIP}:${remotePath}/api/routes/"

# 2. Subir app.ts actualizado
Write-Host "2. Subiendo api/app.ts..." -ForegroundColor Yellow
scp "api/app.ts" "${serverUser}@${serverIP}:${remotePath}/api/"

# 3. Subir api.ts actualizado
Write-Host "3. Subiendo src/services/api.ts..." -ForegroundColor Yellow
scp "src/services/api.ts" "${serverUser}@${serverIP}:${remotePath}/src/services/"

# 4. Subir useStore.ts actualizado
Write-Host "4. Subiendo store/useStore.ts..." -ForegroundColor Yellow
scp "store/useStore.ts" "${serverUser}@${serverIP}:${remotePath}/store/"

# 5. Subir useAuth.ts actualizado
Write-Host "5. Subiendo hooks/useAuth.ts..." -ForegroundColor Yellow
scp "hooks/useAuth.ts" "${serverUser}@${serverIP}:${remotePath}/hooks/"

Write-Host "Archivos subidos. Ejecutando comandos en el servidor..." -ForegroundColor Yellow

# 6. Ejecutar comandos en el servidor
ssh "${serverUser}@${serverIP}" "cd ${remotePath} && echo 'Compilando backend...' && cd api && npm run build && echo 'Compilando frontend...' && cd .. && npm run build && echo 'Reiniciando servicios...' && pm2 restart all && echo 'Despliegue completado!'"

Write-Host "=== Despliegue completado ===" -ForegroundColor Green
Write-Host "Verifica la funcionalidad en: http://${serverIP}" -ForegroundColor Cyan