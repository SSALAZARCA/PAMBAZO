import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import {
    ShoppingBag,
    Clock,
    Award,
    Loader2,
    Star,
    Mail,
    ArrowRight,
    ChefHat,
    Wheat
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { formatCOP } from '../utils/currency';
import { toast } from 'sonner';
import LiveOvenWidget from '../components/LiveOvenWidget';
import RecentOrderToast from '../components/RecentOrderToast';

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
    const { user } = useAuthContext();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    // Fetch products from backend
    useEffect(() => {
        fetchProducts();
    }, []);

    // Initialize filtered products when products change
    useEffect(() => {
        if (selectedCategory === 'Todos') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.category === selectedCategory));
        }
    }, [products, selectedCategory]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.products.getAll({ limit: 6, available: true });

            if (response.success && response.data) {
                const fetchedProducts = (response.data as any).products || response.data || [];
                setProducts(fetchedProducts);
            } else {
                throw new Error('Error al cargar productos');
            }
        } catch (err: any) {
            console.warn('Backend no disponible, cargando datos de demostración', err);
            // Fallback to demo data so the UI looks good
            const DEMO_PRODUCTS: Product[] = [
                { id: '1', name: 'Croissant de Mantequilla', description: 'Capas perfectamente horneadas con mantequilla francesa.', price: 4500, category: 'Pan Dulce', available: true },
                { id: '2', name: 'Hogaza Masa Madre', description: 'Fermentación de 48h, corteza crujiente y miga suave.', price: 12000, category: 'Panadería', available: true },
                { id: '3', name: 'Rol de Canela', description: 'Glaseado de queso crema y canela de Ceylan.', price: 5500, category: 'Pan Dulce', available: true },
                { id: '4', name: 'Baguette Tradicional', description: 'La receta clásica francesa, perfecta para acompañar.', price: 3800, category: 'Panadería', available: true },
                { id: '5', name: 'Pastel de Zanahoria', description: 'Especiado, húmedo y con nueces tostadas.', price: 8500, category: 'Pasteles', available: true },
                { id: '6', name: 'Galleta Choco Chips', description: 'Crujiente por fuera, suave por dentro, chocolate 70%.', price: 4000, category: 'Galletas', available: true },
            ];
            setProducts(DEMO_PRODUCTS);
            toast.message('Modo Demostración', { description: 'Mostrando productos ejemplo (Backend desconectado)' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        toast.success('¡Bienvenido al Club de la Miga! 🥐 Pronto recibirás noticias deliciosas.');
        setEmail('');
    };

    // Helper to get unique categories
    const categories = ['Todos', ...new Set(products.map(p => p.category))];

    // Helper to get image based on category (Simulating the generated asset usage)
    const getProductImage = (category: string) => {
        // ... (existing code)
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('pan')) return "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop";
        if (categoryLower.includes('pastel') || categoryLower.includes('repostería')) return "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=600&auto=format&fit=crop";
        if (categoryLower.includes('galleta')) return "https://images.unsplash.com/photo-1499636138143-bd630f5cf388?q=80&w=600&auto=format&fit=crop";
        return "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop";
    };

    return (
        <div className="min-h-screen bg-[#FFFBF0] font-sans text-foreground overflow-x-hidden">
            {/* Navigation Bar (Glass) */}
            <nav className="fixed top-0 w-full z-50 glass-card px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-white/20">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-500 rounded-lg p-1.5 shadow-lg shadow-orange-500/20">
                        <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold font-display text-gray-900 tracking-tight">PAMBAZO</span>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        className="hidden md:flex text-gray-600 hover:text-orange-600 font-medium"
                        onClick={() => document.getElementById('historia')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Nuestra Historia
                    </Button>
                    <Button
                        variant="ghost"
                        className="hidden md:flex text-gray-600 hover:text-orange-600 font-medium"
                        onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Menú
                    </Button>
                    <Button
                        className="bg-gray-900 text-white hover:bg-orange-600 transition-colors shadow-lg"
                        onClick={() => navigate(user ? '/dashboard' : '/login')}
                    >
                        {user ? 'Ir al Panel' : 'Iniciar Sesión'}
                    </Button>
                </div>
            </nav>

            {/* Hero Section Immersive */}
            <header className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=3272&auto=format&fit=crop"
                        alt="Artisan Bakery Background"
                        className="w-full h-full object-cover animate-pulse-slow"
                        style={{ animationDuration: '30s', transformOrigin: 'center center' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#FFFBF0]"></div>

                    {/* Enhanced Steam/Vapor Effect - Layer 1 */}
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-white/20 via-transparent to-transparent opacity-40 animate-steam pointer-events-none" style={{ animationDuration: '3s' }}></div>

                    {/* Enhanced Steam/Vapor Effect - Layer 2 (Delayed) */}
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-white/20 via-transparent to-transparent opacity-40 animate-steam pointer-events-none" style={{ animationDuration: '4s', animationDelay: '1.5s' }}></div>

                    {/* Floating Flour "Magic Dust" Particles */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse-slow"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6 animate-fade-in-up">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>Votada la mejor panadería artesanal del 2024</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold font-display text-white mb-6 leading-tight drop-shadow-lg tracking-tight">
                        El arte de la <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-200">masa madre</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        Redescubre el sabor del pan auténtico. Fermentación lenta de 48 horas, ingredientes orgánicos y la pasión de nuestros maestros panaderos en cada pieza.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <Button
                            size="lg"
                            className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-7 text-lg rounded-full shadow-xl shadow-orange-900/20 transition-all transform hover:-translate-y-1 hover:shadow-2xl"
                            onClick={() => navigate(user ? '/dashboard' : '/login')}
                        >
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            {user ? 'Hacer Pedido' : 'Ordenar para Recoger'}
                        </Button>

                        <Button
                            size="lg"
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md px-8 py-7 text-lg rounded-full"
                            onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Ver Menú del Día
                        </Button>
                    </div>

                    {/* Live Oven Widget - Floating absolutely on desktop, stacked on mobile */}
                    <div className="hidden lg:block absolute -right-32 top-1/2 transform -translate-y-1/2 animate-float">
                        <LiveOvenWidget />
                    </div>

                    {/* Mobile version of Live Oven Widget */}
                    <div className="lg:hidden mt-8 flex justify-center">
                        <LiveOvenWidget />
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
                        <div className="w-1 h-3 bg-white/60 rounded-full"></div>
                    </div>
                </div>
            </header>

            <RecentOrderToast />

            {/* Features / Benefits Strip */}
            <section className="bg-[#FFFBF0] py-16 -mt-8 relative z-20 rounded-t-[3rem]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Wheat, title: "100% Orgánico", desc: "Harinas de grano entero sin blanquear." },
                            { icon: Clock, title: "48h Fermentación", desc: "Proceso lento para mayor sabor y digestión." },
                            { icon: Award, title: "Hecho a Mano", desc: "Cada pieza formada por artesanos." }
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-6 rounded-2xl bg-white border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{feature.title}</h3>
                                    <p className="text-gray-500 text-sm">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Showcase 2.0 */}
            <section id="productos" className="py-24 relative bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                        <div>
                            <span className="text-orange-600 font-semibold tracking-wider text-sm uppercase">Recién salido del horno</span>
                            <h2 className="text-4xl md:text-5xl font-bold font-display text-gray-900 mt-2">
                                Favoritos del Día
                            </h2>
                        </div>
                        <Button
                            variant="link"
                            className="text-orange-600 font-semibold text-lg group hidden md:flex"
                            onClick={() => navigate('/login')}
                        >
                            Ver todo el menú <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    {/* Category Filter Pills */}
                    {!loading && !error && (
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat
                                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-600 ring-offset-2'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-200 hover:text-orange-600'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-24 bg-gray-50 rounded-3xl">
                            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                            <span className="text-xl text-gray-500 font-medium">Preparando la vitrina...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100 p-8 max-w-md mx-auto">
                            <p className="text-red-600 mb-4 text-lg font-medium">⚠️ {error}</p>
                            <Button onClick={fetchProducts} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                                🔄 Reintentar
                            </Button>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-24 bg-gray-50 rounded-3xl">
                            <div className="bg-gray-100 p-4 rounded-full mb-4 inline-block">
                                <ShoppingBag className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-400 text-xl font-medium">No hay productos en esta categoría</p>
                            <button
                                onClick={() => setSelectedCategory('Todos')}
                                className="mt-4 text-orange-600 font-medium hover:underline"
                            >
                                Ver todos los productos
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1">
                                    {/* Image Section */}
                                    <div className="relative h-64 overflow-hidden bg-gray-100">
                                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                                            {product.available ? (
                                                <span className="px-3 py-1 bg-white/90 backdrop-blur text-green-700 text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                    Disponible
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-gray-900/90 backdrop-blur text-white text-xs font-bold rounded-full shadow-sm">
                                                    Agotado
                                                </span>
                                            )}
                                        </div>
                                        <img
                                            src={getProductImage(product.category)}
                                            alt={product.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>

                                        <div className="absolute bottom-4 left-4 text-white">
                                            <p className="text-sm font-medium opacity-90 mb-1">{product.category}</p>
                                            <h3 className="text-2xl font-bold font-display leading-none">{product.name}</h3>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6">
                                        <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[40px]">
                                            {product.description || "Deliciosa creación artesanal con los mejores ingredientes seleccionados."}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900 font-display">
                                                    {formatCOP(product.price)}
                                                </p>
                                            </div>
                                            <Button
                                                size="icon"
                                                className="rounded-full w-10 h-10 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-110"
                                                onClick={() => navigate('/login')}
                                                disabled={!product.available}
                                            >
                                                <ShoppingBag className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-12 text-center md:hidden">
                        <Button
                            className="bg-gray-900 text-white w-full py-4 rounded-xl font-medium"
                            onClick={() => navigate('/login')}
                        >
                            Ver todo el menú
                        </Button>
                    </div>
                </div>
            </section>

            {/* Master Baker Story Section */}
            <section id="historia" className="py-24 bg-[#FFFBF0] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-50/50 rounded-l-[100px] hidden lg:block"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2 relative">
                            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                                <img
                                    src="https://images.unsplash.com/photo-1583332130317-de7cb869f88c?q=80&w=2600&auto=format&fit=crop"
                                    alt="Master Baker Kneading"
                                    className="w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
                                <div className="absolute bottom-8 left-8 text-white">
                                    <p className="font-display text-3xl">Mateo Rossi</p>
                                    <p className="text-orange-200">Maestro Panadero</p>
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-20"></div>
                        </div>

                        <div className="w-full lg:w-1/2">
                            <h2 className="text-4xl md:text-5xl font-bold font-display text-gray-900 mb-6">
                                "El buen pan requiere dos ingredientes: <span className="text-orange-600">tiempo y alma</span>."
                            </h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                En PAMBAZO, no aceleramos procesos. Respetamos la tradición de la fermentación larga, permitiendo que las levaduras naturales desarrollen sabores complejos que ninguna maquinaria industrial puede replicar.
                            </p>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Cada mañana, antes de que salga el sol, nuestro equipo ya está amasando a mano, asegurando que cuando llegues, el aroma a pan recién horneado sea tu mejor bienvenida.
                            </p>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-4xl font-bold text-gray-900 font-display">15+</p>
                                    <p className="text-gray-500">Años de tradición</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-bold text-gray-900 font-display">48h</p>
                                    <p className="text-gray-500">Fermentación promedio</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter / Club Section */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <img
                        src="https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=2940&auto=format&fit=crop"
                        className="w-full h-full object-cover grayscale"
                    />
                </div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <Mail className="w-12 h-12 mx-auto text-orange-400 mb-6" />
                    <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">Únete al Club de la Miga</h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Recibe un <span className="text-orange-400 font-bold">croissant gratis</span> en tu cumpleaños, acceso a catas exclusivas y las recetas secretas de Mateo.
                    </p>

                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                        <input
                            type="email"
                            placeholder="Tu correo electrónico"
                            className="flex-1 bg-white/10 backdrop-blur border border-white/20 rounded-full px-6 py-4 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-orange-900/40"
                        >
                            Suscribirme
                        </Button>
                    </form>
                    <p className="text-xs text-gray-500 mt-4">Sin spam. Solo amor y harina.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                        <div className="text-center md:text-left mb-8 md:mb-0">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <span className="text-2xl font-bold font-display text-gray-900 tracking-tight">PAMBAZO</span>
                            </div>
                            <p className="text-gray-500 text-sm max-w-xs">
                                Panadería artesanal redefiniendo la experiencia del pan diario con pasión y tecnología.
                            </p>
                        </div>
                        <div className="flex gap-8 text-sm font-medium text-gray-500">
                            <a href="#" className="hover:text-orange-600 transition-colors">Instagram</a>
                            <a href="#" className="hover:text-orange-600 transition-colors">Facebook</a>
                            <a href="#" className="hover:text-orange-600 transition-colors">Ubicaciones</a>
                            <a href="#" className="hover:text-orange-600 transition-colors">Contacto</a>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                        <p>© 2024 PAMBAZO. Hecho con ❤️ y 🥖 en Colombia.</p>
                        <div className="mt-4 md:mt-0 flex gap-4">
                            <span onClick={() => navigate(user ? '/dashboard' : '/login')} className="cursor-pointer hover:text-orange-500">{user ? 'Panel de Control' : 'Acceso Corporativo'}</span>
                            <span>Privacidad</span>
                            <span>Términos</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
