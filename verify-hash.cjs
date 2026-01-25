const bcrypt = require('bcrypt');

const password = 'admin123';
const hash = '$2b$12$LQv3c1yqBwlVHpPjrCyeNOGTcLdGcFWYuAEmnEOVxe6EKm5UjWS9q';

console.log('Verificando hash...');
console.log('Password:', password);
console.log('Hash:', hash);

const isValid = bcrypt.compareSync(password, hash);
console.log('¿Es válido?:', isValid);

// También vamos a generar un nuevo hash para admin123
const newHash = bcrypt.hashSync('admin123', 12);
console.log('Nuevo hash para admin123:', newHash);