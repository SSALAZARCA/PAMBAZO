# Script de despliegue automatizado para PAMBAZO 2.1
# VPS: 31.97.128.11
# Usuario: root
# Contraseña: Ssalazarca841209+

$VPS_HOST = "72.62.130.152"
$VPS_USER = "root"
$VPS_PASSWORD = "Ssalazarca841209+"
$VPS_PATH = "/var/www/pambazo"

Write-Host "=== DESPLIEGUE AUTOMATIZADO PAMBAZO 2.1 ===" -ForegroundColor Green

Write-Host "1. Subiendo frontend compilado..." -ForegroundColor Cyan
& scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r dist/* root@31.97.128.11:/var/www/pambazo/

Write-Host "2. Subiendo backend compilado..." -ForegroundColor Cyan  
& scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r api/dist/* root@31.97.128.11:/var/www/pambazo/api/

Write-Host "3. Subiendo archivos de configuración..." -ForegroundColor Cyan
& scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null package.json root@31.97.128.11:/var/www/pambazo/
& scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ecosystem.config.js root@31.97.128.11:/var/www/pambazo/
& scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null .env.production root@31.97.128.11:/var/www/pambazo/.env

Write-Host "4. Configurando servicios en VPS..." -ForegroundColor Cyan
$commands = @(
    "cd /var/www/pambazo && npm install --production",
    "pm2 delete all || true",
    "cd /var/www/pambazo && pm2 start ecosystem.config.js",
    "pm2 save",
    "systemctl restart nginx",
    "systemctl restart postgresql"
)

foreach ($cmd in $commands) {
    Write-Host "Ejecutando: $cmd" -ForegroundColor Yellow
    & ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@31.97.128.11 $cmd
}

Write-Host "5. Verificando estado..." -ForegroundColor Cyan
& ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@31.97.128.11 "pm2 status && systemctl is-active nginx postgresql"

Write-Host "=== DESPLIEGUE COMPLETADO ===" -ForegroundColor Green
Write-Host "Sitio disponible en: http://31.97.128.11" -ForegroundColor Yellow