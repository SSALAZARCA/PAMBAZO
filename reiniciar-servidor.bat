@echo off
echo ========================================
echo REINICIANDO SERVIDOR BACKEND
echo ========================================
echo.

echo Paso 1: Deteniendo todos los procesos Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK] Procesos detenidos

echo.
echo Paso 2: Navegando al directorio...
cd /d "d:\DESARROLLOS\PAMBASO 2.1"
echo [OK] Directorio: %CD%

echo.
echo Paso 3: Iniciando servidor backend...
echo.
echo ========================================
echo SERVIDOR INICIANDO...
echo ========================================
echo.

npm run server:dev
