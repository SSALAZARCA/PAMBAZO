import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { ShoppingCart, Table as TableIcon, CreditCard } from 'lucide-react';

interface TableDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: any;
    order: any;
    onCloseAccount: () => void;
}

export const TableDetailsModal: React.FC<TableDetailsModalProps> = ({
    isOpen,
    onClose,
    table,
    order,
    onCloseAccount
}) => {
    if (!table || !order) return null;

    const total = (order.items || []).reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                        <TableIcon className="w-6 h-6 text-orange-600" />
                        Detalles Mesa {table.number}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <div className="flex justify-between items-center mb-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <div>
                            <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider">Estado de Orden</p>
                            <Badge className={`mt-1 ${order.status === 'ready' ? 'bg-green-600' :
                                order.status === 'preparing' ? 'bg-blue-600' : 'bg-orange-500'
                                }`}>
                                {order.status === 'ready' ? 'LISTO PARA SERVIR' :
                                    order.status === 'preparing' ? 'EN COCINA' : 'PENDIENTE'}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium">ID Pedido</p>
                            <p className="font-mono font-bold text-gray-700">#{(order.id?.toString() || '').slice(-6)}</p>
                        </div>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                        Consumo Actual
                    </h3>

                    <ScrollArea className="h-[250px] pr-4">
                        <div className="space-y-3">
                            {(order.items || []).map((item: any, idx: number) => {
                                if (!item) return null;
                                return (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white border rounded-xl shadow-sm hover:border-orange-200 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900">{item.product_name || item.productName || 'Producto sin nombre'}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>{item.quantity || 0} unidades</span>
                                                <span>•</span>
                                                <span>${(item.price || 0).toLocaleString()} c/u</span>
                                            </div>
                                        </div>
                                        <div className="text-right font-bold text-gray-900">
                                            ${((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>

                    <div className="mt-6 p-4 bg-gray-900 rounded-2xl text-white">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Total a Pagar</span>
                            <span className="text-3xl font-black text-white">${total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={onClose}>
                        Volver
                    </Button>
                    <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 h-12 rounded-xl gap-2 shadow-lg shadow-green-500/20"
                        onClick={onCloseAccount}
                    >
                        <CreditCard className="w-5 h-5" />
                        Cerrar Cuenta
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
