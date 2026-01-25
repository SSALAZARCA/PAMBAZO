# Auditoría Completa del Backend - Dashboard Panadero
# Fecha: 2026-01-06

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "AUDITORÍA BACKEND - DASHBOARD PANADERO" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001/api/v1"
$authUrl = "http://localhost:3001/api"
$results = @()

# Función para hacer requests
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Description,
        [string]$Token = $null,
        [object]$Body = $null
    )
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri             = $Url
            Method          = $Method
            Headers         = $headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        $status = "✅ OK ($($response.StatusCode))"
        $color = "Green"
    }
    catch {
        $status = "❌ FAIL ($($_.Exception.Response.StatusCode.value__))"
        $color = "Red"
    }
    
    Write-Host "$Description" -NoNewline
    Write-Host " ... " -NoNewline
    Write-Host $status -ForegroundColor $color
    
    return @{
        Endpoint    = $Url
        Description = $Description
        Status      = $status
    }
}

# 1. HEALTH CHECK
Write-Host "`n[1] HEALTH CHECK" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Url "http://localhost:3001/api/health" -Description "Health Check"

# 2. AUTENTICACIÓN
Write-Host "`n[2] AUTENTICACIÓN" -ForegroundColor Yellow
try {
    $loginBody = @{
        email    = "baker@pambazo.com"
        password = "pambazo123"
    }
    
    $loginResponse = Invoke-WebRequest -Uri "$authUrl/v1/auth/login" -Method POST -Body ($loginBody | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.data.tokens.accessToken
    
    Write-Host "Login Baker" -NoNewline
    Write-Host " ... " -NoNewline
    Write-Host "✅ OK (Token obtenido)" -ForegroundColor Green
    
    $results += @{
        Endpoint    = "$authUrl/v1/auth/login"
        Description = "Login Baker"
        Status      = "✅ OK"
    }
}
catch {
    Write-Host "Login Baker" -NoNewline
    Write-Host " ... " -NoNewline
    Write-Host "❌ FAIL" -ForegroundColor Red
    $token = $null
}

if (-not $token) {
    Write-Host "`n⚠️  No se pudo obtener token. Abortando auditoría." -ForegroundColor Red
    exit 1
}

# 3. INVENTARIO
Write-Host "`n[3] INVENTARIO" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Url "$baseUrl/inventory" -Description "Obtener Inventario" -Token $token

# 4. PRODUCCIÓN - LOTES
Write-Host "`n[4] PRODUCCIÓN - LOTES" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Url "$baseUrl/production/batches" -Description "Obtener Lotes de Producción" -Token $token

# 5. PRODUCCIÓN - DEDUCCIÓN DE MATERIALES
Write-Host "`n[5] PRODUCCIÓN - DEDUCCIÓN MATERIALES" -ForegroundColor Yellow
$deductBody = @{
    materials = @(
        @{ materialId = "1"; quantity = 0.5 }
    )
}
$results += Test-Endpoint -Method "POST" -Url "$baseUrl/production/batches/deduct-materials" -Description "Deducir Materiales" -Token $token -Body $deductBody

# 6. PRODUCCIÓN - AGREGAR PRODUCTO TERMINADO
Write-Host "`n[6] PRODUCCIÓN - PRODUCTO TERMINADO" -ForegroundColor Yellow
$finishedBody = @{
    productName = "Pan de Prueba"
    quantity    = 10
}
$results += Test-Endpoint -Method "POST" -Url "$baseUrl/production/batches/add-finished-product" -Description "Agregar Producto Terminado" -Token $token -Body $finishedBody

# 7. ÓRDENES
Write-Host "`n[7] ÓRDENES" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Url "$baseUrl/orders" -Description "Obtener Órdenes" -Token $token

# 8. USUARIOS
Write-Host "`n[8] USUARIOS" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Url "$baseUrl/users" -Description "Obtener Usuarios" -Token $token

# 9. MÉTRICAS
Write-Host "`n[9] MÉTRICAS" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Url "$baseUrl/metrics/dashboard" -Description "Métricas Dashboard" -Token $token

# 10. VERIFICAR BASE DE DATOS (db.json)
Write-Host "`n[10] BASE DE DATOS (db.json)" -ForegroundColor Yellow
$dbPath = ".\backend\db.json"
if (Test-Path $dbPath) {
    try {
        $dbContent = Get-Content $dbPath -Raw | ConvertFrom-Json
        
        Write-Host "Archivo db.json existe" -NoNewline
        Write-Host " ... " -NoNewline
        Write-Host "✅ OK" -ForegroundColor Green
        
        # Verificar estructuras
        $structures = @("users", "products", "inventory", "orders", "tables")
        foreach ($struct in $structures) {
            if ($dbContent.$struct) {
                $count = if ($dbContent.$struct -is [Array]) { $dbContent.$struct.Count } else { 1 }
                Write-Host "  - $struct" -NoNewline
                Write-Host " ... " -NoNewline
                Write-Host "✅ $count items" -ForegroundColor Green
            }
            else {
                Write-Host "  - $struct" -NoNewline
                Write-Host " ... " -NoNewline
                Write-Host "⚠️  No encontrado" -ForegroundColor Yellow
            }
        }
    }
    catch {
        Write-Host "Error leyendo db.json" -NoNewline
        Write-Host " ... " -NoNewline
        Write-Host "❌ FAIL" -ForegroundColor Red
    }
}
else {
    Write-Host "Archivo db.json NO existe" -NoNewline
    Write-Host " ... " -NoNewline
    Write-Host "❌ FAIL" -ForegroundColor Red
}

# RESUMEN
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESUMEN DE AUDITORÍA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$totalTests = $results.Count
$passedTests = ($results | Where-Object { $_.Status -like "*OK*" }).Count
$failedTests = $totalTests - $passedTests

Write-Host "Total de pruebas: $totalTests" -ForegroundColor White
Write-Host "Exitosas: $passedTests" -ForegroundColor Green
Write-Host "Fallidas: $failedTests" -ForegroundColor Red

$percentage = [math]::Round(($passedTests / $totalTests) * 100, 2)
Write-Host "`nPorcentaje de éxito: $percentage%" -ForegroundColor $(if ($percentage -ge 80) { "Green" } elseif ($percentage -ge 50) { "Yellow" } else { "Red" })

Write-Host "`n========================================`n" -ForegroundColor Cyan
