import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Switch } from '../../../components/ui/switch';
import { Label } from '../../../components/ui/label';
import { Plus, Users, Edit, Trash2, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from '../../../shared/types';
import api from '../../../services/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';

interface TablesPageProps {
    user: User;
    onLogout: () => void;
}

interface Table {
    id: number;
    number: number;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    occupiedSince?: Date;
    waiter?: string;
    currentOrder?: {
        id: number;
        items: Array<{ name: string; quantity: number; price: number }>;
        total: number;
    };
}

export default function TablesPage({ user, onLogout }: TablesPageProps) {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    // Dialogs
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [viewTable, setViewTable] = useState<Table | null>(null);

    // Form State
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [formData, setFormData] = useState({ number: '', capacity: '4' });

    // Payment State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const response = await api.tables.getAll();
            if (response.success && response.data) {
                const rawList = Array.isArray(response.data) ? response.data : (response.data as any).tables || [];

                // Proper mapping ensuring types
                const mappedTables: Table[] = rawList.map((t: any) => ({
                    id: Number(t.id),
                    number: Number(t.number || t.table_number || 0),
                    capacity: Number(t.capacity),
                    status: t.is_available ? 'available' : (t.current_order || t.status === 'occupied' ? 'occupied' : 'reserved'),
                    occupiedSince: t.current_order ? new Date(t.current_order.created_at) : undefined,
                    waiter: t.current_order?.user?.name || t.waiter,
                    currentOrder: t.current_order ? {
                        id: t.current_order.id,
                        items: t.current_order.items || [],
                        total: t.current_order.total || 0
                    } : undefined
                }));

                const sortedTables = mappedTables.sort((a, b) => a.number - b.number);
                setTables(sortedTables);
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
            toast.error('Error al cargar mesas');
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ---

    const handleSaveTable = async () => {
        try {
            const payload = {
                table_number: parseInt(formData.number),
                capacity: parseInt(formData.capacity)
            };

            if (editingTable) {
                // Optimistic Update
                setTables(prev => prev.map(t =>
                    t.id === editingTable.id
                        ? { ...t, number: payload.table_number, capacity: payload.capacity }
                        : t
                ).sort((a, b) => a.number - b.number));

                console.log('Sending payload:', payload);
                await api.tables.update(String(editingTable.id), payload);
                toast.success('Mesa actualizada');
            } else {
                await api.tables.create(payload);
                toast.success('Mesa creada');
            }

            setIsDialogOpen(false);
            setEditingTable(null);
            fetchTables();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar mesa');
        }
    };

    const handleDeleteTable = async (id: number) => {
        // Optimistic UI Update immediately
        const previousTables = [...tables];
        setTables(prev => prev.filter(t => t.id !== id));

        try {
            await api.tables.delete(String(id));
            toast.success('Mesa eliminada correctamente');
            fetchTables();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar mesa');
            setTables(previousTables);
        }
    };

    const handleReleaseTable = async (table: Table) => {
        if (!confirm('¿Liberar mesa y marcar como disponible?')) return;
        performRelease(table);
    };

    const performRelease = async (table: Table) => {
        try {
            await api.tables.update(String(table.id), {
                status: 'available',
                currentOrder: null
            } as any);

            toast.success('Mesa liberada');
            setViewTable(null);
            fetchTables();
        } catch (error) {
            console.error(error);
            toast.error('Error al liberar mesa');
        }
    };

    const handleInitiatePayment = () => {
        setIsPaymentOpen(true);
    };

    const handleProcessPayment = async () => {
        if (!viewTable?.currentOrder) return;

        try {
            // 1. Update Order Status to 'completed'
            await api.orders.updateStatus(String(viewTable.currentOrder.id), 'completed');

            // 2. Release Table (Logic duplicated just to be safe and explicit)
            await api.tables.update(String(viewTable.id), {
                status: 'available',
                currentOrder: null
            } as any);

            toast.success(`Cobro registrado (${paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'card' ? 'Tarjeta' : 'Nequi'}) y mesa liberada`);
            setIsPaymentOpen(false);
            setViewTable(null);
            fetchTables();
        } catch (error) {
            console.error(error);
            toast.error('Error al procesar el cobro');
        }
    };


    // --- HELPERS ---

    const openCreateDialog = () => {
        setEditingTable(null);
        setFormData({ number: '', capacity: '4' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (table: Table) => {
        setEditingTable(table);
        setFormData({ number: String(table.number), capacity: String(table.capacity) });
        setIsDialogOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 border-green-300 hover:bg-green-200';
            case 'occupied': return 'bg-orange-100 border-orange-300 hover:bg-orange-200';
            case 'reserved': return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
            default: return 'bg-gray-100 border-gray-300';
        }
    };

    // --- RENDER ---

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-6">

                {/* HEADLINE & CONTROLS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="text-orange-600" />
                            Gestión de Sala
                        </h1>
                        <p className="text-gray-500">Administración de mesas y ocupación</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
                            <Switch
                                id="edit-mode"
                                checked={isEditMode}
                                onCheckedChange={setIsEditMode}
                            />
                            <Label htmlFor="edit-mode" className="cursor-pointer font-medium">
                                {isEditMode ? 'Modo Edición ACTIVADO' : 'Modo Vista'}
                            </Label>
                        </div>

                        {isEditMode && (
                            <Button onClick={openCreateDialog} className="bg-orange-600 hover:bg-orange-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Mesa
                            </Button>
                        )}
                    </div>
                </div>

                {/* TABLES GRID */}
                {loading ? (
                    <div className="text-center py-20">Cargando esquema de sala...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {tables.map(table => (
                            <Card
                                key={table.id}
                                className={`relative transition-all duration-200 border-2 ${getStatusColor(table.status)} ${!isEditMode ? 'cursor-pointer transform hover:-translate-y-1 shadow-md' : ''}`}
                                onClick={() => {
                                    if (!isEditMode) {
                                        setViewTable(table);
                                    }
                                }}
                            >
                                <CardContent className="p-4 flex flex-col items-center justify-center min-h-[140px]">
                                    {/* STATUS INDICATOR */}
                                    <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${table.status === 'available' ? 'bg-green-500' :
                                        table.status === 'occupied' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                                        }`} />

                                    <span className="text-3xl font-bold text-gray-800 mb-1">
                                        Mesa {table.number}
                                    </span>

                                    <div className="flex items-center text-sm text-gray-600 gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>{table.capacity} p.</span>
                                    </div>

                                    {/* INFO IF OCCUPIED (Vista Mode) */}
                                    {!isEditMode && table.status === 'occupied' && (
                                        <div className="mt-2 text-xs bg-white/50 px-2 py-1 rounded text-orange-800 font-medium">
                                            $ {table.currentOrder?.total.toLocaleString() || '0'}
                                        </div>
                                    )}

                                    {/* EDIT CONTROLS (Overlay) */}
                                    {isEditMode && (
                                        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-2 p-2 rounded-lg z-10 transition-opacity">
                                            <span className="font-bold text-gray-900 mb-1">Mesa {table.number}</span>
                                            <div className="flex gap-2 w-full">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 h-8 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                                    onClick={(e) => { e.stopPropagation(); openEditDialog(table); }}
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="flex-1 h-8"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteTable(table.id); }}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* CREATE/EDIT DIALOG */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTable ? 'Editar Mesa' : 'Nueva Mesa'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Número de Mesa</Label>
                                <Input
                                    value={formData.number}
                                    onChange={e => setFormData(prev => ({ ...prev, number: e.target.value }))}
                                    placeholder="Ej: 5"
                                    type="number"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Capacidad (Personas)</Label>
                                <Input
                                    value={formData.capacity}
                                    onChange={e => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                                    type="number"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSaveTable} className="bg-orange-600 hover:bg-orange-700">Guardar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* VIEW DETAILS & PAYMENT DIALOG */}
                <Dialog open={!!viewTable} onOpenChange={() => { setViewTable(null); setIsPaymentOpen(false); }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex justify-between items-center">
                                <span>Mesa {viewTable?.number}</span>
                                <Badge variant={viewTable?.status === 'occupied' ? 'destructive' : 'default'} className="uppercase">
                                    {viewTable?.status === 'occupied' ? 'Ocupada' : 'Disponible'}
                                </Badge>
                            </DialogTitle>
                        </DialogHeader>

                        {isPaymentOpen ? (
                            <div className="space-y-4 animate-in fade-in zoom-in duration-200">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h3 className="font-bold text-green-800 text-lg mb-2 text-center">Proceso de Cobro</h3>
                                    <p className="text-center text-gray-600 mb-4">Total a pagar: <span className="font-bold text-xl">${viewTable?.currentOrder?.total.toLocaleString()}</span></p>

                                    <div className="space-y-3">
                                        <Label>Método de Pago</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button
                                                type="button"
                                                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                                                className={paymentMethod === 'cash' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                onClick={() => setPaymentMethod('cash')}
                                            >
                                                <DollarSign className="w-4 h-4 mr-2" />
                                                Efectivo
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                                                className={paymentMethod === 'card' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                                onClick={() => setPaymentMethod('card')}
                                            >
                                                Tarjeta
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={paymentMethod === 'transfer' ? 'default' : 'outline'}
                                                className={paymentMethod === 'transfer' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                                                onClick={() => setPaymentMethod('transfer')}
                                            >
                                                Nequi
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Atrás</Button>
                                    <Button className="bg-green-600 hover:bg-green-700 w-full md:w-auto" onClick={handleProcessPayment}>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Confirmar Pago y Liberar
                                    </Button>
                                </DialogFooter>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Capacidad:</span>
                                        <span className="font-medium">{viewTable?.capacity} Personas</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Estado:</span>
                                        <Badge variant={viewTable?.status === 'available' ? 'outline' : 'secondary'}>
                                            {viewTable?.status === 'available' ? 'Disponible' : (viewTable?.status === 'occupied' ? 'Ocupada' : 'Reservada')}
                                        </Badge>
                                    </div>
                                    {viewTable?.waiter && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Atendido por:</span>
                                            <span className="font-medium">{viewTable.waiter}</span>
                                        </div>
                                    )}
                                    {viewTable?.occupiedSince && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Ocupada desde:</span>
                                            <span>{viewTable.occupiedSince.toLocaleTimeString()}</span>
                                        </div>
                                    )}
                                </div>

                                {viewTable?.currentOrder ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Consumo Actual</h4>
                                            <div className="border rounded-lg overflow-hidden max-h-[200px] overflow-y-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-100 sticky top-0">
                                                        <tr>
                                                            <th className="p-2 text-left">Producto</th>
                                                            <th className="p-2 text-center">Cant</th>
                                                            <th className="p-2 text-right">$$</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        {viewTable.currentOrder.items.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td className="p-2">{item.name}</td>
                                                                <td className="p-2 text-center">{item.quantity}</td>
                                                                <td className="p-2 text-right">${(item.price * item.quantity).toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg mt-2 font-bold">
                                                <span>Total:</span>
                                                <span className="text-lg">${viewTable.currentOrder.total.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <DialogFooter className="sm:justify-between gap-2">
                                            <Button variant="outline" onClick={() => setViewTable(null)}>
                                                Cerrar
                                            </Button>
                                            <Button variant="default" className="bg-green-600 hover:bg-green-700 w-full md:w-auto" onClick={handleInitiatePayment}>
                                                <DollarSign className="w-4 h-4 mr-2" />
                                                Cobrar en Caja
                                            </Button>
                                        </DialogFooter>
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-gray-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No hay orden activa.</p>
                                        <DialogFooter className="mt-4 flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setViewTable(null)}>
                                                Cerrar
                                            </Button>
                                            {viewTable?.status !== 'available' && (
                                                <Button variant="outline" onClick={() => handleReleaseTable(viewTable!)}>
                                                    Forzar Liberación
                                                </Button>
                                            )}
                                        </DialogFooter>
                                    </div>
                                )}
                            </>
                        )}
                    </DialogContent>
                </Dialog>

            </div>
        </DashboardLayout>
    );
}
