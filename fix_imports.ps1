# Fix all incorrect import paths
$files = @(
    "d:\DESARROLLOS\PAMBASO 2.1\src\hooks\useAuth.ts",
    "d:\DESARROLLOS\PAMBASO 2.1\src\hooks\useOptimizedStore.ts",
    "d:\DESARROLLOS\PAMBASO 2.1\src\pages\BakerDashboard.tsx",
    "d:\DESARROLLOS\PAMBASO 2.1\src\pages\MobileBakerDashboard.tsx",
    "d:\DESARROLLOS\PAMBASO 2.1\src\components\StockAlerts.tsx",
    "d:\DESARROLLOS\PAMBASO 2.1\src\components\ProductionMonitor.tsx",
    "d:\DESARROLLOS\PAMBASO 2.1\src\components\PreparationTracker.tsx",
    "d:\DESARROLLOS\PAMBASO 2.1\src\components\MaterialOutput.tsx",
    "d:\DESARROLLOS\PAMBASO 2.1\src\components\HistoricalProductsView.tsx",
    "d:\DESARROLLOS\PAMBASO 2.1\src\components\BakerKPIs.tsx",
    "d:\DESARROLLOS\PAMBASO 2.1\src\components\BakerCharts.tsx",
    "d:\DESARROLLOS\PAMBASO 2.1\src\components\mobile\MobileOwnerDashboard.tsx",
    "d:\DESARROLLOS\PAMBASO 2.1\src\components\mobile\MobileWaiterDashboard.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "from '../../store/useStore'", "from '../store/useStore'"
        $content = $content -replace 'from "../../store/useStore"', 'from "../store/useStore"'
        Set-Content $file -Value $content -NoNewline
        Write-Host "Fixed: $file"
    }
}

Write-Host "All import paths fixed!"
