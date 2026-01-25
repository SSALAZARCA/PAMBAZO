/**
 * Script para ejecutar migraciones de base de datos PostgreSQL
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config();

async function runMigrations() {
  console.log('🔄 Ejecutando migraciones de base de datos...');
  
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'pambaso_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  });

  try {
    // Conectar a la base de datos
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Leer el archivo de migración
    const migrationPath = join(__dirname, '..', 'migrations', '001_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Ejecutando migración inicial...');
    
    // Ejecutar la migración
    await client.query(migrationSQL);
    
    console.log('✅ Migración ejecutada correctamente');
    
    // Verificar que las tablas se crearon
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    // Verificar datos de ejemplo
    const categoriesCount = await client.query('SELECT COUNT(*) FROM categories');
    const productsCount = await client.query('SELECT COUNT(*) FROM products');
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    
    console.log('\n📈 Datos insertados:');
    console.log(`   ✓ Categorías: ${categoriesCount.rows[0].count}`);
    console.log(`   ✓ Productos: ${productsCount.rows[0].count}`);
    console.log(`   ✓ Usuarios: ${usersCount.rows[0].count}`);
    
    console.log('\n🎉 Base de datos configurada correctamente!');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Sugerencias:');
      console.log('   1. Asegúrate de que PostgreSQL esté ejecutándose');
      console.log('   2. Verifica la configuración de conexión en .env');
      console.log('   3. Ejecuta: scripts/install-postgresql.ps1 (como administrador)');
    } else if (error.code === '3D000') {
      console.log('\n💡 La base de datos no existe. Créala con:');
      console.log('   psql -U postgres -c "CREATE DATABASE pambaso_db;"');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar migraciones
runMigrations().catch(console.error);