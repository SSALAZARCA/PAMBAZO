-- =====================================================
-- TRIGGERS Y FUNCIONES - ESQUEMA REESTRUCTURADO PAMBAZO
-- Versión: 1.0
-- Fecha: 2025-10-02
-- Descripción: Creación de triggers y funciones del sistema
-- =====================================================

-- =====================================================
-- 1. FUNCIÓN PARA ACTUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 2. TRIGGERS PARA updated_at
-- =====================================================

-- Trigger para users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tables
DROP TRIGGER IF EXISTS update_tables_updated_at ON tables;
CREATE TRIGGER update_tables_updated_at 
    BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para suppliers
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para table_reservations
DROP TRIGGER IF EXISTS update_table_reservations_updated_at ON table_reservations;
CREATE TRIGGER update_table_reservations_updated_at 
    BEFORE UPDATE ON table_reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. FUNCIÓN PARA AUDITORÍA AUTOMÁTICA
-- =====================================================
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values)
        VALUES (TG_TABLE_NAME, OLD.id::text, TG_OP, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id::text, TG_OP, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values)
        VALUES (TG_TABLE_NAME, NEW.id::text, TG_OP, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- =====================================================
-- 4. TRIGGERS DE AUDITORÍA PARA TABLAS CRÍTICAS
-- =====================================================

-- Auditoría para users
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Auditoría para orders
DROP TRIGGER IF EXISTS audit_orders_trigger ON orders;
CREATE TRIGGER audit_orders_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Auditoría para products
DROP TRIGGER IF EXISTS audit_products_trigger ON products;
CREATE TRIGGER audit_products_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Auditoría para inventory
DROP TRIGGER IF EXISTS audit_inventory_trigger ON inventory;
CREATE TRIGGER audit_inventory_trigger
    AFTER INSERT OR UPDATE OR DELETE ON inventory
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- 5. FUNCIÓN PARA GENERAR NÚMERO DE ORDEN
-- =====================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Generar número de orden único: ORD-YYYYMMDD-NNNN
    NEW.order_number = 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                       LPAD(NEXTVAL('order_number_seq')::text, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear secuencia para números de orden
DROP SEQUENCE IF EXISTS order_number_seq;
CREATE SEQUENCE order_number_seq START 1;

-- Trigger para generar número de orden automáticamente
DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- 6. FUNCIÓN PARA ACTUALIZAR STOCK AUTOMÁTICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Sumar al stock cuando se agrega una entrada
        UPDATE inventory 
        SET current_stock = current_stock + NEW.quantity,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = NEW.inventory_id;
        
        RAISE NOTICE 'Stock actualizado: +% unidades para inventory_id %', NEW.quantity, NEW.inventory_id;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Ajustar stock basado en la diferencia
        UPDATE inventory 
        SET current_stock = current_stock - OLD.quantity + NEW.quantity,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = NEW.inventory_id;
        
        RAISE NOTICE 'Stock ajustado: % unidades para inventory_id %', (NEW.quantity - OLD.quantity), NEW.inventory_id;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Restar del stock cuando se elimina una entrada
        UPDATE inventory 
        SET current_stock = current_stock - OLD.quantity,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = OLD.inventory_id;
        
        RAISE NOTICE 'Stock reducido: -% unidades para inventory_id %', OLD.quantity, OLD.inventory_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para actualizar stock automáticamente
DROP TRIGGER IF EXISTS update_inventory_stock_trigger ON inventory_entries;
CREATE TRIGGER update_inventory_stock_trigger
    AFTER INSERT OR UPDATE OR DELETE ON inventory_entries
    FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

-- =====================================================
-- 7. FUNCIÓN PARA CALCULAR TOTALES DE ORDEN
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    order_subtotal DECIMAL(10,2);
    order_tax DECIMAL(10,2);
    order_total DECIMAL(10,2);
    tax_rate DECIMAL(5,4) := 0.16; -- 16% IVA México
BEGIN
    -- Calcular subtotal de la orden
    SELECT COALESCE(SUM(total_price), 0) 
    INTO order_subtotal
    FROM order_items 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- Calcular impuestos
    order_tax := order_subtotal * tax_rate;
    
    -- Calcular total
    order_total := order_subtotal + order_tax;
    
    -- Actualizar la orden
    UPDATE orders 
    SET 
        subtotal = order_subtotal,
        tax_amount = order_tax,
        total_amount = order_total,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RAISE NOTICE 'Totales actualizados para orden %: Subtotal=%, Tax=%, Total=%', 
                 COALESCE(NEW.order_id, OLD.order_id), order_subtotal, order_tax, order_total;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para calcular totales automáticamente
DROP TRIGGER IF EXISTS calculate_order_totals_trigger ON order_items;
CREATE TRIGGER calculate_order_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION calculate_order_totals();

-- =====================================================
-- 8. FUNCIÓN PARA VALIDAR STOCK ANTES DE ORDEN
-- =====================================================
CREATE OR REPLACE FUNCTION validate_stock_before_order()
RETURNS TRIGGER AS $$
DECLARE
    available_stock INTEGER;
    product_name VARCHAR(200);
BEGIN
    -- Obtener stock disponible y nombre del producto
    SELECT i.current_stock, p.name
    INTO available_stock, product_name
    FROM inventory i
    JOIN products p ON i.product_id = p.id
    WHERE i.product_id = NEW.product_id;
    
    -- Verificar si hay suficiente stock
    IF available_stock IS NULL THEN
        RAISE EXCEPTION 'Producto % no tiene inventario configurado', product_name;
    END IF;
    
    IF available_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Stock insuficiente para %: disponible %, solicitado %', 
                        product_name, available_stock, NEW.quantity;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para validar stock antes de agregar items a orden
DROP TRIGGER IF EXISTS validate_stock_trigger ON order_items;
CREATE TRIGGER validate_stock_trigger
    BEFORE INSERT OR UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION validate_stock_before_order();

-- =====================================================
-- 9. FUNCIÓN PARA GENERAR QR CODE PARA MESAS
-- =====================================================
CREATE OR REPLACE FUNCTION generate_table_qr_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Generar código QR único para la mesa
    NEW.qr_code = 'QR-TABLE-' || NEW.number || '-' || 
                  EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::bigint;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para generar QR code automáticamente
DROP TRIGGER IF EXISTS generate_table_qr_trigger ON tables;
CREATE TRIGGER generate_table_qr_trigger
    BEFORE INSERT ON tables
    FOR EACH ROW EXECUTE FUNCTION generate_table_qr_code();

-- =====================================================
-- 10. FUNCIÓN PARA NOTIFICACIONES AUTOMÁTICAS
-- =====================================================
CREATE OR REPLACE FUNCTION create_automatic_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificación para stock bajo
    IF TG_TABLE_NAME = 'inventory' AND NEW.current_stock <= NEW.min_stock THEN
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
            'low_stock',
            'Stock Bajo',
            'El producto tiene stock bajo: ' || NEW.current_stock || ' unidades restantes',
            'high',
            jsonb_build_object(
                'inventory_id', NEW.id,
                'product_id', NEW.product_id,
                'current_stock', NEW.current_stock,
                'min_stock', NEW.min_stock
            )
        FROM users u 
        WHERE u.role IN ('owner', 'admin') AND u.is_active = true;
    END IF;
    
    -- Notificación para nueva orden
    IF TG_TABLE_NAME = 'orders' AND TG_OP = 'INSERT' THEN
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
            'new_order',
            'Nueva Orden',
            'Nueva orden recibida: ' || NEW.order_number,
            'medium',
            jsonb_build_object(
                'order_id', NEW.id,
                'order_number', NEW.order_number,
                'table_id', NEW.table_id,
                'total_amount', NEW.total_amount
            )
        FROM users u 
        WHERE u.role IN ('kitchen', 'waiter') AND u.is_active = true;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para notificaciones automáticas
DROP TRIGGER IF EXISTS inventory_notifications_trigger ON inventory;
CREATE TRIGGER inventory_notifications_trigger
    AFTER UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION create_automatic_notifications();

DROP TRIGGER IF EXISTS order_notifications_trigger ON orders;
CREATE TRIGGER order_notifications_trigger
    AFTER INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION create_automatic_notifications();

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Triggers y funciones creados exitosamente';
    RAISE NOTICE 'Funciones: update_updated_at_column, audit_trigger_function, generate_order_number, update_inventory_stock, calculate_order_totals, validate_stock_before_order, generate_table_qr_code, create_automatic_notifications';
    RAISE NOTICE 'Triggers aplicados a todas las tablas correspondientes';
    RAISE NOTICE 'Sistema de auditoría y notificaciones automáticas activado';
END $$;