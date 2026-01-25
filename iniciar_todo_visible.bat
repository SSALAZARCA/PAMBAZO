@echo off
echo ========================================
echo INICIANDO PAMBAZO 2.1 (FULL STACK)
echo ========================================

echo 1. Deteniendo procesos anteriores...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo 2. Iniciando BACKEND (Puerto 3001)...
start "PAMBAZO BACKEND" cmd /k "npm run server:dev"

echo.
echo 3. Iniciando FRONTEND (Puerto 5173)...
start "PAMBAZO FRONTEND" cmd /k "npm run dev"

echo.
echo ========================================
echo SISTEMA INICIADO
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo ========================================
timeout /t 5
