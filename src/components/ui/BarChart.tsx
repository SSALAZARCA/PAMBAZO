import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface DataPoint {
    label: string;
    value: number;
    color?: string;
}

interface BarChartProps {
    data: DataPoint[];
    title: string;
    height?: number;
    showValues?: boolean;
    horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
    data,
    title,
    height = 300,
    showValues = true,
    horizontal = false,
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

    const maxValue = Math.max(...data.map((d) => d.value));
    const colors = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // orange
        '#8b5cf6', // purple
        '#ef4444', // red
    ];

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height: `${height}px` }} className="flex flex-col justify-end gap-2">
                    {horizontal ? (
                        // Horizontal bars
                        <div className="space-y-3">
                            {data.map((item, index) => {
                                const percentage = (item.value / maxValue) * 100;
                                const color = item.color || colors[index % colors.length];

                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-700">{item.label}</span>
                                            {showValues && (
                                                <span className="text-gray-600">{item.value.toLocaleString()}</span>
                                            )}
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: color,
                                                }}
                                            >
                                                {showValues && percentage > 15 && (
                                                    <span className="text-xs font-semibold text-white">
                                                        {percentage.toFixed(0)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // Vertical bars
                        <div className="flex items-end justify-around h-full gap-2">
                            {data.map((item, index) => {
                                const percentage = (item.value / maxValue) * 100;
                                const color = item.color || colors[index % colors.length];

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex flex-col items-center">
                                            {showValues && (
                                                <span className="text-sm font-semibold text-gray-700 mb-1">
                                                    {item.value.toLocaleString()}
                                                </span>
                                            )}
                                            <div
                                                className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative group"
                                                style={{
                                                    height: `${percentage}%`,
                                                    backgroundColor: color,
                                                    minHeight: '4px',
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-600 text-center mt-1">
                                            {item.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default BarChart;
