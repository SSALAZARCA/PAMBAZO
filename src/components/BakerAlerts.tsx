import React from 'react';
import { AlertTriangle, Info, Bell, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface Alert {
    id: string;
    type: 'warning' | 'info' | 'critical' | 'reminder';
    title: string;
    message: string;
    timestamp?: string;
}

const BakerAlerts: React.FC = () => {
    // In a real app, these would come from useStore or an API
    const alerts: Alert[] = [
        {
            id: '1',
            type: 'warning',
            title: 'Mantenimiento Preventivo',
            message: 'Horno #2 requiere limpieza de filtros en 2 horas.',
            timestamp: 'Hoy, 14:00'
        },
        {
            id: '2',
            type: 'critical',
            title: 'Inventario Bajo',
            message: 'Quedan menos de 10kg de Harina de Trigo Premium.',
        },
        {
            id: '3',
            type: 'info',
            title: 'Nuevo Pedido Especial',
            message: 'Pedido de 50 Croissants para mañana a las 7:00 AM.',
            timestamp: 'Mańana, 07:00'
        }
    ];

    const getIcon = (type: Alert['type']) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'critical': return <Bell className="w-5 h-5 text-red-500" />;
            case 'info': return <Info className="w-5 h-5 text-blue-500" />;
            case 'reminder': return <Calendar className="w-5 h-5 text-purple-500" />;
            default: return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const getBgColor = (type: Alert['type']) => {
        switch (type) {
            case 'warning': return 'bg-amber-50 border-amber-100 hover:bg-amber-100';
            case 'critical': return 'bg-red-50 border-red-100 hover:bg-red-100';
            case 'info': return 'bg-blue-50 border-blue-100 hover:bg-blue-100';
            case 'reminder': return 'bg-purple-50 border-purple-100 hover:bg-purple-100';
            default: return 'bg-gray-50 border-gray-100';
        }
    };

    return (
        <Card className="h-full border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <Bell className="w-5 h-5" />
                    Centro de Avisos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${getBgColor(alert.type)}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                                {getIcon(alert.type)}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-1">
                                    {alert.title}
                                </h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {alert.message}
                                </p>
                                {alert.timestamp && (
                                    <div className="mt-2 flex items-center text-[10px] text-gray-500 font-medium bg-white/50 w-fit px-2 py-0.5 rounded-full">
                                        <ClockIcon className="w-3 h-3 mr-1" />
                                        {alert.timestamp}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                <div className="pt-2">
                    <button className="text-xs font-medium text-gray-500 hover:text-gray-900 w-full text-center py-2 border border-dashed border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Ver todas las notificaciones anteriores
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};

const ClockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

export default BakerAlerts;
