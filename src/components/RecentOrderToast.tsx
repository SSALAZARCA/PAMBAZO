import { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ORDER_NAMES = ['Sofia', 'Carlos', 'Ana', 'Luis', 'Valentina', 'Mateo', 'Isabella'];
const PRODUCTS = [
    '6x Croissants',
    'Hogaza Masa Madre',
    'Caja de Regalo',
    'Pastel de Zanahoria',
    'Café Americano + Rol',
    'Pan de Campo'
];
const LOCATIONS = ['Centro', 'Norte', 'Chapinero', 'Usaquén', 'Domicilio'];

const RecentOrderToast = () => {
    const [visible, setVisible] = useState(false);
    const [orderData, setOrderData] = useState({ name: '', product: '', location: '', time: '' });

    useEffect(() => {
        // Initial delay
        const initialTimeout = setTimeout(() => {
            triggerNotification();
        }, 5000);

        const interval = setInterval(() => {
            triggerNotification();
        }, 15000 + Math.random() * 10000); // Random interval between 15-25s

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    const triggerNotification = () => {
        const name = ORDER_NAMES[Math.floor(Math.random() * ORDER_NAMES.length)] || 'Cliente';
        const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)] || 'Pan Artesanal';
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)] || 'Online';

        setOrderData({ name, product, location, time: 'Hace un momento' });
        setVisible(true);

        // Auto hide
        setTimeout(() => {
            setVisible(false);
        }, 5000);
    };

    if (!visible) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-6 left-6 z-[9999] bg-white border border-gray-100 shadow-xl rounded-xl p-4 flex items-center gap-4 max-w-sm"
                >
                    <div className="bg-green-100 p-2 rounded-full">
                        <ShoppingBag className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-900 font-medium">
                            <span className="font-bold">{orderData.name}</span> ordenó <span className="font-bold">{orderData.product}</span>
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            {orderData.location} • <span className="text-green-600 font-medium">{orderData.time}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setVisible(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RecentOrderToast;
