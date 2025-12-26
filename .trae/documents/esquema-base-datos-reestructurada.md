# Esquema de Base de Datos Reestructurada - Sistema PAMBAZO

## 1. Diseño de Base de Datos

### 1.1 Principios de Diseño
- **Normalización**: Tercera forma normal (3NF) para evitar redundancia
- **Integridad Referencial**: Uso de foreign keys y constraints
- **Escalabilidad**: Diseño preparado para crecimiento
- **Auditoría**: Tracking completo de cambios
- **Rendimiento**: Índices optimizados para consultas frecuentes

### 1.2 Convenciones de Nomenclatura
- Tablas: `snake_case` en plural (ej: `users`, `order_items`)
- Columnas: `snake_case` (ej: `created_at`, `user_id`)
- Índices: `idx_table_column` (ej: `idx_users_email`)
- Foreign Keys: `fk_table_column` (ej: `fk_orders_user_id`)
- Constraints: `chk_table_condition` (ej: `chk_users_role`)

## 2. Definición de Tablas

### 2.1 Tabla: users
```sql
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

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 2.2 Tabla: categories
```sql
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

-- Índices
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_is_active ON categories(is_active);
```

### 2.3 Tabla: products
```sql
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

-- Índices
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_price ON products(price);
```

### 2.4 Tabla: product_ingredients
```sql
CREATE TABLE product_ingredients (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,
    is_allergen BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_product_ingredients_product_id ON product_ingredients(product_id);
CREATE INDEX idx_product_ingredients_allergen ON product_ingredients(is_allergen);
```

### 2.5 Tabla: tables
```sql
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

-- Índices
CREATE INDEX idx_tables_number ON tables(number);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_tables_assigned_waiter ON tables(assigned_waiter_id);
```

### 2.6 Tabla: orders
```sql
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

-- Índices
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_created_by ON orders(created_by);
```

### 2.7 Tabla: order_items
```sql
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

-- Índices
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_status ON order_items(status);
```

### 2.8 Tabla: inventory
```sql
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

-- Índices
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_current_stock ON inventory(current_stock);
CREATE INDEX idx_inventory_low_stock ON inventory(current_stock, min_stock) 
    WHERE current_stock <= min_stock;
CREATE INDEX idx_inventory_last_updated ON inventory(last_updated);
```

### 2.9 Tabla: suppliers
```sql
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

-- Índices
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
```

### 2.10 Tabla: inventory_entries
```sql
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

-- Índices
CREATE INDEX idx_inventory_entries_inventory_id ON inventory_entries(inventory_id);
CREATE INDEX idx_inventory_entries_supplier_id ON inventory_entries(supplier_id);
CREATE INDEX idx_inventory_entries_entry_type ON inventory_entries(entry_type);
CREATE INDEX idx_inventory_entries_created_at ON inventory_entries(created_at);
CREATE INDEX idx_inventory_entries_expiry_date ON inventory_entries(expiry_date);
```

### 2.11 Tabla: table_reservations
```sql
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

-- Índices
CREATE INDEX idx_table_reservations_table_id ON table_reservations(table_id);
CREATE INDEX idx_table_reservations_date ON table_reservations(reservation_date);
CREATE INDEX idx_table_reservations_status ON table_reservations(status);
CREATE INDEX idx_table_reservations_customer_phone ON table_reservations(customer_phone);
```

### 2.12 Tabla: audit_logs
```sql
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

-- Índices
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 2.13 Tabla: notifications
```sql
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

-- Índices
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## 3. Triggers y Funciones

### 3.1 Función para actualizar updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 3.2 Triggers para updated_at
```sql
-- Aplicar a todas las tablas que tengan updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at 
    BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_table_reservations_updated_at 
    BEFORE UPDATE ON table_reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.3 Función para auditoría automática
```sql
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
```

### 3.4 Función para generar número de orden
```sql
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                       LPAD(NEXTVAL('order_number_seq')::text, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear secuencia para números de orden
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger para generar número de orden automáticamente
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();
```

### 3.5 Función para actualizar stock automáticamente
```sql
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
```

## 4. Vistas Útiles

### 4.1 Vista de productos con inventario
```sql
CREATE VIEW products_with_inventory AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.cost,
    p.image_url,
    p.is_active,
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
```

### 4.2 Vista de órdenes con detalles
```sql
CREATE VIEW orders_with_details AS
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
```

### 4.3 Vista de dashboard de ventas
```sql
CREATE VIEW sales_dashboard AS
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
```

## 5. Datos Iniciales

### 5.1 Usuario Propietario por Defecto
```sql
-- Insertar usuario propietario (contraseña: admin123)
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
) ON CONFLICT (email) DO NOTHING;
```

### 5.2 Categorías Iniciales
```sql
INSERT INTO categories (name, description, sort_order) VALUES
('Panes', 'Variedad de panes frescos y tradicionales', 1),
('Pasteles', 'Pasteles y tortas para ocasiones especiales', 2),
('Galletas', 'Galletas caseras y tradicionales', 3),
('Bebidas', 'Bebidas calientes y frías', 4),
('Especiales', 'Productos especiales de la casa', 5)
ON CONFLICT (name) DO NOTHING;
```

### 5.3 Mesas Iniciales
```sql
INSERT INTO tables (number, capacity, location) VALUES
(1, 2, 'Ventana frontal'),
(2, 4, 'Centro del salón'),
(3, 4, 'Cerca de la cocina'),
(4, 6, 'Mesa familiar'),
(5, 2, 'Terraza'),
(6, 8, 'Sala privada')
ON CONFLICT (number) DO NOTHING;
```

## 6. Optimizaciones de Rendimiento

### 6.1 Índices Compuestos
```sql
-- Para consultas frecuentes de órdenes por fecha y estado
CREATE INDEX idx_orders_date_status ON orders(DATE(created_at), status);

-- Para búsquedas de productos por categoría y estado
CREATE INDEX idx_products_category_active ON products(category_id, is_active);

-- Para consultas de inventario con stock bajo
CREATE INDEX idx_inventory_low_stock_alert ON inventory(current_stock, min_stock) 
WHERE current_stock <= min_stock;
```

### 6.2 Particionamiento (para tablas grandes)
```sql
-- Particionar audit_logs por mes
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE audit_logs_y2024m02 PARTITION OF audit_logs
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

## 7. Políticas de Seguridad

### 7.1 Row Level Security (RLS)
```sql
-- Habilitar RLS en tablas sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propios datos
CREATE POLICY user_own_data ON users
FOR ALL TO authenticated_user
USING (id = current_user_id());

-- Política para órdenes basada en roles
CREATE POLICY order_access ON orders
FOR ALL TO authenticated_user
USING (
    current_user_role() IN ('owner', 'admin') OR
    created_by = current_user_id() OR
    assigned_to = current_user_id()
);
```

### 7.2 Funciones de Seguridad
```sql
-- Función para obtener el ID del usuario actual
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('app.current_user_role', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```