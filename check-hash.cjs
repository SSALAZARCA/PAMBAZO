const bcrypt = require('bcrypt');

async function checkHash() {
  const storedHash = '$2b$12$lmZ0/kOWu0t/KtcwmBSZ1ONLmrWznyxxWKwDP.yu5bwTQ9FVt3b8a';
  const passwords = ['123456', 'owner123', 'pambazo123', 'admin123', 'password'];
  
  console.log('🔍 Verificando contraseñas contra el hash almacenado...');
  console.log('📝 Hash:', storedHash);
  console.log('');
  
  for (const password of passwords) {
    try {
      const isValid = await bcrypt.compare(password, storedHash);
      console.log(`🔑 "${password}": ${isValid ? '✅ VÁLIDA' : '❌ Inválida'}`);
    } catch (error) {
      console.log(`🔑 "${password}": ❌ Error - ${error.message}`);
    }
  }
}

checkHash();