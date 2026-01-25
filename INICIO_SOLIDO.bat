@echo off
echo ========================================
echo   REINICIO LIMPIO Y SOLIDO DE PAMBAZO
echo ========================================

echo 1. Limpiando procesos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo 2. Iniciando BACKEND (Puerto 3001)...
start "PAMBAZO BACKEND" /min cmd /c "npm run server:dev"

echo    Esperando que el backend arranque...
timeout /t 10 /nobreak >nul

echo.
echo 3. Iniciando FRONTEND (Puerto 5173)...
start "PAMBAZO FRONTEND" /min cmd /c "npm run client:dev"

echo    Esperando que el frontend arranque...
timeout /t 10 /nobreak >nul

echo.
echo 4. Abriendo navegador...
start http://localhost:5173

echo.
echo ========================================
echo   SISTEMA REINICIADO
echo   Si la pagina no carga, espera unos segundos 
echo   y presiona F5
echo ========================================
pause
