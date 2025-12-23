import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { BakerKPI, ProductionBatch, MaterialUsage } from '../../shared/types';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Thermometer,
  Package,
  DollarSign,
  Target,
  Award,
  AlertCircle,
  RefreshCw,
  Download
} from 'lucide-react';

interface BakerKPIsProps {
  className?: string;
  showHeader?: boolean;
  timeRange?: 'today' | 'week' | 'month' | 'quarter';
}

const BakerKPIs: React.FC<BakerKPIsProps> = ({
  className = '',
  showHeader = true,
  timeRange = 'today'
}) => {
  const {
    user,
    productionBatches,
    materialUsages,
    addBakerKPI,
    getBakerKPIsByDate
  } = useStore();

  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculation, setLastCalculation] = useState<Date | null>(null);

  // Calcular KPIs automáticamente
  const calculateKPIs = async () => {
    if (!user || user.role !== 'baker') return;

    setIsCalculating(true);

    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      // Obtener lotes del día actual
      const todayBatches = productionBatches.filter(batch =>
        batch.bakerId === user.id &&
        batch.startTime >= startOfDay &&
        batch.startTime < endOfDay
      );

      // Obtener usos de materiales del día
      const todayMaterialUsages = materialUsages.filter(usage =>
        usage.usageDate >= startOfDay &&
        usage.usageDate < endOfDay
      );

      // Calcular métricas
      const completedBatches = todayBatches.filter((batch: ProductionBatch) => batch.status === 'completed');
      const totalProduction = completedBatches.reduce((sum: number, batch: ProductionBatch) => sum + batch.quantity, 0);

      // Calcular tiempo promedio de horneado
      const batchesWithTimes = completedBatches.filter((batch: ProductionBatch) =>
        batch.actualEndTime && batch.startTime
      );

      const averageBakeTime = batchesWithTimes.length > 0
        ? batchesWithTimes.reduce((sum: number, batch: ProductionBatch) => {
          const duration = (batch.actualEndTime!.getTime() - batch.startTime.getTime()) / (1000 * 60); // minutos
          return sum + duration;
        }, 0) / batchesWithTimes.length
        : 0;

      // Calcular eficiencia del horno (tiempo real vs estimado)
      const ovenEfficiency = batchesWithTimes.length > 0
        ? batchesWithTimes.reduce((sum: number, batch: ProductionBatch) => {
          const actualTime = (batch.actualEndTime!.getTime() - batch.startTime.getTime()) / (1000 * 60);
          const estimatedTime = (batch.estimatedEndTime.getTime() - batch.startTime.getTime()) / (1000 * 60);
          const efficiency = estimatedTime > 0 ? Math.min((estimatedTime / actualTime) * 100, 100) : 0;
          return sum + efficiency;
        }, 0) / batchesWithTimes.length
        : 0;

      // Calcular desperdicio de materiales (estimación simple)
      const materialWaste = todayMaterialUsages.reduce((sum: number, usage: MaterialUsage) => {
        // Asumimos un 2-5% de desperdicio normal
        const wastePercentage = Math.random() * 3 + 2; // 2-5%
        return sum + (usage.quantityUsed * wastePercentage / 100);
      }, 0);

      // Calcular puntuación de calidad (simulada basada en eficiencia y otros factores)
      const qualityScore = Math.min(
        (ovenEfficiency * 0.4) +
        (completedBatches.length > 0 ? 30 : 0) +
        (materialWaste < 5 ? 20 : 10) +
        (averageBakeTime > 0 && averageBakeTime < 120 ? 20 : 10),
        100
      );

      // Consumo de energía estimado (kWh)
      const energyConsumption = completedBatches.reduce((sum, batch) => {
        const duration = batch.actualEndTime && batch.startTime
          ? (batch.actualEndTime.getTime() - batch.startTime.getTime()) / (1000 * 60 * 60) // horas
          : 0;
        const powerConsumption = 3.5; // kW promedio por horno
        return sum + (duration * powerConsumption);
      }, 0);

      // Crear nuevo KPI
      const newKPI: Omit<BakerKPI, 'id'> = {
        date: now,
        totalProduction,
        batchesCompleted: completedBatches.length,
        averageBakeTime: Math.round(averageBakeTime),
        ovenEfficiency: Math.round(ovenEfficiency),
        materialWaste: Math.round(materialWaste * 100) / 100,
        qualityScore: Math.round(qualityScore),
        energyConsumption: Math.round(energyConsumption * 100) / 100,
        bakerId: user.id
      };

      addBakerKPI(newKPI);
      setLastCalculation(now);

    } catch (error) {
      console.error('Error calculando KPIs:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-calcular KPIs cada hora
  useEffect(() => {
    const timer = setInterval(() => {
      calculateKPIs();
    }, 60 * 60 * 1000); // 1 hora

    return () => clearInterval(timer);
  }, [user]);

  // Obtener KPIs según el rango de tiempo seleccionado
  const getKPIsForRange = () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedTimeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
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
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    return getBakerKPIsByDate(startDate, now);
  };

  const kpis = getKPIsForRange();
  const latestKPI = kpis.length > 0 ? kpis[kpis.length - 1] : null;

  // Calcular promedios y tendencias
  const averageKPIs = kpis.length > 0 ? {
    totalProduction: Math.round(kpis.reduce((sum, kpi) => sum + kpi.totalProduction, 0) / kpis.length),
    batchesCompleted: Math.round(kpis.reduce((sum, kpi) => sum + kpi.batchesCompleted, 0) / kpis.length),
    averageBakeTime: Math.round(kpis.reduce((sum, kpi) => sum + kpi.averageBakeTime, 0) / kpis.length),
    ovenEfficiency: Math.round(kpis.reduce((sum, kpi) => sum + kpi.ovenEfficiency, 0) / kpis.length),
    materialWaste: Math.round((kpis.reduce((sum, kpi) => sum + kpi.materialWaste, 0) / kpis.length) * 100) / 100,
    qualityScore: Math.round(kpis.reduce((sum, kpi) => sum + kpi.qualityScore, 0) / kpis.length),
    energyConsumption: Math.round((kpis.reduce((sum, kpi) => sum + (kpi.energyConsumption || 0), 0) / kpis.length) * 100) / 100
  } : null;

  // Calcular tendencias (comparar últimos 2 períodos)
  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const trends = kpis.length >= 2 ? {
    production: getTrend(kpis[kpis.length - 1]!.totalProduction, kpis[kpis.length - 2]!.totalProduction),
    efficiency: getTrend(kpis[kpis.length - 1]!.ovenEfficiency, kpis[kpis.length - 2]!.ovenEfficiency),
    quality: getTrend(kpis[kpis.length - 1]!.qualityScore, kpis[kpis.length - 2]!.qualityScore),
    waste: getTrend(kpis[kpis.length - 1]!.materialWaste, kpis[kpis.length - 2]!.materialWaste)
  } : null;

  const formatTrend = (trend: number) => {
    const isPositive = trend > 0;
    const isNegative = trend < 0;
    return {
      value: Math.abs(trend).toFixed(1),
      isPositive,
      isNegative,
      icon: isPositive ? TrendingUp : isNegative ? TrendingDown : null,
      color: isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
    };
  };

  const getScoreColor = (score: number, type: 'efficiency' | 'quality' | 'waste') => {
    if (type === 'waste') {
      // Para desperdicio, menos es mejor
      if (score <= 2) return 'text-green-600';
      if (score <= 5) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      // Para eficiencia y calidad, más es mejor
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  const exportKPIs = () => {
    const headers = ['Fecha', 'Producción Total', 'Lotes Completados', 'Tiempo Promedio (min)', 'Eficiencia (%)', 'Desperdicio', 'Calidad (%)', 'Energía (kWh)'];
    const csvContent = [
      headers.join(','),
      ...kpis.map(kpi => [
        kpi.date.toLocaleDateString('es-CO'),
        kpi.totalProduction,
        kpi.batchesCompleted,
        kpi.averageBakeTime,
        kpi.ovenEfficiency,
        kpi.materialWaste,
        kpi.qualityScore,
        kpi.energyConsumption || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpis_panadero_${selectedTimeRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">KPIs del Panadero</h2>
                <p className="text-sm text-gray-600">
                  {kpis.length} registros • Última actualización: {lastCalculation?.toLocaleTimeString('es-CO') || 'Nunca'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="today">Hoy</option>
                <option value="week">7 días</option>
                <option value="month">30 días</option>
                <option value="quarter">90 días</option>
              </select>
              <button
                onClick={calculateKPIs}
                disabled={isCalculating}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isCalculating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>{isCalculating ? 'Calculando...' : 'Actualizar'}</span>
              </button>
              <button
                onClick={exportKPIs}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Exportar KPIs"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {kpis.length === 0 ? (
        <div className="p-12 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos de KPIs</h3>
          <p className="text-gray-600 mb-4">Comienza a producir para generar métricas de rendimiento</p>
          <button
            onClick={calculateKPIs}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Calcular KPIs
          </button>
        </div>
      ) : (
        <>
          {/* KPIs principales */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Producción Total */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Producción Total</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {latestKPI?.totalProduction || 0}
                    </p>
                    <p className="text-xs text-blue-700">unidades</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                {trends && (
                  <div className="mt-2 flex items-center">
                    {trends.production !== 0 && formatTrend(trends.production).icon && (
                      React.createElement(formatTrend(trends.production).icon!, {
                        className: `h-4 w-4 ${formatTrend(trends.production).color}`
                      })
                    )}
                    <span className={`text-xs ${formatTrend(trends.production).color} ml-1`}>
                      {formatTrend(trends.production).value}% vs anterior
                    </span>
                  </div>
                )}
              </div>

              {/* Eficiencia del Horno */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Eficiencia Horno</p>
                    <p className={`text-2xl font-bold ${getScoreColor(latestKPI?.ovenEfficiency || 0, 'efficiency')}`}>
                      {latestKPI?.ovenEfficiency || 0}%
                    </p>
                    <p className="text-xs text-orange-700">promedio</p>
                  </div>
                  <Thermometer className="h-8 w-8 text-orange-600" />
                </div>
                {trends && (
                  <div className="mt-2 flex items-center">
                    {trends.efficiency !== 0 && formatTrend(trends.efficiency).icon && (
                      React.createElement(formatTrend(trends.efficiency).icon!, {
                        className: `h-4 w-4 ${formatTrend(trends.efficiency).color}`
                      })
                    )}
                    <span className={`text-xs ${formatTrend(trends.efficiency).color} ml-1`}>
                      {formatTrend(trends.efficiency).value}% vs anterior
                    </span>
                  </div>
                )}
              </div>

              {/* Calidad */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Puntuación Calidad</p>
                    <p className={`text-2xl font-bold ${getScoreColor(latestKPI?.qualityScore || 0, 'quality')}`}>
                      {latestKPI?.qualityScore || 0}
                    </p>
                    <p className="text-xs text-green-700">sobre 100</p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                {trends && (
                  <div className="mt-2 flex items-center">
                    {trends.quality !== 0 && formatTrend(trends.quality).icon && (
                      React.createElement(formatTrend(trends.quality).icon!, {
                        className: `h-4 w-4 ${formatTrend(trends.quality).color}`
                      })
                    )}
                    <span className={`text-xs ${formatTrend(trends.quality).color} ml-1`}>
                      {formatTrend(trends.quality).value}% vs anterior
                    </span>
                  </div>
                )}
              </div>

              {/* Desperdicio */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Desperdicio</p>
                    <p className={`text-2xl font-bold ${getScoreColor(latestKPI?.materialWaste || 0, 'waste')}`}>
                      {latestKPI?.materialWaste || 0}%
                    </p>
                    <p className="text-xs text-red-700">materiales</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                {trends && (
                  <div className="mt-2 flex items-center">
                    {trends.waste !== 0 && formatTrend(trends.waste).icon && (
                      React.createElement(formatTrend(trends.waste).icon!, {
                        className: `h-4 w-4 ${formatTrend(trends.waste).color}`
                      })
                    )}
                    <span className={`text-xs ${formatTrend(trends.waste).color} ml-1`}>
                      {formatTrend(trends.waste).value}% vs anterior
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KPIs secundarios */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tiempo Promedio */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                    <p className="text-xl font-bold text-gray-900">
                      {latestKPI?.averageBakeTime || 0} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Lotes Completados */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lotes Completados</p>
                    <p className="text-xl font-bold text-gray-900">
                      {latestKPI?.batchesCompleted || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Consumo Energético */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-6 w-6 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Energía Consumida</p>
                    <p className="text-xl font-bold text-gray-900">
                      {latestKPI?.energyConsumption || 0} kWh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de promedios */}
          {averageKPIs && (
            <div className="px-6 pb-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pt-6">Promedios del Período</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{averageKPIs.totalProduction}</div>
                  <div className="text-gray-600">Producción Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{averageKPIs.ovenEfficiency}%</div>
                  <div className="text-gray-600">Eficiencia Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{averageKPIs.qualityScore}</div>
                  <div className="text-gray-600">Calidad Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{averageKPIs.materialWaste}%</div>
                  <div className="text-gray-600">Desperdicio Promedio</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BakerKPIs;