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
function generateId(prefix = 'shift') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/employee-shifts - Obtener todos los turnos (filtrado por rol)
router.get('/', async (req, res) => {
    try {
        const db = await readDB();
        const { employeeId, status, startDate, endDate } = req.query;
        const user = req.user; // Asumiendo middleware de autenticación

        let shifts = db.employeeShifts || [];

        // Si no es admin, solo ver sus propios turnos
        if (user && user.role !== 'admin') {
            shifts = shifts.filter(s => s.employeeId === user.id);
        }

        // Filtros opcionales
        if (employeeId) {
            shifts = shifts.filter(s => s.employeeId === parseInt(employeeId));
        }

        if (status) {
            shifts = shifts.filter(s => s.status === status);
        }

        if (startDate && endDate) {
            shifts = shifts.filter(s => {
                const shiftDate = new Date(s.date);
                return shiftDate >= new Date(startDate) && shiftDate <= new Date(endDate);
            });
        }

        res.json({ success: true, data: shifts });
    } catch (error) {
        console.error('Error getting shifts:', error);
        res.status(500).json({ success: false, error: 'Error al obtener turnos' });
    }
});

// GET /api/employee-shifts/my-shifts - Obtener turnos del usuario actual
router.get('/my-shifts', async (req, res) => {
    try {
        const db = await readDB();
        const user = req.user;

        if (!user) {
            return res.status(401).json({ success: false, error: 'No autenticado' });
        }

        const shifts = (db.employeeShifts || []).filter(s => s.employeeId === user.id);

        res.json({ success: true, data: shifts });
    } catch (error) {
        console.error('Error getting my shifts:', error);
        res.status(500).json({ success: false, error: 'Error al obtener turnos' });
    }
});

// POST /api/employee-shifts - Crear nuevo turno (solo admin)
router.post('/', async (req, res) => {
    try {
        const user = req.user;

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'No autorizado' });
        }

        const { employeeId, date, startTime, endTime, notes } = req.body;

        // Validaciones
        if (!employeeId || !date || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos'
            });
        }

        const db = await readDB();

        // Buscar nombre del empleado
        const employee = db.users.find(u => u.id === employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, error: 'Empleado no encontrado' });
        }

        const newShift = {
            id: generateId('shift'),
            employeeId,
            employeeName: employee.name,
            date: new Date(date).toISOString(),
            startTime,
            endTime,
            status: 'scheduled',
            notes: notes || null,
            attendanceTime: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (!db.employeeShifts) {
            db.employeeShifts = [];
        }

        db.employeeShifts.push(newShift);
        await writeDB(db);

        res.status(201).json({ success: true, data: newShift });
    } catch (error) {
        console.error('Error creating shift:', error);
        res.status(500).json({ success: false, error: 'Error al crear turno' });
    }
});

// PUT /api/employee-shifts/:id - Actualizar turno (solo admin)
router.put('/:id', async (req, res) => {
    try {
        const user = req.user;

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'No autorizado' });
        }

        const { id } = req.params;
        const updates = req.body;

        const db = await readDB();
        const shiftIndex = db.employeeShifts.findIndex(s => s.id === id);

        if (shiftIndex === -1) {
            return res.status(404).json({ success: false, error: 'Turno no encontrado' });
        }

        // Actualizar turno
        db.employeeShifts[shiftIndex] = {
            ...db.employeeShifts[shiftIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await writeDB(db);

        res.json({ success: true, data: db.employeeShifts[shiftIndex] });
    } catch (error) {
        console.error('Error updating shift:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar turno' });
    }
});

// DELETE /api/employee-shifts/:id - Eliminar turno (solo admin)
router.delete('/:id', async (req, res) => {
    try {
        const user = req.user;

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'No autorizado' });
        }

        const { id } = req.params;
        const db = await readDB();

        const shiftIndex = db.employeeShifts.findIndex(s => s.id === id);

        if (shiftIndex === -1) {
            return res.status(404).json({ success: false, error: 'Turno no encontrado' });
        }

        db.employeeShifts.splice(shiftIndex, 1);
        await writeDB(db);

        res.json({ success: true, message: 'Turno eliminado' });
    } catch (error) {
        console.error('Error deleting shift:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar turno' });
    }
});

// POST /api/employee-shifts/:id/attendance - Marcar asistencia
router.post('/:id/attendance', async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ success: false, error: 'No autenticado' });
        }

        const { id } = req.params;
        const db = await readDB();

        const shiftIndex = db.employeeShifts.findIndex(s => s.id === id);

        if (shiftIndex === -1) {
            return res.status(404).json({ success: false, error: 'Turno no encontrado' });
        }

        const shift = db.employeeShifts[shiftIndex];

        // Verificar que el turno pertenece al usuario
        if (shift.employeeId !== user.id && user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'No autorizado' });
        }

        // Verificar que el turno es de hoy
        const today = new Date().toISOString().split('T')[0];
        const shiftDate = new Date(shift.date).toISOString().split('T')[0];

        if (shiftDate !== today) {
            return res.status(400).json({
                success: false,
                error: 'Solo puedes marcar asistencia el día del turno'
            });
        }

        // Verificar que no se ha marcado ya
        if (shift.attendanceTime) {
            return res.status(400).json({
                success: false,
                error: 'Ya has marcado asistencia para este turno'
            });
        }

        // Marcar asistencia
        db.employeeShifts[shiftIndex] = {
            ...shift,
            status: 'completed',
            attendanceTime: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await writeDB(db);

        res.json({ success: true, data: db.employeeShifts[shiftIndex] });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ success: false, error: 'Error al marcar asistencia' });
    }
});

// POST /api/employee-shifts/change-request - Solicitar cambio de turno
router.post('/change-request', async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ success: false, error: 'No autenticado' });
        }

        const { shiftId, requestedDate, reason } = req.body;

        if (!shiftId || !requestedDate || !reason) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos'
            });
        }

        const db = await readDB();

        // Verificar que el turno existe y pertenece al usuario
        const shift = db.employeeShifts.find(s => s.id === shiftId);

        if (!shift) {
            return res.status(404).json({ success: false, error: 'Turno no encontrado' });
        }

        if (shift.employeeId !== user.id) {
            return res.status(403).json({ success: false, error: 'No autorizado' });
        }

        const newRequest = {
            id: generateId('request'),
            shiftId,
            employeeId: user.id,
            employeeName: user.name,
            currentDate: shift.date,
            requestedDate: new Date(requestedDate).toISOString(),
            reason,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (!db.shiftChangeRequests) {
            db.shiftChangeRequests = [];
        }

        db.shiftChangeRequests.push(newRequest);
        await writeDB(db);

        res.status(201).json({ success: true, data: newRequest });
    } catch (error) {
        console.error('Error creating change request:', error);
        res.status(500).json({ success: false, error: 'Error al crear solicitud' });
    }
});

// GET /api/employee-shifts/change-requests - Obtener solicitudes
router.get('/change-requests', async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ success: false, error: 'No autenticado' });
        }

        const db = await readDB();
        let requests = db.shiftChangeRequests || [];

        // Si no es admin, solo ver sus propias solicitudes
        if (user.role !== 'admin') {
            requests = requests.filter(r => r.employeeId === user.id);
        }

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Error getting change requests:', error);
        res.status(500).json({ success: false, error: 'Error al obtener solicitudes' });
    }
});

// PUT /api/employee-shifts/change-request/:id - Aprobar/rechazar solicitud (solo admin)
router.put('/change-request/:id', async (req, res) => {
    try {
        const user = req.user;

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'No autorizado' });
        }

        const { id } = req.params;
        const { status } = req.body; // 'approved' o 'rejected'

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Estado inválido'
            });
        }

        const db = await readDB();
        const requestIndex = db.shiftChangeRequests.findIndex(r => r.id === id);

        if (requestIndex === -1) {
            return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
        }

        const request = db.shiftChangeRequests[requestIndex];

        // Actualizar solicitud
        db.shiftChangeRequests[requestIndex] = {
            ...request,
            status,
            updatedAt: new Date().toISOString()
        };

        // Si se aprueba, actualizar el turno
        if (status === 'approved') {
            const shiftIndex = db.employeeShifts.findIndex(s => s.id === request.shiftId);
            if (shiftIndex !== -1) {
                db.employeeShifts[shiftIndex] = {
                    ...db.employeeShifts[shiftIndex],
                    date: request.requestedDate,
                    updatedAt: new Date().toISOString()
                };
            }
        }

        await writeDB(db);

        res.json({ success: true, data: db.shiftChangeRequests[requestIndex] });
    } catch (error) {
        console.error('Error updating change request:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar solicitud' });
    }
});

module.exports = router;
