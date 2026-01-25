import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import {
    Star,
    Gift,
    Clock,
    Award,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';
import { User } from '../../../shared/types';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import api from '../../services/api';
import { toast } from 'sonner';

interface CustomerLoyaltyPageProps {
    user: User;
    onLogout: () => void;
}

interface Reward {
    id: number;
    name: string;
    points: number;
    image: string;
    description: string;
}

interface LoyaltyHistory {
    type: 'earned' | 'redeem';
    points: number;
    reason?: string;
    reward?: Reward; // Changed type from 'any' to 'Reward'
    date: string;
}

interface LoyaltyDataResponse {
    points: number;
    history: LoyaltyHistory[];
}

export const CustomerLoyaltyPage: React.FC<CustomerLoyaltyPageProps> = ({ user, onLogout }) => {
    const [points, setPoints] = useState<number>(0);
    const [history, setHistory] = useState<LoyaltyHistory[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoyaltyData();
    }, []);

    const fetchLoyaltyData = async () => {
        setLoading(true);
        try {
            const [pointsRes, rewardsRes] = await Promise.all([
                api.loyalty.getPoints(parseInt(user.id)),
                api.loyalty.getRewards()
            ]);

            if (pointsRes.success && pointsRes.data) {
                const data = pointsRes.data as LoyaltyDataResponse; // Fixed type casting
                setPoints(data.points || 0);
                setHistory(data.history || []);
            }

            if (rewardsRes.success && rewardsRes.data) {
                const rewardsData = (rewardsRes.data as any).data || rewardsRes.data;
                setRewards(Array.isArray(rewardsData) ? rewardsData : []);
            }
        } catch (error) {
            console.error('Error fetching loyalty data:', error);
            toast.error('Error al cargar datos de lealtad');
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (reward: Reward) => {
        try {
            const res = await api.loyalty.redeem({
                customerId: parseInt(user.id),
                points: reward.points,
                reward: reward
            });

            if (res.success && res.data) {
                const data = res.data as any;
                toast.success(`¡Disfruta tu ${reward.name}!`);
                setPoints(data.points);
                setHistory(data.history || []);
            } else {
                toast.error(res.error || 'No se pudo canjear la recompensa');
            }
        } catch (error) {
            toast.error('Error de conexión al canjear');
        }
    };

    const formatPoints = (p: number) => new Intl.NumberFormat('es-CO').format(p);

    if (loading) {
        return (
            <DashboardLayout user={user} onLogout={onLogout}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-8 max-w-6xl mx-auto pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Mis Pambazo Points</h1>
                        <p className="text-gray-500 text-lg">Acumula puntos con cada compra y canjéalos por delicias.</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-3xl shadow-2xl shadow-orange-500/40 text-white min-w-[240px]">
                        <div className="flex items-center gap-3 mb-2 opacity-80">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="font-bold uppercase tracking-wider text-xs">Saldo Disponible</span>
                        </div>
                        <div className="text-5xl font-black">{formatPoints(points)}</div>
                        <div className="mt-4 flex items-center gap-2 text-sm bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <Award className="w-4 h-4" />
                            <span>Nivel: <span className="font-bold">Bronze</span></span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Rewards Catalog */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Gift className="w-6 h-6 text-orange-600" /> Catalogó de Recompensas
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {rewards.map((reward) => (
                                <Card key={reward.id} className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300">
                                    <div className="h-40 bg-gray-50 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">
                                        {reward.image}
                                    </div>
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-900">{reward.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                                            </div>
                                            <Badge className="bg-orange-100 text-orange-700 font-black text-sm px-3 py-1 border-none shrink-0 ml-2">
                                                {reward.points} PTS
                                            </Badge>
                                        </div>
                                        <Button
                                            className={`w-full font-black rounded-xl h-12 transition-all ${points >= reward.points
                                                ? 'bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            disabled={points < reward.points}
                                            onClick={() => handleRedeem(reward)}
                                        >
                                            {points >= reward.points ? 'Canjear Ahora' : `Faltan ${formatPoints(reward.points - points)} pts`}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-orange-600" /> Historial Reciente
                        </h2>
                        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-xl h-[600px] flex flex-col">
                            <CardContent className="p-0 flex-1 overflow-y-auto">
                                {history.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {[...history].reverse().map((item, idx) => (
                                            <div key={idx} className="p-4 flex items-center gap-4 hover:bg-orange-50/50 transition-colors">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.type === 'earned'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-orange-100 text-orange-600'
                                                    }`}>
                                                    {item.type === 'earned' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">
                                                        {item.type === 'earned' ? item.reason : `Canje: ${item.reward?.name || 'Recompensa'}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <div className={`font-black text-lg ${item.type === 'earned' ? 'text-green-600' : 'text-orange-600'
                                                    }`}>
                                                    {item.type === 'earned' ? '+' : ''}{item.points}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full p-10 text-center text-gray-400">
                                        <Award className="w-16 h-16 mb-4 opacity-20" />
                                        <p>No tienes movimientos registrados aún.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
