# Script de despliegue con contraseña automatizada
$password = "Ssalazarca841209+"
$host = "31.97.128.11"
$user = "root"

Write-Host "=== DESPLIEGUE AUTOMATIZADO PAMBAZO 2.1 ===" -ForegroundColor Green

# Función para ejecutar comandos con expect
function Execute-WithPassword {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "Ejecutando: $Description" -ForegroundColor Yellow
    
    # Crear script expect temporal
    $expectScript = @"
#!/usr/bin/expect -f
set timeout 30
spawn $Command
expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "Password:" {
        send "$password\r"
        exp_continue
    }
    "(yes/no)?" {
        send "yes\r"
        exp_continue
    }
    eof
}
"@
    
    $tempScript = [System.IO.Path]::GetTempFileName() + ".exp"
    $expectScript | Out-File -FilePath $tempScript -Encoding ASCII
    
    try {
        if (Get-Command wsl -ErrorAction SilentlyContinue) {
            # Usar WSL si está disponible
            $result = wsl expect $tempScript
        } else {
            # Usar PowerShell con entrada automática
            $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($user, $securePassword)
            
            # Ejecutar comando directamente
            Invoke-Expression $Command
        }
        Write-Host "✓ $Description completado" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Error: $Description" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
    finally {
        Remove-Item -Path $tempScript -Force -ErrorAction SilentlyContinue
    }
}

# 1. Subir frontend
Write-Host "`n1. Subiendo frontend..." -ForegroundColor Cyan
Execute-WithPassword "scp -r dist/* $user@${host}:/var/www/pambazo/" "Frontend"

# 2. Subir backend
Write-Host "`n2. Subiendo backend..." -ForegroundColor Cyan
Execute-WithPassword "scp -r api/dist/* $user@${host}:/var/www/pambazo/api/" "Backend"

# 3. Subir configuración
Write-Host "`n3. Subiendo configuración..." -ForegroundColor Cyan
Execute-WithPassword "scp package.json $user@${host}:/var/www/pambazo/" "package.json"
Execute-WithPassword "scp ecosystem.config.js $user@${host}:/var/www/pambazo/" "ecosystem.config.js"

# 4. Configurar servicios
Write-Host "`n4. Configurando servicios..." -ForegroundColor Cyan
$commands = @(
    "cd /var/www/pambazo && npm install --production",
    "pm2 delete all || true",
    "cd /var/www/pambazo && pm2 start ecosystem.config.js",
    "systemctl restart nginx"
)

foreach ($cmd in $commands) {
    Execute-WithPassword "ssh $user@$host '$cmd'" "Comando: $cmd"
}

Write-Host "`n=== DESPLIEGUE COMPLETADO ===" -ForegroundColor Green
Write-Host "Verificando sitio en http://$host" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://$host" -Method Head -TimeoutSec 10
    Write-Host "✓ Sitio funcionando (Status: $($response.StatusCode))" -ForegroundColor Green
}
catch {
    Write-Host "⚠ Verificar manualmente: $($_.Exception.Message)" -ForegroundColor Yellow
}