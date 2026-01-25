@echo off
echo ========================================
echo   MODO DEBUG AVANZADO
echo ========================================

echo 1. Cerrando todo...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo 2. Iniciando BACKEND (VENTANA NEGRA - NO CERRAR)...
echo    Aqui veras los errores de login.f
start "BACKEND LOGS" cmd /k "npm run server:dev"

echo.
echo 3. Iniciando FRONTEND...
start "FRONTEND" /min cmd /c "npm run client:dev"

echo.
echo Esperando inicio...
timeout /t 10 /nobreak >nul

echo.
echo 4. Abriendo navegador...
start http://localhost:5173

echo ========================================
echo POR FAVOR MIRA LA VENTANA NEGRA "BACKEND LOGS"
echo SI APARECE UN TEXTO [AUTH FAIL] AVISAME
echo ========================================
pause
