import React from 'react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { User } from '../../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface ReportsPageProps {
    user: User;
    onLogout: () => void;
}

const mockSalesData = [
    { name: 'Lun', ventas: 4000 },
    { name: 'Mar', ventas: 3000 },
    { name: 'Mie', ventas: 2000 },
    { name: 'Jue', ventas: 2780 },
    { name: 'Vie', ventas: 1890 },
    { name: 'Sab', ventas: 2390 },
    { name: 'Dom', ventas: 3490 },
];

const mockCategoryData = [
    { name: 'Panes', value: 400 },
    { name: 'Pasteles', value: 300 },
    { name: 'Bebidas', value: 300 },
    { name: 'Otros', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const ReportsPage: React.FC<ReportsPageProps> = ({ user, onLogout }) => {
    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
                        Reportes y Análisis
                    </h1>
                    <p className="text-gray-500">
                        Visualización de métricas clave del negocio
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ventas Semanales */}
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Ventas Semanales (Estimadas)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mockSalesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="ventas" fill="#f97316" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Distribución por Categoría */}
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Ventas por Categoría</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={mockCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {mockCategoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-gray-500">
                            <p>Más reportes detallados estarán disponibles próximamente.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ReportsPage;
