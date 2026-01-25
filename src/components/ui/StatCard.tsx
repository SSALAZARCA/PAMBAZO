import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
    color?: 'orange' | 'green' | 'blue' | 'purple' | 'red';
}

const colorClasses = {
    orange: {
        bg: 'from-orange-500 to-orange-600',
        shadow: 'shadow-orange-500/20',
        light: 'bg-orange-50',
        text: 'text-orange-600'
    },
    green: {
        bg: 'from-green-500 to-green-600',
        shadow: 'shadow-green-500/20',
        light: 'bg-green-50',
        text: 'text-green-600'
    },
    blue: {
        bg: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/20',
        light: 'bg-blue-50',
        text: 'text-blue-600'
    },
    purple: {
        bg: 'from-purple-500 to-purple-600',
        shadow: 'shadow-purple-500/20',
        light: 'bg-purple-50',
        text: 'text-purple-600'
    },
    red: {
        bg: 'from-red-500 to-red-600',
        shadow: 'shadow-red-500/20',
        light: 'bg-red-50',
        text: 'text-red-600'
    }
};

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    subtitle,
    color = 'orange'
}) => {
    const colors = colorClasses[color];

    return (
        <div className="glass-card rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold font-display text-gray-900">{value}</h3>
                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`bg-gradient-to-br ${colors.bg} p-3 rounded-xl shadow-lg ${colors.shadow}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>

            {trend && (
                <div className="flex items-center gap-2">
                    {trend.isPositive ? (
                        <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-semibold">+{trend.value}%</span>
                        </div>
                    ) : trend.value === 0 ? (
                        <div className="flex items-center gap-1 text-gray-500">
                            <Minus className="w-4 h-4" />
                            <span className="text-sm font-semibold">0%</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-red-600">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm font-semibold">{trend.value}%</span>
                        </div>
                    )}
                    <span className="text-xs text-gray-500">vs mes anterior</span>
                </div>
            )}
        </div>
    );
};
