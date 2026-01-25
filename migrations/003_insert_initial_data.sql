-- =====================================================
-- DATOS INICIALES - ESQUEMA REESTRUCTURADO PAMBAZO
-- Versión: 1.0
-- Fecha: 2025-10-02
-- Descripción: Inserción de datos iniciales del sistema
-- =====================================================

-- =====================================================
-- 1. USUARIO PROPIETARIO POR DEFECTO
-- =====================================================
-- Contraseña: admin123 (hash bcrypt con 12 rounds)
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
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_active = EXCLUDED.is_active,
    email_verified = EXCLUDED.email_verified,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 2. USUARIOS ADICIONALES DEL SISTEMA
-- =====================================================

-- Administrador
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
) ON CONFLICT (email) DO NOTHING;

-- Mesero principal
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
    '+52 555 123 4567',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Personal de cocina
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
    'cocina@pambazo.com',
    'chef1',
    '$2b$12$LQv3c1yqBwlVHpPjrCyeNOGTcLdGcFWYuAEmnEOVxe6EKm5UjWS9q',
    'kitchen',
    'María',
    'González',
    '+52 555 234 5678',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 3. CATEGORÍAS INICIALES
-- =====================================================
INSERT INTO categories (name, description, sort_order, icon_url) VALUES
('Panes', 'Variedad de panes frescos y tradicionales', 1, '/icons/bread.svg'),
('Pasteles', 'Pasteles y tortas para ocasiones especiales', 2, '/icons/cake.svg'),
('Galletas', 'Galletas caseras y tradicionales', 3, '/icons/cookie.svg'),
('Bebidas', 'Bebidas calientes y frías', 4, '/icons/drink.svg'),
('Especiales', 'Productos especiales de la casa', 5, '/icons/special.svg'),
('Desayunos', 'Opciones para el desayuno', 6, '/icons/breakfast.svg'),
('Postres', 'Deliciosos postres caseros', 7, '/icons/dessert.svg')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    icon_url = EXCLUDED.icon_url,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 4. MESAS INICIALES
-- =====================================================
INSERT INTO tables (number, capacity, location) VALUES
(1, 2, 'Ventana frontal'),
(2, 4, 'Centro del salón'),
(3, 4, 'Cerca de la cocina'),
(4, 6, 'Mesa familiar'),
(5, 2, 'Terraza'),
(6, 8, 'Sala privada'),
(7, 4, 'Junto a la barra'),
(8, 2, 'Rincón acogedor'),
(9, 6, 'Mesa grande central'),
(10, 4, 'Cerca de la entrada')
ON CONFLICT (number) DO UPDATE SET
    capacity = EXCLUDED.capacity,
    location = EXCLUDED.location,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 5. PRODUCTOS INICIALES
-- =====================================================

-- Obtener IDs de categorías
DO $$
DECLARE
    cat_panes INTEGER;
    cat_pasteles INTEGER;
    cat_galletas INTEGER;
    cat_bebidas INTEGER;
    cat_especiales INTEGER;
    cat_desayunos INTEGER;
    cat_postres INTEGER;
    owner_id UUID;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO cat_panes FROM categories WHERE name = 'Panes';
    SELECT id INTO cat_pasteles FROM categories WHERE name = 'Pasteles';
    SELECT id INTO cat_galletas FROM categories WHERE name = 'Galletas';
    SELECT id INTO cat_bebidas FROM categories WHERE name = 'Bebidas';
    SELECT id INTO cat_especiales FROM categories WHERE name = 'Especiales';
    SELECT id INTO cat_desayunos FROM categories WHERE name = 'Desayunos';
    SELECT id INTO cat_postres FROM categories WHERE name = 'Postres';
    
    -- Obtener ID del propietario
    SELECT id INTO owner_id FROM users WHERE email = 'owner@pambazo.com';

    -- Insertar productos de Panes
    INSERT INTO products (name, description, category_id, price, cost, preparation_time, is_featured) VALUES
    ('Pan Integral', 'Pan integral artesanal con semillas', cat_panes, 45.00, 20.00, 15, true),
    ('Baguette Francesa', 'Baguette tradicional francesa crujiente', cat_panes, 35.00, 15.00, 20, false),
    ('Pan de Ajo', 'Pan tostado con mantequilla de ajo y hierbas', cat_panes, 55.00, 25.00, 10, true),
    ('Pan Dulce Tradicional', 'Variedad de pan dulce mexicano', cat_panes, 25.00, 12.00, 5, false)
    ON CONFLICT DO NOTHING;

    -- Insertar productos de Pasteles
    INSERT INTO products (name, description, category_id, price, cost, preparation_time, is_featured) VALUES
    ('Pastel de Chocolate', 'Pastel de chocolate con ganache', cat_pasteles, 450.00, 200.00, 60, true),
    ('Cheesecake de Fresa', 'Cheesecake cremoso con fresas frescas', cat_pasteles, 380.00, 180.00, 45, true),
    ('Tres Leches', 'Pastel tres leches tradicional', cat_pasteles, 320.00, 150.00, 40, false),
    ('Pastel Red Velvet', 'Pastel red velvet con cream cheese', cat_pasteles, 420.00, 190.00, 50, false)
    ON CONFLICT DO NOTHING;

    -- Insertar productos de Galletas
    INSERT INTO products (name, description, category_id, price, cost, preparation_time, is_featured) VALUES
    ('Galletas de Avena', 'Galletas caseras de avena con pasas', cat_galletas, 35.00, 15.00, 8, false),
    ('Cookies de Chocolate', 'Cookies americanas con chispas de chocolate', cat_galletas, 40.00, 18.00, 10, true),
    ('Galletas de Mantequilla', 'Galletas tradicionales de mantequilla', cat_galletas, 30.00, 12.00, 8, false)
    ON CONFLICT DO NOTHING;

    -- Insertar productos de Bebidas
    INSERT INTO products (name, description, category_id, price, cost, preparation_time, is_featured) VALUES
    ('Café Americano', 'Café americano recién molido', cat_bebidas, 35.00, 10.00, 3, true),
    ('Cappuccino', 'Cappuccino con espuma de leche', cat_bebidas, 45.00, 15.00, 5, true),
    ('Chocolate Caliente', 'Chocolate caliente con marshmallows', cat_bebidas, 50.00, 20.00, 5, false),
    ('Jugo Natural', 'Jugo natural de frutas de temporada', cat_bebidas, 40.00, 18.00, 3, false),
    ('Agua Fresca', 'Agua fresca de sabores', cat_bebidas, 25.00, 8.00, 2, false)
    ON CONFLICT DO NOTHING;

    -- Insertar productos de Especiales
    INSERT INTO products (name, description, category_id, price, cost, preparation_time, is_featured) VALUES
    ('Pambazo Especial', 'Pambazo tradicional con chorizo y papa', cat_especiales, 85.00, 40.00, 15, true),
    ('Torta Ahogada', 'Torta ahogada estilo Guadalajara', cat_especiales, 95.00, 45.00, 18, true),
    ('Quesadilla Gourmet', 'Quesadilla con ingredientes premium', cat_especiales, 75.00, 35.00, 12, false)
    ON CONFLICT DO NOTHING;

    -- Insertar productos de Desayunos
    INSERT INTO products (name, description, category_id, price, cost, preparation_time, is_featured) VALUES
    ('Huevos Rancheros', 'Huevos rancheros con salsa roja', cat_desayunos, 65.00, 30.00, 12, true),
    ('Chilaquiles', 'Chilaquiles rojos o verdes', cat_desayunos, 70.00, 32.00, 15, true),
    ('Molletes', 'Molletes con frijoles y queso', cat_desayunos, 55.00, 25.00, 10, false),
    ('Hot Cakes', 'Hot cakes con miel y mantequilla', cat_desayunos, 60.00, 28.00, 8, false)
    ON CONFLICT DO NOTHING;

    -- Insertar productos de Postres
    INSERT INTO products (name, description, category_id, price, cost, preparation_time, is_featured) VALUES
    ('Flan Napolitano', 'Flan casero con caramelo', cat_postres, 45.00, 20.00, 5, true),
    ('Gelatina de Mosaico', 'Gelatina de colores en mosaico', cat_postres, 35.00, 15.00, 3, false),
    ('Pay de Limón', 'Pay de limón con merengue', cat_postres, 55.00, 25.00, 8, true),
    ('Helado Artesanal', 'Helado artesanal de vainilla o chocolate', cat_postres, 40.00, 18.00, 2, false)
    ON CONFLICT DO NOTHING;

    -- Crear inventario para todos los productos
    INSERT INTO inventory (product_id, current_stock, min_stock, max_stock, unit, unit_cost, updated_by)
    SELECT 
        p.id,
        CASE 
            WHEN p.category_id = cat_bebidas THEN 50
            WHEN p.category_id = cat_panes THEN 30
            WHEN p.category_id = cat_galletas THEN 40
            WHEN p.category_id = cat_pasteles THEN 10
            WHEN p.category_id = cat_especiales THEN 20
            WHEN p.category_id = cat_desayunos THEN 25
            WHEN p.category_id = cat_postres THEN 15
            ELSE 20
        END as current_stock,
        CASE 
            WHEN p.category_id = cat_bebidas THEN 10
            WHEN p.category_id = cat_panes THEN 5
            WHEN p.category_id = cat_galletas THEN 8
            WHEN p.category_id = cat_pasteles THEN 2
            WHEN p.category_id = cat_especiales THEN 5
            WHEN p.category_id = cat_desayunos THEN 5
            WHEN p.category_id = cat_postres THEN 3
            ELSE 5
        END as min_stock,
        CASE 
            WHEN p.category_id = cat_bebidas THEN 100
            WHEN p.category_id = cat_panes THEN 60
            WHEN p.category_id = cat_galletas THEN 80
            WHEN p.category_id = cat_pasteles THEN 20
            WHEN p.category_id = cat_especiales THEN 40
            WHEN p.category_id = cat_desayunos THEN 50
            WHEN p.category_id = cat_postres THEN 30
            ELSE 40
        END as max_stock,
        'units' as unit,
        p.cost as unit_cost,
        owner_id
    FROM products p
    WHERE NOT EXISTS (
        SELECT 1 FROM inventory i WHERE i.product_id = p.id
    );

END $$;

-- =====================================================
-- 6. PROVEEDORES INICIALES
-- =====================================================
INSERT INTO suppliers (name, contact_person, email, phone, address, payment_terms) VALUES
('Distribuidora de Harinas SA', 'Carlos Mendoza', 'carlos@harinas.com', '+52 555 111 2222', 'Av. Industrial 123, CDMX', '30 días'),
('Lácteos Frescos del Valle', 'Ana Rodríguez', 'ana@lacteos.com', '+52 555 333 4444', 'Carretera a Toluca Km 15', '15 días'),
('Frutas y Verduras Premium', 'José García', 'jose@frutaspremium.com', '+52 555 555 6666', 'Central de Abastos Local 45', '7 días'),
('Carnes Selectas del Norte', 'María López', 'maria@carnesselectas.com', '+52 555 777 8888', 'Zona Industrial Norte 67', '21 días'),
('Especias y Condimentos Gourmet', 'Roberto Silva', 'roberto@especiasgourmet.com', '+52 555 999 0000', 'Mercado de San Juan 12', '30 días')
ON CONFLICT (name) DO UPDATE SET
    contact_person = EXCLUDED.contact_person,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    payment_terms = EXCLUDED.payment_terms,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 7. CONFIGURACIÓN INICIAL DEL SISTEMA
-- =====================================================

-- Crear notificación de bienvenida para el propietario
INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    priority,
    data
)
SELECT 
    u.id,
    'system',
    'Bienvenido a PAMBAZO',
    'Sistema reestructurado exitosamente. Todas las funcionalidades están disponibles.',
    'medium',
    jsonb_build_object(
        'version', '2.1',
        'migration_date', CURRENT_TIMESTAMP,
        'features', jsonb_build_array(
            'Autenticación JWT',
            'Base de datos PostgreSQL',
            'Sistema de inventario',
            'Gestión de órdenes',
            'Reportes en tiempo real'
        )
    )
FROM users u 
WHERE u.email = 'owner@pambazo.com';

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
DECLARE
    user_count INTEGER;
    category_count INTEGER;
    product_count INTEGER;
    table_count INTEGER;
    inventory_count INTEGER;
    supplier_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO category_count FROM categories;
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO table_count FROM tables;
    SELECT COUNT(*) INTO inventory_count FROM inventory;
    SELECT COUNT(*) INTO supplier_count FROM suppliers;
    
    RAISE NOTICE 'Datos iniciales insertados exitosamente:';
    RAISE NOTICE '- Usuarios: %', user_count;
    RAISE NOTICE '- Categorías: %', category_count;
    RAISE NOTICE '- Productos: %', product_count;
    RAISE NOTICE '- Mesas: %', table_count;
    RAISE NOTICE '- Items de inventario: %', inventory_count;
    RAISE NOTICE '- Proveedores: %', supplier_count;
    RAISE NOTICE 'Usuario propietario: owner@pambazo.com (contraseña: admin123)';
    RAISE NOTICE 'Sistema listo para usar';
END $$;