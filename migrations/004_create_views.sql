-- =====================================================
-- VISTAS ÚTILES - ESQUEMA REESTRUCTURADO PAMBAZO
-- Versión: 1.0
-- Fecha: 2025-10-02
-- Descripción: Vistas para consultas optimizadas
-- =====================================================

-- =====================================================
-- 1. VISTA: PRODUCTOS CON INVENTARIO
-- =====================================================
CREATE OR REPLACE VIEW products_with_inventory AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.cost,
    p.preparation_time,
    p.is_active,
    p.is_featured,
    p.image_url,
    c.name as category_name,
    c.id as category_id,
    COALESCE(i.current_stock, 0) as current_stock,
    COALESCE(i.min_stock, 0) as min_stock,
    COALESCE(i.max_stock, 0) as max_stock,
    i.unit,
    i.unit_cost,
    CASE 
        WHEN COALESCE(i.current_stock, 0) <= COALESCE(i.min_stock, 0) THEN 'low'
        WHEN COALESCE(i.current_stock, 0) >= COALESCE(i.max_stock, 100) THEN 'high'
        ELSE 'normal'
    END as stock_status,
    CASE 
        WHEN COALESCE(i.current_stock, 0) > 0 THEN true
        ELSE false
    END as in_stock,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN inventory i ON p.id = i.product_id
WHERE p.is_active = true
ORDER BY c.sort_order, p.name;

-- =====================================================
-- 2. VISTA: ÓRDENES CON DETALLES
-- =====================================================
CREATE OR REPLACE VIEW orders_with_details AS
SELECT 
    o.id,
    o.order_number,
    o.table_id,
    t.number as table_number,
    t.location as table_location,
    o.customer_name,
    o.customer_phone,
    o.status,
    o.order_type,
    o.subtotal,
    o.tax_amount,
    o.discount_amount,
    o.total_amount,
    o.payment_method,
    o.payment_status,
    o.notes,
    o.estimated_completion,
    o.completed_at,
    u_created.username as created_by_username,
    u_created.first_name as created_by_first_name,
    u_assigned.username as assigned_to_username,
    u_assigned.first_name as assigned_to_first_name,
    COUNT(oi.id) as total_items,
    SUM(oi.quantity) as total_quantity,
    o.created_at,
    o.updated_at,
    EXTRACT(EPOCH FROM (COALESCE(o.completed_at, CURRENT_TIMESTAMP) - o.created_at))/60 as duration_minutes
FROM orders o
LEFT JOIN tables t ON o.table_id = t.id
LEFT JOIN users u_created ON o.created_by = u_created.id
LEFT JOIN users u_assigned ON o.assigned_to = u_assigned.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY 
    o.id, o.order_number, o.table_id, t.number, t.location,
    o.customer_name, o.customer_phone, o.status, o.order_type,
    o.subtotal, o.tax_amount, o.discount_amount, o.total_amount,
    o.payment_method, o.payment_status, o.notes,
    o.estimated_completion, o.completed_at,
    u_created.username, u_created.first_name,
    u_assigned.username, u_assigned.first_name,
    o.created_at, o.updated_at
ORDER BY o.created_at DESC;

-- =====================================================
-- 3. VISTA: DASHBOARD DE VENTAS
-- =====================================================
CREATE OR REPLACE VIEW sales_dashboard AS
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_sales,
    AVG(o.total_amount) as average_order_value,
    SUM(CASE WHEN o.status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
    SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
    SUM(CASE WHEN o.order_type = 'dine_in' THEN 1 ELSE 0 END) as dine_in_orders,
    SUM(CASE WHEN o.order_type = 'takeout' THEN 1 ELSE 0 END) as takeout_orders,
    SUM(CASE WHEN o.order_type = 'delivery' THEN 1 ELSE 0 END) as delivery_orders,
    SUM(CASE WHEN o.payment_method = 'cash' THEN o.total_amount ELSE 0 END) as cash_sales,
    SUM(CASE WHEN o.payment_method = 'card' THEN o.total_amount ELSE 0 END) as card_sales,
    SUM(CASE WHEN o.payment_method = 'transfer' THEN o.total_amount ELSE 0 END) as transfer_sales,
    AVG(EXTRACT(EPOCH FROM (COALESCE(o.completed_at, CURRENT_TIMESTAMP) - o.created_at))/60) as avg_preparation_time
FROM orders o
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

-- =====================================================
-- 4. VISTA: PRODUCTOS MÁS VENDIDOS
-- =====================================================
CREATE OR REPLACE VIEW top_selling_products AS
SELECT 
    p.id,
    p.name,
    p.price,
    c.name as category_name,
    SUM(oi.quantity) as total_sold,
    SUM(oi.subtotal) as total_revenue,
    COUNT(DISTINCT oi.order_id) as orders_count,
    AVG(oi.quantity) as avg_quantity_per_order,
    RANK() OVER (ORDER BY SUM(oi.quantity) DESC) as sales_rank
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
JOIN categories c ON p.category_id = c.id
WHERE o.status = 'completed'
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, p.price, c.name
ORDER BY total_sold DESC
LIMIT 20;

-- =====================================================
-- 5. VISTA: ESTADO DE MESAS
-- =====================================================
CREATE OR REPLACE VIEW tables_status AS
SELECT 
    t.id,
    t.number,
    t.capacity,
    t.location,
    t.is_active,
    CASE 
        WHEN o.id IS NOT NULL AND o.status IN ('pending', 'preparing', 'ready') THEN 'occupied'
        WHEN tr.id IS NOT NULL AND tr.status = 'confirmed' 
             AND tr.reservation_date = CURRENT_DATE 
             AND tr.reservation_time BETWEEN CURRENT_TIME - INTERVAL '30 minutes' 
             AND CURRENT_TIME + INTERVAL '2 hours' THEN 'reserved'
        ELSE 'available'
    END as status,
    o.id as current_order_id,
    o.order_number as current_order_number,
    o.customer_name,
    o.total_amount as current_order_total,
    o.created_at as order_start_time,
    tr.id as reservation_id,
    tr.customer_name as reservation_customer,
    tr.reservation_date,
    tr.reservation_time,
    tr.party_size as reservation_party_size,
    t.qr_code,
    t.created_at,
    t.updated_at
FROM tables t
LEFT JOIN orders o ON t.id = o.table_id 
    AND o.status IN ('pending', 'preparing', 'ready')
LEFT JOIN table_reservations tr ON t.id = tr.table_id 
    AND tr.status = 'confirmed'
    AND tr.reservation_date = CURRENT_DATE
    AND tr.reservation_time BETWEEN CURRENT_TIME - INTERVAL '30 minutes' 
    AND CURRENT_TIME + INTERVAL '2 hours'
WHERE t.is_active = true
ORDER BY t.number;

-- =====================================================
-- 6. VISTA: INVENTARIO BAJO STOCK
-- =====================================================
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    p.id,
    p.name,
    c.name as category_name,
    i.current_stock,
    i.min_stock,
    i.max_stock,
    i.unit,
    i.unit_cost,
    (i.current_stock::DECIMAL / NULLIF(i.min_stock, 0)) * 100 as stock_percentage,
    CASE 
        WHEN i.current_stock = 0 THEN 'out_of_stock'
        WHEN i.current_stock <= i.min_stock * 0.5 THEN 'critical'
        WHEN i.current_stock <= i.min_stock THEN 'low'
        ELSE 'normal'
    END as urgency_level,
    i.updated_at as last_updated
FROM inventory i
JOIN products p ON i.product_id = p.id
JOIN categories c ON p.category_id = c.id
WHERE i.current_stock <= i.min_stock
    AND p.is_active = true
ORDER BY 
    CASE 
        WHEN i.current_stock = 0 THEN 1
        WHEN i.current_stock <= i.min_stock * 0.5 THEN 2
        ELSE 3
    END,
    (i.current_stock::DECIMAL / NULLIF(i.min_stock, 0));

-- =====================================================
-- 7. VISTA: RESUMEN FINANCIERO DIARIO
-- =====================================================
CREATE OR REPLACE VIEW daily_financial_summary AS
SELECT 
    DATE(o.created_at) as business_date,
    COUNT(o.id) as total_orders,
    SUM(o.subtotal) as gross_sales,
    SUM(o.tax_amount) as total_taxes,
    SUM(o.discount_amount) as total_discounts,
    SUM(o.total_amount) as net_sales,
    SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END) as collected_amount,
    SUM(CASE WHEN o.payment_status = 'pending' THEN o.total_amount ELSE 0 END) as pending_amount,
    -- Estimación de costos basada en productos vendidos
    SUM(oi.quantity * p.cost) as estimated_costs,
    SUM(o.total_amount) - SUM(oi.quantity * p.cost) as estimated_profit,
    CASE 
        WHEN SUM(o.total_amount) > 0 
        THEN ((SUM(o.total_amount) - SUM(oi.quantity * p.cost)) / SUM(o.total_amount)) * 100
        ELSE 0
    END as profit_margin_percentage
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.status = 'completed'
GROUP BY DATE(o.created_at)
ORDER BY business_date DESC;

-- =====================================================
-- 8. VISTA: ACTIVIDAD DE USUARIOS
-- =====================================================
CREATE OR REPLACE VIEW user_activity AS
SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    u.role,
    u.is_active,
    COUNT(DISTINCT o.id) as orders_created,
    COUNT(DISTINCT o2.id) as orders_assigned,
    SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END) as total_sales_generated,
    MAX(o.created_at) as last_order_created,
    MAX(o2.updated_at) as last_order_updated,
    u.last_login,
    u.created_at as user_since
FROM users u
LEFT JOIN orders o ON u.id = o.created_by
LEFT JOIN orders o2 ON u.id = o2.assigned_to
GROUP BY 
    u.id, u.username, u.first_name, u.last_name, 
    u.role, u.is_active, u.last_login, u.created_at
ORDER BY u.role, total_sales_generated DESC;

-- =====================================================
-- 9. VISTA: RESERVACIONES ACTIVAS
-- =====================================================
CREATE OR REPLACE VIEW active_reservations AS
SELECT 
    tr.id,
    tr.reservation_date,
    tr.reservation_time,
    tr.customer_name,
    tr.customer_phone,
    tr.customer_email,
    tr.party_size,
    tr.special_requests,
    tr.status,
    t.number as table_number,
    t.capacity as table_capacity,
    t.location as table_location,
    u.username as created_by_username,
    tr.created_at,
    tr.updated_at,
    CASE 
        WHEN tr.reservation_date = CURRENT_DATE 
             AND tr.reservation_time BETWEEN CURRENT_TIME - INTERVAL '30 minutes' 
             AND CURRENT_TIME + INTERVAL '30 minutes' THEN 'arriving_soon'
        WHEN tr.reservation_date = CURRENT_DATE 
             AND tr.reservation_time < CURRENT_TIME - INTERVAL '30 minutes' THEN 'overdue'
        WHEN tr.reservation_date = CURRENT_DATE 
             AND tr.reservation_time > CURRENT_TIME THEN 'today'
        WHEN tr.reservation_date > CURRENT_DATE THEN 'future'
        ELSE 'past'
    END as timing_status
FROM table_reservations tr
JOIN tables t ON tr.table_id = t.id
LEFT JOIN users u ON tr.created_by = u.id
WHERE tr.status IN ('confirmed', 'pending')
    AND tr.reservation_date >= CURRENT_DATE - INTERVAL '1 day'
ORDER BY tr.reservation_date, tr.reservation_time;

-- =====================================================
-- 10. VISTA: AUDITORÍA RECIENTE
-- =====================================================
CREATE OR REPLACE VIEW recent_audit_logs AS
SELECT 
    al.id,
    al.table_name,
    al.operation,
    al.old_values,
    al.new_values,
    al.changed_at,
    u.username as changed_by_username,
    u.first_name as changed_by_first_name,
    u.role as changed_by_role,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - al.changed_at))/3600 as hours_ago
FROM audit_logs al
LEFT JOIN users u ON al.changed_by = u.id
WHERE al.changed_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY al.changed_at DESC
LIMIT 100;

-- =====================================================
-- PERMISOS PARA LAS VISTAS
-- =====================================================

-- Otorgar permisos de lectura a roles autenticados
GRANT SELECT ON products_with_inventory TO authenticated;
GRANT SELECT ON orders_with_details TO authenticated;
GRANT SELECT ON sales_dashboard TO authenticated;
GRANT SELECT ON top_selling_products TO authenticated;
GRANT SELECT ON tables_status TO authenticated;
GRANT SELECT ON low_stock_products TO authenticated;
GRANT SELECT ON daily_financial_summary TO authenticated;
GRANT SELECT ON user_activity TO authenticated;
GRANT SELECT ON active_reservations TO authenticated;
GRANT SELECT ON recent_audit_logs TO authenticated;

-- Otorgar permisos limitados al rol anónimo (solo para consultas públicas)
GRANT SELECT ON products_with_inventory TO anon;
GRANT SELECT ON tables_status TO anon;

-- =====================================================
-- COMENTARIOS EN LAS VISTAS
-- =====================================================

COMMENT ON VIEW products_with_inventory IS 'Vista que combina productos con su información de inventario y estado de stock';
COMMENT ON VIEW orders_with_details IS 'Vista completa de órdenes con detalles de mesa, usuario y estadísticas';
COMMENT ON VIEW sales_dashboard IS 'Dashboard de ventas con métricas diarias agregadas';
COMMENT ON VIEW top_selling_products IS 'Productos más vendidos en los últimos 30 días';
COMMENT ON VIEW tables_status IS 'Estado actual de todas las mesas (disponible, ocupada, reservada)';
COMMENT ON VIEW low_stock_products IS 'Productos con inventario bajo o crítico';
COMMENT ON VIEW daily_financial_summary IS 'Resumen financiero diario con costos y ganancias estimadas';
COMMENT ON VIEW user_activity IS 'Actividad y rendimiento de usuarios del sistema';
COMMENT ON VIEW active_reservations IS 'Reservaciones activas y próximas con estado de timing';
COMMENT ON VIEW recent_audit_logs IS 'Logs de auditoría recientes para monitoreo de cambios';

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Vistas creadas exitosamente:';
    RAISE NOTICE '- products_with_inventory: Productos con inventario';
    RAISE NOTICE '- orders_with_details: Órdenes con detalles completos';
    RAISE NOTICE '- sales_dashboard: Dashboard de ventas';
    RAISE NOTICE '- top_selling_products: Productos más vendidos';
    RAISE NOTICE '- tables_status: Estado de mesas';
    RAISE NOTICE '- low_stock_products: Inventario bajo';
    RAISE NOTICE '- daily_financial_summary: Resumen financiero';
    RAISE NOTICE '- user_activity: Actividad de usuarios';
    RAISE NOTICE '- active_reservations: Reservaciones activas';
    RAISE NOTICE '- recent_audit_logs: Auditoría reciente';
    RAISE NOTICE 'Todas las vistas están listas para usar';
END $$;