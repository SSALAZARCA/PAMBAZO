-- ==============================================
-- PAMBASO Initial Data Seeding Script
-- ==============================================
-- This script inserts initial data for the application
-- Run this after the database initialization script

-- ==============================================
-- DEFAULT ADMIN USER
-- ==============================================
-- Password: admin123 (hashed with bcrypt)
-- IMPORTANT: Change this password after first login!
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@pambaso.com', '$2b$12$LQv3c1yqBwlVHpPjrCyeNOGTcLdGcFWYuAEmnEOVxe6EKm5UjWS9q', 'Admin', 'User', 'admin', true, true),
('550e8400-e29b-41d4-a716-446655440001', 'owner@pambaso.com', '$2b$12$LQv3c1yqBwlVHpPjrCyeNOGTcLdGcFWYuAEmnEOVxe6EKm5UjWS9q', 'Restaurant', 'Owner', 'owner', true, true),
('550e8400-e29b-41d4-a716-446655440002', 'kitchen@pambaso.com', '$2b$12$LQv3c1yqBwlVHpPjrCyeNOGTcLdGcFWYuAEmnEOVxe6EKm5UjWS9q', 'Kitchen', 'Staff', 'kitchen', true, true),
('550e8400-e29b-41d4-a716-446655440003', 'waiter@pambaso.com', '$2b$12$LQv3c1yqBwlVHpPjrCyeNOGTcLdGcFWYuAEmnEOVxe6EKm5UjWS9q', 'Waiter', 'Staff', 'waiter', true, true)
ON CONFLICT (email) DO NOTHING;

-- ==============================================
-- PRODUCT CATEGORIES
-- ==============================================
INSERT INTO categories (id, name, description, sort_order) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'Entradas', 'Aperitivos y entradas para comenzar la comida', 1),
('660e8400-e29b-41d4-a716-446655440001', 'Platos Principales', 'Platos principales y especialidades de la casa', 2),
('660e8400-e29b-41d4-a716-446655440002', 'Postres', 'Dulces y postres caseros', 3),
('660e8400-e29b-41d4-a716-446655440003', 'Bebidas', 'Bebidas frías y calientes', 4),
('660e8400-e29b-41d4-a716-446655440004', 'Ensaladas', 'Ensaladas frescas y saludables', 5),
('660e8400-e29b-41d4-a716-446655440005', 'Pizzas', 'Pizzas artesanales con ingredientes frescos', 6),
('660e8400-e29b-41d4-a716-446655440006', 'Pastas', 'Pastas caseras con salsas tradicionales', 7),
('660e8400-e29b-41d4-a716-446655440007', 'Carnes', 'Carnes a la parrilla y especialidades', 8)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- SAMPLE PRODUCTS
-- ==============================================
INSERT INTO products (id, name, description, price, category_id, is_available, preparation_time, sort_order) VALUES
-- Entradas
('770e8400-e29b-41d4-a716-446655440000', 'Bruschetta Clásica', 'Pan tostado con tomate fresco, albahaca y aceite de oliva', 8.50, '660e8400-e29b-41d4-a716-446655440000', true, 10, 1),
('770e8400-e29b-41d4-a716-446655440001', 'Tabla de Quesos', 'Selección de quesos artesanales con frutos secos', 15.00, '660e8400-e29b-41d4-a716-446655440000', true, 5, 2),

-- Platos Principales
('770e8400-e29b-41d4-a716-446655440002', 'Paella Valenciana', 'Paella tradicional con pollo, conejo y verduras', 22.00, '660e8400-e29b-41d4-a716-446655440001', true, 35, 1),
('770e8400-e29b-41d4-a716-446655440003', 'Salmón a la Plancha', 'Salmón fresco con verduras de temporada', 18.50, '660e8400-e29b-41d4-a716-446655440001', true, 20, 2),

-- Pizzas
('770e8400-e29b-41d4-a716-446655440004', 'Pizza Margherita', 'Tomate, mozzarella fresca y albahaca', 12.00, '660e8400-e29b-41d4-a716-446655440005', true, 15, 1),
('770e8400-e29b-41d4-a716-446655440005', 'Pizza Quattro Stagioni', 'Tomate, mozzarella, jamón, champiñones, alcachofas y aceitunas', 16.00, '660e8400-e29b-41d4-a716-446655440005', true, 18, 2),

-- Pastas
('770e8400-e29b-41d4-a716-446655440006', 'Spaghetti Carbonara', 'Pasta con huevo, panceta y queso parmesano', 14.00, '660e8400-e29b-41d4-a716-446655440006', true, 12, 1),
('770e8400-e29b-41d4-a716-446655440007', 'Lasaña de la Casa', 'Lasaña casera con carne, bechamel y queso', 16.50, '660e8400-e29b-41d4-a716-446655440006', true, 25, 2),

-- Postres
('770e8400-e29b-41d4-a716-446655440008', 'Tiramisú', 'Postre italiano tradicional con café y mascarpone', 7.50, '660e8400-e29b-41d4-a716-446655440002', true, 5, 1),
('770e8400-e29b-41d4-a716-446655440009', 'Tarta de Chocolate', 'Tarta casera de chocolate con helado de vainilla', 8.00, '660e8400-e29b-41d4-a716-446655440002', true, 5, 2),

-- Bebidas
('770e8400-e29b-41d4-a716-446655440010', 'Agua Mineral', 'Agua mineral natural 500ml', 2.50, '660e8400-e29b-41d4-a716-446655440003', true, 1, 1),
('770e8400-e29b-41d4-a716-446655440011', 'Café Espresso', 'Café espresso italiano', 2.00, '660e8400-e29b-41d4-a716-446655440003', true, 3, 2),
('770e8400-e29b-41d4-a716-446655440012', 'Vino Tinto de la Casa', 'Copa de vino tinto seleccionado', 4.50, '660e8400-e29b-41d4-a716-446655440003', true, 2, 3)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- RESTAURANT TABLES
-- ==============================================
INSERT INTO restaurant_tables (id, table_number, capacity, location, status) VALUES
('880e8400-e29b-41d4-a716-446655440000', 1, 2, 'indoor', 'available'),
('880e8400-e29b-41d4-a716-446655440001', 2, 4, 'indoor', 'available'),
('880e8400-e29b-41d4-a716-446655440002', 3, 4, 'indoor', 'available'),
('880e8400-e29b-41d4-a716-446655440003', 4, 6, 'indoor', 'available'),
('880e8400-e29b-41d4-a716-446655440004', 5, 2, 'terrace', 'available'),
('880e8400-e29b-41d4-a716-446655440005', 6, 4, 'terrace', 'available'),
('880e8400-e29b-41d4-a716-446655440006', 7, 4, 'terrace', 'available'),
('880e8400-e29b-41d4-a716-446655440007', 8, 8, 'terrace', 'available'),
('880e8400-e29b-41d4-a716-446655440008', 9, 2, 'bar', 'available'),
('880e8400-e29b-41d4-a716-446655440009', 10, 2, 'bar', 'available')
ON CONFLICT (table_number) DO NOTHING;

-- ==============================================
-- INITIAL INVENTORY
-- ==============================================
INSERT INTO inventory (id, product_id, current_stock, minimum_stock, maximum_stock, unit, cost_per_unit) VALUES
('990e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 50, 10, 100, 'portions', 3.50),
('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 20, 5, 30, 'portions', 8.00),
('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 15, 3, 25, 'portions', 12.00),
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 25, 5, 40, 'portions', 10.50),
('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 30, 10, 50, 'portions', 6.00),
('990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 25, 8, 40, 'portions', 8.50),
('990e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440006', 40, 15, 60, 'portions', 7.00),
('990e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440007', 20, 5, 30, 'portions', 9.50),
('990e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440008', 35, 10, 50, 'portions', 4.00),
('990e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440009', 30, 8, 45, 'portions', 4.50),
('990e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440010', 100, 20, 150, 'bottles', 1.00),
('990e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440011', 200, 50, 300, 'cups', 0.50),
('990e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440012', 50, 10, 80, 'glasses', 2.50)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- INITIAL INVENTORY MOVEMENTS
-- ==============================================
INSERT INTO inventory_movements (inventory_id, movement_type, quantity, previous_stock, new_stock, reason, performed_by) VALUES
('990e8400-e29b-41d4-a716-446655440000', 'in', 50, 0, 50, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000'),
('990e8400-e29b-41d4-a716-446655440001', 'in', 20, 0, 20, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000'),
('990e8400-e29b-41d4-a716-446655440002', 'in', 15, 0, 15, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000'),
('990e8400-e29b-41d4-a716-446655440003', 'in', 25, 0, 25, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000'),
('990e8400-e29b-41d4-a716-446655440004', 'in', 30, 0, 30, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000'),
('990e8400-e29b-41d4-a716-446655440005', 'in', 25, 0, 25, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000'),
('990e8400-e29b-41d4-a716-446655440006', 'in', 40, 0, 40, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000'),
('990e8400-e29b-41d4-a716-446655440007', 'in', 20, 0, 20, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000'),
('990e8400-e29b-41d4-a716-446655440008', 'in', 35, 0, 35, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000'),
('990e8400-e29b-41d4-a716-446655440009', 'in', 30, 0, 30, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000'),
('990e8400-e29b-41d4-a716-446655440010', 'in', 100, 0, 100, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000'),
('990e8400-e29b-41d4-a716-446655440011', 'in', 200, 0, 200, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000'),
('990e8400-e29b-41d4-a716-446655440012', 'in', 50, 0, 50, 'Initial stock', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- UPDATE SEQUENCES (if needed)
-- ==============================================
-- This ensures that auto-generated IDs don't conflict with our seeded data
-- PostgreSQL uses UUIDs so this is not necessary, but kept for reference

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================
-- Uncomment these to verify the data was inserted correctly

-- SELECT 'Users created:' as info, COUNT(*) as count FROM users;
-- SELECT 'Categories created:' as info, COUNT(*) as count FROM categories;
-- SELECT 'Products created:' as info, COUNT(*) as count FROM products;
-- SELECT 'Tables created:' as info, COUNT(*) as count FROM restaurant_tables;
-- SELECT 'Inventory items created:' as info, COUNT(*) as count FROM inventory;
-- SELECT 'Inventory movements created:' as info, COUNT(*) as count FROM inventory_movements;