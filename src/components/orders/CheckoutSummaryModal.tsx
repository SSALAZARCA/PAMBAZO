import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { CheckCircle2, DollarSign, ArrowRight, Printer, CreditCard } from 'lucide-react';
import { Badge } from '../ui/badge';

interface CheckoutSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: any;
    order: any;
    onConfirmCheckout: () => void;
}

export const CheckoutSummaryModal: React.FC<CheckoutSummaryModalProps> = ({
    isOpen,
    onClose,
    table,
    order,
    onConfirmCheckout
}) => {
    if (!table || !order) return null;

    const total = (order.items || []).reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 text-white text-center flex flex-col items-center">
                    <div className="bg-white/20 p-4 rounded-full mb-4 backdrop-blur-md">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <DialogTitle className="text-2xl font-black mb-1">Resumen de Venta</DialogTitle>
                    <p className="text-green-100 opacity-80">Mesa {table.number} • Orden #{(order.id?.toString() || '').slice(-6)}</p>
                </div>

                <div className="p-8 space-y-6 bg-white">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-gray-500 font-medium">
                            <span>Artículos ({(order.items || []).length})</span>
                            <span className="text-gray-900">${total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-500 font-medium">
                            <span>Impuestos (0%)</span>
                            <span className="text-gray-900">$0</span>
                        </div>
                        <div className="h-px bg-dashed border-t-2 border-gray-100 border-dashed w-full my-2"></div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Total a Recaudar</p>
                                <p className="text-4xl font-black text-gray-900 tracking-tight">${total.toLocaleString()}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 mb-1">
                                <DollarSign className="w-3 h-3 mr-1" /> LISTO
                            </Badge>
                        </div>
                    </div>

                    <div className="bg-blue-50 border-blue-100 border p-4 rounded-2xl flex items-start gap-4">
                        <div className="bg-blue-600 text-white p-2 rounded-xl">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-blue-900 text-sm">Ticket Generado</p>
                            <p className="text-xs text-blue-700">El resumen de cuenta se enviará directamente a caja para el cobro final.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-gray-50 gap-3 border-t">
                    <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        className="h-12 flex-2 bg-gray-900 hover:bg-black text-white px-8 rounded-xl font-bold flex items-center gap-3 group"
                        onClick={onConfirmCheckout}
                    >
                        <CreditCard className="w-5 h-5" />
                        Pasa a Caja
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
