export interface LoyaltyPoint {
    id: string;
    customer_id: string;
    points: number;
    total_earned: number;
    total_redeemed: number;
    created_at: string;
    updated_at: string;
}

export interface LoyaltyTransaction {
    id: string;
    customer_id: string;
    order_id?: string;
    transaction_type: 'earned' | 'redeemed';
    points: number;
    description: string;
    created_at: string;
}

export interface LoyaltyTier {
    name: string;
    minPoints: number;
    benefits: string[];
    discount: number;
}

const BRONZE: LoyaltyTier = {
    name: 'Bronze',
    minPoints: 0,
    benefits: ['1 punto por cada $100 gastados'],
    discount: 0
};

const SILVER: LoyaltyTier = {
    name: 'Silver',
    minPoints: 500,
    benefits: ['1.5 puntos por cada $100', '5% descuento'],
    discount: 5
};

const GOLD: LoyaltyTier = {
    name: 'Gold',
    minPoints: 1000,
    benefits: ['2 puntos por cada $100', '10% descuento', 'Prioridad en pedidos'],
    discount: 10
};

const PLATINUM: LoyaltyTier = {
    name: 'Platinum',
    minPoints: 2500,
    benefits: ['3 puntos por cada $100', '15% descuento', 'Delivery gratis', 'Acceso a productos exclusivos'],
    discount: 15
};

export const LOYALTY_TIERS: LoyaltyTier[] = [BRONZE, SILVER, GOLD, PLATINUM];

export function calculatePointsForPurchase(amount: number, currentPoints: number): number {
    const tier = getTierForPoints(currentPoints);
    const basePoints = Math.floor(amount / 100);

    if (tier.name === 'Silver') return Math.floor(basePoints * 1.5);
    if (tier.name === 'Gold') return basePoints * 2;
    if (tier.name === 'Platinum') return basePoints * 3;

    return basePoints;
}

export function getTierForPoints(points: number): LoyaltyTier {
    if (points >= PLATINUM.minPoints) return PLATINUM;
    if (points >= GOLD.minPoints) return GOLD;
    if (points >= SILVER.minPoints) return SILVER;
    return BRONZE;
}
