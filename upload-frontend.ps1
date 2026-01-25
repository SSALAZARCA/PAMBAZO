# Script para subir el frontend actualizado al servidor VPS

# Configuración del servidor
$serverIP = "31.97.128.11"
$serverUser = "root"
$localDistPath = "./dist/*"
$remotePath = "/var/www/pambazo/"

Write-Host "Subiendo archivos del frontend al servidor VPS..." -ForegroundColor Green

# Usar SCP para copiar los archivos
try {
    # Crear el directorio remoto si no existe
    ssh $serverUser@$serverIP "mkdir -p $remotePath"
    
    # Copiar archivos
    scp -r $localDistPath $serverUser@${serverIP}:$remotePath
    
    Write-Host "Frontend actualizado exitosamente en el servidor VPS" -ForegroundColor Green
    Write-Host "URL: http://$serverIP" -ForegroundColor Cyan
} catch {
    Write-Host "Error al subir archivos: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Proceso completado." -ForegroundColor Green