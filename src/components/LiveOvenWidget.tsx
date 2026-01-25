import { useState, useEffect } from 'react';
import { Flame, Timer, Package } from 'lucide-react';

interface ProductionBatch {
    id: string;
    productName: string;
    quantity: number;
    status: 'pending' | 'in_progress' | 'completed';
    startTime: string;
    estimatedCompletionTime?: string;
    temperature?: number;
}

const LiveOvenWidget = () => {
    const [batches, setBatches] = useState<ProductionBatch[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);

    // Fetch production batches from backend
    useEffect(() => {
        fetchProductionBatches();
        // Refresh every 30 seconds
        const interval = setInterval(fetchProductionBatches, 30000);
        return () => clearInterval(interval);
    }, []);

    // Rotate through batches
    useEffect(() => {
        if (batches.length === 0) return;

        const rotateInterval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % batches.length);
        }, 8000); // Change item every 8 seconds

        return () => clearInterval(rotateInterval);
    }, [batches.length]);

    const fetchProductionBatches = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/v1/production/batches');

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    const activeBatches = data.data.filter((batch: ProductionBatch) =>
                        batch.status === 'in_progress' || batch.status === 'pending'
                    );

                    if (activeBatches.length > 0) {
                        setBatches(activeBatches);
                        setIsOnline(true);
                    } else {
                        // Use demo data if no active batches
                        useDemoData();
                    }
                } else {
                    useDemoData();
                }
            } else {
                useDemoData();
            }
        } catch (error) {
            console.warn('Backend no disponible, usando datos de demostración', error);
            useDemoData();
        } finally {
            setLoading(false);
        }
    };

    const useDemoData = () => {
        const DEMO_BATCHES: ProductionBatch[] = [
            {
                id: 'demo-1',
                productName: 'Croissants de Mantequilla',
                quantity: 24,
                status: 'in_progress',
                startTime: new Date().toISOString(),
                temperature: 200
            },
            {
                id: 'demo-2',
                productName: 'Hogaza Masa Madre',
                quantity: 12,
                status: 'in_progress',
                startTime: new Date().toISOString(),
                temperature: 230
            },
            {
                id: 'demo-3',
                productName: 'Baguettes Rústicas',
                quantity: 18,
                status: 'in_progress',
                startTime: new Date().toISOString(),
                temperature: 240
            },
            {
                id: 'demo-4',
                productName: 'Roles de Canela',
                quantity: 16,
                status: 'in_progress',
                startTime: new Date().toISOString(),
                temperature: 180
            }
        ];
        setBatches(DEMO_BATCHES);
        setIsOnline(false);
    };

    const getTimeRemaining = (batch: ProductionBatch) => {
        if (batch.estimatedCompletionTime) {
            const now = new Date();
            const completion = new Date(batch.estimatedCompletionTime);
            const diff = Math.max(0, Math.floor((completion.getTime() - now.getTime()) / 60000));
            return diff;
        }
        // Default estimate based on product type
        if (batch.productName.toLowerCase().includes('croissant')) return 12;
        if (batch.productName.toLowerCase().includes('masa madre')) return 25;
        if (batch.productName.toLowerCase().includes('baguette')) return 8;
        return 15;
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Preparando';
            case 'in_progress': return 'Horneando';
            case 'completed': return 'Listo';
            default: return 'Procesando';
        }
    };

    const getTemperature = (batch: ProductionBatch) => {
        if (batch.temperature) return batch.temperature;
        // Default temperatures based on product type
        if (batch.productName.toLowerCase().includes('croissant')) return 200;
        if (batch.productName.toLowerCase().includes('masa madre')) return 230;
        if (batch.productName.toLowerCase().includes('baguette')) return 240;
        if (batch.productName.toLowerCase().includes('rol') || batch.productName.toLowerCase().includes('canela')) return 180;
        return 200;
    };

    if (loading) {
        return (
            <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white shadow-2xl max-w-sm w-full">
                <div className="flex items-center justify-center h-20">
                    <Flame className="w-6 h-6 animate-pulse text-orange-400" />
                </div>
            </div>
        );
    }

    if (batches.length === 0) {
        return (
            <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white shadow-2xl max-w-sm w-full">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-orange-400">
                        <Flame className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Horno en Vivo</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        Inactivo
                    </div>
                </div>
                <p className="text-sm text-gray-400">No hay producción activa en este momento</p>
            </div>
        );
    }

    const currentBatch = batches[currentIndex];
    if (!currentBatch) return null;

    const timeRemaining = getTimeRemaining(currentBatch);
    const temperature = getTemperature(currentBatch);
    const statusText = getStatusText(currentBatch.status);

    return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white shadow-2xl animate-fade-in border-l-4 border-l-orange-500 max-w-sm w-full">
            <div className="flex items-center justify-between mb-3 leading-none">
                <div className="flex items-center gap-2 text-orange-400">
                    <Flame className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">Horno en Vivo</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                    {isOnline ? 'Online' : 'Demo'}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex-shrink-0">
                    {/* Radial progress */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-700" />
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-orange-500" strokeDasharray={125} strokeDashoffset={125 - (125 * 0.7)} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold">
                        {temperature}°
                    </div>
                </div>

                <div className="flex-1">
                    <h4 className="font-bold text-lg leading-tight">{currentBatch.productName}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-300 mt-1">
                        <span className="flex items-center gap-1">
                            <Timer className="w-3 h-3" /> {timeRemaining} min rest.
                        </span>
                        <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" /> {currentBatch.quantity} uds
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded text-[10px] uppercase font-bold">
                            {statusText}
                        </span>
                    </div>
                </div>
            </div>

            {/* Batch indicator */}
            {batches.length > 1 && (
                <div className="flex items-center justify-center gap-1 mt-3">
                    {batches.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1 rounded-full transition-all ${index === currentIndex
                                ? 'w-4 bg-orange-500'
                                : 'w-1 bg-gray-600'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LiveOvenWidget;
