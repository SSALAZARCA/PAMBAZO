const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  host: '31.97.128.11',
  port: 5432,
  database: 'pambaso_db',
  user: 'pambaso_user',
  password: 'pambaso_password_2024',
});

async function verifyPassword() {
  try {
    console.log('🔍 Verificando contraseña del usuario owner...');
    
    // Obtener el hash de la base de datos
    const userQuery = 'SELECT password_hash FROM users WHERE email = $1';
    const result = await pool.query(userQuery, ['owner@pambazo.com']);
    
    if (!result.rows[0]) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    const storedHash = result.rows[0].password_hash;
    console.log('📝 Hash almacenado:', storedHash);
    
    // Probar diferentes contraseñas
    const passwords = ['123456', 'owner123', 'pambazo123', 'admin123'];
    
    for (const password of passwords) {
      const isValid = await bcrypt.compare(password, storedHash);
      console.log(`🔑 Contraseña "${password}": ${isValid ? '✅ VÁLIDA' : '❌ Inválida'}`);
    }
    
    // Generar nuevo hash para 123456
    console.log('\n🔧 Generando nuevo hash para "123456"...');
    const newHash = await bcrypt.hash('123456', 12);
    console.log('📝 Nuevo hash:', newHash);
    
    // Verificar el nuevo hash
    const isNewHashValid = await bcrypt.compare('123456', newHash);
    console.log(`✅ Verificación del nuevo hash: ${isNewHashValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyPassword();