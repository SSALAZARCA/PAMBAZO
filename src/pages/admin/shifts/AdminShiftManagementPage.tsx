import React, { useState } from 'react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { User } from '../../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
    Calendar,
    Clock,
    Users,
    Plus,
    Trash2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    UserCheck,
    CalendarClock
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';

interface AdminShiftManagementProps {
    user: User;
    onLogout: () => void;
}

interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface Shift {
    id: string;
    employeeId: string;
    employeeName: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'completed' | 'absent' | 'pending';
    notes?: string;
}

interface ShiftChangeRequest {
    id: string;
    shiftId: string;
    employeeId: string;
    employeeName: string;
    currentDate: Date;
    requestedDate: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
}

// DATOS DE EJEMPLO
const MOCK_EMPLOYEES: Employee[] = [
    { id: '1', name: 'Juan Pérez', email: 'juan@pambazo.com', role: 'baker' },
    { id: '2', name: 'María García', email: 'maria@pambazo.com', role: 'baker' },
    { id: '3', name: 'Carlos López', email: 'carlos@pambazo.com', role: 'baker' },
    { id: '4', name: 'Ana Martínez', email: 'ana@pambazo.com', role: 'baker' },
];

const MOCK_SHIFTS: Shift[] = [
    { id: '1', employeeId: '1', employeeName: 'Juan Pérez', date: new Date(2026, 0, 6), startTime: '05:00', endTime: '13:00', status: 'scheduled' },
    { id: '2', employeeId: '2', employeeName: 'María García', date: new Date(2026, 0, 6), startTime: '13:00', endTime: '21:00', status: 'scheduled' },
    { id: '3', employeeId: '1', employeeName: 'Juan Pérez', date: new Date(2026, 0, 7), startTime: '05:00', endTime: '13:00', status: 'scheduled' },
    { id: '4', employeeId: '3', employeeName: 'Carlos López', date: new Date(2026, 0, 7), startTime: '13:00', endTime: '21:00', status: 'scheduled' },
    { id: '5', employeeId: '2', employeeName: 'María García', date: new Date(2026, 0, 3), startTime: '05:00', endTime: '13:00', status: 'completed' },
    { id: '6', employeeId: '1', employeeName: 'Juan Pérez', date: new Date(2026, 0, 2), startTime: '05:00', endTime: '13:00', status: 'completed' },
];

const MOCK_REQUESTS: ShiftChangeRequest[] = [
    {
        id: '1',
        shiftId: '1',
        employeeId: '1',
        employeeName: 'Juan Pérez',
        currentDate: new Date(2026, 0, 6),
        requestedDate: new Date(2026, 0, 10),
        reason: 'Cita médica',
        status: 'pending'
    },
];

export const AdminShiftManagementPage: React.FC<AdminShiftManagementProps> = ({ user, onLogout }) => {
    const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
    const [requests, setRequests] = useState<ShiftChangeRequest[]>(MOCK_REQUESTS);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');

    // Formulario de nuevo turno
    const [newShift, setNewShift] = useState({
        employeeId: '',
        date: '',
        startTime: '05:00',
        endTime: '13:00',
        notes: ''
    });

    const handleCreateShift = () => {
        if (!newShift.employeeId || !newShift.date) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        const employee = MOCK_EMPLOYEES.find(e => e.id === newShift.employeeId);
        if (!employee) return;

        const shift: Shift = {
            id: Date.now().toString(),
            employeeId: newShift.employeeId,
            employeeName: employee.name,
            date: new Date(newShift.date),
            startTime: newShift.startTime,
            endTime: newShift.endTime,
            status: 'scheduled',
            notes: newShift.notes
        };

        setShifts([...shifts, shift]);
        setIsCreateDialogOpen(false);
        setNewShift({ employeeId: '', date: '', startTime: '05:00', endTime: '13:00', notes: '' });
    };

    const handleDeleteShift = (shiftId: string) => {
        if (confirm('¿Estás seguro de eliminar este turno?')) {
            setShifts(shifts.filter(s => s.id !== shiftId));
        }
    };

    const handleApproveRequest = (requestId: string) => {
        setRequests(requests.map(r =>
            r.id === requestId ? { ...r, status: 'approved' as const } : r
        ));
    };

    const handleRejectRequest = (requestId: string) => {
        setRequests(requests.map(r =>
            r.id === requestId ? { ...r, status: 'rejected' as const } : r
        ));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            case 'absent': return 'bg-red-100 text-red-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'Completado';
            case 'scheduled': return 'Programado';
            case 'absent': return 'Ausente';
            case 'pending': return 'Pendiente';
            default: return status;
        }
    };

    const employeeShifts = selectedEmployee
        ? shifts.filter(s => s.employeeId === selectedEmployee)
        : shifts;

    const scheduledShifts = shifts.filter(s => s.status === 'scheduled').length;
    const completedShifts = shifts.filter(s => s.status === 'completed').length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <CalendarClock className="w-8 h-8 text-purple-600" />
                            Gestión de Turnos
                        </h1>
                        <p className="text-gray-600 mt-1">Administración de horarios y asistencia</p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-purple-600 hover:bg-purple-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Turno
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Crear Nuevo Turno</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Empleado *</Label>
                                    <select
                                        className="w-full mt-1 p-2 border rounded-md"
                                        value={newShift.employeeId}
                                        onChange={(e) => setNewShift({ ...newShift, employeeId: e.target.value })}
                                    >
                                        <option value="">Seleccionar empleado</option>
                                        {MOCK_EMPLOYEES.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label>Fecha *</Label>
                                    <Input
                                        type="date"
                                        value={newShift.date}
                                        onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Hora Inicio *</Label>
                                        <Input
                                            type="time"
                                            value={newShift.startTime}
                                            onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Hora Fin *</Label>
                                        <Input
                                            type="time"
                                            value={newShift.endTime}
                                            onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Notas</Label>
                                    <Input
                                        placeholder="Notas adicionales..."
                                        value={newShift.notes}
                                        onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleCreateShift} className="bg-purple-600 hover:bg-purple-700">
                                    Crear Turno
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Empleados</p>
                                    <p className="text-3xl font-bold text-purple-600">{MOCK_EMPLOYEES.length}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Turnos Programados</p>
                                    <p className="text-3xl font-bold text-blue-600">{scheduledShifts}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Turnos Completados</p>
                                    <p className="text-3xl font-bold text-green-600">{completedShifts}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Solicitudes Pendientes</p>
                                    <p className="text-3xl font-bold text-yellow-600">{pendingRequests}</p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Solicitudes Pendientes */}
                {pendingRequests > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                Solicitudes de Cambio Pendientes ({pendingRequests})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {requests.filter(r => r.status === 'pending').map(request => (
                                    <div key={request.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{request.employeeName}</p>
                                            <p className="text-sm text-gray-600">
                                                Cambiar de {request.currentDate.toLocaleDateString('es-ES')} a {request.requestedDate.toLocaleDateString('es-ES')}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">Razón: {request.reason}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleApproveRequest(request.id)}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                Aprobar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                onClick={() => handleRejectRequest(request.id)}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Rechazar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filtro por Empleado */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Turnos por Empleado</CardTitle>
                            <select
                                className="p-2 border rounded-md"
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                            >
                                <option value="">Todos los empleados</option>
                                {MOCK_EMPLOYEES.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {employeeShifts.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No hay turnos programados</p>
                                </div>
                            ) : (
                                employeeShifts
                                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                                    .map(shift => (
                                        <div key={shift.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-purple-100 rounded">
                                                    <UserCheck className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{shift.employeeName}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {shift.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {shift.startTime} - {shift.endTime}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={getStatusColor(shift.status)}>
                                                    {getStatusText(shift.status)}
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteShift(shift.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Empleados */}
                <Card>
                    <CardHeader>
                        <CardTitle>Empleados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {MOCK_EMPLOYEES.map(employee => {
                                const empShifts = shifts.filter(s => s.employeeId === employee.id);
                                const scheduled = empShifts.filter(s => s.status === 'scheduled').length;
                                const completed = empShifts.filter(s => s.status === 'completed').length;

                                return (
                                    <div key={employee.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-lg">{employee.name}</p>
                                                <p className="text-sm text-gray-600">{employee.email}</p>
                                            </div>
                                            <Badge variant="outline">{employee.role}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-600" />
                                                <span>{scheduled} programados</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                <span>{completed} completados</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminShiftManagementPage;
