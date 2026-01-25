import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { User } from '../../../../shared/types'; // Asegúrate de que Product esté exportado en types o definirlo aquí
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Package, Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../../components/ui/dialog'; // Asumiendo que existen
import { Label } from '../../../components/ui/label';
import api from '../../../services/api';

interface ProductsPageProps {
    user: User;
    onLogout: () => void;
}

// Interfaz local si no coincide exactamente con shared/types, pero intentaremos usar la de api.ts
interface ProductFormData {
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    available: boolean;
}

const initialFormData: ProductFormData = {
    name: '',
    description: '',
    price: 0,
    category: 'general',
    image_url: '',
    available: true
};

export const ProductsPage: React.FC<ProductsPageProps> = ({ user, onLogout }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProductFormData>(initialFormData);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.products.getAll();
            if (res.success && res.data) {
                // Manejar la estructura paginada o array directo
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
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.products.update(editingProduct, formData);
            } else {
                await api.products.create(formData);
            }
            setIsDialogOpen(false);
            setFormData(initialFormData);
            setEditingProduct(null);
            fetchProducts(); // Recargar lista
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error al guardar el producto');
        }
    };

    const handleEdit = (product: any) => {
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category || 'general',
            image_url: product.image_url || '',
            available: product.available !== false
        });
        setEditingProduct(product.id);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await api.products.delete(id);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleOpenDialog = () => {
        setFormData(initialFormData);
        setEditingProduct(null);
        setIsDialogOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image_url: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
                            Gestión de Productos
                        </h1>
                        <p className="text-gray-500">
                            Administra el catálogo del menú ({products.length} productos)
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleOpenDialog}>
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Producto
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                                <div className="space-y-2">
                                    <Label>Imagen del Producto</Label>
                                    <div className="flex flex-col items-center gap-4 border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                                        {formData.image_url ? (
                                            <div className="relative w-32 h-32">
                                                <img
                                                    src={formData.image_url}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-lg shadow-sm"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                    onClick={() => setFormData({ ...formData, image_url: '' })}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <span className="text-sm">Sin imagen</span>
                                            </div>
                                        )}
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Precio</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoría</Label>
                                        <Input
                                            id="category"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="ej. Panes, Bebidas"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                                        {editingProduct ? 'Actualizar' : 'Guardar'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-orange-600" />
                                Catálogo
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="group relative bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="h-12 w-12 rounded-full object-cover border border-gray-100 shadow-sm"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                    {product.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => handleEdit(product)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDelete(product.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 truncate" title={product.name}>{product.name}</h3>
                                        <p className="text-sm text-gray-500 mb-3 truncate">{product.description || 'Sin descripción'}</p>
                                        <div className="flex justify-between items-center mt-auto">
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                                {product.category || 'General'}
                                            </Badge>
                                            <span className="font-bold text-lg text-orange-600">
                                                ${product.price.toLocaleString()}
                                            </span>
                                        </div>
                                        {!product.available && (
                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px] rounded-xl">
                                                <Badge variant="destructive">No Disponible</Badge>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {!loading && filteredProducts.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                No se encontraron productos. ¡Crea el primero!
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ProductsPage;
