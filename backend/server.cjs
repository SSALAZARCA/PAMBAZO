// 🥖 PAMBASO 2.1 - Backend de Producción (Consolidado)
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const Minio = require('minio');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: { origin: process.env.FRONTEND_URL || '*', credentials: true }
});
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'pambazo-super-secret-key-2024';

io.on('connection', (socket) => {
    console.log('🔌 Nuevo cliente WebSocket conectado:', socket.id);
    socket.on('disconnect', () => console.log('🔌 Cliente desconectado:', socket.id));
});

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pambaso_db',
    user: process.env.DB_USER || 'pambaso_user',
    password: process.env.DB_PASSWORD || 'pambaso123',
});

const fs = require('fs');
const path = require('path');

// Prueba de conexión e inicialización
pool.query('SELECT NOW()', async (err, res) => {
    if (err) {
        console.error('❌ Error de conexión a PostgreSQL:', err.message);
        console.error('Configuración intentada:', { host: process.env.DB_HOST, user: process.env.DB_USER, db: process.env.DB_NAME });
    } else {
        console.log('✅ PostgreSQL conectado:', res.rows[0].now);

        try {
            // Verificar si la base de datos está completa (usando 'products' como testigo)
            console.log('🔍 Verificando existencia de tablas...');
            const tableCheck = await pool.query("SELECT to_regclass('public.products')");

            if (!tableCheck.rows[0].to_regclass) {
                console.log('⚠️ Base de datos incompleta detectada (no existe tabla products). Iniciando auto-migración...');
                const sqlPath = path.join(__dirname, '..', 'database', 'init', '01-init-database.sql');

                console.log(`📁 Buscando script SQL en: ${sqlPath}`);
                if (fs.existsSync(sqlPath)) {
                    console.log('📄 Script encontrado. Leyendo y ejecutando...');
                    const sql = fs.readFileSync(sqlPath, 'utf8');
                    await pool.query(sql);
                    console.log('✅ Esquema de base de datos aplicado exitosamente.');
                } else {
                    console.error('❌ Archivo de migración no encontrado. No se puede inicializar la DB.');
                }
            } else {
                console.log('ℹ️ Base de datos ya cuenta con tablas base.');
            }
        } catch (dbInitErr) {
            console.error('❌ Error crítico durante la inicialización de DB:', dbInitErr.message);
        }

        await bootstrapUser();
    }
});

async function bootstrapUser() {
    try {
        const correctEmail = 'admin@pambazo.com';
        const legacyEmail = 'admin@pambaso.com';
        const hashedPwd = await bcrypt.hash('pambazo123', 12);

        console.log('🧹 Limpiando inconsistencias de usuarios...');
        // Eliminar rastro de emails incorrectos o conflictos de username 'admin'
        await pool.query('DELETE FROM users WHERE email = $1 OR (username = $2 AND email != $3)', [legacyEmail, 'admin', correctEmail]);

        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [correctEmail]);

        if (userExists.rowCount === 0) {
            console.log('👷 Creando usuario admin@pambazo.com...');
            await pool.query(
                'INSERT INTO users (email, username, password_hash, role, full_name, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
                [correctEmail, 'admin', hashedPwd, 'admin', 'Administrador Pambazo', true]
            );
            console.log('✅ Usuario admin@pambazo.com creado.');
        } else {
            console.log('👥 Asegurando contraseña para admin@pambazo.com...');
            await pool.query('UPDATE users SET password_hash = $1, username = $2 WHERE email = $3', [hashedPwd, 'admin', correctEmail]);
            console.log('✅ Usuario admin@pambazo.com actualizado.');
        }
    } catch (e) {
        console.error('⚠️ Error en bootstrapUser:', e.message);
    }
}

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'pambazo_minio_secret'
});
const BUCKET_NAME = process.env.MINIO_BUCKET || 'pambazo-images';

class ApiResponse {
    static success(res, data = null, message = 'V_DEPLOYED_888', statusCode = 200) {
        return res.status(statusCode).json({ success: true, message, data, timestamp: new Date().toISOString() });
    }
    static error(res, message = 'Error', statusCode = 500, details = null) {
        return res.status(statusCode).json({ success: false, message, details, timestamp: new Date().toISOString() });
    }
}

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return ApiResponse.error(res, 'Token requerido', 401);
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = (await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id])).rows[0];
        if (!user?.is_active) return ApiResponse.error(res, 'Usuario inactivo', 401);
        req.user = user;
        next();
    } catch (e) { return ApiResponse.error(res, 'Token inválido', 401); }
};

const authorize = (roles) => (req, res, next) => roles.includes(req.user.role) ? next() : ApiResponse.error(res, 'No permitido', 403);

// --- RUTAS V1 ---
app.get('/api/v1/health', async (req, res) => {
    res.status(200).send(`HEALTH_OK_SYNC_V_TRACE_107_${Date.now()}`);
});

// AUTH
app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const { username, email, password, role, name } = req.body;
        const hashedPwd = await bcrypt.hash(password || 'pambazo123', 12);

        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, role, full_name, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, role, full_name',
            [username || email.split('@')[0], email, hashedPwd, role || 'waiter', name || username, true]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        ApiResponse.success(res, {
            user: { ...user, fullName: user.full_name },
            accessToken: token,
            refreshToken: token
        }, 'Registro exitoso');
    } catch (e) { ApiResponse.error(res, e.message); }
});
app.get('/api/v1/debug/db', async (req, res) => {
    try {
        const users = await pool.query('SELECT email, role, is_active FROM users');
        const tables = await pool.query('SELECT COUNT(*) FROM tables');
        const products = await pool.query('SELECT COUNT(*) FROM products');
        const categories = await pool.query('SELECT COUNT(*) FROM categories');
        ApiResponse.success(res, {
            total_users: users.rowCount,
            users: users.rows,
            total_tables: parseInt(tables.rows[0].count),
            total_products: parseInt(products.rows[0].count),
            total_categories: parseInt(categories.rows[0].count)
        });
    } catch (e) { ApiResponse.error(res, e.message); }
});

// AUTH
app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`🔑 [LOGIN] Intento para: ${email}`);

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            console.warn(`❌ [LOGIN] Usuario no encontrado: ${email}`);
            return ApiResponse.error(res, `Usuario ${email} no existe`, 401);
        }

        console.log(`🔍 [LOGIN] Usuario encontrado: ${user.email}. Comparando password...`);
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            console.warn(`❌ [LOGIN] Contraseña incorrecta para: ${email}`);
            return ApiResponse.error(res, 'Contraseña incorrecta', 401);
        }

        console.log(`✅ [LOGIN] Exitoso: ${email} | Rol: ${user.role}`);
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        ApiResponse.success(res, {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                username: user.username,
                fullName: user.full_name,
                first_name: user.full_name?.split(' ')[0] || user.username,
                last_name: user.full_name?.split(' ').slice(1).join(' ') || ''
            },
            accessToken: token,
            refreshToken: token,
            expiresIn: 86400
        }, 'Login exitoso');
    } catch (e) {
        console.error('🔥 [LOGIN] Error crítico:', e.message);
        ApiResponse.error(res, `Error en servidor: ${e.message}`);
    }
});

app.get('/api/v1/auth/me', auth, async (req, res) => {
    const user = (await pool.query('SELECT id, username, email, role, full_name FROM users WHERE id = $1', [req.user.id])).rows[0];
    ApiResponse.success(res, {
        ...user,
        first_name: user.full_name?.split(' ')[0] || user.username,
        last_name: user.full_name?.split(' ').slice(1).join(' ') || ''
    });
});

// --- USUARIOS CRUD ---
app.get('/api/v1/users', auth, authorize(['admin']), async (req, res) => {
    const result = await pool.query('SELECT id, username, email, role, full_name, is_active, created_at FROM users ORDER BY created_at DESC');
    ApiResponse.success(res, {
        users: result.rows,
        pagination: { page: 1, limit: result.rowCount, total: result.rowCount, pages: 1 }
    });
});

app.get('/api/v1/users/:id', auth, authorize(['admin']), async (req, res) => {
    const result = await pool.query('SELECT id, username, email, role, full_name, is_active, created_at FROM users WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return ApiResponse.error(res, 'Usuario no encontrado', 404);
    ApiResponse.success(res, { user: result.rows[0] });
});

app.post('/api/v1/users', auth, authorize(['admin']), async (req, res) => {
    try {
        const { username, email, password, role, full_name } = req.body;
        const hash = await bcrypt.hash(password || 'pambazo123', 12);
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, role, full_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [username, email, hash, role || 'waiter', full_name]
        );
        ApiResponse.success(res, { id: result.rows[0].id }, 'Usuario creado');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.put('/api/v1/users/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        const { username, email, role, full_name, is_active } = req.body;
        await pool.query(
            'UPDATE users SET username=$1, email=$2, role=$3, full_name=$4, is_active=$5, updated_at=NOW() WHERE id=$6',
            [username, email, role, full_name, is_active, req.params.id]
        );
        ApiResponse.success(res, null, 'Usuario actualizado');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.delete('/api/v1/users/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        ApiResponse.success(res, null, 'Usuario eliminado');
    } catch (e) { ApiResponse.error(res, e.message); }
});

// --- CATEGORÍAS CRUD ---
app.post('/api/v1/categories', auth, authorize(['admin']), async (req, res) => {
    try {
        const { name, description } = req.body;
        const result = await pool.query('INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id', [name, description]);
        ApiResponse.success(res, { id: result.rows[0].id }, 'Categoría creada');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.put('/api/v1/categories/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        const { name, description, is_active } = req.body;
        await pool.query('UPDATE categories SET name=$1, description=$2, is_active=$3, updated_at=NOW() WHERE id=$4', [name, description, is_active, req.params.id]);
        ApiResponse.success(res, null, 'Categoría actualizada');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.delete('/api/v1/categories/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
        ApiResponse.success(res, null, 'Categoría eliminada');
    } catch (e) { ApiResponse.error(res, e.message); }
});

// --- PRODUCTOS CRUD ---
app.post('/api/v1/products', auth, authorize(['admin']), async (req, res) => {
    try {
        const { name, description, price, category_id, image_url, preparation_time } = req.body;
        const result = await pool.query(
            'INSERT INTO products (name, description, price, category_id, image_url, preparation_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [name, description, price, category_id, image_url, preparation_time || 15]
        );
        ApiResponse.success(res, { id: result.rows[0].id }, 'Producto creado');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.put('/api/v1/products/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        const { name, description, price, category_id, image_url, preparation_time, is_available } = req.body;
        await pool.query(
            'UPDATE products SET name=$1, description=$2, price=$3, category_id=$4, image_url=$5, preparation_time=$6, is_available=$7, updated_at=NOW() WHERE id=$8',
            [name, description, price, category_id, image_url, preparation_time, is_available, req.params.id]
        );
        ApiResponse.success(res, null, 'Producto actualizado');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.delete('/api/v1/products/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        ApiResponse.success(res, null, 'Producto eliminado');
    } catch (e) { ApiResponse.error(res, e.message); }
});

// --- MESAS CRUD ---
app.post('/api/v1/tables', auth, authorize(['admin']), async (req, res) => {
    try {
        const { table_number, capacity, location } = req.body;
        const result = await pool.query('INSERT INTO tables (table_number, capacity, location) VALUES ($1, $2, $3) RETURNING id', [table_number, capacity, location]);
        ApiResponse.success(res, { id: result.rows[0].id }, 'Mesa creada');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.put('/api/v1/tables/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        const { table_number, capacity, location, status } = req.body;
        await pool.query('UPDATE tables SET table_number=$1, capacity=$2, location=$3, status=$4, updated_at=NOW() WHERE id=$5', [table_number, capacity, location, status, req.params.id]);
        ApiResponse.success(res, null, 'Mesa actualizada');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.delete('/api/v1/tables/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        await pool.query('DELETE FROM tables WHERE id = $1', [req.params.id]);
        ApiResponse.success(res, null, 'Mesa eliminada');
    } catch (e) { ApiResponse.error(res, e.message); }
});

// --- ÓRDENES (CREACIÓN) ---
app.post('/api/v1/orders', auth, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { table_id, items, notes, total_amount } = req.body;
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

        const orderRes = await client.query(
            'INSERT INTO orders (order_number, table_id, waiter_id, total_amount, notes, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [orderNumber, table_id, req.user.id, total_amount, notes, 'pending']
        );
        const orderId = orderRes.rows[0].id;

        for (const item of items) {
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5)',
                [orderId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
            );
        }

        if (table_id) await client.query('UPDATE tables SET status = \'occupied\' WHERE id = $1', [table_id]);

        await client.query('COMMIT');

        // Notificar en tiempo real
        io.emit('order:created', { id: orderId, orderNumber, table_id });

        ApiResponse.success(res, { id: orderId, orderNumber, order: { id: orderId, orderNumber } }, 'Orden creada exitosamente');
    } catch (e) {
        await client.query('ROLLBACK');
        ApiResponse.error(res, e.message);
    } finally {
        client.release();
    }
});

// PRODUCTOS & CATEGORÍAS
app.get('/api/v1/products', async (req, res) => {
    const { category_id, search } = req.query;
    let sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];
    if (category_id) { params.push(category_id); sql += ` AND p.category_id = $${params.length}`; }
    if (search) { params.push(`%${search}%`); sql += ` AND p.name ILIKE $${params.length}`; }
    const result = await pool.query(sql + ' ORDER BY p.name ASC', params);
    ApiResponse.success(res, {
        products: result.rows,
        pagination: { total: result.rowCount, page: 1, limit: 100, pages: 1 }
    });
});

app.get('/api/v1/products/:id', async (req, res) => {
    const result = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1', [req.params.id]);
    if (result.rowCount === 0) return ApiResponse.error(res, 'Producto no encontrado', 404);
    ApiResponse.success(res, { product: result.rows[0] });
});

app.get('/api/v1/categories', async (req, res) => {
    const result = await pool.query('SELECT * FROM categories WHERE is_active = true ORDER BY name ASC');
    ApiResponse.success(res, { categories: result.rows });
});

app.get('/api/v1/categories/:id', async (req, res) => {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return ApiResponse.error(res, 'Categoría no encontrada', 404);
    ApiResponse.success(res, { category: result.rows[0] });
});

// ÓRDENES & MESAS
// --- ÓRDENES & MESAS ---
app.get('/api/v1/orders', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT o.*, t.table_number FROM orders o LEFT JOIN tables t ON o.table_id = t.id ORDER BY o.created_at DESC');
        ApiResponse.success(res, {
            orders: result.rows,
            pagination: { total: result.rowCount, page: 1, limit: 100, pages: 1 }
        });
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.get('/api/v1/orders/:id', auth, async (req, res) => {
    try {
        const order = (await pool.query('SELECT o.*, t.table_number FROM orders o LEFT JOIN tables t ON o.table_id = t.id WHERE o.id = $1', [req.params.id])).rows[0];
        if (!order) return ApiResponse.error(res, 'Orden no encontrada', 404);
        const items = (await pool.query('SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1', [req.params.id])).rows;
        ApiResponse.success(res, { order: { ...order, items } });
    } catch (e) { ApiResponse.error(res, e.message); }
});

// --- KITCHEN ---
app.get('/api/v1/kitchen/orders', auth, authorize(['admin', 'kitchen']), async (req, res) => {
    try {
        const result = await pool.query('SELECT o.*, t.table_number FROM orders o LEFT JOIN tables t ON o.table_id = t.id WHERE o.status NOT IN (\'ready\', \'served\', \'completed\', \'cancelled\') ORDER BY o.created_at ASC');
        // El frontend espera el array directo en .data para kitchen
        ApiResponse.success(res, result.rows);
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.get('/api/v1/kitchen/stats', auth, authorize(['admin', 'kitchen']), async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const stats = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'preparing') as preparing,
                COUNT(*) FILTER (WHERE status = 'ready') as ready,
                COUNT(*) FILTER (WHERE status = 'served') as served
            FROM orders WHERE created_at >= $1
        `, [today]);

        ApiResponse.success(res, {
            date: today,
            pendingOrders: parseInt(stats.rows[0].pending),
            inPreparation: parseInt(stats.rows[0].preparing),
            completedToday: parseInt(stats.rows[0].served),
            avgPrepTime: 15,
            readyToServe: parseInt(stats.rows[0].ready)
        });
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.get('/api/v1/kitchen/history', auth, authorize(['admin', 'kitchen']), async (req, res) => {
    try {
        const result = await pool.query('SELECT o.*, t.table_number FROM orders o LEFT JOIN tables t ON o.table_id = t.id WHERE o.status IN (\'ready\', \'served\', \'completed\') ORDER BY o.updated_at DESC LIMIT 50');
        ApiResponse.success(res, result.rows);
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.put('/api/v1/kitchen/orders/:id/start', auth, authorize(['admin', 'kitchen']), async (req, res) => {
    try {
        await pool.query('UPDATE orders SET status = \'preparing\', updated_at = NOW() WHERE id = $1', [req.params.id]);
        io.emit('order:status-updated', { id: req.params.id, status: 'preparing' });
        ApiResponse.success(res, null, 'Orden en preparación');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.put('/api/v1/kitchen/orders/:id/complete', auth, authorize(['admin', 'kitchen']), async (req, res) => {
    try {
        await pool.query('UPDATE orders SET status = \'ready\', updated_at = NOW() WHERE id = $1', [req.params.id]);
        io.emit('order:status-updated', { id: req.params.id, status: 'ready' });
        io.emit('order:ready', { id: req.params.id });
        ApiResponse.success(res, null, 'Orden lista');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.get('/api/v1/tables', auth, async (req, res) => {
    const result = await pool.query('SELECT * FROM tables ORDER BY table_number ASC');
    ApiResponse.success(res, { tables: result.rows });
});

app.get('/api/v1/tables/:id', auth, async (req, res) => {
    const result = await pool.query('SELECT * FROM tables WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return ApiResponse.error(res, 'Mesa no encontrada', 404);
    ApiResponse.success(res, { table: result.rows[0] });
});

// INVENTARIO
app.get('/api/v1/inventory', auth, authorize(['admin', 'owner', 'kitchen']), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory ORDER BY item_name ASC');
        ApiResponse.success(res, {
            inventory: result.rows,
            pagination: { total: result.rowCount, page: 1, limit: 100, pages: 1 }
        });
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.get('/api/v1/inventory/:id', auth, authorize(['admin', 'owner', 'kitchen']), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) return ApiResponse.error(res, 'Item no encontrado', 404);
        ApiResponse.success(res, { item: result.rows[0] });
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.post('/api/v1/inventory', auth, authorize(['admin', 'owner']), async (req, res) => {
    try {
        const { item_name, current_stock, min_stock, unit, product_id } = req.body;
        const result = await pool.query(
            'INSERT INTO inventory (item_name, current_stock, min_stock, unit, product_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [item_name, current_stock || 0, min_stock || 0, unit, product_id]
        );
        ApiResponse.success(res, { item: { id: result.rows[0].id } }, 'Item creado');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.put('/api/v1/inventory/:id', auth, authorize(['admin', 'owner']), async (req, res) => {
    try {
        const { item_name, current_stock, min_stock, unit, product_id } = req.body;
        await pool.query(
            'UPDATE inventory SET item_name=$1, current_stock=$2, min_stock=$3, unit=$4, product_id=$5, updated_at=NOW() WHERE id=$6',
            [item_name, current_stock, min_stock, unit, product_id, req.params.id]
        );
        ApiResponse.success(res, null, 'Item actualizado');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.delete('/api/v1/inventory/:id', auth, authorize(['admin', 'owner']), async (req, res) => {
    try {
        await pool.query('DELETE FROM inventory WHERE id = $1', [req.params.id]);
        ApiResponse.success(res, null, 'Item eliminado');
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.get('/api/v1/inventory/alerts/low-stock', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory WHERE current_stock <= min_stock');
        ApiResponse.success(res, { low_stock_items: result.rows, count: result.rowCount });
    } catch (e) { ApiResponse.error(res, e.message); }
});

// --- SHIFTS ---
app.get('/api/v1/shifts', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employee_shifts ORDER BY start_time DESC');
        ApiResponse.success(res, result.rows);
    } catch (e) { ApiResponse.error(res, e.message); }
});

// --- LOYALTY ---
app.get('/api/v1/loyalty/rewards', auth, async (req, res) => {
    try {
        // En una implementación real esta tabla existiría. Por ahora devolvemos lista vacía
        ApiResponse.success(res, []);
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.get('/api/v1/loyalty/config', auth, async (req, res) => {
    ApiResponse.success(res, { amountPerPoint: 10, enabled: true });
});

// REPORTES & DASHBOARD
app.get('/api/v1/reports/dashboard', auth, authorize(['admin', 'owner']), async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const revenue = (await pool.query('SELECT SUM(total_amount) FROM orders WHERE status = \'paid\' AND created_at >= $1', [today])).rows[0].sum || 0;
    const orders = (await pool.query('SELECT COUNT(*) FROM orders WHERE created_at >= $1', [today])).rows[0].count;
    const lowStock = (await pool.query('SELECT COUNT(*) FROM inventory WHERE current_stock <= min_stock')).rows[0].count;
    ApiResponse.success(res, { dailyRevenue: parseFloat(revenue), todayOrders: parseInt(orders), lowStockItems: parseInt(lowStock), activeTables: 0 });
});

app.get('/api/v1/stats/overview', auth, async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const revenue = (await pool.query('SELECT SUM(total_amount) FROM orders WHERE status = \'paid\' AND created_at >= $1', [today])).rows[0].sum || 0;
    ApiResponse.success(res, { revenue: parseFloat(revenue) });
});

// UPLOAD
app.post('/api/v1/upload', auth, async (req, res) => {
    try {
        const { image, name } = req.body;
        const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const fileName = `products/${Date.now()}-${name || 'img'}.png`;
        await minioClient.putObject(BUCKET_NAME, fileName, buffer);
        const url = `${process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:9000`}/${BUCKET_NAME}/${fileName}`;
        ApiResponse.success(res, { url });
    } catch (e) { ApiResponse.error(res, e.message); }
});

app.use('*', (req, res) => ApiResponse.error(res, 'Ruta no encontrada', 404));
server.listen(PORT, () => console.log(`🚀 API v2.1 Producción en puerto ${PORT}`));
