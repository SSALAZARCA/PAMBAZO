const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../backend/db.json');

try {
    if (fs.existsSync(dbPath)) {
        console.log('Leyendo base de datos...');
        // Manejar posible BOM
        let content = fs.readFileSync(dbPath, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }

        const db = JSON.parse(content);

        // Buscar admin
        let admin = db.users.find(u => u.email === 'admin@pambazo.com');

        if (admin) {
            console.log('Usuario Admin encontrado. Restableciendo contraseña...');
            admin.password = 'pambazo123';
            admin.role = 'admin';
            admin.id = 1; // Asegurar ID numérico 1
        } else {
            console.log('Usuario Admin no encontrado. Creándolo...');
            db.users.push({
                id: 1,
                name: 'Administrador',
                email: 'admin@pambazo.com',
                password: 'pambazo123',
                role: 'admin',
                createdAt: new Date().toISOString()
            });
        }

        // Asegurar IDs numéricos en todos
        db.users.forEach(u => {
            if (typeof u.id === 'string' && !isNaN(parseInt(u.id))) {
                u.id = parseInt(u.id);
            }
        });

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        console.log('✅ Base de datos reparada. Admin pass: pambazo123');
    } else {
        console.log('❌ No se encontró db.json');
    }
} catch (error) {
    console.error('Error:', error);
}
