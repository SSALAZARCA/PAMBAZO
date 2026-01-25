# Script para instalar PostgreSQL en Windows
# Ejecutar como Administrador

Write-Host "🔧 Instalando PostgreSQL..." -ForegroundColor Green

# Verificar si se ejecuta como administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host "💡 Haz clic derecho en PowerShell y selecciona 'Ejecutar como administrador'" -ForegroundColor Yellow
    pause
    exit 1
}

# Verificar si Chocolatey está instalado
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Instalando Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    refreshenv
}

# Instalar PostgreSQL
Write-Host "🐘 Instalando PostgreSQL 15..." -ForegroundColor Yellow
try {
    choco install postgresql15 --params '/Password:postgres' --yes
    Write-Host "✅ PostgreSQL instalado correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al instalar PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Esperar a que el servicio se inicie
Write-Host "⏳ Esperando a que PostgreSQL se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar que el servicio esté ejecutándose
$service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq "Running") {
    Write-Host "✅ Servicio PostgreSQL está ejecutándose" -ForegroundColor Green
} else {
    Write-Host "⚠️ Intentando iniciar el servicio PostgreSQL..." -ForegroundColor Yellow
    Start-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 5
}

# Crear la base de datos
Write-Host "🗄️ Creando base de datos 'pambaso_db'..." -ForegroundColor Yellow
try {
    # Agregar PostgreSQL al PATH si no está
    $pgPath = "C:\Program Files\PostgreSQL\15\bin"
    if (Test-Path $pgPath) {
        $env:PATH += ";$pgPath"
    }
    
    # Crear la base de datos
    & psql -U postgres -c "CREATE DATABASE pambaso_db;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de datos 'pambaso_db' creada" -ForegroundColor Green
    } else {
        Write-Host "⚠️ La base de datos 'pambaso_db' ya existe o hubo un error" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ No se pudo crear la base de datos automáticamente" -ForegroundColor Yellow
    Write-Host "💡 Puedes crearla manualmente con: psql -U postgres -c 'CREATE DATABASE pambaso_db;'" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Instalación completada!" -ForegroundColor Green
Write-Host "📋 Información de conexión:" -ForegroundColor Cyan
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Puerto: 5432" -ForegroundColor White
Write-Host "   Usuario: postgres" -ForegroundColor White
Write-Host "   Contraseña: postgres" -ForegroundColor White
Write-Host "   Base de datos: pambaso_db" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Ejecutar las migraciones: npm run migrate" -ForegroundColor White
Write-Host "   2. Iniciar el servidor: npm run server:start" -ForegroundColor White
Write-Host ""
pause