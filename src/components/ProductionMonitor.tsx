import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { ProductionBatch, OvenStatus } from '../../shared/types';
import {
  Clock,
  Thermometer,
  CheckCircle,
  TrendingUp,
  Package,
  Flame,
  RefreshCw
} from 'lucide-react';

interface ProductionMonitorProps {
  className?: string;
}

const ProductionMonitor: React.FC<ProductionMonitorProps> = ({ className = '' }) => {
  const {
    ovenStatuses,
    getActiveBatches,
    getBatchesByStatus,
    updateProductionBatch
  } = useStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Actualizar tiempo cada 30 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh cada 2 minutos si está habilitado
  useEffect(() => {
    if (!autoRefresh) return;

    const refreshTimer = setInterval(() => {
      // Aquí se podría hacer una llamada a la API para actualizar datos
      console.log('Auto-refreshing production data...');
    }, 120000);

    return () => clearInterval(refreshTimer);
  }, [autoRefresh]);

  const activeBatches = getActiveBatches();
  const bakingBatches = getBatchesByStatus('baking');
  const readyBatches = getBatchesByStatus('ready');
  const preparingBatches = getBatchesByStatus('preparing');

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return { text: 'Completado', isOverdue: true };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let text = '';
    if (hours > 0) {
      text = `${hours}h ${minutes}m`;
    } else {
      text = `${minutes}m`;
    }

    return { text, isOverdue: false };
  };

  const getProgressPercentage = (startTime: Date, endTime: Date) => {
    const now = new Date();
    const total = endTime.getTime() - startTime.getTime();
    const elapsed = now.getTime() - startTime.getTime();
    const percentage = Math.min(Math.max((elapsed / total) * 100, 0), 100);
    return Math.round(percentage);
  };

  const getStatusIcon = (status: ProductionBatch['status']) => {
    switch (status) {
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'baking':
        return <Flame className="h-4 w-4" />;
      case 'cooling':
        return <Thermometer className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ProductionBatch['status']) => {
    switch (status) {
      case 'preparing': return 'text-yellow-600 bg-yellow-100';
      case 'baking': return 'text-orange-600 bg-orange-100';
      case 'cooling': return 'text-blue-600 bg-blue-100';
      case 'ready': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleBatchStatusUpdate = (batchId: string, newStatus: ProductionBatch['status']) => {
    const updates: Partial<ProductionBatch> = { status: newStatus };

    if (newStatus === 'completed') {
      updates.actualEndTime = new Date();
    }

    updateProductionBatch(batchId, updates);
  };

  const getOvenTemperatureStatus = (oven: OvenStatus) => {
    const tempDiff = Math.abs(oven.currentTemperature - oven.targetTemperature);
    if (tempDiff <= 5) return 'optimal';
    if (tempDiff <= 15) return 'acceptable';
    return 'warning';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Monitor de Producción</h2>
              <p className="text-sm text-gray-600">Tiempo real - {formatTime(currentTime)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${autoRefresh
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
                }`}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{preparingBatches.length}</div>
            <div className="text-sm text-gray-600">Preparando</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{bakingBatches.length}</div>
            <div className="text-sm text-gray-600">Horneando</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{readyBatches.length}</div>
            <div className="text-sm text-gray-600">Listos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {activeBatches.reduce((sum: number, batch: ProductionBatch) => sum + batch.quantity, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Unidades</div>
          </div>
        </div>
      </div>

      {/* Lista de lotes activos */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lotes en Producción</h3>

        {activeBatches.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay lotes en producción actualmente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBatches.map((batch: ProductionBatch) => {
              const timeRemaining = getTimeRemaining(batch.estimatedEndTime);
              const progress = getProgressPercentage(batch.startTime, batch.estimatedEndTime);
              const isSelected = selectedBatch === batch.id;

              return (
                <div
                  key={batch.id}
                  className={`border rounded-lg p-4 transition-all cursor-pointer ${isSelected
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setSelectedBatch(isSelected ? null : batch.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(batch.status)}`}>
                        {getStatusIcon(batch.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{batch.productName}</h4>
                        <p className="text-sm text-gray-600">{batch.quantity} unidades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${timeRemaining.isOverdue ? 'text-red-600' : 'text-gray-900'
                        }`}>
                        {timeRemaining.text}
                      </div>
                      <div className="text-xs text-gray-500">
                        {batch.status === 'preparing' && 'Preparando'}
                        {batch.status === 'baking' && 'En horno'}
                        {batch.status === 'cooling' && 'Enfriando'}
                        {batch.status === 'ready' && 'Listo'}
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progreso</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${timeRemaining.isOverdue
                          ? 'bg-red-500'
                          : batch.status === 'ready'
                            ? 'bg-green-500'
                            : 'bg-orange-500'
                          }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Panadero:</span>
                          <span className="ml-2 font-medium">{batch.bakerName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Horno:</span>
                          <span className="ml-2 font-medium">{batch.ovenId || 'No asignado'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Inicio:</span>
                          <span className="ml-2 font-medium">{formatTime(batch.startTime)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Fin estimado:</span>
                          <span className="ml-2 font-medium">{formatTime(batch.estimatedEndTime)}</span>
                        </div>
                        {batch.temperature && (
                          <div>
                            <span className="text-gray-600">Temperatura:</span>
                            <span className="ml-2 font-medium">{batch.temperature}°C</span>
                          </div>
                        )}
                        {batch.notes && (
                          <div className="col-span-2">
                            <span className="text-gray-600">Notas:</span>
                            <p className="mt-1 text-gray-900">{batch.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Acciones rápidas */}
                      <div className="mt-4 flex space-x-2">
                        {batch.status === 'preparing' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBatchStatusUpdate(batch.id, 'baking');
                            }}
                            className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Iniciar Horneado
                          </button>
                        )}
                        {batch.status === 'baking' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBatchStatusUpdate(batch.id, 'cooling');
                            }}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Iniciar Enfriado
                          </button>
                        )}
                        {batch.status === 'cooling' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBatchStatusUpdate(batch.id, 'ready');
                            }}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Marcar Listo
                          </button>
                        )}
                        {batch.status === 'ready' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBatchStatusUpdate(batch.id, 'completed');
                            }}
                            className="px-3 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Completar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Estado de hornos */}
      {ovenStatuses.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Hornos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ovenStatuses.map((oven: OvenStatus) => {
              const tempStatus = getOvenTemperatureStatus(oven);

              return (
                <div key={oven.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{oven.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${oven.status === 'idle' ? 'bg-gray-100 text-gray-800' :
                      oven.status === 'preheating' ? 'bg-yellow-100 text-yellow-800' :
                        oven.status === 'baking' ? 'bg-orange-100 text-orange-800' :
                          oven.status === 'cooling' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                      }`}>
                      {oven.status === 'idle' && 'Inactivo'}
                      {oven.status === 'preheating' && 'Precalentando'}
                      {oven.status === 'baking' && 'Horneando'}
                      {oven.status === 'cooling' && 'Enfriando'}
                      {oven.status === 'maintenance' && 'Mantenimiento'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Temperatura:</span>
                      <span className={`font-medium ${tempStatus === 'optimal' ? 'text-green-600' :
                        tempStatus === 'acceptable' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                        {oven.currentTemperature}°C / {oven.targetTemperature}°C
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Eficiencia:</span>
                      <span className="font-medium">{oven.efficiency}%</span>
                    </div>

                    {oven.currentBatch && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Lote actual:</span>
                        <span className="font-medium text-orange-600">{oven.currentBatch}</span>
                      </div>
                    )}

                    {oven.estimatedAvailableTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Disponible:</span>
                        <span className="font-medium">{formatTime(oven.estimatedAvailableTime)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionMonitor;