import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    MapPin,
    Clock,
    Phone,
    Award,
    Calendar,
    Truck,
    ChevronRight,
    Star,
    Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { formatCOP } from '../utils/currency';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    available: boolean;
}

const LandingPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch products from backend
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('http://localhost:3001/api/v1/products?limit=6&available=true');

            if (!response.ok) {
                throw new Error('Error al cargar productos');
            }

            const data = await response.json();

            if (data.success && data.data) {
                setProducts(data.data.products || []);
            } else {
                setError('No se pudieron cargar los productos');
            }
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError(err.message || 'Error de conexión con el servidor');
            toast.error('No se pudieron cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get emoji based on category
    const getProductEmoji = (category: string): string => {
        const emojiMap: { [key: string]: string } = {
            'Pan Dulce': '🥐',
            'Pan de Caja': '🍞',
            'Pasteles': '🎂',
            'Galletas': '🍪',
            'Panadería': '🥖',
            'Repostería': '🧁'
        };
        return emojiMap[category] || '🥖';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
            {/* Hero Section */}
            <section className="relative py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="text-8xl mb-6">🥖</div>
                        <h1 className="text-6xl font-bold text-orange-800 mb-4">PAMBAZO</h1>
                        <p className="text-2xl text-orange-600 mb-4">Panadería Artesanal</p>
                        <p className="text-xl text-orange-500 mb-12">Pan fresco todos los días</p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg"
                                onClick={() => navigate('/login')}
                            >
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                Ordenar Ahora
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="border-orange-600 text-orange-600 px-8 py-6 text-lg"
                                onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Ver Menú
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section - CONNECTED TO BACKEND */}
            <section id="productos" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-orange-800 text-center mb-4">
                        Nuestros Productos Destacados
                    </h2>
                    <p className="text-center text-orange-600 mb-12">
                        Productos frescos disponibles hoy
                    </p>

                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-20">
                            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
                            <span className="text-xl text-orange-600">Cargando productos desde el servidor...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-600 mb-4 text-lg">⚠️ {error}</p>
                            <p className="text-gray-600 mb-6">Asegúrate de que el servidor esté corriendo en http://localhost:3001</p>
                            <Button onClick={fetchProducts} variant="outline" className="border-orange-600 text-orange-600">
                                🔄 Reintentar
                            </Button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-600 text-xl mb-4">📭 No hay productos disponibles en este momento</p>
                            <p className="text-gray-500">Vuelve pronto para ver nuestras delicias</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {products.map((product) => (
                                    <Card key={product.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                        <CardContent className="p-6 text-center">
                                            <div className="text-6xl mb-4">
                                                {getProductEmoji(product.category)}
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                                            {product.description && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                                                    {product.description}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-center gap-1 mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                                    />
                                                ))}
                                                <span className="ml-2 text-sm text-gray-600">5.0</span>
                                            </div>
                                            <p className="text-2xl text-orange-600 font-bold mb-4">
                                                {formatCOP(product.price)}
                                            </p>
                                            <Button
                                                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400"
                                                onClick={() => navigate('/login')}
                                                disabled={!product.available}
                                            >
                                                {product.available ? 'Agregar al Carrito' : 'No Disponible'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="text-center mt-12">
                                <p className="text-sm text-gray-500 mb-4">
                                    Mostrando {products.length} productos disponibles
                                </p>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-orange-600 text-orange-600 px-8 py-4"
                                    onClick={() => navigate('/login')}
                                >
                                    Ver Todo el Menú
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-orange-800 text-center mb-12">
                        ¿Por Qué Elegirnos?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="hover:shadow-xl transition-shadow">
                            <CardContent className="p-8 text-center">
                                <Award className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Programa de Lealtad</h3>
                                <p className="text-gray-600">Acumula puntos y obtén recompensas exclusivas</p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-xl transition-shadow">
                            <CardContent className="p-8 text-center">
                                <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Sistema de Reservas</h3>
                                <p className="text-gray-600">Reserva tu mesa o pedido con anticipación</p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-xl transition-shadow">
                            <CardContent className="p-8 text-center">
                                <Truck className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Delivery Disponible</h3>
                                <p className="text-gray-600">Entrega rápida a domicilio en toda la ciudad</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-orange-800 text-center mb-12">Visítanos</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <MapPin className="w-8 h-8 text-orange-600 mb-4" />
                                <h3 className="font-bold text-lg mb-2">Ubicación</h3>
                                <p className="text-gray-600">Av. Principal 123, Col. Centro</p>
                                <p className="text-gray-600">Ciudad, Estado, CP 12345</p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <Clock className="w-8 h-8 text-blue-600 mb-4" />
                                <h3 className="font-bold text-lg mb-2">Horarios</h3>
                                <p className="text-gray-600"><strong>Lun-Vie:</strong> 6:00 AM - 8:00 PM</p>
                                <p className="text-gray-600"><strong>Sábados:</strong> 6:00 AM - 9:00 PM</p>
                                <p className="text-gray-600"><strong>Domingos:</strong> 7:00 AM - 7:00 PM</p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <Phone className="w-8 h-8 text-green-600 mb-4" />
                                <h3 className="font-bold text-lg mb-2">Contacto</h3>
                                <p className="text-gray-600">📞 +57 123 456 7890</p>
                                <p className="text-gray-600">📱 WhatsApp: +57 123 456 7890</p>
                                <p className="text-gray-600">✉️ info@pambazo.com</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-orange-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-4">🥖</div>
                        <h3 className="text-2xl font-bold mb-2">PAMBAZO</h3>
                        <p className="text-orange-200">Panadería Artesanal desde 2024</p>
                    </div>

                    <div className="border-t border-orange-800 pt-8 text-center">
                        <p className="text-orange-200 mb-4">© 2024 PAMBAZO. Todos los derechos reservados.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-orange-200 hover:text-white underline text-sm"
                        >
                            Acceso Empleados
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
