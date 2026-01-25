import { useState } from 'react';
import { Button } from '../ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceButtonProps {
    shiftId: string;
    shiftDate: Date;
    attendanceTime: string | null;
    onAttendanceMarked?: () => void;
}

export const AttendanceButton: React.FC<AttendanceButtonProps> = ({
    shiftDate,
    attendanceTime,
    onAttendanceMarked
}) => {
    const [loading, setLoading] = useState(false);

    const isToday = () => {
        const today = new Date();
        const shift = new Date(shiftDate);
        return (
            today.getDate() === shift.getDate() &&
            today.getMonth() === shift.getMonth() &&
            today.getFullYear() === shift.getFullYear()
        );
    };

    const handleMarkAttendance = async () => {
        if (!isToday()) {
            toast.error('Solo puedes marcar asistencia el día del turno');
            return;
        }

        if (attendanceTime) {
            toast.error('Ya has marcado asistencia para este turno');
            return;
        }

        setLoading(true);

        try {
            // Aquí se conectará con la API real
            // await shiftService.markAttendance(shiftId);

            // Por ahora simulamos la llamada
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('¡Asistencia marcada exitosamente!', {
                description: `Hora de llegada: ${new Date().toLocaleTimeString('es-ES')}`
            });

            if (onAttendanceMarked) {
                onAttendanceMarked();
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            toast.error('Error al marcar asistencia', {
                description: 'Por favor intenta nuevamente'
            });
        } finally {
            setLoading(false);
        }
    };

    // Si ya marcó asistencia
    if (attendanceTime) {
        return (
            <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <div className="text-sm">
                    <p className="font-medium">Asistencia marcada</p>
                    <p className="text-gray-600">
                        {new Date(attendanceTime).toLocaleTimeString('es-ES')}
                    </p>
                </div>
            </div>
        );
    }

    // Si no es hoy
    if (!isToday()) {
        return (
            <Button disabled variant="outline" className="w-full">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marcar Asistencia
            </Button>
        );
    }

    // Si es hoy y no ha marcado
    return (
        <Button
            onClick={handleMarkAttendance}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Marcando...
                </>
            ) : (
                <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Marcar Asistencia
                </>
            )}
        </Button>
    );
};

export default AttendanceButton;
