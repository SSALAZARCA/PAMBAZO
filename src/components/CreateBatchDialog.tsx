import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { Plus, Package, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { Product, Material, MaterialUsage } from '../shared/types';
import { ScrollArea } from './ui/scroll-area';
import api from '../services/api';
import { toast } from 'sonner';


interface CreateBatchDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export const CreateBatchDialog: React.FC<CreateBatchDialogProps> = ({
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    trigger
}) => {
    const { addProductionBatch, user } = useStore();
    const [internalOpen, setInternalOpen] = useState(false);

    // Manage open state and steps
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = setControlledOpen || setInternalOpen;
    const [step, setStep] = useState<1 | 2>(1);

    const [products, setProducts] = useState<Product[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);

    const [selectedMaterials, setSelectedMaterials] = useState<{ materialId: string, quantity: number }[]>([]);

    const [formData, setFormData] = useState({
        productId: '',
        quantity: 20,
        notes: '',
        estimatedBakingTime: 0  // Tiempo estimado en minutos (0 = automático)
    });

    // Load products and materials from API
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load inventory materials
                const inventoryResponse = await api.inventory.getAll();
                if (inventoryResponse.success && inventoryResponse.data) {
                    const inventoryData = Array.isArray(inventoryResponse.data)
                        ? inventoryResponse.data
                        : (inventoryResponse.data as any).data || [];

                    // Convert inventory items to Material format
                    const materialsData: Material[] = inventoryData.map((item: any) => ({
                        id: String(item.id),
                        name: item.name || item.item_name,
                        unit: item.unit || 'un',
                        stock: item.stock || item.current_stock || 0,
                        minStock: item.minStock || item.min_stock || 0,
                        cost: item.cost || item.cost_per_unit || 0
                    }));
                    setMaterials(materialsData);
                }

                // Mock products (you can replace with real API call later)
                const mockProducts: Product[] = [
                    { id: '1', name: 'Pan Aliñado', category: 'Clásicos', price: 2000, description: 'Pan tradicional suave', available: true, rating: 4.5, stock: 50 },
                    { id: '2', name: 'Croissant', category: 'Hojaldres', price: 3500, description: 'Crujiente y mantequilloso', available: true, rating: 4.8, stock: 30 },
                    { id: '3', name: 'Pan de Bono', category: 'Quesos', price: 1500, description: 'Con queso fresco', available: true, rating: 4.9, stock: 100 },
                    { id: '4', name: 'Buñuelo', category: 'Fritos', price: 1200, description: 'Tradicional', available: true, rating: 4.7, stock: 80 },
                    { id: '5', name: 'Pan Integral', category: 'Saludable', price: 4000, description: '100% integral', available: true, rating: 4.6, stock: 20 },
                    { id: '6', name: 'Pastel de Pollo', category: 'Hojaldres', price: 3000, description: 'Relleno generoso', available: true, rating: 4.5, stock: 25 },
                    { id: '7', name: 'Mogolla Chicharrona', category: 'Tradicional', price: 1800, description: 'Con trocitos de chicharrón', available: true, rating: 4.8, stock: 40 },
                    { id: '8', name: 'Pan Coco', category: 'Dulce', price: 2200, description: 'Dulce y esponjoso', available: true, rating: 4.6, stock: 35 },
                ];
                setProducts(mockProducts);
            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Error al cargar los datos');
            }
        };

        loadData();
    }, []);


    const handleAddMaterial = () => {
        setSelectedMaterials([...selectedMaterials, { materialId: '', quantity: 0 }]);
    };

    const handleUpdateMaterial = (index: number, field: 'materialId' | 'quantity', value: string | number) => {
        setSelectedMaterials(prev => {
            const updated = [...prev];
            const current = updated[index];
            if (!current) return prev;

            if (field === 'materialId') {
                updated[index] = { materialId: value as string, quantity: current.quantity };
            } else if (field === 'quantity') {
                updated[index] = { materialId: current.materialId, quantity: Number(value) };
            }
            return updated;
        });
    };

    const handleRemoveMaterial = (index: number) => {
        const updated = [...selectedMaterials];
        updated.splice(index, 1);
        setSelectedMaterials(updated);
    };

    // Función para obtener tiempo de horneado por defecto según el producto
    const getDefaultBakingTime = (productName: string): number => {
        const name = productName.toLowerCase();
        if (name.includes('croissant')) return 12;
        if (name.includes('masa madre') || name.includes('hogaza')) return 25;
        if (name.includes('baguette')) return 8;
        if (name.includes('rol') || name.includes('canela')) return 15;
        if (name.includes('pan')) return 20;
        if (name.includes('buñuelo')) return 5;
        if (name.includes('pastel')) return 18;
        return 15; // Default
    };

    // Función para obtener temperatura por defecto según el producto
    const getDefaultTemperature = (productName: string): number => {
        const name = productName.toLowerCase();
        if (name.includes('croissant')) return 200;
        if (name.includes('masa madre') || name.includes('hogaza')) return 230;
        if (name.includes('baguette')) return 240;
        if (name.includes('rol') || name.includes('canela')) return 180;
        if (name.includes('buñuelo')) return 190;
        return 200; // Default
    };

    const handleSubmit = async () => {
        const product = products.find(p => p.id === formData.productId);
        if (!product) return;

        try {
            // 1. Deducir materiales del inventario (API REAL)
            if (selectedMaterials.length > 0) {
                const materialsToDeduct = selectedMaterials
                    .filter(m => m.materialId && m.quantity > 0)
                    .map(m => ({
                        materialId: m.materialId,
                        quantity: m.quantity
                    }));

                if (materialsToDeduct.length > 0) {
                    const deductionResponse = await api.production.deductMaterials(materialsToDeduct);

                    if (!deductionResponse.success) {
                        toast.error('Error al deducir materiales del inventario');
                        return;
                    }

                    toast.success(`Materiales deducidos: ${(deductionResponse.data as any).deductions.length} items`);
                }
            }

            // 2. Crear el lote de producción
            const materialsUsed: MaterialUsage[] = selectedMaterials
                .filter(m => m.materialId && m.quantity > 0)
                .map(m => {
                    const mat = materials.find(mat => mat.id === m.materialId);
                    return {
                        id: `usage-${Date.now()}-${m.materialId}`,
                        materialId: m.materialId,
                        materialName: mat?.name || 'Desconocido',
                        quantityUsed: m.quantity,
                        unit: mat?.unit || 'un',
                        cost: (mat?.cost || 0) * m.quantity,
                        usageDate: new Date(),
                        date: new Date(),
                        batchId: 'pending-creation'
                    };
                });

            // Calcular tiempo estimado de horneado
            const estimatedMinutes = formData.estimatedBakingTime > 0
                ? formData.estimatedBakingTime
                : getDefaultBakingTime(product.name);

            addProductionBatch({
                productId: product.id,
                productName: product.name,
                quantity: Number(formData.quantity),
                status: 'preparing',
                startTime: new Date(),
                estimatedEndTime: new Date(Date.now() + estimatedMinutes * 60 * 1000),
                bakerId: user?.id || 'current-user',
                bakerName: user?.name || 'Panadero',
                notes: formData.notes,
                materialsUsed: materialsUsed,
                temperature: getDefaultTemperature(product.name),
                estimatedBakingTime: estimatedMinutes
            });

            toast.success(`Lote de ${product.name} creado exitosamente`);

            // Reset
            setFormData({ productId: '', quantity: 20, notes: '', estimatedBakingTime: 0 });
            setSelectedMaterials([]);
            setStep(1);
            setIsOpen(false);
        } catch (error) {
            console.error('Error creating batch:', error);
            toast.error('Error al crear el lote de producción');
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) setStep(1); }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Lote
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="mx-auto bg-orange-100 p-3 rounded-full mb-2">
                        <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">
                        {step === 1 ? 'Iniciar Producción' : 'Salida de Materiales'}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {step === 1 ? 'Configura un nuevo lote para hornear.' : 'Registra los ingredientes que usarás para descontar del inventario.'}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="grid gap-4 py-4 animate-in fade-in slide-in-from-right-4">
                        <div className="grid gap-2">
                            <Label htmlFor="product">Producto</Label>
                            <Select
                                value={formData.productId}
                                onValueChange={(val) => setFormData({ ...formData, productId: val })}
                            >
                                <SelectTrigger id="product" className="h-11">
                                    <SelectValue placeholder="Seleccionar producto..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                                            <div className="flex justify-between items-center w-full gap-2">
                                                <span className="font-medium">{p.name}</span>
                                                <span className="text-xs text-gray-400">{p.category}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Cantidad a Producir</Label>
                            <Input
                                id="quantity"
                                type="number"
                                className="h-11 font-medium text-lg"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                min={1}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea
                                id="notes"
                                placeholder="Ej. Tostado extra, pedido especial..."
                                className="resize-none"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="estimatedTime">Tiempo de Horneado (minutos)</Label>
                                <span className="text-xs text-gray-500">
                                    {formData.estimatedBakingTime === 0 ? '(Automático)' : `${formData.estimatedBakingTime} min`}
                                </span>
                            </div>
                            <Input
                                id="estimatedTime"
                                type="number"
                                className="h-11"
                                value={formData.estimatedBakingTime}
                                onChange={(e) => setFormData({ ...formData, estimatedBakingTime: Number(e.target.value) })}
                                min={0}
                                placeholder="0 = Automático"
                            />
                            <p className="text-xs text-gray-500">
                                💡 Deja en 0 para calcular automáticamente según el producto.
                                {formData.productId && formData.estimatedBakingTime === 0 && (
                                    <span className="text-orange-600 font-medium">
                                        {' '}Tiempo estimado: {getDefaultBakingTime(products.find(p => p.id === formData.productId)?.name || '')} min
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="py-4 animate-in fade-in slide-in-from-right-4">
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg flex justify-between items-center text-sm border border-slate-200">
                            <span className="text-slate-600">Producto: <b>{products.find(p => p.id === formData.productId)?.name}</b></span>
                            <span className="text-slate-600">Cant: <b>{formData.quantity}</b></span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <Label>Ingredientes / Materia Prima</Label>
                            <Button variant="ghost" size="sm" onClick={handleAddMaterial} className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                <Plus className="w-3 h-3 mr-1" />
                                Agregar
                            </Button>
                        </div>

                        <ScrollArea className="h-[200px] w-full pr-4 border rounded-md p-2">
                            {selectedMaterials.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm italic">
                                    <ShoppingBag className="w-8 h-8 mb-2 opacity-50" />
                                    No has seleccionado ingredientes
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedMaterials.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <Select
                                                value={item.materialId}
                                                onValueChange={(val) => handleUpdateMaterial(idx, 'materialId', val)}
                                            >
                                                <SelectTrigger className="flex-1 h-9">
                                                    <SelectValue placeholder="Ingrediente" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {materials.map(m => (
                                                        <SelectItem key={m.id} value={m.id}>
                                                            {m.name} ({m.unit})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                placeholder="Cant"
                                                className="w-20 h-9"
                                                value={item.quantity === 0 ? '' : item.quantity}
                                                onChange={(e) => handleUpdateMaterial(idx, 'quantity', Number(e.target.value))}
                                            />
                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-red-500 hover:bg-red-50" onClick={() => handleRemoveMaterial(idx)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                        <p className="text-xs text-slate-500 mt-2">
                            * Estos materiales serán descontados del inventario inmediatamente.
                        </p>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    {step === 2 && (
                        <Button variant="outline" onClick={() => setStep(1)} className="mr-auto">
                            Atrás
                        </Button>
                    )}
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    {step === 1 ? (
                        <Button onClick={() => setStep(2)} className="bg-orange-600 hover:bg-orange-700 text-white" disabled={!formData.productId}>
                            Siguiente <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                            Confirmar y Producir <Package className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
