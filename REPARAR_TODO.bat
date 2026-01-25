@echo off
echo ========================================
echo REPARANDO SISTEMA PAMBAZO
echo ========================================

echo 1. Deteniendo procesos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 2. Limpiando cache de desarrollo...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo [OK] Cache limpio
)

echo 3. Iniciando BACKEND (Puerto 3001)...
start "PAMBAZO BACKEND" cmd /k "npm run server:dev"

echo 4. Iniciando FRONTEND (Puerto 5173)...
echo [INFO] Vite tardara unos segundos en iniciar...
start "PAMBAZO FRONTEND" cmd /k "npm run dev"

echo.
echo ========================================
echo LISTO!
echo Por favor espera 30 segundos y recarga la pagina con Ctrl+F5
echo ========================================
timeout /t 10
