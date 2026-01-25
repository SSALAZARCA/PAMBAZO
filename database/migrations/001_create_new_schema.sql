-- =====================================================
-- MIGRACIÓN 001: Crear Nuevo Esquema de Base de Datos
-- Sistema PAMBAZO - Reestructuración Completa
-- =====================================================

-- Eliminar tablas existentes si existen (para recreación limpia)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS table_reservations CASCADE;
DROP TABLE IF EXISTS inventory_entries CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS product_ingredients CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Eliminar secuencias si existen
DROP SEQUENCE IF EXISTS order_number_seq CASCADE;

-- =====================================================
-- 1. TABLA: users
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'waiter' 
        CHECK (role IN ('owner', 'admin', 'waiter', 'kitchen', 'customer')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- =====================================================
-- 2. TABLA: categories
-- =====================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para categories
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- =====================================================
-- 3. TABLA: products
-- =====================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(10,2) CHECK (cost >= 0),
    image_url VARCHAR(500),
    preparation_time INTEGER DEFAULT 0, -- minutos
    nutritional_info JSONB, -- {calories, protein, carbs, fat, fiber, sugar, sodium}
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para products
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_price ON products(price);

-- =====================================================
-- 4. TABLA: product_ingredients
-- =====================================================
CREATE TABLE product_ingredients (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,
    is_allergen BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para product_ingredients
CREATE INDEX idx_product_ingredients_product_id ON product_ingredients(product_id);
CREATE INDEX idx_product_ingredients_allergen ON product_ingredients(is_allergen);

-- =====================================================
-- 5. TABLA: tables
-- =====================================================
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    number INTEGER UNIQUE NOT NULL CHECK (number > 0),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'available' 
        CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning', 'out_of_service')),
    assigned_waiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    qr_code VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para tables
CREATE INDEX idx_tables_number ON tables(number);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_tables_assigned_waiter ON tables(assigned_waiter_id);

-- =====================================================
-- 6. TABLA: orders
-- =====================================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,
    customer_name VARCHAR(200),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    order_type VARCHAR(20) DEFAULT 'dine_in' 
        CHECK (order_type IN ('dine_in', 'takeout', 'delivery')),
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    payment_method VARCHAR(20) 
        CHECK (payment_method IN ('cash', 'card', 'transfer', 'digital_wallet')),
    payment_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'failed')),
    notes TEXT,
    special_instructions TEXT,
    estimated_completion_time TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para orders
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_created_by ON orders(created_by);

-- =====================================================
-- 7. TABLA: order_items
-- =====================================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'preparing', 'ready', 'served')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para order_items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_status ON order_items(status);

-- =====================================================
-- 8. TABLA: suppliers
-- =====================================================
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para suppliers
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);

-- =====================================================
-- 9. TABLA: inventory
-- =====================================================
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock INTEGER DEFAULT 0 CHECK (min_stock >= 0),
    max_stock INTEGER CHECK (max_stock >= min_stock),
    unit VARCHAR(20) NOT NULL DEFAULT 'units',
    unit_cost DECIMAL(10,2) CHECK (unit_cost >= 0),
    location VARCHAR(100),
    last_restock_date TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Índices para inventory
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_current_stock ON inventory(current_stock);
CREATE INDEX idx_inventory_low_stock ON inventory(current_stock, min_stock) 
    WHERE current_stock <= min_stock;
CREATE INDEX idx_inventory_last_updated ON inventory(last_updated);

-- =====================================================
-- 10. TABLA: inventory_entries
-- =====================================================
CREATE TABLE inventory_entries (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    entry_type VARCHAR(20) NOT NULL 
        CHECK (entry_type IN ('purchase', 'adjustment', 'return', 'waste', 'transfer')),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) CHECK (unit_cost >= 0),
    total_cost DECIMAL(10,2) CHECK (total_cost >= 0),
    invoice_number VARCHAR(100),
    batch_number VARCHAR(100),
    expiry_date DATE,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para inventory_entries
CREATE INDEX idx_inventory_entries_inventory_id ON inventory_entries(inventory_id);
CREATE INDEX idx_inventory_entries_supplier_id ON inventory_entries(supplier_id);
CREATE INDEX idx_inventory_entries_entry_type ON inventory_entries(entry_type);
CREATE INDEX idx_inventory_entries_created_at ON inventory_entries(created_at);
CREATE INDEX idx_inventory_entries_expiry_date ON inventory_entries(expiry_date);

-- =====================================================
-- 11. TABLA: table_reservations
-- =====================================================
CREATE TABLE table_reservations (
    id SERIAL PRIMARY KEY,
    table_id INTEGER NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    customer_name VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    party_size INTEGER NOT NULL CHECK (party_size > 0),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 120 CHECK (duration_minutes > 0),
    status VARCHAR(20) DEFAULT 'confirmed' 
        CHECK (status IN ('confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
    special_requests TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para table_reservations
CREATE INDEX idx_table_reservations_table_id ON table_reservations(table_id);
CREATE INDEX idx_table_reservations_date ON table_reservations(reservation_date);
CREATE INDEX idx_table_reservations_status ON table_reservations(status);
CREATE INDEX idx_table_reservations_customer_phone ON table_reservations(customer_phone);

-- =====================================================
-- 12. TABLA: audit_logs
-- =====================================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- 13. TABLA: notifications
-- =====================================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    data JSONB, -- Datos adicionales específicos del tipo de notificación
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- SECUENCIA PARA NÚMEROS DE ORDEN
-- =====================================================
CREATE SEQUENCE order_number_seq START 1;

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================
COMMENT ON TABLE users IS 'Usuarios del sistema con roles y permisos';
COMMENT ON TABLE categories IS 'Categorías de productos';
COMMENT ON TABLE products IS 'Productos del menú con información nutricional';
COMMENT ON TABLE orders IS 'Órdenes de clientes con estado y pagos';
COMMENT ON TABLE order_items IS 'Items individuales de cada orden';
COMMENT ON TABLE tables IS 'Mesas del restaurante con estado y asignación';
COMMENT ON TABLE inventory IS 'Inventario de productos con stock y alertas';
COMMENT ON TABLE inventory_entries IS 'Entradas y movimientos de inventario';
COMMENT ON TABLE suppliers IS 'Proveedores para el inventario';
COMMENT ON TABLE table_reservations IS 'Reservaciones de mesas';
COMMENT ON TABLE audit_logs IS 'Logs de auditoría para tracking de cambios';
COMMENT ON TABLE notifications IS 'Notificaciones del sistema para usuarios';

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
SELECT 'Esquema de base de datos creado exitosamente' AS status;