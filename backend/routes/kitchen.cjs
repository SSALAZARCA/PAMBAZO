const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

// Helper para leer DB
async function readDB() {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
}

// Helper para escribir DB
async function writeDB(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// Helper para generar ID único
function generateId(prefix = 'order') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/kitchen/stats - Obtener estadísticas del día
router.get('/stats', async (req, res) => {
    try {
        const db = await readDB();
        const stats = db.kitchenStats || {
            date: new Date().toISOString().split('T')[0],
            pendingOrders: 0,
            inPreparation: 0,
            completedToday: 0,
            avgPrepTime: 0
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error getting kitchen stats:', error);
        res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
});

// GET /api/kitchen/orders - Obtener órdenes activas
router.get('/orders', async (req, res) => {
    try {
        const db = await readDB();
        const { status } = req.query;

        let orders = db.kitchenOrders || [];

        // Filtrar por estado si se proporciona
        if (status) {
            orders = orders.filter(o => o.status === status);
        }

        // Ordenar por prioridad y fecha de creación
        orders.sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            const priorityDiff = (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error getting kitchen orders:', error);
        res.status(500).json({ success: false, error: 'Error al obtener órdenes' });
    }
});

// PUT /api/kitchen/orders/:id/start - Iniciar preparación de una orden
router.put('/orders/:id/start', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await readDB();

        const orderIndex = db.kitchenOrders.findIndex(o => o.id === id);

        if (orderIndex === -1) {
            return res.status(404).json({ success: false, error: 'Orden no encontrada' });
        }

        const order = db.kitchenOrders[orderIndex];

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'La orden ya está en preparación o completada'
            });
        }

        // Actualizar orden
        db.kitchenOrders[orderIndex] = {
            ...order,
            status: 'preparing',
            startedAt: new Date().toISOString()
        };

        // Actualizar estadísticas
        if (db.kitchenStats) {
            db.kitchenStats.pendingOrders = Math.max(0, (db.kitchenStats.pendingOrders || 0) - 1);
            db.kitchenStats.inPreparation = (db.kitchenStats.inPreparation || 0) + 1;
        }

        await writeDB(db);

        res.json({ success: true, data: db.kitchenOrders[orderIndex] });
    } catch (error) {
        console.error('Error starting order:', error);
        res.status(500).json({ success: false, error: 'Error al iniciar preparación' });
    }
});

// PUT /api/kitchen/orders/:id/complete - Marcar orden como lista
router.put('/orders/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await readDB();

        const orderIndex = db.kitchenOrders.findIndex(o => o.id === id);

        if (orderIndex === -1) {
            return res.status(404).json({ success: false, error: 'Orden no encontrada' });
        }

        const order = db.kitchenOrders[orderIndex];

        if (order.status !== 'preparing') {
            return res.status(400).json({
                success: false,
                error: 'La orden debe estar en preparación para completarla'
            });
        }

        const completedAt = new Date();
        const startedAt = new Date(order.startedAt);
        const prepTime = Math.round((completedAt - startedAt) / 60000); // minutos

        // Actualizar orden
        db.kitchenOrders[orderIndex] = {
            ...order,
            status: 'ready',
            completedAt: completedAt.toISOString(),
            prepTime
        };

        // Actualizar estadísticas
        if (db.kitchenStats) {
            db.kitchenStats.inPreparation = Math.max(0, (db.kitchenStats.inPreparation || 0) - 1);
            db.kitchenStats.completedToday = (db.kitchenStats.completedToday || 0) + 1;

            // Recalcular tiempo promedio
            const completedOrders = db.kitchenOrders.filter(o => o.status === 'ready' && o.prepTime);
            if (completedOrders.length > 0) {
                const totalTime = completedOrders.reduce((sum, o) => sum + o.prepTime, 0);
                db.kitchenStats.avgPrepTime = Math.round(totalTime / completedOrders.length);
            }
        }

        await writeDB(db);

        res.json({ success: true, data: db.kitchenOrders[orderIndex] });
    } catch (error) {
        console.error('Error completing order:', error);
        res.status(500).json({ success: false, error: 'Error al completar orden' });
    }
});

// GET /api/kitchen/history - Obtener historial del día
router.get('/history', async (req, res) => {
    try {
        const db = await readDB();
        const today = new Date().toISOString().split('T')[0];

        let orders = db.kitchenOrders || [];

        // Filtrar órdenes del día actual que están completadas
        orders = orders.filter(o => {
            const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
            return orderDate === today && o.status === 'ready';
        });

        // Ordenar por fecha de completado (más reciente primero)
        orders.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error getting kitchen history:', error);
        res.status(500).json({ success: false, error: 'Error al obtener historial' });
    }
});

module.exports = router;
