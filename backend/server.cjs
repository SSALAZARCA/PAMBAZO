// 🥖 PAMBASO 2.1 - Backend de Producción (Consolidado)
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const Minio = require('minio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'pambazo-super-secret-key-2024';

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pambaso_db',
    user: process.env.DB_USER || 'pambaso_user',
    password: process.env.DB_PASSWORD || 'pambaso123',
});

// Prueba de conexión inmediata
pool.query('SELECT NOW()', async (err, res) => {
    if (err) {
        console.error('❌ Error de conexión a PostgreSQL:', err.message);
        console.error('Configuración intentada:', { host: process.env.DB_HOST, user: process.env.DB_USER, db: process.env.DB_NAME });
    } else {
        console.log('✅ PostgreSQL conectado:', res.rows[0].now);
        await bootstrapUser();
    }
});

async function bootstrapUser() {
    try {
        const adminEmail = 'admin@pambazo.com';
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
        if (userExists.rowCount === 0) {
            console.log('👷 Creando usuario admin por defecto...');
            const hashedPwd = await bcrypt.hash('admin123', 12);
            await pool.query(
                'INSERT INTO users (email, username, password_hash, role, first_name, last_name, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [adminEmail, 'admin', hashedPwd, 'admin', 'Admin', 'Pambazo', true]
            );
            console.log('✅ Usuario admin@pambazo.com creado (pass: admin123)');
        } else {
            console.log('👥 Usuario admin ya existe. Actualizando contraseña...');
            const hashedPwd = await bcrypt.hash('pambazo123', 12);
            await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashedPwd, adminEmail]);
            console.log('✅ Contraseña de admin@pambazo.com actualizada a: pambazo123');
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
    res.status(200).send(`HEALTH_OK_SYNC_${Date.now()}`);
});
app.get('/api/v1/debug/db', async (req, res) => {
    try {
        const users = await pool.query('SELECT email, role, is_active FROM users');
        const tables = await pool.query('SELECT COUNT(*) FROM tables');
        const products = await pool.query('SELECT COUNT(*) FROM products');
        ApiResponse.success(res, {
            total_users: users.rowCount,
            users: users.rows,
            total_tables: tables.rows[0].count,
            total_products: products.rows[0].count
        });
    } catch (e) { ApiResponse.error(res, e.message); }
});

// AUTH
app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔑 Intento de login para:', email);

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            console.warn('❌ Usuario no encontrado:', email);
            return ApiResponse.error(res, 'Usuario no existe', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            console.warn('❌ Contraseña incorrecta para:', email);
            return ApiResponse.error(res, 'Contraseña incorrecta', 401);
        }

        console.log('✅ Login exitoso:', email, 'Role:', user.role);
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        ApiResponse.success(res, {
            user: { id: user.id, email: user.email, role: user.role, name: user.username, fullName: user.full_name },
            token, tokens: { accessToken: token, refreshToken: token, expiresIn: 86400 }
        });
    } catch (e) {
        console.error('🔥 Error en login:', e.message);
        ApiResponse.error(res, e.message);
    }
});

app.get('/api/v1/auth/me', auth, async (req, res) => {
    const user = (await pool.query('SELECT id, username, email, role, full_name FROM users WHERE id = $1', [req.user.id])).rows[0];
    ApiResponse.success(res, user);
});

// PRODUCTOS & CATEGORÍAS
app.get('/api/v1/products', async (req, res) => {
    const { category_id, search } = req.query;
    let sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];
    if (category_id) { params.push(category_id); sql += ` AND p.category_id = $${params.length}`; }
    if (search) { params.push(`%${search}%`); sql += ` AND p.name ILIKE $${params.length}`; }
    const result = await pool.query(sql + ' ORDER BY p.name ASC', params);
    ApiResponse.success(res, { products: result.rows, pagination: { total: result.rowCount, page: 1, limit: 100 } });
});

app.get('/api/v1/categories', async (req, res) => {
    const result = await pool.query('SELECT * FROM categories WHERE is_active = true ORDER BY name ASC');
    ApiResponse.success(res, result.rows);
});

// ÓRDENES & MESAS
app.get('/api/v1/orders', auth, async (req, res) => {
    const result = await pool.query('SELECT o.*, t.table_number FROM orders o LEFT JOIN tables t ON o.table_id = t.id ORDER BY o.created_at DESC');
    ApiResponse.success(res, result.rows);
});

app.get('/api/v1/kitchen/orders', auth, authorize(['admin', 'kitchen']), async (req, res) => {
    const result = await pool.query('SELECT o.*, t.table_number FROM orders o LEFT JOIN tables t ON o.table_id = t.id WHERE o.status NOT IN (\'completed\', \'cancelled\') ORDER BY o.created_at ASC');
    ApiResponse.success(res, result.rows);
});

app.get('/api/v1/tables', auth, async (req, res) => {
    const result = await pool.query('SELECT * FROM tables ORDER BY table_number ASC');
    ApiResponse.success(res, result.rows);
});

// INVENTARIO
app.get('/api/v1/inventory', auth, authorize(['admin', 'owner', 'kitchen']), async (req, res) => {
    const result = await pool.query('SELECT * FROM inventory ORDER BY item_name ASC');
    ApiResponse.success(res, { inventory: result.rows, pagination: { total: result.rowCount, page: 1, limit: 100 } });
});

app.get('/api/v1/inventory/alerts/low-stock', auth, async (req, res) => {
    const result = await pool.query('SELECT * FROM inventory WHERE current_stock <= min_stock');
    ApiResponse.success(res, { low_stock_items: result.rows, count: result.rowCount });
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
app.listen(PORT, () => console.log(`🚀 API v2.1 Producción en puerto ${PORT}`));
