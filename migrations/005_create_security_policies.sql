-- =====================================================
-- POLÍTICAS DE SEGURIDAD RLS - ESQUEMA REESTRUCTURADO PAMBAZO
-- Versión: 1.0
-- Fecha: 2025-10-02
-- Descripción: Row Level Security y políticas de acceso
-- =====================================================

-- =====================================================
-- 1. FUNCIONES DE SEGURIDAD
-- =====================================================

-- Función para obtener el ID del usuario actual
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
    SELECT COALESCE(
        current_setting('request.jwt.claims', true)::json->>'user_id',
        current_setting('app.current_user_id', true)
    )::UUID;
$$;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION auth.current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
    SELECT COALESCE(
        current_setting('request.jwt.claims', true)::json->>'role',
        current_setting('app.current_user_role', true),
        'anon'
    );
$$;

-- Función para verificar si el usuario es propietario o admin
CREATE OR REPLACE FUNCTION auth.is_admin_or_owner()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT auth.current_user_role() IN ('owner', 'admin');
$$;

-- Función para verificar si el usuario puede gestionar órdenes
CREATE OR REPLACE FUNCTION auth.can_manage_orders()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT auth.current_user_role() IN ('owner', 'admin', 'waiter', 'kitchen');
$$;

-- Función para verificar si el usuario puede ver reportes
CREATE OR REPLACE FUNCTION auth.can_view_reports()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT auth.current_user_role() IN ('owner', 'admin');
$$;

-- =====================================================
-- 2. HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. POLÍTICAS PARA TABLA USERS
-- =====================================================

-- Los usuarios pueden ver su propia información
CREATE POLICY "users_select_own" ON users
    FOR SELECT
    USING (id = auth.current_user_id());

-- Admins y owners pueden ver todos los usuarios
CREATE POLICY "users_select_admin" ON users
    FOR SELECT
    USING (auth.is_admin_or_owner());

-- Solo admins y owners pueden crear usuarios
CREATE POLICY "users_insert_admin" ON users
    FOR INSERT
    WITH CHECK (auth.is_admin_or_owner());

-- Los usuarios pueden actualizar su propia información (excepto rol)
CREATE POLICY "users_update_own" ON users
    FOR UPDATE
    USING (id = auth.current_user_id())
    WITH CHECK (
        id = auth.current_user_id() 
        AND (OLD.role = NEW.role OR auth.is_admin_or_owner())
    );

-- Solo admins y owners pueden actualizar cualquier usuario
CREATE POLICY "users_update_admin" ON users
    FOR UPDATE
    USING (auth.is_admin_or_owner());

-- Solo owners pueden eliminar usuarios
CREATE POLICY "users_delete_owner" ON users
    FOR DELETE
    USING (auth.current_user_role() = 'owner');

-- =====================================================
-- 4. POLÍTICAS PARA TABLA CATEGORIES
-- =====================================================

-- Todos pueden ver categorías activas
CREATE POLICY "categories_select_all" ON categories
    FOR SELECT
    USING (is_active = true OR auth.can_manage_orders());

-- Solo admins y owners pueden gestionar categorías
CREATE POLICY "categories_insert_admin" ON categories
    FOR INSERT
    WITH CHECK (auth.is_admin_or_owner());

CREATE POLICY "categories_update_admin" ON categories
    FOR UPDATE
    USING (auth.is_admin_or_owner());

CREATE POLICY "categories_delete_admin" ON categories
    FOR DELETE
    USING (auth.is_admin_or_owner());

-- =====================================================
-- 5. POLÍTICAS PARA TABLA PRODUCTS
-- =====================================================

-- Todos pueden ver productos activos
CREATE POLICY "products_select_active" ON products
    FOR SELECT
    USING (is_active = true OR auth.can_manage_orders());

-- Solo admins y owners pueden gestionar productos
CREATE POLICY "products_insert_admin" ON products
    FOR INSERT
    WITH CHECK (auth.is_admin_or_owner());

CREATE POLICY "products_update_admin" ON products
    FOR UPDATE
    USING (auth.is_admin_or_owner());

CREATE POLICY "products_delete_admin" ON products
    FOR DELETE
    USING (auth.is_admin_or_owner());

-- =====================================================
-- 6. POLÍTICAS PARA TABLA TABLES
-- =====================================================

-- Todos pueden ver mesas activas
CREATE POLICY "tables_select_active" ON tables
    FOR SELECT
    USING (is_active = true OR auth.can_manage_orders());

-- Solo admins y owners pueden gestionar mesas
CREATE POLICY "tables_insert_admin" ON tables
    FOR INSERT
    WITH CHECK (auth.is_admin_or_owner());

CREATE POLICY "tables_update_admin" ON tables
    FOR UPDATE
    USING (auth.is_admin_or_owner());

CREATE POLICY "tables_delete_admin" ON tables
    FOR DELETE
    USING (auth.is_admin_or_owner());

-- =====================================================
-- 7. POLÍTICAS PARA TABLA ORDERS
-- =====================================================

-- Los usuarios pueden ver órdenes que crearon o les fueron asignadas
CREATE POLICY "orders_select_own" ON orders
    FOR SELECT
    USING (
        created_by = auth.current_user_id() 
        OR assigned_to = auth.current_user_id()
        OR auth.is_admin_or_owner()
    );

-- Personal autorizado puede crear órdenes
CREATE POLICY "orders_insert_staff" ON orders
    FOR INSERT
    WITH CHECK (auth.can_manage_orders());

-- Los usuarios pueden actualizar órdenes que crearon o les fueron asignadas
CREATE POLICY "orders_update_own" ON orders
    FOR UPDATE
    USING (
        created_by = auth.current_user_id() 
        OR assigned_to = auth.current_user_id()
        OR auth.is_admin_or_owner()
    );

-- Solo admins y owners pueden eliminar órdenes
CREATE POLICY "orders_delete_admin" ON orders
    FOR DELETE
    USING (auth.is_admin_or_owner());

-- =====================================================
-- 8. POLÍTICAS PARA TABLA ORDER_ITEMS
-- =====================================================

-- Los usuarios pueden ver items de órdenes que pueden ver
CREATE POLICY "order_items_select_authorized" ON order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = order_id 
            AND (
                o.created_by = auth.current_user_id() 
                OR o.assigned_to = auth.current_user_id()
                OR auth.is_admin_or_owner()
            )
        )
    );

-- Personal autorizado puede gestionar items de órdenes
CREATE POLICY "order_items_insert_staff" ON order_items
    FOR INSERT
    WITH CHECK (
        auth.can_manage_orders()
        AND EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = order_id 
            AND (
                o.created_by = auth.current_user_id() 
                OR o.assigned_to = auth.current_user_id()
                OR auth.is_admin_or_owner()
            )
        )
    );

CREATE POLICY "order_items_update_staff" ON order_items
    FOR UPDATE
    USING (
        auth.can_manage_orders()
        AND EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = order_id 
            AND (
                o.created_by = auth.current_user_id() 
                OR o.assigned_to = auth.current_user_id()
                OR auth.is_admin_or_owner()
            )
        )
    );

CREATE POLICY "order_items_delete_staff" ON order_items
    FOR DELETE
    USING (
        auth.can_manage_orders()
        AND EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = order_id 
            AND (
                o.created_by = auth.current_user_id() 
                OR o.assigned_to = auth.current_user_id()
                OR auth.is_admin_or_owner()
            )
        )
    );

-- =====================================================
-- 9. POLÍTICAS PARA TABLA INVENTORY
-- =====================================================

-- Personal autorizado puede ver inventario
CREATE POLICY "inventory_select_staff" ON inventory
    FOR SELECT
    USING (auth.can_manage_orders());

-- Solo admins y owners pueden gestionar inventario
CREATE POLICY "inventory_insert_admin" ON inventory
    FOR INSERT
    WITH CHECK (auth.is_admin_or_owner());

CREATE POLICY "inventory_update_admin" ON inventory
    FOR UPDATE
    USING (auth.is_admin_or_owner());

CREATE POLICY "inventory_delete_admin" ON inventory
    FOR DELETE
    USING (auth.is_admin_or_owner());

-- =====================================================
-- 10. POLÍTICAS PARA TABLA SUPPLIERS
-- =====================================================

-- Solo admins y owners pueden gestionar proveedores
CREATE POLICY "suppliers_select_admin" ON suppliers
    FOR SELECT
    USING (auth.is_admin_or_owner());

CREATE POLICY "suppliers_insert_admin" ON suppliers
    FOR INSERT
    WITH CHECK (auth.is_admin_or_owner());

CREATE POLICY "suppliers_update_admin" ON suppliers
    FOR UPDATE
    USING (auth.is_admin_or_owner());

CREATE POLICY "suppliers_delete_admin" ON suppliers
    FOR DELETE
    USING (auth.is_admin_or_owner());

-- =====================================================
-- 11. POLÍTICAS PARA TABLA INVENTORY_ENTRIES
-- =====================================================

-- Solo admins y owners pueden gestionar entradas de inventario
CREATE POLICY "inventory_entries_select_admin" ON inventory_entries
    FOR SELECT
    USING (auth.is_admin_or_owner());

CREATE POLICY "inventory_entries_insert_admin" ON inventory_entries
    FOR INSERT
    WITH CHECK (auth.is_admin_or_owner());

CREATE POLICY "inventory_entries_update_admin" ON inventory_entries
    FOR UPDATE
    USING (auth.is_admin_or_owner());

CREATE POLICY "inventory_entries_delete_admin" ON inventory_entries
    FOR DELETE
    USING (auth.is_admin_or_owner());

-- =====================================================
-- 12. POLÍTICAS PARA TABLA TABLE_RESERVATIONS
-- =====================================================

-- Personal autorizado puede ver reservaciones
CREATE POLICY "reservations_select_staff" ON table_reservations
    FOR SELECT
    USING (auth.can_manage_orders());

-- Personal autorizado puede crear reservaciones
CREATE POLICY "reservations_insert_staff" ON table_reservations
    FOR INSERT
    WITH CHECK (auth.can_manage_orders());

-- Los usuarios pueden actualizar reservaciones que crearon
CREATE POLICY "reservations_update_own" ON table_reservations
    FOR UPDATE
    USING (
        created_by = auth.current_user_id()
        OR auth.is_admin_or_owner()
    );

-- Solo admins y owners pueden eliminar reservaciones
CREATE POLICY "reservations_delete_admin" ON table_reservations
    FOR DELETE
    USING (auth.is_admin_or_owner());

-- =====================================================
-- 13. POLÍTICAS PARA TABLA AUDIT_LOGS
-- =====================================================

-- Solo admins y owners pueden ver logs de auditoría
CREATE POLICY "audit_logs_select_admin" ON audit_logs
    FOR SELECT
    USING (auth.is_admin_or_owner());

-- Los logs se insertan automáticamente por triggers
CREATE POLICY "audit_logs_insert_system" ON audit_logs
    FOR INSERT
    WITH CHECK (true);

-- No se permite actualizar o eliminar logs de auditoría
-- (solo lectura para preservar integridad)

-- =====================================================
-- 14. POLÍTICAS PARA TABLA NOTIFICATIONS
-- =====================================================

-- Los usuarios pueden ver sus propias notificaciones
CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT
    USING (
        user_id = auth.current_user_id()
        OR auth.is_admin_or_owner()
    );

-- Personal autorizado puede crear notificaciones
CREATE POLICY "notifications_insert_staff" ON notifications
    FOR INSERT
    WITH CHECK (auth.can_manage_orders());

-- Los usuarios pueden actualizar sus propias notificaciones (marcar como leídas)
CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE
    USING (
        user_id = auth.current_user_id()
        OR auth.is_admin_or_owner()
    )
    WITH CHECK (
        user_id = auth.current_user_id()
        OR auth.is_admin_or_owner()
    );

-- Solo admins y owners pueden eliminar notificaciones
CREATE POLICY "notifications_delete_admin" ON notifications
    FOR DELETE
    USING (auth.is_admin_or_owner());

-- =====================================================
-- 15. POLÍTICAS PARA INGREDIENTES DE PRODUCTOS
-- =====================================================

-- Todos pueden ver ingredientes de productos activos
CREATE POLICY "product_ingredients_select_all" ON product_ingredients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM products p 
            WHERE p.id = product_id 
            AND (p.is_active = true OR auth.can_manage_orders())
        )
    );

-- Solo admins y owners pueden gestionar ingredientes
CREATE POLICY "product_ingredients_insert_admin" ON product_ingredients
    FOR INSERT
    WITH CHECK (auth.is_admin_or_owner());

CREATE POLICY "product_ingredients_update_admin" ON product_ingredients
    FOR UPDATE
    USING (auth.is_admin_or_owner());

CREATE POLICY "product_ingredients_delete_admin" ON product_ingredients
    FOR DELETE
    USING (auth.is_admin_or_owner());

-- =====================================================
-- 16. OTORGAR PERMISOS BÁSICOS A ROLES
-- =====================================================

-- Permisos para rol anónimo (acceso público limitado)
GRANT SELECT ON categories TO anon;
GRANT SELECT ON products TO anon;
GRANT SELECT ON tables TO anon;

-- Permisos para rol autenticado
GRANT ALL ON users TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON product_ingredients TO authenticated;
GRANT ALL ON tables TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT ALL ON inventory TO authenticated;
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON inventory_entries TO authenticated;
GRANT ALL ON table_reservations TO authenticated;
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT ALL ON notifications TO authenticated;

-- Permisos para secuencias
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =====================================================
-- 17. FUNCIÓN PARA CONFIGURAR CONTEXTO DE USUARIO
-- =====================================================

CREATE OR REPLACE FUNCTION auth.set_user_context(user_id UUID, user_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Configurar el contexto del usuario para las políticas RLS
    PERFORM set_config('app.current_user_id', user_id::TEXT, true);
    PERFORM set_config('app.current_user_role', user_role, true);
END;
$$;

-- =====================================================
-- 18. FUNCIÓN PARA LIMPIAR CONTEXTO DE USUARIO
-- =====================================================

CREATE OR REPLACE FUNCTION auth.clear_user_context()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Limpiar el contexto del usuario
    PERFORM set_config('app.current_user_id', '', true);
    PERFORM set_config('app.current_user_role', 'anon', true);
END;
$$;

-- =====================================================
-- 19. FUNCIÓN PARA VERIFICAR PERMISOS DE TABLA
-- =====================================================

CREATE OR REPLACE FUNCTION auth.check_table_permission(table_name TEXT, operation TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    user_role := auth.current_user_role();
    
    -- Owners y admins tienen acceso completo
    IF user_role IN ('owner', 'admin') THEN
        RETURN true;
    END IF;
    
    -- Verificar permisos específicos por tabla y operación
    CASE table_name
        WHEN 'orders', 'order_items', 'tables', 'table_reservations' THEN
            RETURN user_role IN ('waiter', 'kitchen');
        WHEN 'products', 'categories' THEN
            RETURN operation = 'SELECT' OR user_role IN ('waiter', 'kitchen');
        WHEN 'inventory', 'suppliers', 'inventory_entries' THEN
            RETURN operation = 'SELECT' AND user_role IN ('waiter', 'kitchen');
        WHEN 'users' THEN
            RETURN operation = 'SELECT';
        ELSE
            RETURN false;
    END CASE;
END;
$$;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Políticas de seguridad RLS configuradas exitosamente:';
    RAISE NOTICE '- Funciones de autenticación y autorización creadas';
    RAISE NOTICE '- RLS habilitado en todas las tablas';
    RAISE NOTICE '- Políticas específicas por rol implementadas';
    RAISE NOTICE '- Permisos básicos otorgados a roles anon y authenticated';
    RAISE NOTICE '- Funciones de contexto de usuario configuradas';
    RAISE NOTICE 'Sistema de seguridad listo para usar';
END $$;