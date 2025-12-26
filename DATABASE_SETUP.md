# Configuración de Base de Datos PostgreSQL

## 📋 Requisitos Previos

- Windows con PowerShell
- Permisos de administrador
- Node.js 18+ instalado

## 🚀 Instalación Automática

### Paso 1: Instalar PostgreSQL

1. **Abrir PowerShell como Administrador**
   - Presiona `Win + X`
   - Selecciona "Windows PowerShell (Administrador)"
   - O busca "PowerShell" → clic derecho → "Ejecutar como administrador"

2. **Ejecutar el script de instalación**
   ```powershell
   cd "C:\Users\Personal\Documents\desarrollos\PAMBASO 2.1"
   .\scripts\install-postgresql.ps1
   ```

3. **Esperar a que termine la instalación**
   - El script instalará PostgreSQL 15
   - Configurará la contraseña como "postgres"
   - Creará la base de datos "pambaso_db"

### Paso 2: Ejecutar Migraciones

1. **En una terminal normal (no administrador)**
   ```bash
   npm run migrate
   ```

2. **Verificar que todo funcione**
   ```bash
   npm run server:start
   ```

## 🔧 Configuración Manual

### Si el script automático falla:

1. **Instalar PostgreSQL manualmente**
   - Descargar desde: https://www.postgresql.org/download/windows/
   - Durante la instalación, usar contraseña: `postgres`
   - Puerto: `5432`

2. **Crear la base de datos**
   ```sql
   psql -U postgres
   CREATE DATABASE pambaso_db;
   \q
   ```

3. **Ejecutar migraciones**
   ```bash
   npm run migrate
   ```

## 📊 Verificación

### Comprobar que PostgreSQL está ejecutándose:
```powershell
Get-Service -Name "postgresql*"
```

### Conectar a la base de datos:
```bash
psql -U postgres -d pambaso_db
```

### Verificar tablas creadas:
```sql
\dt
```

## 🔍 Solución de Problemas

### Error: "ECONNREFUSED"
- PostgreSQL no está ejecutándose
- Verificar servicio: `Get-Service -Name "postgresql*"`
- Iniciar servicio: `Start-Service -Name "postgresql*"`

### Error: "database does not exist"
- Crear base de datos: `psql -U postgres -c "CREATE DATABASE pambaso_db;"`

### Error: "permission denied"
- Ejecutar PowerShell como administrador
- Verificar permisos de usuario

### Error: "password authentication failed"
- Verificar contraseña en `.env`
- Contraseña por defecto: `postgres`

## 📁 Estructura de Archivos

```
scripts/
├── install-postgresql.ps1    # Script de instalación automática
└── run-migrations.js         # Script de migración de datos

migrations/
└── 001_initial_schema.sql    # Schema inicial de la base de datos
```

## 🌐 Variables de Entorno

Verificar que `.env` contenga:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pambaso_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

## 📞 Soporte

Si tienes problemas:

1. Verificar logs del servidor
2. Comprobar conexión a PostgreSQL
3. Revisar variables de entorno
4. Ejecutar migraciones nuevamente

---

**¡Listo!** Una vez completada la configuración, el sistema estará preparado para usar PostgreSQL como base de datos principal.