import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DataPoint {
    label: string;
    value: number;
}

interface LineChartProps {
    data: DataPoint[];
    title: string;
    color?: string;
    height?: number;
    showTrend?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
    data,
    title,
    color = '#3b82f6',
    height = 200,
    showTrend = true,
}) => {
    if (data.length === 0) {
        return (
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        No hay datos disponibles
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calculate trend
    const firstValue = data[0]?.value || 0;
    const lastValue = data[data.length - 1]?.value || 0;
    const trend = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    const isPositive = trend >= 0;

    // Calculate SVG path
    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue || 1;

    const points = data.map((point, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = ((maxValue - point.value) / range) * 80 + 10;
        return `${x},${y}`;
    }).join(' ');

    return (
        <Card className="glass-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{title}</CardTitle>
                    {showTrend && (
                        <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {isPositive ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            <span>{Math.abs(trend).toFixed(1)}%</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div style={{ height: `${height}px` }} className="relative">
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="w-full h-full"
                    >
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((y) => (
                            <line
                                key={y}
                                x1="0"
                                y1={y}
                                x2="100"
                                y2={y}
                                stroke="#e5e7eb"
                                strokeWidth="0.2"
                            />
                        ))}

                        {/* Area fill */}
                        <polygon
                            points={`0,100 ${points} 100,100`}
                            fill={color}
                            fillOpacity="0.1"
                        />

                        {/* Line */}
                        <polyline
                            points={points}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Points */}
                        {data.map((point, index) => {
                            const x = (index / (data.length - 1)) * 100;
                            const y = ((maxValue - point.value) / range) * 80 + 10;
                            return (
                                <circle
                                    key={index}
                                    cx={x}
                                    cy={y}
                                    r="1.5"
                                    fill={color}
                                    className="hover:r-2 transition-all cursor-pointer"
                                >
                                    <title>{`${point.label}: ${point.value}`}</title>
                                </circle>
                            );
                        })}
                    </svg>

                    {/* Labels */}
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>{data[0]?.label || ''}</span>
                        <span>{data[Math.floor(data.length / 2)]?.label || ''}</span>
                        <span>{data[data.length - 1]?.label || ''}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default LineChart;
