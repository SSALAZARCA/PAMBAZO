import React, { useState } from 'react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { User } from '../../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
    Calendar,
    Clock,
    Users,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    CalendarClock
} from 'lucide-react';
import AttendanceButton from '../../../components/shifts/AttendanceButton';
import ShiftChangeRequestDialog from '../../../components/shifts/ShiftChangeRequestDialog';

interface BakerSchedulePageProps {
    user: User;
    onLogout: () => void;
}

interface Shift {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'completed' | 'absent' | 'pending';
    notes?: string;
}

const MOCK_SHIFTS: Shift[] = [
    { id: '1', date: new Date(2026, 0, 6), startTime: '05:00', endTime: '13:00', status: 'scheduled', notes: 'Turno mañana' },
    { id: '2', date: new Date(2026, 0, 7), startTime: '05:00', endTime: '13:00', status: 'scheduled' },
    { id: '3', date: new Date(2026, 0, 8), startTime: '05:00', endTime: '13:00', status: 'scheduled' },
    { id: '4', date: new Date(2026, 0, 9), startTime: '05:00', endTime: '13:00', status: 'scheduled' },
    { id: '5', date: new Date(2026, 0, 10), startTime: '05:00', endTime: '13:00', status: 'scheduled' },
    { id: '6', date: new Date(2026, 0, 3), startTime: '05:00', endTime: '13:00', status: 'completed' },
    { id: '7', date: new Date(2026, 0, 2), startTime: '05:00', endTime: '13:00', status: 'completed' },
    { id: '8', date: new Date(2026, 0, 1), startTime: '05:00', endTime: '13:00', status: 'completed' },
];

export const BakerSchedulePage: React.FC<BakerSchedulePageProps> = ({ user, onLogout }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

    const getShiftForDate = (date: Date) => {
        return MOCK_SHIFTS.find(shift =>
            shift.date.getDate() === date.getDate() &&
            shift.date.getMonth() === date.getMonth() &&
            shift.date.getFullYear() === date.getFullYear()
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-300';
            case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'absent': return 'bg-red-100 text-red-700 border-red-300';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="w-4 h-4" />;
            case 'scheduled': return <Clock className="w-4 h-4" />;
            case 'absent': return <XCircle className="w-4 h-4" />;
            case 'pending': return <AlertCircle className="w-4 h-4" />;
            default: return null;
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

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const scheduledShifts = MOCK_SHIFTS.filter(s => s.status === 'scheduled').length;
    const completedShifts = MOCK_SHIFTS.filter(s => s.status === 'completed').length;
    const totalHours = MOCK_SHIFTS.filter(s => s.status === 'completed').length * 8;

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <CalendarClock className="w-8 h-8 text-purple-600" />
                            Horarios y Turnos
                        </h1>
                        <p className="text-gray-600 mt-1">Gestión de turnos y asistencia</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <p className="text-sm text-gray-600">Horas Trabajadas</p>
                                    <p className="text-3xl font-bold text-purple-600">{totalHours}h</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Calendar */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="capitalize">{monthName}</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={previousMonth}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={nextMonth}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Days of week */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {/* Empty cells for days before month starts */}
                            {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                                <div key={`empty-${idx}`} className="aspect-square" />
                            ))}

                            {/* Days of the month */}
                            {Array.from({ length: daysInMonth }).map((_, idx) => {
                                const day = idx + 1;
                                const date = new Date(year, month, day);
                                const shift = getShiftForDate(date);
                                const isToday = date.toDateString() === new Date().toDateString();

                                return (
                                    <div
                                        key={day}
                                        className={`aspect-square border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${isToday ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                                            } ${shift ? getStatusColor(shift.status) : 'bg-white'}`}
                                        onClick={() => setSelectedDate(date)}
                                    >
                                        <div className="flex flex-col h-full">
                                            <span className={`text-sm font-semibold ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>
                                                {day}
                                            </span>
                                            {shift && (
                                                <div className="mt-auto">
                                                    <div className="flex items-center gap-1 text-xs">
                                                        {getStatusIcon(shift.status)}
                                                        <span className="truncate">{shift.startTime}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Shift Details */}
                {selectedDate && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Detalles del {selectedDate.toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const shift = getShiftForDate(selectedDate);
                                if (shift) {
                                    return (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <Badge className={getStatusColor(shift.status)}>
                                                    {getStatusText(shift.status)}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Hora de Inicio</p>
                                                    <p className="text-lg font-semibold">{shift.startTime}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Hora de Fin</p>
                                                    <p className="text-lg font-semibold">{shift.endTime}</p>
                                                </div>
                                            </div>
                                            {shift.notes && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Notas</p>
                                                    <p className="text-sm">{shift.notes}</p>
                                                </div>
                                            )}

                                            {/* Acciones del turno */}
                                            <div className="pt-4 border-t space-y-3">
                                                <AttendanceButton
                                                    shiftId={shift.id}
                                                    shiftDate={shift.date}
                                                    attendanceTime={null}
                                                    onAttendanceMarked={() => {
                                                        // Aquí se recargará la lista de turnos
                                                        console.log('Asistencia marcada');
                                                    }}
                                                />

                                                {shift.status === 'scheduled' && (
                                                    <ShiftChangeRequestDialog
                                                        shiftId={shift.id}
                                                        currentDate={shift.date}
                                                        onRequestSubmitted={() => {
                                                            // Aquí se recargará la lista de turnos
                                                            console.log('Solicitud enviada');
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="text-center py-8 text-gray-500">
                                            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                            <p>No hay turno programado para este día</p>
                                        </div>
                                    );
                                }
                            })()}
                        </CardContent>
                    </Card>
                )}

                {/* Upcoming Shifts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Próximos Turnos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {MOCK_SHIFTS
                                .filter(s => s.status === 'scheduled')
                                .sort((a, b) => a.date.getTime() - b.date.getTime())
                                .slice(0, 5)
                                .map(shift => (
                                    <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded">
                                                <Calendar className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {shift.date.toLocaleDateString('es-ES', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long'
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {shift.startTime} - {shift.endTime}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(shift.status)}>
                                            {getStatusText(shift.status)}
                                        </Badge>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default BakerSchedulePage;
