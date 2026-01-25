import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface DataPoint {
    label: string;
    value: number;
    color?: string;
}

interface PieChartProps {
    data: DataPoint[];
    title: string;
    size?: number;
    showLegend?: boolean;
    showPercentages?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
    data,
    title,
    size = 200,
    showLegend = true,
    showPercentages = true,
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

    const colors = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // orange
        '#8b5cf6', // purple
        '#ef4444', // red
        '#06b6d4', // cyan
        '#ec4899', // pink
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Calculate pie slices
    let currentAngle = -90; // Start from top
    const slices = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (item.value / total) * 360;
        const color = item.color || colors[index % colors.length];

        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        // Calculate path for pie slice
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const radius = 45;
        const centerX = 50;
        const centerY = 50;

        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);

        const largeArcFlag = angle > 180 ? 1 : 0;

        const path = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z',
        ].join(' ');

        return {
            path,
            color,
            label: item.label,
            value: item.value,
            percentage,
        };
    });

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Pie Chart */}
                    <div style={{ width: size, height: size }} className="flex-shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            {slices.map((slice, index) => (
                                <g key={index}>
                                    <path
                                        d={slice.path}
                                        fill={slice.color}
                                        className="hover:opacity-80 transition-opacity cursor-pointer"
                                        strokeWidth="0.5"
                                        stroke="white"
                                    >
                                        <title>{`${slice.label}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}</title>
                                    </path>
                                </g>
                            ))}

                            {/* Center circle for donut effect */}
                            <circle
                                cx="50"
                                cy="50"
                                r="20"
                                fill="white"
                                className="pointer-events-none"
                            />

                            {/* Total in center */}
                            <text
                                x="50"
                                y="48"
                                textAnchor="middle"
                                className="text-xs font-semibold fill-gray-700"
                            >
                                Total
                            </text>
                            <text
                                x="50"
                                y="56"
                                textAnchor="middle"
                                className="text-sm font-bold fill-gray-900"
                            >
                                {total.toLocaleString()}
                            </text>
                        </svg>
                    </div>

                    {/* Legend */}
                    {showLegend && (
                        <div className="flex-1 space-y-2">
                            {slices.map((slice, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded"
                                            style={{ backgroundColor: slice.color }}
                                        />
                                        <span className="text-sm text-gray-700">{slice.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {slice.value.toLocaleString()}
                                        </span>
                                        {showPercentages && (
                                            <span className="text-xs text-gray-500">
                                                ({slice.percentage.toFixed(1)}%)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PieChart;
