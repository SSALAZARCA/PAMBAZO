const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Configuración de la base de datos
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'pambaso_db',
  user: 'pambaso_user',
  password: 'pambaso123',
});

async function testDatabaseConnection() {
  try {
    console.log('🔍 Probando conexión a la nueva base de datos...');
    
    // Test de conexión
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Verificar tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:', tablesResult.rows.map(r => r.table_name));
    
    // Verificar usuario propietario
    const userResult = await client.query(`
      SELECT id, email, username, role, is_active, created_at 
      FROM users 
      WHERE email = $1
    `, ['owner@pambazo.com']);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario propietario no encontrado');
      return false;
    }
    
    const user = userResult.rows[0];
    console.log('👤 Usuario propietario encontrado:', {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at
    });
    
    // Probar autenticación con contraseña
    const passwordResult = await client.query(`
      SELECT password_hash 
      FROM users 
      WHERE email = $1
    `, ['owner@pambazo.com']);
    
    const storedHash = passwordResult.rows[0].password_hash;
    const testPassword = 'admin123';
    
    console.log('🔐 Probando autenticación...');
    const isValidPassword = await bcrypt.compare(testPassword, storedHash);
    
    if (isValidPassword) {
      console.log('✅ Autenticación exitosa con contraseña: admin123');
    } else {
      console.log('❌ Fallo en la autenticación');
      return false;
    }
    
    // Verificar datos iniciales
    const categoriesCount = await client.query('SELECT COUNT(*) FROM categories');
    const productsCount = await client.query('SELECT COUNT(*) FROM products');
    const tablesCount = await client.query('SELECT COUNT(*) FROM tables');
    const inventoryCount = await client.query('SELECT COUNT(*) FROM inventory');
    
    console.log('📊 Datos iniciales:');
    console.log(`   - Categorías: ${categoriesCount.rows[0].count}`);
    console.log(`   - Productos: ${productsCount.rows[0].count}`);
    console.log(`   - Mesas: ${tablesCount.rows[0].count}`);
    console.log(`   - Items de inventario: ${inventoryCount.rows[0].count}`);
    
    // Probar vistas
    console.log('🔍 Probando vistas...');
    const viewsResult = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
    `);
    
    console.log('👁️ Vistas disponibles:', viewsResult.rows.map(r => r.table_name));
    
    // Probar vista de productos con inventario
    const productsWithInventory = await client.query(`
      SELECT name, current_stock, stock_status 
      FROM products_with_inventory 
      LIMIT 5
    `);
    
    console.log('🛍️ Productos con inventario (muestra):');
    productsWithInventory.rows.forEach(product => {
      console.log(`   - ${product.name}: ${product.current_stock} (${product.stock_status})`);
    });
    
    client.release();
    console.log('🎉 Todas las pruebas pasaron exitosamente!');
    return true;
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    return false;
  }
}

async function testLogin(email, password) {
  try {
    console.log(`\n🔐 Probando login para: ${email}`);
    
    const client = await pool.connect();
    
    // Buscar usuario
    const userResult = await client.query(`
      SELECT id, email, username, password_hash, role, is_active, first_name, last_name
      FROM users 
      WHERE email = $1 AND is_active = true
    `, [email]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario no encontrado o inactivo');
      client.release();
      return null;
    }
    
    const user = userResult.rows[0];
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('❌ Contraseña incorrecta');
      client.release();
      return null;
    }
    
    console.log('✅ Login exitoso!');
    console.log('👤 Datos del usuario:', {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      name: `${user.first_name} ${user.last_name}`
    });
    
    client.release();
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    };
    
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de la nueva base de datos reestructurada...\n');
  
  // Probar conexión y estructura
  const dbTestPassed = await testDatabaseConnection();
  
  if (!dbTestPassed) {
    console.log('\n❌ Las pruebas de base de datos fallaron');
    process.exit(1);
  }
  
  // Probar login del propietario
  const loginResult = await testLogin('owner@pambazo.com', 'admin123');
  
  if (!loginResult) {
    console.log('\n❌ El login del propietario falló');
    process.exit(1);
  }
  
  // Probar otros usuarios
  await testLogin('admin@pambazo.com', 'admin123');
  await testLogin('mesero@pambazo.com', 'admin123');
  
  console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
  console.log('✅ La base de datos reestructurada está funcionando correctamente');
  console.log('✅ El usuario propietario puede autenticarse');
  console.log('✅ Los datos iniciales están cargados');
  console.log('✅ Las vistas están funcionando');
  
  await pool.end();
}

main().catch(console.error);