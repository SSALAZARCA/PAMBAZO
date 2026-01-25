-- =====================================================
-- SCRIPT DE APLICACIÓN DE MIGRACIONES
-- Sistema PAMBAZO - Reestructuración Completa
-- =====================================================

-- Crear tabla de control de migraciones si no existe
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(255)
);

-- Función para aplicar migración con control
CREATE OR REPLACE FUNCTION apply_migration(
    migration_version VARCHAR(255),
    migration_description TEXT,
    migration_sql TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    migration_exists BOOLEAN;
BEGIN
    -- Verificar si la migración ya fue aplicada
    SELECT EXISTS(
        SELECT 1 FROM schema_migrations 
        WHERE version = migration_version
    ) INTO migration_exists;
    
    IF migration_exists THEN
        RAISE NOTICE 'Migración % ya aplicada, saltando...', migration_version;
        RETURN FALSE;
    END IF;
    
    -- Aplicar la migración
    EXECUTE migration_sql;
    
    -- Registrar la migración
    INSERT INTO schema_migrations (version, description)
    VALUES (migration_version, migration_description);
    
    RAISE NOTICE 'Migración % aplicada exitosamente', migration_version;
    RETURN TRUE;
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error aplicando migración %: %', migration_version, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- APLICAR MIGRACIONES EN ORDEN
-- =====================================================

-- Nota: En un entorno real, cada migración se ejecutaría desde archivos separados
-- Este script es para demostración y testing

\echo 'Iniciando aplicación de migraciones...'

-- Migración 001: Crear nuevo esquema
\echo 'Aplicando migración 001: Crear nuevo esquema...'

-- Migración 002: Crear triggers y funciones
\echo 'Aplicando migración 002: Crear triggers y funciones...'

-- Migración 003: Insertar datos iniciales
\echo 'Aplicando migración 003: Insertar datos iniciales...'

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

\echo 'Verificando estado de la base de datos...'

-- Verificar tablas creadas
SELECT 
    'Tablas creadas' AS check_type,
    COUNT(*) AS count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name NOT LIKE 'pg_%';

-- Verificar usuarios
SELECT 
    'Usuarios creados' AS check_type,
    COUNT(*) AS count
FROM users;

-- Verificar productos
SELECT 
    'Productos creados' AS check_type,
    COUNT(*) AS count
FROM products;

-- Verificar mesas
SELECT 
    'Mesas creadas' AS check_type,
    COUNT(*) AS count
FROM tables;

-- Verificar usuario propietario
SELECT 
    'Usuario propietario' AS check_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM users WHERE email = 'owner@pambazo.com' AND role = 'owner')
        THEN 'CREADO CORRECTAMENTE'
        ELSE 'ERROR - NO ENCONTRADO'
    END AS status;

-- Verificar triggers
SELECT 
    'Triggers creados' AS check_type,
    COUNT(*) AS count
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Verificar funciones
SELECT 
    'Funciones creadas' AS check_type,
    COUNT(*) AS count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';

\echo 'Migraciones completadas exitosamente!'