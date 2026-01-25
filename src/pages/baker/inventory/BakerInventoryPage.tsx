import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import api, { User, InventoryItem } from '../../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Package, Search, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface BakerInventoryPageProps {
    user: User;
    onLogout: () => void;
}

export const BakerInventoryPage: React.FC<BakerInventoryPageProps> = ({ user, onLogout }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await api.inventory.getAll();
            // Handle both array and paginated response
            const data = Array.isArray(response.data) ? response.data : (response.data as any)?.items || [];
            setItems(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Error al cargar el inventario');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchInventory, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredItems = items.filter(item =>
        (item.name || item.item_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Categorizar por nombre o notas (ya que no existe category en InventoryItem)
    const materiaPrima = filteredItems.filter(item => {
        const name = (item.name || item.item_name || '').toLowerCase();
        return name.includes('harina') || name.includes('azúcar') || name.includes('levadura') ||
            name.includes('mantequilla') || name.includes('huevos') || name.includes('sal') ||
            name.includes('leche') || item.notes?.includes('materia prima');
    });
    const productosTerminados = filteredItems.filter(item => {
        const name = (item.name || item.item_name || '').toLowerCase();
        return name.includes('pan') || name.includes('croissant') || name.includes('galleta') ||
            name.includes('pastel') || name.includes('torta') || item.notes?.includes('producto terminado');
    });
    const lowStockItems = filteredItems.filter(item => {
        const stock = item.stock ?? item.current_stock ?? 0;
        const minStock = item.min_stock ?? 0;
        return stock <= minStock;
    });

    const getStockStatus = (item: InventoryItem) => {
        const stock = item.stock ?? item.current_stock ?? 0;
        const minStock = item.min_stock ?? 0;

        if (stock === 0) return { color: 'bg-red-500', text: 'Sin Stock', icon: AlertTriangle };
        if (stock <= minStock) return { color: 'bg-orange-500', text: 'Stock Bajo', icon: TrendingDown };
        if (stock <= minStock * 2) return { color: 'bg-yellow-500', text: 'Stock Medio', icon: TrendingDown };
        return { color: 'bg-green-500', text: 'Stock OK', icon: TrendingUp };
    };

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">📦 Inventario</h1>
                        <p className="text-gray-600 mt-1">Consulta de materiales y productos</p>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                        {items.length} Items
                    </Badge>
                </div>

                {/* Search Bar */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Alertas de Stock Bajo */}
                {lowStockItems.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-700">
                                <AlertTriangle className="h-5 w-5" />
                                Alertas de Stock Bajo ({lowStockItems.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {lowStockItems.map(item => {
                                    const stock = item.stock ?? item.current_stock ?? 0;
                                    const minStock = item.min_stock ?? 0;
                                    return (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                                            <div className="flex items-center gap-3">
                                                <Package className="h-5 w-5 text-orange-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.name || item.item_name}</p>
                                                    <p className="text-sm text-gray-500">Mínimo: {minStock} {item.unit}</p>
                                                </div>
                                            </div>
                                            <Badge variant="destructive">
                                                {stock} {item.unit}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Materia Prima */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            Materia Prima ({materiaPrima.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Cargando inventario...</div>
                        ) : materiaPrima.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No hay materias primas</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {materiaPrima.map(item => {
                                    const stock = item.stock ?? item.current_stock ?? 0;
                                    const minStock = item.min_stock ?? 0;
                                    const status = getStockStatus(item);
                                    const StatusIcon = status.icon;

                                    return (
                                        <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{item.name || item.item_name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Unidad: {item.unit}</p>
                                                </div>
                                                <StatusIcon className={`h-5 w-5 ${stock <= minStock ? 'text-orange-500' : 'text-green-500'}`} />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Stock Actual:</span>
                                                    <span className="font-bold text-lg">{stock} {item.unit}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Stock Mínimo:</span>
                                                    <span className="text-sm text-gray-700">{minStock} {item.unit}</span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mt-3">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${status.color}`}
                                                            style={{ width: `${Math.min((stock / (minStock * 2)) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 text-center">{status.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Productos Terminados */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-green-600" />
                            Productos Terminados ({productosTerminados.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {productosTerminados.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No hay productos terminados</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {productosTerminados.map(item => {
                                    const stock = item.stock ?? item.current_stock ?? 0;
                                    const minStock = item.min_stock ?? 0;
                                    const status = getStockStatus(item);
                                    const StatusIcon = status.icon;

                                    return (
                                        <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{item.name || item.item_name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Unidad: {item.unit}</p>
                                                </div>
                                                <StatusIcon className={`h-5 w-5 ${stock <= minStock ? 'text-orange-500' : 'text-green-600'}`} />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Stock Actual:</span>
                                                    <span className="font-bold text-lg text-green-700">{stock} {item.unit}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Stock Mínimo:</span>
                                                    <span className="text-sm text-gray-700">{minStock} {item.unit}</span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mt-3">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${status.color}`}
                                                            style={{ width: `${Math.min((stock / (minStock * 2)) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 text-center">{status.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default BakerInventoryPage;
