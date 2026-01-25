import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function testLogin() {
    // Abrir base de datos
    const db = await open({
        filename: './api/data/pambazo.db',
        driver: sqlite3.Database
    });

    // Obtener usuario
    const user = await db.get('SELECT * FROM users WHERE email = ?', ['admin@pambazo.com']);
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('Email:', user?.email);
    console.log('Role:', user?.role);
    console.log('Hash (first 30 chars):', user?.password_hash?.substring(0, 30));

    // Verificar contraseña
    const password = 'admin123';
    const match = await bcrypt.compare(password, user.password_hash);
    console.log('Password matches:', match);

    await db.close();
}

testLogin().catch(console.error);
