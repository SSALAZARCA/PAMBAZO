
$sourceRoot = Get-Location
$destRoot = "$sourceRoot\src"

# Function to safely move/merge directories
function Merge-Directory {
    param (
        [string]$Source,
        [string]$Destination
    )

    if (-not (Test-Path $Source)) {
        Write-Host "Source $Source does not exist. Skipping."
        return
    }

    if (-not (Test-Path $Destination)) {
        Write-Host "Creating destination $Destination"
        New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    }

    Get-ChildItem -Path $Source | ForEach-Object {
        $destPath = Join-Path $Destination $_.Name
        if ($_.PSIsContainer) {
            # Recursive merge for subdirectories
            Merge-Directory -Source $_.FullName -Destination $destPath
        } else {
            if (Test-Path $destPath) {
                Write-Host "Conflict: File $destPath already exists. Skipping source file."
            } else {
                Move-Item -Path $_.FullName -Destination $destPath
            }
        }
    }
    
    # Remove empty source directory
    if ((Get-ChildItem -Path $Source).Count -eq 0) {
        Remove-Item -Path $Source
    }
}

# 1. Move root files
if (Test-Path "App.tsx") { Move-Item "App.tsx" "$destRoot\App.tsx" }
if (Test-Path "main.tsx") { Move-Item "main.tsx" "$destRoot\main.tsx" }

# 2. Merge directories
Merge-Directory -Source "components" -Destination "$destRoot\components"
Merge-Directory -Source "store" -Destination "$destRoot\store"
Merge-Directory -Source "hooks" -Destination "$destRoot\hooks"
Merge-Directory -Source "lib" -Destination "$destRoot\lib"
Merge-Directory -Source "styles" -Destination "$destRoot\styles"
Merge-Directory -Source "utils" -Destination "$destRoot\utils"
Merge-Directory -Source "contexts" -Destination "$destRoot\contexts"
Merge-Directory -Source "config" -Destination "$destRoot\config"

Write-Host "Migration complete."
