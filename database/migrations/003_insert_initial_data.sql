-- =====================================================
-- MIGRACIÓN 003: Insertar Datos Iniciales
-- Sistema PAMBAZO - Reestructuración Completa
-- =====================================================

-- =====================================================
-- 1. INSERTAR USUARIO PROPIETARIO
-- =====================================================
-- Contraseña: 123456 (hash bcrypt con 12 rounds)
INSERT INTO users (
    email, 
    username, 
    password_hash, 
    role, 
    first_name, 
    last_name, 
    is_active,
    email_verified
) VALUES (
    'owner@pambazo.com',
    'owner',
    '$2b$12$LQv3c1yqBwlVHpPjrCyeNOGTcLdGcFWYuAEmnEOVxe6EKm5UjWS9q',
    'owner',
    'Propietario',
    'PAMBAZO',
    true,
    true
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    email_verified = EXCLUDED.email_verified,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 2. INSERTAR USUARIOS ADICIONALES DE EJEMPLO
-- =====================================================
-- Admin user (contraseña: 123456)
INSERT INTO users (
    email, 
    username, 
    password_hash, 
    role, 
    first_name, 
    last_name, 
    is_active,
    email_verified
) VALUES (
    'admin@pambazo.com',
    'admin',
    '$2b$12$LQv3c1yqBwlVHpPjrCyeNOGTcLdGcFWYuAEmnEOVxe6EKm5UjWS9q',
    'admin',
    'Administrador',
    'Sistema',
    true,
    true
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = CURRENT_TIMESTAMP;

-- Waiter user (contraseña: 123456)
INSERT INTO users (
    email, 
    username, 
    password_hash, 
    role, 
    first_name, 
    last_name, 
    phone,
    is_active,
    email_verified
) VALUES (
    'mesero@pambazo.com',
    'mesero1',
    '$2b$12$LQv3c1yqBwlVHpPjrCyeNOGTcLdGcFWYuAEmnEOVxe6EKm5UjWS9q',
    'waiter',
    'Juan',
    'Pérez',
    '+1234567890',
    true,
    true
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = CURRENT_TIMESTAMP;

-- Kitchen user (contraseña: 123456)
INSERT INTO users (
    email, 
    username, 
    password_hash, 
    role, 
    first_name, 
    last_name, 
    is_active,
    email_verified
) VALUES (
    'cocina@pambazo.com',
    'cocina1',
    '$2b$12$LQv3c1yqBwlVHpPjrCyeNOGTcLdGcFWYuAEmnEOVxe6EKm5UjWS9q',
    'kitchen',
    'María',
    'González',
    true,
    true
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 3. INSERTAR CATEGORÍAS INICIALES
-- =====================================================
INSERT INTO categories (name, description, sort_order, is_active) VALUES
('Panes', 'Variedad de panes frescos y tradicionales', 1, true),
('Pasteles', 'Pasteles y tortas para ocasiones especiales', 2, true),
('Galletas', 'Galletas caseras y tradicionales', 3, true),
('Bebidas', 'Bebidas calientes y frías', 4, true),
('Especiales', 'Productos especiales de la casa', 5, true),
('Desayunos', 'Opciones para el desayuno', 6, true),
('Postres', 'Postres y dulces variados', 7, true),
('Snacks', 'Bocadillos y aperitivos', 8, true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 4. INSERTAR PRODUCTOS INICIALES
-- =====================================================
-- Obtener IDs de categorías para referencias
DO $$
DECLARE
    cat_panes INTEGER;
    cat_pasteles INTEGER;
    cat_bebidas INTEGER;
    cat_especiales INTEGER;
    cat_desayunos INTEGER;
    owner_id UUID;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO cat_panes FROM categories WHERE name = 'Panes';
    SELECT id INTO cat_pasteles FROM categories WHERE name = 'Pasteles';
    SELECT id INTO cat_bebidas FROM categories WHERE name = 'Bebidas';
    SELECT id INTO cat_especiales FROM categories WHERE name = 'Especiales';
    SELECT id INTO cat_desayunos FROM categories WHERE name = 'Desayunos';
    SELECT id INTO owner_id FROM users WHERE email = 'owner@pambazo.com';

    -- Insertar productos de panes
    INSERT INTO products (name, description, category_id, price, cost, preparation_time, is_active, is_featured) VALUES
    ('Pan Integral', 'Pan integral artesanal con semillas', cat_panes, 2.50, 1.20, 15, true, true),
    ('Baguette Francesa', 'Baguette tradicional francesa crujiente', cat_panes, 3.00, 1.50, 20, true, false),
    ('Pan de Centeno', 'Pan de centeno con nueces', cat_panes, 3.50, 1.80, 25, true, false),
    ('Pan Dulce', 'Pan dulce tradicional mexicano', cat_panes, 2.00, 1.00, 10, true, true);

    -- Insertar productos de pasteles
    INSERT INTO products (name, description, category_id, price, cost, preparation_time, is_active, is_featured) VALUES
    ('Pastel de Chocolate', 'Pastel de chocolate con ganache', cat_pasteles, 25.00, 12.00, 60, true, true),
    ('Cheesecake', 'Cheesecake de fresa con base de galleta', cat_pasteles, 22.00, 11.00, 45, true, true),
    ('Tres Leches', 'Pastel tres leches tradicional', cat_pasteles, 20.00, 10.00, 40, true, false);

    -- Insertar productos de bebidas
    INSERT INTO products (name, description, category_id, price, cost, preparation_time, is_active, is_featured) VALUES
    ('Café Americano', 'Café americano recién molido', cat_bebidas, 2.50, 0.80, 5, true, true),
    ('Cappuccino', 'Cappuccino con espuma de leche', cat_bebidas, 3.50, 1.20, 8, true, true),
    ('Té Verde', 'Té verde orgánico', cat_bebidas, 2.00, 0.60, 3, true, false),
    ('Jugo de Naranja', 'Jugo de naranja natural', cat_bebidas, 3.00, 1.50, 5, true, false);

    -- Insertar productos especiales
    INSERT INTO products (name, description, category_id, price, cost, preparation_time, is_active, is_featured) VALUES
    ('Combo Desayuno', 'Pan tostado, café y mermelada', cat_especiales, 8.50, 4.00, 15, true, true),
    ('Merienda Especial', 'Pastel + bebida caliente', cat_especiales, 12.00, 6.00, 20, true, true);

    -- Crear inventario inicial para todos los productos
    INSERT INTO inventory (product_id, current_stock, min_stock, max_stock, unit, unit_cost, location, updated_by)
    SELECT 
        p.id,
        50, -- stock inicial
        10, -- stock mínimo
        100, -- stock máximo
        'units',
        p.cost,
        'Almacén Principal',
        owner_id
    FROM products p;

END $$;

-- =====================================================
-- 5. INSERTAR MESAS INICIALES
-- =====================================================
INSERT INTO tables (number, capacity, location, status) VALUES
(1, 2, 'Ventana frontal', 'available'),
(2, 4, 'Centro del salón', 'available'),
(3, 4, 'Cerca de la cocina', 'available'),
(4, 6, 'Mesa familiar', 'available'),
(5, 2, 'Terraza', 'available'),
(6, 8, 'Sala privada', 'available'),
(7, 2, 'Junto a la ventana', 'available'),
(8, 4, 'Zona tranquila', 'available'),
(9, 2, 'Mesa alta', 'available'),
(10, 6, 'Mesa redonda', 'available')
ON CONFLICT (number) DO UPDATE SET
    capacity = EXCLUDED.capacity,
    location = EXCLUDED.location,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 6. INSERTAR PROVEEDORES INICIALES
-- =====================================================
INSERT INTO suppliers (name, contact_person, email, phone, address, is_active) VALUES
('Panadería Central', 'Carlos Mendoza', 'carlos@panaderiacentral.com', '+1234567891', 'Av. Principal 123, Ciudad', true),
('Lácteos del Valle', 'Ana Rodríguez', 'ana@lacteosdelval.com', '+1234567892', 'Calle Secundaria 456, Ciudad', true),
('Frutas y Verduras Frescas', 'Luis García', 'luis@frutasfrescas.com', '+1234567893', 'Mercado Central Local 78', true),
('Distribuidora de Café', 'María López', 'maria@distcafe.com', '+1234567894', 'Zona Industrial 789', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. CREAR VISTAS ÚTILES
-- =====================================================

-- Vista de productos con inventario
CREATE OR REPLACE VIEW products_with_inventory AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.cost,
    p.image_url,
    p.is_active,
    p.is_featured,
    c.name as category_name,
    i.current_stock,
    i.min_stock,
    i.max_stock,
    CASE 
        WHEN i.current_stock <= i.min_stock THEN 'low'
        WHEN i.current_stock >= i.max_stock THEN 'high'
        ELSE 'normal'
    END as stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN inventory i ON p.id = i.product_id
WHERE p.is_active = true;

-- Vista de órdenes con detalles
CREATE OR REPLACE VIEW orders_with_details AS
SELECT 
    o.id,
    o.order_number,
    o.customer_name,
    o.table_id,
    t.number as table_number,
    o.status,
    o.total_amount,
    o.payment_status,
    o.created_at,
    u.first_name || ' ' || u.last_name as created_by_name,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN tables t ON o.table_id = t.id
LEFT JOIN users u ON o.created_by = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, t.number, u.first_name, u.last_name;

-- Vista de dashboard de ventas
CREATE OR REPLACE VIEW sales_dashboard AS
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_sales,
    AVG(o.total_amount) as average_order_value,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders
FROM orders o
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

-- =====================================================
-- 8. CONFIGURAR PERMISOS BÁSICOS
-- =====================================================

-- Otorgar permisos básicos a roles anónimos y autenticados
-- (Esto es importante para evitar errores de permisos)
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO PUBLIC;

-- =====================================================
-- 9. INSERTAR NOTIFICACIÓN DE BIENVENIDA
-- =====================================================
DO $$
DECLARE
    owner_id UUID;
BEGIN
    SELECT id INTO owner_id FROM users WHERE email = 'owner@pambazo.com';
    
    INSERT INTO notifications (user_id, type, title, message, priority, data)
    VALUES (
        owner_id,
        'system',
        '¡Bienvenido al Sistema PAMBAZO!',
        'El sistema ha sido reestructurado exitosamente. Todas las funcionalidades están disponibles.',
        'medium',
        json_build_object('version', '2.1', 'migration_date', CURRENT_TIMESTAMP)::jsonb
    );
END $$;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
SELECT 
    'Datos iniciales insertados exitosamente' AS status,
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM categories) AS total_categories,
    (SELECT COUNT(*) FROM products) AS total_products,
    (SELECT COUNT(*) FROM tables) AS total_tables,
    (SELECT COUNT(*) FROM suppliers) AS total_suppliers;