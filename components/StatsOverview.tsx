
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export function StatsOverview() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls
        const [salesResponse, productsResponse, statsResponse] = await Promise.all([
          fetch('/api/stats/sales'),
          fetch('/api/stats/products'),
          fetch('/api/stats/overview')
        ]);

        if (salesResponse.ok) {
          const salesData = await salesResponse.json();
          setSalesData(salesData);
        }

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProductData(productsData);
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-xs ${stat.color}`}>
                      {stat.change} desde ayer
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="space-y-4">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ventas de la Semana
            </CardTitle>
            <CardDescription>
              Ingresos y número de pedidos por día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'ventas' ? `$${value}` : value,
                    name === 'ventas' ? 'Ventas' : 'Pedidos'
                  ]}
                />
                <Bar dataKey="ventas" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Productos</CardTitle>
            <CardDescription>
              Porcentaje de ventas por categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={false}
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Últimas transacciones y eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '10:30 AM', action: 'Nuevo pedido #1234 por $45.50', type: 'order' },
              { time: '10:25 AM', action: 'Pago confirmado para pedido #1233', type: 'payment' },
              { time: '10:20 AM', action: 'Envío completado para pedido #1232', type: 'delivery' },
              { time: '10:15 AM', action: 'Nuevo cliente registrado: Ana Martínez', type: 'customer' },
              { time: '10:10 AM', action: 'Stock actualizado: Pan de Caja +50 unidades', type: 'inventory' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${activity.type === 'order' ? 'bg-blue-100 text-blue-800' :
                  activity.type === 'payment' ? 'bg-green-100 text-green-800' :
                    activity.type === 'delivery' ? 'bg-orange-100 text-orange-800' :
                      activity.type === 'customer' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                  }`}>
                  {activity.type === 'order' ? 'Pedido' :
                    activity.type === 'payment' ? 'Pago' :
                      activity.type === 'delivery' ? 'Envío' :
                        activity.type === 'customer' ? 'Cliente' :
                          'Inventario'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}