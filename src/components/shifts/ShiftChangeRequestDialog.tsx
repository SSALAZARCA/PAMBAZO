import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShiftChangeRequestDialogProps {
    shiftId: string;
    currentDate: Date;
    onRequestSubmitted?: () => void;
    trigger?: React.ReactNode;
}

export const ShiftChangeRequestDialog: React.FC<ShiftChangeRequestDialogProps> = ({
    currentDate,
    onRequestSubmitted,
    trigger
}) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        requestedDate: '',
        reason: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.requestedDate || !formData.reason) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        // Validar que la nueva fecha sea diferente
        const newDate = new Date(formData.requestedDate);
        const current = new Date(currentDate);

        if (newDate.toDateString() === current.toDateString()) {
            toast.error('La nueva fecha debe ser diferente a la actual');
            return;
        }

        setLoading(true);

        try {
            // Aquí se conectará con la API real
            // await shiftService.requestChange({
            //     shiftId,
            //     requestedDate: formData.requestedDate,
            //     reason: formData.reason
            // });

            // Por ahora simulamos la llamada
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Solicitud enviada exitosamente', {
                description: 'El administrador revisará tu solicitud pronto'
            });

            setOpen(false);
            setFormData({ requestedDate: '', reason: '' });

            if (onRequestSubmitted) {
                onRequestSubmitted();
            }
        } catch (error) {
            console.error('Error submitting change request:', error);
            toast.error('Error al enviar solicitud', {
                description: 'Por favor intenta nuevamente'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Solicitar Cambio
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Solicitar Cambio de Turno</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label>Fecha Actual</Label>
                            <Input
                                type="text"
                                value={new Date(currentDate).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                                disabled
                                className="bg-gray-100"
                            />
                        </div>

                        <div>
                            <Label>Nueva Fecha Solicitada *</Label>
                            <Input
                                type="date"
                                value={formData.requestedDate}
                                onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        <div>
                            <Label>Razón del Cambio *</Label>
                            <textarea
                                className="w-full min-h-[100px] p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Explica por qué necesitas cambiar tu turno..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                required
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.reason.length}/500 caracteres
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <p className="text-sm text-blue-800">
                                <strong>Nota:</strong> Tu solicitud será revisada por el administrador.
                                Recibirás una notificación cuando sea aprobada o rechazada.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Solicitud'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ShiftChangeRequestDialog;
