-- =====================================================
-- MIGRACIÓN 002: Triggers y Funciones del Sistema
-- Sistema PAMBAZO - Reestructuración Completa
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
-- 2. TRIGGERS PARA updated_at EN TODAS LAS TABLAS
-- =====================================================

-- Trigger para users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para categories
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para products
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tables
CREATE TRIGGER update_tables_updated_at 
    BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para orders
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para suppliers
CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para table_reservations
CREATE TRIGGER update_table_reservations_updated_at 
    BEFORE UPDATE ON table_reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. FUNCIÓN PARA GENERAR NÚMERO DE ORDEN
-- =====================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                       LPAD(NEXTVAL('order_number_seq')::text, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para generar número de orden automáticamente
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- 4. FUNCIÓN PARA AUDITORÍA AUTOMÁTICA
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
-- 5. TRIGGERS DE AUDITORÍA PARA TABLAS CRÍTICAS
-- =====================================================

-- Auditoría para users
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Auditoría para orders
CREATE TRIGGER audit_orders_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Auditoría para products
CREATE TRIGGER audit_products_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Auditoría para inventory
CREATE TRIGGER audit_inventory_trigger
    AFTER INSERT OR UPDATE OR DELETE ON inventory
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

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
    ELSIF TG_OP = 'UPDATE' THEN
        -- Ajustar stock basado en la diferencia
        UPDATE inventory 
        SET current_stock = current_stock - OLD.quantity + NEW.quantity,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = NEW.inventory_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Restar del stock cuando se elimina una entrada
        UPDATE inventory 
        SET current_stock = current_stock - OLD.quantity,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = OLD.inventory_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para actualizar stock automáticamente
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
    order_total DECIMAL(10,2);
BEGIN
    -- Calcular subtotal de la orden
    SELECT COALESCE(SUM(total_price), 0) INTO order_subtotal
    FROM order_items 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- Calcular total (subtotal + tax - discount)
    SELECT 
        order_subtotal + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0)
    INTO order_total
    FROM orders 
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- Actualizar la orden con los nuevos totales
    UPDATE orders 
    SET 
        subtotal = order_subtotal,
        total_amount = order_subtotal + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para calcular totales automáticamente
CREATE TRIGGER calculate_order_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION calculate_order_totals();

-- =====================================================
-- 8. FUNCIÓN PARA GENERAR QR CODE DE MESA
-- =====================================================
CREATE OR REPLACE FUNCTION generate_table_qr()
RETURNS TRIGGER AS $$
BEGIN
    -- Generar código QR único para la mesa
    NEW.qr_code = 'QR-TABLE-' || NEW.number || '-' || 
                  EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::bigint;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para generar QR automáticamente
CREATE TRIGGER generate_table_qr_trigger
    BEFORE INSERT ON tables
    FOR EACH ROW EXECUTE FUNCTION generate_table_qr();

-- =====================================================
-- 9. FUNCIÓN PARA VALIDAR RESERVACIONES
-- =====================================================
CREATE OR REPLACE FUNCTION validate_reservation()
RETURNS TRIGGER AS $$
DECLARE
    table_capacity INTEGER;
    conflicting_reservations INTEGER;
BEGIN
    -- Obtener capacidad de la mesa
    SELECT capacity INTO table_capacity
    FROM tables 
    WHERE id = NEW.table_id;
    
    -- Validar que el party_size no exceda la capacidad
    IF NEW.party_size > table_capacity THEN
        RAISE EXCEPTION 'El tamaño del grupo (%) excede la capacidad de la mesa (%)', 
                       NEW.party_size, table_capacity;
    END IF;
    
    -- Verificar conflictos de horario
    SELECT COUNT(*) INTO conflicting_reservations
    FROM table_reservations
    WHERE table_id = NEW.table_id
      AND reservation_date = NEW.reservation_date
      AND status NOT IN ('cancelled', 'completed', 'no_show')
      AND (
          -- Verificar solapamiento de horarios
          (reservation_time <= NEW.reservation_time AND 
           reservation_time + INTERVAL '1 minute' * duration_minutes > NEW.reservation_time)
          OR
          (NEW.reservation_time <= reservation_time AND 
           NEW.reservation_time + INTERVAL '1 minute' * NEW.duration_minutes > reservation_time)
      )
      AND (TG_OP = 'INSERT' OR id != NEW.id);
    
    IF conflicting_reservations > 0 THEN
        RAISE EXCEPTION 'Conflicto de horario: La mesa ya está reservada en ese horario';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para validar reservaciones
CREATE TRIGGER validate_reservation_trigger
    BEFORE INSERT OR UPDATE ON table_reservations
    FOR EACH ROW EXECUTE FUNCTION validate_reservation();

-- =====================================================
-- 10. FUNCIÓN PARA NOTIFICACIONES AUTOMÁTICAS
-- =====================================================
CREATE OR REPLACE FUNCTION create_low_stock_notification()
RETURNS TRIGGER AS $$
DECLARE
    product_name VARCHAR(200);
    admin_users UUID[];
BEGIN
    -- Solo procesar si el stock está bajo
    IF NEW.current_stock <= NEW.min_stock THEN
        -- Obtener nombre del producto
        SELECT name INTO product_name
        FROM products 
        WHERE id = NEW.product_id;
        
        -- Obtener usuarios admin y owner
        SELECT ARRAY_AGG(id) INTO admin_users
        FROM users 
        WHERE role IN ('admin', 'owner') AND is_active = true;
        
        -- Crear notificaciones para cada admin
        IF admin_users IS NOT NULL THEN
            INSERT INTO notifications (user_id, type, title, message, priority, data)
            SELECT 
                unnest(admin_users),
                'low_stock',
                'Stock Bajo: ' || product_name,
                'El producto "' || product_name || '" tiene stock bajo (' || NEW.current_stock || ' unidades). Mínimo requerido: ' || NEW.min_stock,
                'high',
                json_build_object(
                    'product_id', NEW.product_id,
                    'current_stock', NEW.current_stock,
                    'min_stock', NEW.min_stock
                )::jsonb;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para notificaciones de stock bajo
CREATE TRIGGER create_low_stock_notification_trigger
    AFTER UPDATE ON inventory
    FOR EACH ROW 
    WHEN (NEW.current_stock <= NEW.min_stock AND OLD.current_stock > OLD.min_stock)
    EXECUTE FUNCTION create_low_stock_notification();

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
SELECT 'Triggers y funciones creados exitosamente' AS status;