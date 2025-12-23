import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Gift,
  TrendingUp,
  Star,
  Crown,
  Zap,
  Clock,
  Award,
  Sparkles,
  Target,
  CheckCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useToast } from './NotificationSystem';
import { useStore } from '../store/useStore';

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: React.ComponentType<any>;
  benefits: string[];
  multiplier: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'free_item' | 'experience' | 'exclusive';
  image?: string;
  available: boolean;
  expiresAt?: Date;
  termsAndConditions: string[];
  tier?: string;
}

interface PointsTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  orderId?: string;
  rewardId?: string;
  timestamp: Date;
}

interface UserLoyalty {
  totalPoints: number;
  availablePoints: number;
  currentTier: LoyaltyTier;
  nextTier?: LoyaltyTier;
  pointsToNextTier: number;
  transactions: PointsTransaction[];
  redeemedRewards: string[];
  joinDate: Date;
  lifetimeSpent: number;
}

// Loyalty Tiers
const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Bronce',
    minPoints: 0,
    maxPoints: 499,
    color: 'text-amber-600',
    icon: Star,
    benefits: [
      '1 punto por cada $1000 gastados',
      'Ofertas especiales mensuales',
      'Notificaciones de nuevos productos'
    ],
    multiplier: 1
  },
  {
    id: 'silver',
    name: 'Plata',
    minPoints: 500,
    maxPoints: 1499,
    color: 'text-gray-600',
    icon: Trophy,
    benefits: [
      '1.5 puntos por cada $1000 gastados',
      'Descuento del 5% en cumpleaños',
      'Acceso anticipado a promociones',
      'Envío gratis en pedidos especiales'
    ],
    multiplier: 1.5
  },
  {
    id: 'gold',
    name: 'Oro',
    minPoints: 1500,
    maxPoints: 4999,
    color: 'text-yellow-600',
    icon: Award,
    benefits: [
      '2 puntos por cada $1000 gastados',
      'Descuento del 10% en cumpleaños',
      'Productos exclusivos',
      'Soporte prioritario',
      'Eventos VIP'
    ],
    multiplier: 2
  },
  {
    id: 'platinum',
    name: 'Platino',
    minPoints: 5000,
    maxPoints: Infinity,
    color: 'text-purple-600',
    icon: Crown,
    benefits: [
      '3 puntos por cada $1000 gastados',
      'Descuento del 15% en cumpleaños',
      'Menú exclusivo de platino',
      'Concierge personal',
      'Experiencias gastronómicas únicas',
      'Invitaciones a eventos especiales'
    ],
    multiplier: 3
  }
];

// Available Rewards
const AVAILABLE_REWARDS: Reward[] = [
  {
    id: 'discount-10',
    name: '10% de Descuento',
    description: 'Descuento del 10% en tu próximo pedido',
    pointsCost: 100,
    category: 'discount',
    available: true,
    termsAndConditions: [
      'Válido por 30 días',
      'No acumulable con otras ofertas',
      'Mínimo de compra $20.000'
    ]
  },
  {
    id: 'free-burger',
    name: 'Hamburguesa Gratis',
    description: 'Hamburguesa clásica completamente gratis',
    pointsCost: 250,
    category: 'free_item',
    available: true,
    termsAndConditions: [
      'Válido por 15 días',
      'Solo hamburguesa clásica',
      'No incluye acompañamientos'
    ]
  },
  {
    id: 'vip-experience',
    name: 'Experiencia VIP',
    description: 'Cena privada para 2 personas con chef personal',
    pointsCost: 1000,
    category: 'experience',
    available: true,
    tier: 'gold',
    termsAndConditions: [
      'Reserva con 48 horas de anticipación',
      'Sujeto a disponibilidad',
      'Incluye menú degustación completo'
    ]
  },
  {
    id: 'exclusive-burger',
    name: 'Hamburguesa Exclusiva',
    description: 'Acceso al menú secreto de hamburguesas premium',
    pointsCost: 500,
    category: 'exclusive',
    available: true,
    tier: 'silver',
    termsAndConditions: [
      'Válido por 60 días',
      'Solo para miembros Plata o superior',
      'Ingredientes premium incluidos'
    ]
  },
  {
    id: 'birthday-special',
    name: 'Especial de Cumpleaños',
    description: 'Combo completo gratis en tu cumpleaños',
    pointsCost: 300,
    category: 'free_item',
    available: true,
    termsAndConditions: [
      'Solo válido en el mes de cumpleaños',
      'Incluye hamburguesa, papas y bebida',
      'Presentar identificación'
    ]
  }
];

// Mock user loyalty data
const mockUserLoyalty: UserLoyalty = {
  totalPoints: 1250,
  availablePoints: 850,
  currentTier: LOYALTY_TIERS[1] as LoyaltyTier, // Silver
  nextTier: LOYALTY_TIERS[2] as LoyaltyTier, // Gold
  pointsToNextTier: 250,
  transactions: [
    {
      id: '1',
      type: 'earned',
      points: 50,
      description: 'Compra - Orden #12345',
      orderId: '12345',
      timestamp: new Date(Date.now() - 86400000)
    },
    {
      id: '2',
      type: 'redeemed',
      points: -100,
      description: 'Canje - 10% de Descuento',
      rewardId: 'discount-10',
      timestamp: new Date(Date.now() - 172800000)
    },
    {
      id: '3',
      type: 'bonus',
      points: 200,
      description: 'Bono de cumpleaños',
      timestamp: new Date(Date.now() - 259200000)
    }
  ],
  redeemedRewards: ['discount-10'],
  joinDate: new Date(Date.now() - 31536000000), // 1 year ago
  lifetimeSpent: 450000
};

// Tier Progress Component
const TierProgress = ({ userLoyalty }: { userLoyalty: UserLoyalty }) => {
  const { currentTier, nextTier, pointsToNextTier, totalPoints } = userLoyalty;
  const CurrentIcon = currentTier.icon;
  const NextIcon = nextTier?.icon;

  const progressPercentage = nextTier
    ? ((totalPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CurrentIcon className={`h-6 w-6 ${currentTier.color}`} />
          Nivel {currentTier.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CurrentIcon className={`h-5 w-5 ${currentTier.color}`} />
            <span className="font-medium">{currentTier.name}</span>
          </div>
          {NextIcon && nextTier && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <NextIcon className={`h-5 w-5 ${nextTier.color}`} />
              <span>{nextTier.name}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{totalPoints.toLocaleString()} puntos</span>
            {nextTier && (
              <span className="text-muted-foreground">
                {pointsToNextTier} para {nextTier.name}
              </span>
            )}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Beneficios actuales:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {currentTier.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Points Summary Component
const PointsSummary = ({ userLoyalty }: { userLoyalty: UserLoyalty }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold">{userLoyalty.availablePoints.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Puntos Disponibles</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold">{userLoyalty.totalPoints.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Puntos Totales</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">${userLoyalty.lifetimeSpent.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Gasto Total</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Reward Card Component
const RewardCard = ({
  reward,
  userLoyalty,
  onRedeem
}: {
  reward: Reward;
  userLoyalty: UserLoyalty;
  onRedeem: (reward: Reward) => void;
}) => {
  const canRedeem = userLoyalty.availablePoints >= reward.pointsCost &&
    (!reward.tier || userLoyalty.currentTier.id === reward.tier ||
      LOYALTY_TIERS.findIndex(t => t.id === userLoyalty.currentTier.id) >=
      LOYALTY_TIERS.findIndex(t => t.id === reward.tier));

  const isRedeemed = userLoyalty.redeemedRewards.includes(reward.id);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount': return <Zap className="h-5 w-5" />;
      case 'free_item': return <Gift className="h-5 w-5" />;
      case 'experience': return <Star className="h-5 w-5" />;
      case 'exclusive': return <Crown className="h-5 w-5" />;
      default: return <Gift className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount': return 'text-blue-600 bg-blue-100';
      case 'free_item': return 'text-green-600 bg-green-100';
      case 'experience': return 'text-purple-600 bg-purple-100';
      case 'exclusive': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`relative ${!canRedeem ? 'opacity-60' : ''}`}
    >
      <Card className={`h-full ${isRedeemed ? 'border-green-200 bg-green-50' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-lg ${getCategoryColor(reward.category)}`}>
              {getCategoryIcon(reward.category)}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{reward.pointsCost}</p>
              <p className="text-xs text-muted-foreground">puntos</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">{reward.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {reward.tier && (
            <Badge variant="outline" className="text-xs">
              Requiere nivel {LOYALTY_TIERS.find(t => t.id === reward.tier)?.name}
            </Badge>
          )}

          {isRedeemed ? (
            <Button disabled className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Canjeado
            </Button>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  disabled={!canRedeem}
                  className="w-full"
                  variant={canRedeem ? 'default' : 'outline'}
                >
                  {canRedeem ? (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Canjear
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      {userLoyalty.availablePoints < reward.pointsCost
                        ? `Faltan ${reward.pointsCost - userLoyalty.availablePoints} puntos`
                        : 'Nivel insuficiente'
                      }
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Canje</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`inline-flex p-3 rounded-full ${getCategoryColor(reward.category)} mb-4`}>
                      {getCategoryIcon(reward.category)}
                    </div>
                    <h3 className="text-lg font-semibold">{reward.name}</h3>
                    <p className="text-muted-foreground">{reward.description}</p>
                    <p className="text-2xl font-bold mt-2">{reward.pointsCost} puntos</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Términos y Condiciones:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {reward.termsAndConditions.map((term, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-xs mt-1">•</span>
                          {term}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => onRedeem(reward)}
                      className="flex-1"
                    >
                      Confirmar Canje
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>

        {!reward.available && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <Badge variant="destructive">No Disponible</Badge>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

// Transaction History Component
const TransactionHistory = ({ transactions }: { transactions: PointsTransaction[] }) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'redeemed': return <Gift className="h-4 w-4 text-red-600" />;
      case 'expired': return <Clock className="h-4 w-4 text-gray-600" />;
      case 'bonus': return <Star className="h-4 w-4 text-yellow-600" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Puntos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getTransactionIcon(transaction.type)}
                <div>
                  <p className="font-medium text-sm">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.timestamp)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {transaction.points > 0 ? '+' : ''}{transaction.points}
                </p>
                <p className="text-xs text-muted-foreground">puntos</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Loyalty Program Component
export const LoyaltyProgram = () => {
  const [userLoyalty, setUserLoyalty] = useState<UserLoyalty>(mockUserLoyalty);
  const [rewards] = useState<Reward[]>(AVAILABLE_REWARDS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const notify = useToast();
  const { addNotification } = useStore();

  const handleRedeemReward = (reward: Reward) => {
    if (userLoyalty.availablePoints < reward.pointsCost) {
      notify.error('Puntos insuficientes', 'No tienes suficientes puntos para este canje');
      return;
    }

    const newTransaction: PointsTransaction = {
      id: Date.now().toString(),
      type: 'redeemed',
      points: -reward.pointsCost,
      description: `Canje - ${reward.name}`,
      rewardId: reward.id,
      timestamp: new Date()
    };

    setUserLoyalty(prev => ({
      ...prev,
      availablePoints: prev.availablePoints - reward.pointsCost,
      transactions: [newTransaction, ...prev.transactions],
      redeemedRewards: [...prev.redeemedRewards, reward.id]
    }));

    notify.success('¡Canje exitoso!', `Has canjeado ${reward.name}`);
    addNotification({
      title: 'Recompensa canjeada',
      message: `${reward.name} - ${reward.pointsCost} puntos`,
      type: 'success',
      priority: 'medium'
    });
  };

  const filteredRewards = selectedCategory === 'all'
    ? rewards
    : rewards.filter(reward => reward.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'Todas', icon: Gift },
    { id: 'discount', name: 'Descuentos', icon: Zap },
    { id: 'free_item', name: 'Productos Gratis', icon: Gift },
    { id: 'experience', name: 'Experiencias', icon: Star },
    { id: 'exclusive', name: 'Exclusivos', icon: Crown }
  ];

  return (
    <div className="space-y-6">
      {/* Points Summary */}
      <PointsSummary userLoyalty={userLoyalty} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Progress */}
        <div className="lg:col-span-1">
          <TierProgress userLoyalty={userLoyalty} />
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <TransactionHistory transactions={userLoyalty.transactions.slice(0, 5)} />
        </div>
      </div>

      {/* Rewards Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Recompensas Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredRewards.map(reward => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userLoyalty={userLoyalty}
                  onRedeem={handleRedeemReward}
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredRewards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay recompensas disponibles en esta categoría</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyProgram;