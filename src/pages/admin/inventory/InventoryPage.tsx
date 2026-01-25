import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
// Import User from api to avoid types path issues
import api, { User, InventoryItem } from '../../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Package, Plus, Search, Edit, Trash2, ArrowUpCircle, ArrowDownCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';

interface InventoryPageProps {
    user: User;
    onLogout: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ user, onLogout }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Item Dialog State
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [itemForm, setItemForm] = useState({
        item_name: '',
        current_stock: 0,
        min_stock: 0,
        unit: 'kg',
        cost_per_unit: 0,
        supplier: ''
    });

    // Stock Movement Dialog State
    const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
    const [selectedItemForStock, setSelectedItemForStock] = useState<InventoryItem | null>(null);
    const [stockForm, setStockForm] = useState({
        quantity: 0,
        type: 'in' as 'in' | 'out',
        reason: '',
        cost: 0,
        supplier: '',
        is_cash_payment: true
    });

    const fetchInventory = async () => {
        setLoading(true);
        try {
            console.log('Fetching inventory...');
            const res = await api.inventory.getAll();

            if (res.success && res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data as any).data || (res.data as any).items || [];
                console.log('DEBUG: List:', list);
                setItems(list);
                if (list.length === 0) {
                    toast.warning('El servidor devolvió una lista vacía.');
                } else {
                    toast.success(`Cargados ${list.length} insumos.`);
                }
            } else {
                toast.error('Error: Respuesta del servidor sin datos o success false');
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Error de conexión al cargar inventario');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // ... (rest of methods: handleSaveItem, handleStockUpdate, handleDelete, etc. - keep existing)
    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.inventory.update(editingItem.id, itemForm);
                toast.success('Insumo actualizado');
            } else {
                await api.inventory.create(itemForm);
                toast.success('Insumo creado');
            }
            setIsItemDialogOpen(false);
            setEditingItem(null);
            fetchInventory();
        } catch (error) {
            console.error('Error saving item:', error);
            toast.error('Error al guardar insumo');
        }
    };

    const handleStockUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItemForStock) return;

        try {
            await api.inventory.updateStock(
                selectedItemForStock.id,
                stockForm.quantity,
                stockForm.type,
                stockForm.reason,
                stockForm.cost,
                stockForm.supplier,
                stockForm.is_cash_payment
            );
            toast.success('Stock actualizado correctamente');
            setIsStockDialogOpen(false);
            setSelectedItemForStock(null);
            fetchInventory();
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error('Error al actualizar stock');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Eliminar este insumo?')) {
            try {
                await api.inventory.delete(id);
                toast.success('Insumo eliminado');
                fetchInventory();
            } catch (error) {
                toast.error('Error al eliminar');
            }
        }
    };

    const openCreateDialog = () => {
        setEditingItem(null);
        setItemForm({
            item_name: '',
            current_stock: 0,
            min_stock: 10,
            unit: 'kg',
            cost_per_unit: 0,
            supplier: ''
        });
        setIsItemDialogOpen(true);
    };

    const openEditDialog = (item: InventoryItem) => {
        setEditingItem(item);
        setItemForm({
            item_name: item.item_name || item.name || '',
            current_stock: item.current_stock ?? item.stock ?? 0,
            min_stock: item.min_stock,
            unit: item.unit,
            cost_per_unit: item.cost_per_unit || 0,
            supplier: item.supplier || ''
        });
        setIsItemDialogOpen(true);
    };

    const openStockDialog = (item: InventoryItem, type: 'in' | 'out') => {
        setSelectedItemForStock(item);
        setStockForm({
            quantity: 0,
            type: type,
            reason: type === 'in' ? 'Compra' : 'Uso en producción',
            cost: type === 'in' ? (item.cost_per_unit || 0) : 0,
            supplier: type === 'in' ? (item.supplier || '') : '',
            is_cash_payment: true
        });
        setIsStockDialogOpen(true);
    };

    const filteredItems = items.filter(i =>
        (i.item_name || i.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-6">

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
                            Inventario de Insumos
                        </h1>
                        <p className="text-gray-500">
                            Gestión de materias primas y stock ({items.length} items)
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Insumo
                    </Button>
                </div>

                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-orange-600" />
                                Lista de Insumos
                            </CardTitle>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar insumo..."
                                    className="pl-10 w-64"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="p-4">Insumo</th>
                                        <th className="p-4">Stock Actual</th>
                                        <th className="p-4">Mínimo</th>
                                        <th className="p-4">Unidad</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan={6} className="p-4 text-center">Cargando...</td></tr>
                                    ) : filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50">
                                            <td className="p-4 font-medium text-gray-900">{item.item_name || item.name || 'Sin Nombre'}</td>
                                            <td className="p-4">
                                                <span className={`font-bold ${item.current_stock <= item.min_stock ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {item.current_stock ?? item.stock ?? 0}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500">{item.min_stock}</td>
                                            <td className="p-4 text-gray-500">{item.unit}</td>
                                            <td className="p-4">
                                                {item.current_stock <= item.min_stock ? (
                                                    <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" /> Bajo Stock
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                        Normal
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" title="Entrada Stock" onClick={() => openStockDialog(item, 'in')}>
                                                        <ArrowUpCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50" title="Salida Stock" onClick={() => openStockDialog(item, 'out')}>
                                                        <ArrowDownCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                                                        <Edit className="w-4 h-4 text-gray-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && filteredItems.length === 0 && (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay insumos registrados</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Create/Edit Item Dialog */}
                <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Editar Insumo' : 'Nuevo Insumo'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveItem} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label>Nombre del Insumo</Label>
                                    <Input
                                        value={itemForm.item_name}
                                        onChange={e => setItemForm({ ...itemForm, item_name: e.target.value })}
                                        required
                                        placeholder="Ej. Harina de Trigo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stock Actual</Label>
                                    <Input
                                        type="number"
                                        value={itemForm.current_stock}
                                        onChange={e => setItemForm({ ...itemForm, current_stock: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stock Mínimo</Label>
                                    <Input
                                        type="number"
                                        value={itemForm.min_stock}
                                        onChange={e => setItemForm({ ...itemForm, min_stock: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unidad de Medida</Label>
                                    <Input
                                        value={itemForm.unit}
                                        onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                                        required
                                        placeholder="kg, lts, un"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Costo Unitario</Label>
                                    <Input
                                        type="number"
                                        value={itemForm.cost_per_unit}
                                        onChange={e => setItemForm({ ...itemForm, cost_per_unit: Number(e.target.value) })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Proveedor</Label>
                                    <Input
                                        value={itemForm.supplier}
                                        onChange={e => setItemForm({ ...itemForm, supplier: e.target.value })}
                                        placeholder="Nombre del proveedor"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Guardar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Stock Movement Dialog */}
                <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {stockForm.type === 'in' ? 'Registrar Entrada' : 'Registrar Salida'} - {selectedItemForStock?.item_name || selectedItemForStock?.name}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleStockUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Cantidad ({selectedItemForStock?.unit})</Label>
                                <Input
                                    type="number"
                                    value={stockForm.quantity}
                                    onChange={e => setStockForm({ ...stockForm, quantity: Number(e.target.value) })}
                                    required
                                    min="0.01"
                                    step="0.01"
                                    autoFocus
                                />
                            </div>


                            {stockForm.type === 'in' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Costo Total ($)</Label>
                                            <Input
                                                type="number"
                                                value={stockForm.cost}
                                                onChange={e => setStockForm({ ...stockForm, cost: Number(e.target.value) })}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Proveedor</Label>
                                            <Input
                                                value={stockForm.supplier}
                                                onChange={e => setStockForm({ ...stockForm, supplier: e.target.value })}
                                                placeholder="Nombre Proveedor"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border border-gray-100">
                                        <input
                                            type="checkbox"
                                            id="payment_type"
                                            checked={stockForm.is_cash_payment}
                                            onChange={e => setStockForm({ ...stockForm, is_cash_payment: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <Label htmlFor="payment_type" className="cursor-pointer font-medium">
                                            Pago inmediato de Caja (Efectivo)
                                        </Label>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label>Razón / Nota</Label>
                                <Input
                                    value={stockForm.reason}
                                    onChange={e => setStockForm({ ...stockForm, reason: e.target.value })}
                                    required
                                    placeholder={stockForm.type === 'in' ? 'Compra de insumos' : 'Uso en producción'}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    className={`${stockForm.type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    Confirmar {stockForm.type === 'in' ? 'Entrada' : 'Salida'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </DashboardLayout >
    );
};

export default InventoryPage;
