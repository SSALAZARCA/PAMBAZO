import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function addCustomerUser() {
    const db = await open({
        filename: './api/data/pambazo.db',
        driver: sqlite3.Database
    });

    const password = 'admin123';
    const hash = await bcrypt.hash(password, 12);

    // Insertar usuario cliente
    await db.run(
        `INSERT INTO users (id, username, email, password_hash, role, first_name, last_name, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['4', 'customer', 'customer@pambazo.com', hash, 'customer', 'Cliente', 'Demo', 1]
    );

    console.log('✅ Usuario cliente creado exitosamente');

    // Verificar
    const user = await db.get('SELECT * FROM users WHERE email = ?', ['customer@pambazo.com']);
    const match = await bcrypt.compare(password, user.password_hash);

    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password verification: ${match ? '✅ OK' : '❌ FAILED'}`);

    await db.close();
}

addCustomerUser().catch(console.error);
