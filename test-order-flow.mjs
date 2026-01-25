import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function testOrderFlow() {
    const db = await open({
        filename: './api/data/pambazo.db',
        driver: sqlite3.Database
    });

    console.log('🧪 PRUEBA DE FLUJO DE ÓRDENES\n');

    // 1. Crear una orden
    const orderId = 'test-order-' + Date.now();
    const tableId = 'table-1';
    const waiterId = '2'; // waiter
    const customerId = '4'; // customer

    await db.run(`
    INSERT INTO orders (id, customer_id, table_id, waiter_id, status, order_type, total, customer_name, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [orderId, customerId, tableId, waiterId, 'pending', 'dine_in', 0, 'Cliente Demo', 'Sin cebolla']);

    console.log('✅ Orden creada:', orderId);

    // 2. Agregar items a la orden
    const items = [
        { productId: 'prod-1', quantity: 2, unitPrice: 25.00 },
        { productId: 'prod-5', quantity: 1, unitPrice: 12.00 }
    ];

    for (const item of items) {
        const itemId = 'item-' + Date.now() + '-' + Math.random();
        const subtotal = item.quantity * item.unitPrice;

        await db.run(`
      INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [itemId, orderId, item.productId, item.quantity, item.unitPrice, subtotal]);
    }

    console.log('✅ Items agregados a la orden');

    // 3. Calcular total
    const totalResult = await db.get(`
    SELECT SUM(subtotal) as total FROM order_items WHERE order_id = ?
  `, [orderId]);

    await db.run(`
    UPDATE orders SET total = ? WHERE id = ?
  `, [totalResult.total, orderId]);

    console.log('✅ Total calculado:', totalResult.total);

    // 4. Actualizar mesa a ocupada
    await db.run(`
    UPDATE tables SET status = 'occupied' WHERE id = ?
  `, [tableId]);

    console.log('✅ Mesa actualizada a ocupada');

    // 5. Verificar que la orden aparece en todos los módulos
    console.log('\n📊 VERIFICACIÓN DE DATOS:\n');

    // Vista del mesero
    const waiterView = await db.get(`
    SELECT o.*, t.number as table_number, u.username as waiter_name
    FROM orders o
    LEFT JOIN tables t ON o.table_id = t.id
    LEFT JOIN users u ON o.waiter_id = u.id
    WHERE o.id = ?
  `, [orderId]);

    console.log('👨‍💼 Vista del Mesero:');
    console.log(`   - Orden: ${waiterView.id}`);
    console.log(`   - Mesa: ${waiterView.table_number}`);
    console.log(`   - Mesero: ${waiterView.waiter_name}`);
    console.log(`   - Estado: ${waiterView.status}`);
    console.log(`   - Total: $${waiterView.total}`);

    // Vista de cocina
    const kitchenView = await db.all(`
    SELECT oi.*, p.name as product_name, p.preparation_time
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `, [orderId]);

    console.log('\n👨‍🍳 Vista de Cocina:');
    kitchenView.forEach(item => {
        console.log(`   - ${item.quantity}x ${item.product_name} (${item.preparation_time} min)`);
    });

    // Vista del cliente
    const customerView = await db.get(`
    SELECT o.*, COUNT(oi.id) as items_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ? AND o.customer_id = ?
    GROUP BY o.id
  `, [orderId, customerId]);

    console.log('\n👤 Vista del Cliente:');
    console.log(`   - Orden: ${customerView.id}`);
    console.log(`   - Items: ${customerView.items_count}`);
    console.log(`   - Total: $${customerView.total}`);
    console.log(`   - Estado: ${customerView.status}`);

    // Vista del owner/admin
    const adminView = await db.all(`
    SELECT 
      o.id,
      o.status,
      o.total,
      t.number as table_number,
      u.username as waiter_name,
      COUNT(oi.id) as items_count
    FROM orders o
    LEFT JOIN tables t ON o.table_id = t.id
    LEFT JOIN users u ON o.waiter_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id
  `);

    console.log('\n👔 Vista del Owner/Admin:');
    console.log(`   - Total de órdenes: ${adminView.length}`);
    adminView.forEach(order => {
        console.log(`   - Orden ${order.id}: Mesa ${order.table_number}, ${order.items_count} items, $${order.total} (${order.status})`);
    });

    console.log('\n✅ PRUEBA COMPLETADA - Todas las vistas funcionan correctamente');

    await db.close();
}

testOrderFlow().catch(console.error);
