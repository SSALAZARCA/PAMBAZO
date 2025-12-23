import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useStore } from '../../store/useStore';
import { BakerKPI, MaterialUsage } from '../../shared/types';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  Filter
} from 'lucide-react';

interface BakerChartsProps {
  className?: string;
  timeRange?: 'week' | 'month' | 'quarter';
}

const BakerCharts: React.FC<BakerChartsProps> = ({
  className = '',
  timeRange = 'week'
}) => {
  const {
    bakerKPIs,
    productionBatches,
    materialUsages,
    getKPIsByDateRange
  } = useStore();

  const [selectedChart, setSelectedChart] = useState<'production' | 'efficiency' | 'materials' | 'quality'>('production');
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  // Obtener datos según el rango de tiempo
  const getDataForRange = () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedTimeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    return getKPIsByDateRange(startDate, now);
  };

  const kpiData = getDataForRange();

  // Preparar datos para gráfico de producción
  const productionData = kpiData.map((kpi: BakerKPI) => ({
    date: kpi.date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
    produccion: kpi.totalProduction,
    lotes: kpi.batchesCompleted,
    tiempo: kpi.averageBakeTime
  }));

  // Preparar datos para gráfico de eficiencia
  const efficiencyData = kpiData.map((kpi: BakerKPI) => ({
    date: kpi.date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
    eficiencia: kpi.ovenEfficiency,
    calidad: kpi.qualityScore,
    desperdicio: kpi.materialWaste
  }));

  // Preparar datos para gráfico de materiales (últimos 7 días)
  const getMaterialsData = () => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayUsages = materialUsages.filter(usage =>
        usage.usageDate >= dayStart && usage.usageDate < dayEnd
      );

      const totalCost = dayUsages.reduce((sum: number, usage: MaterialUsage) => sum + usage.cost, 0);
      const totalQuantity = dayUsages.reduce((sum: number, usage: MaterialUsage) => sum + usage.quantityUsed, 0);

      return {
        date: date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
        costo: Math.round(totalCost),
        cantidad: Math.round(totalQuantity),
        usos: dayUsages.length
      };
    });
  };

  const materialsData = getMaterialsData();

  // Preparar datos para gráfico de distribución de productos
  const getProductDistribution = () => {
    const productCounts: { [key: string]: number } = {};

    productionBatches.forEach(batch => {
      if (batch.status === 'completed') {
        productCounts[batch.productName] = (productCounts[batch.productName] || 0) + batch.quantity;
      }
    });

    return Object.entries(productCounts)
      .map(([name, quantity]) => ({ name, value: quantity }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 productos
  };

  const productDistribution = getProductDistribution();

  // Colores para los gráficos
  const colors = {
    primary: '#f97316', // orange-500
    secondary: '#3b82f6', // blue-500
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    danger: '#ef4444', // red-500
    purple: '#8b5cf6', // violet-500
    teal: '#14b8a6', // teal-500
    pink: '#ec4899' // pink-500
  };

  const pieColors = [colors.primary, colors.secondary, colors.success, colors.warning, colors.danger, colors.purple];

  // Componente de tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'costo' && ' COP'}
              {entry.dataKey === 'eficiencia' && '%'}
              {entry.dataKey === 'calidad' && '%'}
              {entry.dataKey === 'desperdicio' && '%'}
              {entry.dataKey === 'tiempo' && ' min'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (selectedChart) {
      case 'production':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="produccion"
                stackId="1"
                stroke={colors.primary}
                fill={colors.primary}
                fillOpacity={0.6}
                name="Producción (unidades)"
              />
              <Area
                type="monotone"
                dataKey="lotes"
                stackId="2"
                stroke={colors.secondary}
                fill={colors.secondary}
                fillOpacity={0.6}
                name="Lotes completados"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'efficiency':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={efficiencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="eficiencia"
                stroke={colors.success}
                strokeWidth={3}
                dot={{ fill: colors.success, strokeWidth: 2, r: 4 }}
                name="Eficiencia (%)"
              />
              <Line
                type="monotone"
                dataKey="calidad"
                stroke={colors.secondary}
                strokeWidth={3}
                dot={{ fill: colors.secondary, strokeWidth: 2, r: 4 }}
                name="Calidad (%)"
              />
              <Line
                type="monotone"
                dataKey="desperdicio"
                stroke={colors.danger}
                strokeWidth={3}
                dot={{ fill: colors.danger, strokeWidth: 2, r: 4 }}
                name="Desperdicio (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'materials':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={materialsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="costo"
                fill={colors.warning}
                name="Costo (COP)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="cantidad"
                fill={colors.teal}
                name="Cantidad usada"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'quality':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
            {/* Distribución de productos */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Distribución de Productos</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tendencia de tiempo promedio */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Tiempo Promedio de Horneado</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="tiempo"
                    stroke={colors.purple}
                    strokeWidth={3}
                    dot={{ fill: colors.purple, strokeWidth: 2, r: 4 }}
                    name="Tiempo (min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getChartTitle = () => {
    switch (selectedChart) {
      case 'production': return 'Producción y Lotes';
      case 'efficiency': return 'Eficiencia y Calidad';
      case 'materials': return 'Uso de Materiales';
      case 'quality': return 'Análisis de Calidad';
      default: return 'Gráficos';
    }
  };

  const getChartIcon = () => {
    switch (selectedChart) {
      case 'production': return <BarChart3 className="h-5 w-5" />;
      case 'efficiency': return <TrendingUp className="h-5 w-5" />;
      case 'materials': return <Activity className="h-5 w-5" />;
      case 'quality': return <PieChartIcon className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              {getChartIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{getChartTitle()}</h2>
              <p className="text-sm text-gray-600">Análisis visual de datos de producción</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="week">7 días</option>
              <option value="month">30 días</option>
              <option value="quarter">90 días</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navegación de gráficos */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-1">
          {[
            { id: 'production', label: 'Producción', icon: BarChart3 },
            { id: 'efficiency', label: 'Eficiencia', icon: TrendingUp },
            { id: 'materials', label: 'Materiales', icon: Activity },
            { id: 'quality', label: 'Calidad', icon: PieChartIcon }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedChart(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedChart === id
                ? 'bg-indigo-500 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenido del gráfico */}
      <div className="p-6">
        {kpiData.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
            <p className="text-gray-600">Comienza a producir para ver gráficos de análisis</p>
          </div>
        ) : (
          renderChart()
        )}
      </div>

      {/* Información adicional */}
      {kpiData.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <div className="text-sm text-gray-600">Producción Total</div>
                <div className="text-2xl font-bold text-orange-600">
                  {bakerKPIs.reduce((sum: number, kpi: BakerKPI) => sum + kpi.totalProduction, 0)}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <div className="text-sm text-gray-600">Eficiencia Promedio</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round(bakerKPIs.reduce((sum: number, kpi: BakerKPI) => sum + kpi.ovenEfficiency, 0) / (bakerKPIs.length || 1))}%
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-sm text-gray-600">Puntualidad</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(bakerKPIs.reduce((sum: number, _kpi: BakerKPI) => sum + 0, 0) / (bakerKPIs.length || 1))}%
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-sm text-gray-600">Calidad</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(bakerKPIs.reduce((sum: number, kpi: BakerKPI) => sum + kpi.qualityScore, 0) / (bakerKPIs.length || 1))}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BakerCharts;