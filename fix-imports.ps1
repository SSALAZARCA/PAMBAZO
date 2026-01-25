# Script para remover extensiones .js de imports en archivos TypeScript
Write-Host "Arreglando imports .js en archivos TypeScript..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "api" -Recurse -Filter "*.ts" -Exclude "*.d.ts"
$count = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Reemplazar imports con .js por sin extensión
    $content = $content -replace "from\s+'([^']+)\.js'", "from '$1'"
    $content = $content -replace 'from\s+"([^"]+)\.js"', 'from "$1"'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  ✓ $($file.Name)" -ForegroundColor Green
        $count++
    }
}

Write-Host ""
Write-Host "✅ Arreglados $count archivos" -ForegroundColor Green
