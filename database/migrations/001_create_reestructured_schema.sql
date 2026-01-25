-- Migración 001: Esquema Reestructurado PAMBAZO
-- Fecha: 2025-10-02
-- Descripción: Creación del esquema completo reestructurado según especificaciones técnicas

-- ============================================================================
-- 1. EXTENSIONES Y CONFIGURACIONES
-- ============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. FUNCIONES AUXILIARES
-- ============================================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 3. TABLA: users (Reestructurada)
-- ============================================================================

-- Verificar si la tabla existe y tiene la estructura correcta
DO $$
BEGIN
    -- Si la tabla no existe, crearla
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
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
    END IF;
    
    -- Agregar columnas faltantes si no existen
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END
$$;

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. TABLA: categories
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
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
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_categories_updated_at ON categories;
CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. TABLA: products (Reestructurada)
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
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
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. TABLA: product_ingredients
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_ingredients (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,
    is_allergen BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para product_ingredients
CREATE INDEX IF NOT EXISTS idx_product_ingredients_product_id ON product_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_allergen ON product_ingredients(is_allergen);

-- ============================================================================
-- 7. TABLA: tables (Reestructurada)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tables (
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
CREATE INDEX IF NOT EXISTS idx_tables_number ON tables(number);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_assigned_waiter ON tables(assigned_waiter_id);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_tables_updated_at ON tables;
CREATE TRIGGER trigger_tables_updated_at
    BEFORE UPDATE ON tables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. TABLA: orders (Reestructurada)
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
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
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. TABLA: order_items
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
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
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);

-- ============================================================================
-- 10. TABLA: inventory
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock INTEGER DEFAULT 0 CHECK (min_stock >= 0),
    max_stock INTEGER DEFAULT 1000 CHECK (max_stock >= min_stock),
    unit VARCHAR(20) DEFAULT 'units',
    last_restocked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para inventory
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_current_stock ON inventory(current_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(current_stock) WHERE current_stock <= min_stock;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_inventory_updated_at ON inventory;
CREATE TRIGGER trigger_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. TABLA: audit_log (Nueva)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Índices para audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);

-- ============================================================================
-- 12. DATOS INICIALES
-- ============================================================================

-- Insertar categorías por defecto
INSERT INTO categories (name, description, sort_order, is_active) VALUES
    ('Pambazos', 'Nuestros deliciosos pambazos tradicionales', 1, true),
    ('Bebidas', 'Refrescos, jugos y bebidas calientes', 2, true),
    ('Antojitos', 'Botanas y aperitivos mexicanos', 3, true),
    ('Postres', 'Dulces tradicionales y postres', 4, true),
    ('Especiales', 'Platillos especiales de la casa', 5, true)
ON CONFLICT (name) DO NOTHING;

-- Insertar mesas por defecto
INSERT INTO tables (number, capacity, location, status) VALUES
    (1, 2, 'Ventana frontal', 'available'),
    (2, 4, 'Centro del local', 'available'),
    (3, 2, 'Ventana lateral', 'available'),
    (4, 6, 'Mesa familiar', 'available'),
    (5, 4, 'Cerca de la cocina', 'available'),
    (6, 2, 'Rincón acogedor', 'available'),
    (7, 4, 'Zona central', 'available'),
    (8, 2, 'Mesa para dos', 'available')
ON CONFLICT (number) DO NOTHING;

-- Actualizar username para usuarios existentes si no lo tienen
UPDATE users 
SET username = LOWER(REPLACE(email, '@pambazo.com', ''))
WHERE username IS NULL;

-- ============================================================================
-- 13. VISTAS ÚTILES
-- ============================================================================

-- Vista para órdenes con información completa
CREATE OR REPLACE VIEW orders_detailed AS
SELECT 
    o.*,
    u.first_name || ' ' || u.last_name AS created_by_name,
    t.number AS table_number,
    COUNT(oi.id) AS items_count,
    SUM(oi.quantity) AS total_items
FROM orders o
LEFT JOIN users u ON o.created_by = u.id
LEFT JOIN tables t ON o.table_id = t.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.first_name, u.last_name, t.number;

-- Vista para productos con inventario
CREATE OR REPLACE VIEW products_with_inventory AS
SELECT 
    p.*,
    c.name AS category_name,
    i.current_stock,
    i.min_stock,
    i.max_stock,
    CASE 
        WHEN i.current_stock <= i.min_stock THEN 'low'
        WHEN i.current_stock >= i.max_stock THEN 'high'
        ELSE 'normal'
    END AS stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN inventory i ON p.id = i.product_id;

-- ============================================================================
-- FINALIZACIÓN
-- ============================================================================

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Migración 001 completada exitosamente. Esquema reestructurado creado.';
END
$$;