import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function fixPassword() {
    const password = 'admin123';

    // Generar hash
    const hash = await bcrypt.hash(password, 12);
    console.log('Generated hash:', hash);

    // Verificar que funciona
    const match = await bcrypt.compare(password, hash);
    console.log('Hash verification:', match);

    if (!match) {
        console.error('ERROR: Hash does not match!');
        return;
    }

    // Actualizar en base de datos
    const db = await open({
        filename: './api/data/pambazo.db',
        driver: sqlite3.Database
    });

    await db.run('UPDATE users SET password_hash = ? WHERE email = ?', [hash, 'admin@pambazo.com']);
    console.log('Password updated in database');

    // Verificar que se guardó correctamente
    const user = await db.get('SELECT password_hash FROM users WHERE email = ?', ['admin@pambazo.com']);
    const dbMatch = await bcrypt.compare(password, user.password_hash);
    console.log('Database verification:', dbMatch);

    await db.close();
}

fixPassword().catch(console.error);
