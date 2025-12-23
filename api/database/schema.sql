-- SQLite Schema for PAMBAZO Bakery Management System

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'waiter', 'kitchen', 'customer', 'baker')),
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login TEXT
);

-- Refresh Tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    revoked INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category_id TEXT,
    image_url TEXT,
    is_available INTEGER DEFAULT 1,
    preparation_time INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tables (restaurant tables)
CREATE TABLE IF NOT EXISTS tables (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    number INTEGER UNIQUE NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
    location TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    customer_id TEXT,
    table_id TEXT,
    waiter_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
    order_type TEXT DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
    total REAL NOT NULL DEFAULT 0,
    notes TEXT,
    customer_name TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (waiter_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,
    subtotal REAL NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    item_name TEXT NOT NULL,
    product_id TEXT,
    current_stock REAL NOT NULL DEFAULT 0,
    min_stock REAL NOT NULL DEFAULT 0,
    max_stock REAL,
    unit TEXT NOT NULL,
    cost_per_unit REAL,
    supplier TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_waiter ON orders(waiter_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Insert default users
INSERT OR IGNORE INTO users (id, username, email, password_hash, role, first_name, last_name, is_active)
VALUES 
('1', 'admin', 'admin@pambazo.com', '$2b$12$gX7JReOrIIYZdCIvAfmk/nHFi60BLF0yL0fO', 'owner', 'Admin', 'PAMBAZO', 1),
('2', 'waiter', 'waiter@pambazo.com', '$2b$12$gX7JReOrIIYZdCIvAfmk/nHFi60BLF0yL0fO', 'waiter', 'Waiter', 'Test', 1),
('3', 'kitchen', 'kitchen@pambazo.com', '$2b$12$gX7JReOrIIYZdCIvAfmk/nHFi60BLF0yL0fO', 'kitchen', 'Kitchen', 'Staff', 1),
('4', 'customer', 'customer@pambazo.com', '$2b$12$gX7JReOrIIYZdCIvAfmk/nHFi60BLF0yL0fO', 'customer', 'Cliente', 'Demo', 1);

-- Insert sample categories
INSERT OR IGNORE INTO categories (id, name, description, is_active)
VALUES 
('cat-1', 'Panes', 'Variedad de panes frescos horneados diariamente', 1),
('cat-2', 'Pasteles', 'Deliciosos pasteles y tortas para toda ocasión', 1),
('cat-3', 'Galletas', 'Galletas artesanales crujientes y suaves', 1),
('cat-4', 'Bebidas', 'Café, té y bebidas refrescantes', 1);

-- Insert sample products
INSERT OR IGNORE INTO products (id, name, description, price, category_id, is_available, preparation_time)
VALUES 
('prod-1', 'Pan Integral', 'Pan integral con semillas, rico en fibra', 25.00, 'cat-1', 1, 15),
('prod-2', 'Baguette Francesa', 'Baguette tradicional crujiente', 18.00, 'cat-1', 1, 20),
('prod-3', 'Pastel de Chocolate', 'Delicioso pastel de chocolate con ganache', 45.00, 'cat-2', 1, 30),
('prod-4', 'Galletas de Avena', 'Galletas caseras de avena con pasas', 15.00, 'cat-3', 1, 12),
('prod-5', 'Café Americano', 'Café negro tradicional', 12.00, 'cat-4', 1, 5);

-- Insert sample tables
INSERT OR IGNORE INTO tables (id, number, capacity, status, location)
VALUES 
('table-1', 1, 2, 'available', 'Ventana'),
('table-2', 2, 4, 'available', 'Centro'),
('table-3', 3, 4, 'available', 'Centro'),
('table-4', 4, 6, 'available', 'Terraza'),
('table-5', 5, 2, 'available', 'Barra');