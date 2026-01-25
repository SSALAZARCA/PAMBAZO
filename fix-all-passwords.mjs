import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function fixAllPasswords() {
    const db = await open({
        filename: './api/data/pambazo.db',
        driver: sqlite3.Database
    });

    const users = [
        { email: 'admin@pambazo.com', password: 'admin123', role: 'admin' },
        { email: 'waiter@pambazo.com', password: 'admin123', role: 'waiter' },
        { email: 'kitchen@pambazo.com', password: 'admin123', role: 'kitchen' },
        { email: 'customer@pambazo.com', password: 'admin123', role: 'customer' }
    ];

    for (const user of users) {
        const hash = await bcrypt.hash(user.password, 12);
        await db.run('UPDATE users SET password_hash = ? WHERE email = ?', [hash, user.email]);

        // Verificar
        const dbUser = await db.get('SELECT * FROM users WHERE email = ?', [user.email]);
        const match = await bcrypt.compare(user.password, dbUser.password_hash);

        console.log(`${user.role.toUpperCase()} (${user.email}): ${match ? '✅ OK' : '❌ FAILED'}`);
    }

    await db.close();
    console.log('\n✅ Todos los usuarios actualizados');
}

fixAllPasswords().catch(console.error);
