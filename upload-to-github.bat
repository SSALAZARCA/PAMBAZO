@echo off
echo ========================================
echo Subiendo PAMBAZO a GitHub
echo ========================================
echo.

REM Limpiar repositorio anterior
echo [1/7] Limpiando repositorio anterior...
rmdir /s /q .git 2>nul
if exist .git\index.lock del /f /q .git\index.lock 2>nul

REM Inicializar Git
echo [2/7] Inicializando Git...
git init
if errorlevel 1 goto error

REM Configurar usuario
echo [3/7] Configurando usuario...
git config user.name "SSALAZARCA"
git config user.email "salazar@example.com"

REM Agregar remote
echo [4/7] Agregando remote...
git remote add origin https://github.com/SSALAZARCA/PAMBAZO.git
if errorlevel 1 (
    git remote set-url origin https://github.com/SSALAZARCA/PAMBAZO.git
)

REM Agregar archivos
echo [5/7] Agregando archivos...
git add .gitignore
git add README.md
git add QUICKSTART_COOLIFY.md
git add DEPLOY_COOLIFY.md
git add SISTEMA_CONFIGURACION_TIENDA.md
git add .coolify.yml
git add Dockerfile.backend
git add Dockerfile.frontend
git add docker-compose.yml
git add nginx.conf
git add .dockerignore
git add .env.production.example
git add package.json
git add tsconfig.json
git add vite.config.ts
git add index.html
git add src
git add components
git add api
git add public

REM Commit
echo [6/7] Haciendo commit...
git commit -m "Initial commit: PAMBAZO with Coolify deployment configuration"
if errorlevel 1 goto error

REM Push
echo [7/7] Subiendo a GitHub...
git branch -M main
git push -f origin main
if errorlevel 1 goto error

echo.
echo ========================================
echo EXITO! Codigo subido a GitHub
echo ========================================
echo.
echo Repositorio: https://github.com/SSALAZARCA/PAMBAZO.git
echo.
pause
goto end

:error
echo.
echo ========================================
echo ERROR! Algo salio mal
echo ========================================
echo.
echo Por favor revisa los mensajes de error arriba
echo.
pause
goto end

:end
