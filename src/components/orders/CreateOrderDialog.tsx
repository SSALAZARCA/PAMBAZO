import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Plus, Minus, ShoppingCart, Search } from 'lucide-react';
import { Badge } from '../ui/badge';
import api from '../../services/api';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    available: boolean;
}

interface OrderItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
}

export interface CreateOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    tableId: string | null;
    tableNumber?: number | undefined;
    onOrderCreated: () => void;
}

export const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({
    isOpen,
    onClose,
    tableId,
    tableNumber,
    onOrderCreated
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('todos');

    useEffect(() => {
        if (isOpen) {
            loadProducts();
            setCart([]);
            setSearchTerm('');
        }
    }, [isOpen]);

    const loadProducts = async () => {
        try {
            const res = await api.products.getAll();
            if (res.success && res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
                setProducts(list.filter((p: any) => p.available !== false));
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: 1
            }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === productId);
            if (existing && existing.quantity > 1) {
                return prev.map(item =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prev.filter(item => item.productId !== productId);
        });
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const categories = ['todos', ...new Set(products.map(p => p.category || 'general'))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'todos' || (p.category || 'general') === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleCreateOrder = async () => {
        if (!tableId || cart.length === 0) return;

        setLoading(true);
        try {
            await api.orders.create({
                order_type: 'dine_in',
                table_id: tableId,
                tableNumber: tableNumber,
                items: cart.map(item => ({
                    product_id: item.productId,
                    product_name: item.productName,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price
                }))
            } as any);
            onOrderCreated();
            onClose();
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Error al crear el pedido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="flex justify-between items-center">
                        <span>Nuevo Pedido - Mesa {tableNumber}</span>
                        <Badge variant="outline" className="text-lg">
                            Total: ${totalAmount.toLocaleString()}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden">
                    {/* Catalog Section */}
                    <div className="flex-1 flex flex-col border-r bg-gray-50/50">
                        <div className="p-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar producto..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <ScrollArea className="w-full whitespace-nowrap pb-2">
                                <div className="flex gap-2">
                                    {categories.map(cat => (
                                        <Button
                                            key={cat}
                                            variant={activeCategory === cat ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setActiveCategory(cat)}
                                            className="capitalize"
                                        >
                                            {cat}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <ScrollArea className="flex-1 p-4 pt-0">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className="bg-white p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                                        onClick={() => addToCart(product)}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                    {product.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-900">${product.price}</span>
                                            </div>
                                            <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1 group-hover:text-orange-600">{product.name}</h4>
                                        </div>
                                        <Button size="sm" variant="secondary" className="w-full h-7 text-xs mt-2 bg-orange-50 text-orange-700 hover:bg-orange-100">
                                            <Plus className="w-3 h-3 mr-1" /> Agregar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Cart Section */}
                    <div className="w-1/3 flex flex-col bg-white">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Resumen del Pedido
                            </h3>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                                    <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                                    <p>El carrito está vacío</p>
                                    <p className="text-sm">Selecciona productos a la izquierda</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map(item => (
                                        <div key={item.productId} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                                            <div className="flex-1 min-w-0 mr-2">
                                                <p className="font-medium text-sm truncate">{item.productName}</p>
                                                <p className="text-xs text-gray-500">${item.price} c/u</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeFromCart(item.productId)}>
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="w-4 text-center font-medium text-sm">{item.quantity}</span>
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => addToCart({ id: item.productId, name: item.productName, price: item.price } as any)}>
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium text-gray-600">Total a Pagar</span>
                                <span className="text-xl font-bold text-gray-900">${totalAmount.toLocaleString()}</span>
                            </div>
                            <Button
                                className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg"
                                disabled={cart.length === 0 || loading}
                                onClick={handleCreateOrder}
                            >
                                {loading ? 'Enviando...' : 'Confirmar Pedido'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
