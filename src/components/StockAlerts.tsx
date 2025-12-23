import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { StockAlert, InventoryItem } from '../../shared/types';
import {
  AlertTriangle,
  Bell,
  Package,
  TrendingDown,
  Check,
  Calendar,
  ShoppingCart,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

interface StockAlertsProps {
  className?: string;
  showHeader?: boolean;
  maxItems?: number;
}

const StockAlerts: React.FC<StockAlertsProps> = ({
  className = '',
  showHeader = true,
  maxItems
}) => {
  const {
    stockAlerts,
    inventory,
    getUnacknowledgedAlerts,
    acknowledgeStockAlert,
    addStockAlert
  } = useStore();

  const [filter, setFilter] = useState<'all' | 'critical' | 'low' | 'out'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [autoCheck, setAutoCheck] = useState(true);

  // Auto-verificación de stock cada 5 minutos
  useEffect(() => {
    if (!autoCheck) return;

    const checkStock = () => {
      inventory.forEach((item: InventoryItem) => {
        // Verificar si ya existe una alerta para este material
        const existingAlert = stockAlerts.find(
          (alert: StockAlert) => alert.materialId === item.id && !alert.acknowledged
        );

        if (existingAlert) return;

        // Calcular nivel de alerta basado en stock actual vs mínimo
        let alertLevel: StockAlert['alertLevel'] | null = null;
        let estimatedDaysLeft = 0;

        if (item.currentStock <= 0) {
          alertLevel = 'out';
        } else if (item.currentStock <= item.minStock * 0.5) {
          alertLevel = 'critical';
        } else if (item.currentStock <= item.minStock) {
          alertLevel = 'low';
        }

        // Estimar días restantes basado en consumo promedio
        // Esto es una estimación simple, en un sistema real se basaría en datos históricos
        const averageDailyConsumption = item.minStock / 30; // Asumiendo 30 días de stock mínimo
        estimatedDaysLeft = Math.floor(item.currentStock / averageDailyConsumption);

        if (alertLevel) {
          const suggestedOrderQuantity = Math.max(
            item.minStock * 2 - item.currentStock,
            item.minStock
          );

          addStockAlert({
            materialId: item.id,
            materialName: item.name,
            currentStock: item.currentStock,
            minStock: item.minStock,
            alertLevel,
            estimatedDaysLeft,
            suggestedOrderQuantity,
            createdAt: new Date(),
            acknowledged: false
          });
        }
      });
    };

    // Verificar inmediatamente
    checkStock();

    // Configurar verificación automática
    const timer = setInterval(checkStock, 5 * 60 * 1000); // 5 minutos
    return () => clearInterval(timer);
  }, [autoCheck, inventory, stockAlerts, addStockAlert]);

  // Filtrar alertas
  const filteredAlerts = stockAlerts.filter(alert => {
    // Filtro por estado de reconocimiento
    if (!showAcknowledged && alert.acknowledged) return false;

    // Filtro por nivel de alerta
    if (filter !== 'all' && alert.alertLevel !== filter) return false;

    // Filtro por búsqueda
    if (searchTerm && !alert.materialName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  }).slice(0, maxItems);

  const criticalCount = stockAlerts.filter(a => a.alertLevel === 'critical' || a.alertLevel === 'out').length;
  const unacknowledgedCount = (getUnacknowledgedAlerts() || []).length;

  const getAlertIcon = (level: StockAlert['alertLevel']) => {
    switch (level) {
      case 'critical':
      case 'out':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getAlertColor = (level: StockAlert['alertLevel']) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'out':
        return 'text-red-800 bg-red-200 border-red-300';
      case 'low':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getAlertText = (level: StockAlert['alertLevel']) => {
    switch (level) {
      case 'critical': return 'Crítico';
      case 'out': return 'Agotado';
      case 'low': return 'Bajo';
      default: return 'Normal';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAcknowledge = (alertId: string) => {
    acknowledgeStockAlert(alertId);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Alertas de Stock</h2>
                <p className="text-sm text-gray-600">
                  {unacknowledgedCount} sin reconocer • {criticalCount} críticas
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoCheck(!autoCheck)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${autoCheck
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                  } `}
              >
                {autoCheck ? 'Auto-check ON' : 'Auto-check OFF'}
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controles de filtrado */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="critical">Críticas</option>
              <option value="low">Bajas</option>
              <option value="out">Agotadas</option>
            </select>

            <button
              onClick={() => setShowAcknowledged(!showAcknowledged)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${showAcknowledged
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
                } `}
            >
              {showAcknowledged ? 'Ocultar reconocidas' : 'Mostrar reconocidas'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="p-6">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {stockAlerts.length === 0
                ? 'No hay alertas de stock'
                : 'No hay alertas que coincidan con los filtros'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const stockPercentage = (alert.currentStock / alert.minStock) * 100;

              return (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 transition-all ${alert.acknowledged
                    ? 'border-gray-200 bg-gray-50 opacity-75'
                    : `border-2 ${getAlertColor(alert.alertLevel).split(' ')[2]}`
                    } `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getAlertColor(alert.alertLevel)} `}>
                        {getAlertIcon(alert.alertLevel)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{alert.materialName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertColor(alert.alertLevel)
                            } `}>
                            {getAlertText(alert.alertLevel)}
                          </span>
                          {alert.acknowledged && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              Reconocida
                            </span>
                          )}
                        </div>

                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Stock actual:</span>
                            <div className="font-medium text-gray-900">{alert.currentStock}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Stock mínimo:</span>
                            <div className="font-medium text-gray-900">{alert.minStock}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Días restantes:</span>
                            <div className={`font-medium ${alert.estimatedDaysLeft <= 3 ? 'text-red-600' :
                              alert.estimatedDaysLeft <= 7 ? 'text-yellow-600' :
                                'text-green-600'
                              } `}>
                              {alert.estimatedDaysLeft} días
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Sugerido ordenar:</span>
                            <div className="font-medium text-blue-600">{alert.suggestedOrderQuantity}</div>
                          </div>
                        </div>

                        {/* Barra de progreso de stock */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Nivel de stock</span>
                            <span>{Math.round(stockPercentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${stockPercentage <= 25 ? 'bg-red-500' :
                                stockPercentage <= 50 ? 'bg-yellow-500' :
                                  stockPercentage <= 75 ? 'bg-blue-500' :
                                    'bg-green-500'
                                } `}
                              style={{ width: `${Math.min(stockPercentage, 100)}% ` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Creada: {formatDate(alert.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      {!alert.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Reconocer alerta"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="p-2 text-gray-400">
                          <Check className="h-4 w-4" />
                        </div>
                      )}

                      {alert.suggestedOrderQuantity > 0 && (
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Crear orden de compra"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumen en el footer */}
      {showHeader && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Críticas: {criticalCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Bajas: {stockAlerts.filter(a => a.alertLevel === 'low').length}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-600">Total: {stockAlerts.length}</span>
              </div>
            </div>
            <div className="text-gray-500">
              Última verificación: {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAlerts;