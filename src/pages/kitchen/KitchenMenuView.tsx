import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { User } from '../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Package, Search, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

interface KitchenMenuViewProps {
    user: User;
    onLogout: () => void;
}

export const KitchenMenuView: React.FC<KitchenMenuViewProps> = ({ user, onLogout }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.products.getAll();
            if (res.success && res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data as any).data || (res.data as any).products || [];
                setProducts(list);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        // Recargar cada 30 segundos para ver cambios de disponibilidad
        const interval = setInterval(fetchProducts, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Agrupar por categoría
    const productsByCategory = filteredProducts.reduce((acc, product) => {
        const category = product.category || 'General';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
                        Menú Disponible
                    </h1>
                    <p className="text-gray-500">
                        Consulta los productos disponibles ({products.length} productos)
                    </p>
                </div>

                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-orange-600" />
                                Productos
                            </CardTitle>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar producto..."
                                    className="pl-10 w-64"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Cargando productos...</div>
                        ) : (
                            <div className="space-y-6">
                                {(Object.entries(productsByCategory) as [string, any[]][]).map(([category, categoryProducts]) => (
                                    <div key={category}>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <div className="h-1 w-8 bg-orange-500 rounded"></div>
                                            {category}
                                            <Badge variant="secondary" className="ml-2">
                                                {categoryProducts.length}
                                            </Badge>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {categoryProducts.map((product: any) => (
                                                <div
                                                    key={product.id}
                                                    className={`p-4 rounded-xl border-2 transition-all ${product.available
                                                        ? 'bg-white border-gray-200 hover:shadow-md'
                                                        : 'bg-gray-50 border-gray-300 opacity-60'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        {product.image_url ? (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className="h-12 w-12 rounded-full object-cover border border-gray-100 shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                                                                {product.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            {product.available ? (
                                                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    Disponible
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="destructive">
                                                                    <XCircle className="w-3 h-3 mr-1" />
                                                                    Agotado
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                                        {product.description || 'Sin descripción'}
                                                    </p>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-400">
                                                            ID: {product.id}
                                                        </span>
                                                        <span className="font-bold text-lg text-orange-600">
                                                            ${product.price?.toLocaleString() || '0'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!loading && filteredProducts.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>No se encontraron productos</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Leyenda informativa */}
                <Card className="glass-card bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">
                                    Vista de Solo Lectura
                                </h4>
                                <p className="text-sm text-blue-700">
                                    Esta es una vista informativa del menú. Los productos se actualizan automáticamente.
                                    Para modificar el menú, contacta al administrador.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default KitchenMenuView;
