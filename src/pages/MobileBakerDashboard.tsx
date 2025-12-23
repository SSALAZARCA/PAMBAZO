import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';
import {
  ChefHat,
  Clock,
  AlertTriangle,
  TrendingUp,
  Thermometer,
  Package,
  Bell,
  RefreshCw,
  Timer,
  Flame,
  Play,
  Pause,
  Square,
  ArrowRight,
  Plus,
  Minus,
  LogOut,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';

interface MobileBakerDashboardProps {
  user: any;
  onLogout: () => void;
}

const MobileBakerDashboard: React.FC<MobileBakerDashboardProps> = ({ user: _user, onLogout }) => {
  const {
    ovenStatuses,
    productionBatches,
    inventoryEntries,
    getUnacknowledgedAlerts,
    initializeOvenStatuses,
    startOven,
    stopOven,
    pauseOven,
    resumeOven,
    moveProductToNextStage,
    recordMaterialOutput,
    resolveStockAlert,
    acknowledgeStockAlert,
    addNotification
  } = useStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'ovens' | 'alerts'>('overview');
  const [showMaterialOutput, setShowMaterialOutput] = useState(false);
  const [materialOutputForm, setMaterialOutputForm] = useState({ materialId: '', quantity: 0, reason: '' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Obtener alertas no reconocidas
  const unacknowledgedAlerts = getUnacknowledgedAlerts() || [];

  // Inicializar hornos si no existen
  useEffect(() => {
    initializeOvenStatuses();
  }, [initializeOvenStatuses]);

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Datos reales del store
  const activeBatches = (productionBatches || []).filter(batch =>
    batch.status === 'preparing' || batch.status === 'baking' || batch.status === 'cooling'
  );
  const criticalAlerts = (unacknowledgedAlerts || []).filter(alert => alert.alertLevel === 'critical');

  // Estadísticas rápidas calculadas
  const todayStats = {
    batchesInProgress: (productionBatches || []).filter(batch => batch.status === 'baking').length,
    batchesReady: (productionBatches || []).filter(batch => batch.status === 'ready').length,
    totalProduction: (productionBatches || []).filter(batch => batch.status === 'completed').length,
    criticalAlerts: criticalAlerts.length
  };

  // Obtener materiales disponibles para salidas
  const availableMaterials = (inventoryEntries || []).filter(entry => entry.quantity > 0);

  // Funciones de control de hornos
  const handleStartOven = async (ovenId: string, temperature: number = 180, batchId?: string) => {
    setLoadingStates(prev => ({ ...prev, [ovenId]: true }));
    try {
      startOven(ovenId, temperature, batchId);
      toast.success(`Horno iniciado a ${temperature}°C`);
      addNotification({
        type: 'success',
        title: 'Horno Iniciado',
        message: `Horno iniciado correctamente`,
        priority: 'medium'
      });
    } catch (_error) {
      toast.error('Error al iniciar el horno');
    } finally {
      setLoadingStates(prev => ({ ...prev, [ovenId]: false }));
    }
  };

  const handlePauseOven = async (ovenId: string) => {
    setLoadingStates(prev => ({ ...prev, [ovenId]: true }));
    try {
      pauseOven(ovenId);
      toast.success('Horno pausado');
    } catch (_error) {
      toast.error('Error al pausar el horno');
    } finally {
      setLoadingStates(prev => ({ ...prev, [ovenId]: false }));
    }
  };

  const handleResumeOven = async (ovenId: string) => {
    setLoadingStates(prev => ({ ...prev, [ovenId]: true }));
    try {
      resumeOven(ovenId);
      toast.success('Horno reanudado');
    } catch (_error) {
      toast.error('Error al reanudar el horno');
    } finally {
      setLoadingStates(prev => ({ ...prev, [ovenId]: false }));
    }
  };

  const handleStopOven = async (ovenId: string) => {
    setLoadingStates(prev => ({ ...prev, [ovenId]: true }));
    try {
      stopOven(ovenId);
      toast.success('Horno detenido');
    } catch (_error) {
      toast.error('Error al detener el horno');
    } finally {
      setLoadingStates(prev => ({ ...prev, [ovenId]: false }));
    }
  };

  // Función para mover productos entre estados
  const handleMoveProduct = async (batchId: string) => {
    setLoadingStates(prev => ({ ...prev, [batchId]: true }));
    try {
      moveProductToNextStage(batchId);
      toast.success('Producto movido al siguiente estado');
    } catch (_error) {
      toast.error('Error al mover el producto');
    } finally {
      setLoadingStates(prev => ({ ...prev, [batchId]: false }));
    }
  };

  // Función para registrar salida de materiales
  const handleMaterialOutput = async () => {
    if (!materialOutputForm.materialId || materialOutputForm.quantity <= 0) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      recordMaterialOutput(materialOutputForm.materialId, materialOutputForm.quantity, materialOutputForm.reason);
      toast.success('Salida de material registrada');
      setMaterialOutputForm({ materialId: '', quantity: 0, reason: '' });
      setShowMaterialOutput(false);
    } catch (_error) {
      toast.error('Error al registrar la salida');
    }
  };

  // Función para resolver alertas
  const handleResolveAlert = async (alertId: string, action: 'restock' | 'ignore' | 'adjust_threshold') => {
    try {
      resolveStockAlert(alertId, action);
      acknowledgeStockAlert(alertId);
      toast.success('Alerta resuelta');
    } catch (_error) {
      toast.error('Error al resolver la alerta');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'baking': return 'bg-orange-100 text-orange-800';
      case 'cooling': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    if (diff <= 0) return 'Completado';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const TabButton = ({ id: _id, label, icon: Icon, isActive, onClick }: {
    id: string;
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center py-2 px-1 text-xs font-medium transition-colors ${isActive
        ? 'text-orange-600 border-b-2 border-orange-600'
        : 'text-gray-500 hover:text-gray-700'
        }`}
    >
      <Icon className="h-5 w-5 mb-1" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 p-2 rounded-lg">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Panel Panadero</h1>
                <p className="text-sm text-gray-600">{formatTime(currentTime)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {(unacknowledgedAlerts || []).length > 0 && (
                <div className="relative">
                  <Bell className="h-6 w-6 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {(unacknowledgedAlerts || []).length}
                  </span>
                </div>
              )}
              <button
                onClick={() => setShowMaterialOutput(true)}
                className="p-2 text-blue-600 hover:text-blue-800"
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 text-red-600 hover:text-red-800"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="flex border-t border-gray-200">
          <TabButton
            id="overview"
            label="Resumen"
            icon={TrendingUp}
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            id="production"
            label="Producción"
            icon={Package}
            isActive={activeTab === 'production'}
            onClick={() => setActiveTab('production')}
          />
          <TabButton
            id="ovens"
            label="Hornos"
            icon={Flame}
            isActive={activeTab === 'ovens'}
            onClick={() => setActiveTab('ovens')}
          />
          <TabButton
            id="alerts"
            label="Alertas"
            icon={AlertTriangle}
            isActive={activeTab === 'alerts'}
            onClick={() => setActiveTab('alerts')}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4">
        {/* Alertas críticas */}
        {criticalAlerts.length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-red-800">Alertas Críticas</span>
            </div>
            <div className="text-sm text-red-700">
              {criticalAlerts.length} material(es) con stock crítico
            </div>
          </div>
        )}

        {/* Contenido por pestaña */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Horneando</p>
                    <p className="text-xl font-bold text-orange-600">{todayStats.batchesInProgress}</p>
                  </div>
                  <Thermometer className="h-6 w-6 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Listos</p>
                    <p className="text-xl font-bold text-green-600">{todayStats.batchesReady}</p>
                  </div>
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Producción</p>
                    <p className="text-xl font-bold text-blue-600">{todayStats.totalProduction}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Alertas</p>
                    <p className="text-xl font-bold text-red-600">{todayStats.criticalAlerts}</p>
                  </div>
                  <Bell className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            {/* Lotes activos recientes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Lotes Activos</h2>
              </div>
              <div className="p-4">
                {activeBatches.length === 0 ? (
                  <div className="text-center py-6">
                    <ChefHat className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No hay lotes en producción</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeBatches.slice(0, 3).map((batch) => (
                      <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">{batch.productName}</h3>
                          <p className="text-xs text-gray-600">{batch.quantity} unidades</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                            {batch.status === 'preparing' && 'Prep.'}
                            {batch.status === 'baking' && 'Horno'}
                            {batch.status === 'cooling' && 'Enfr.'}
                            {batch.status === 'ready' && 'Listo'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {getTimeRemaining(batch.estimatedEndTime)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'production' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Gestión de Lotes</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {activeBatches.length === 0 ? (
                  <div className="p-6 text-center">
                    <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No hay lotes en producción</p>
                    <button
                      onClick={() => toast.info('Funcionalidad de crear lote próximamente')}
                      className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Crear Lote</span>
                    </button>
                  </div>
                ) : (
                  activeBatches.map((batch) => (
                    <div key={batch.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{batch.productName}</h3>
                          <p className="text-sm text-gray-600">{batch.quantity} unidades</p>
                          <p className="text-xs text-gray-500">Lote: {batch.id}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                            {batch.status === 'preparing' && 'Preparando'}
                            {batch.status === 'baking' && 'Horneando'}
                            {batch.status === 'cooling' && 'Enfriando'}
                            {batch.status === 'ready' && 'Listo'}
                          </span>
                        </div>
                      </div>

                      {/* Botón de acción */}
                      {batch.status !== 'ready' && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleMoveProduct(batch.id)}
                            disabled={loadingStates[batch.id]}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                          >
                            {loadingStates[batch.id] ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <ArrowRight className="h-3 w-3" />
                            )}
                            <span>Siguiente Estado</span>
                          </button>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Timer className="h-3 w-3" />
                          <span>Inicio: {batch.startTime ? formatTime(new Date(batch.startTime)) : '--:--'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Fin: {batch.estimatedEndTime ? formatTime(new Date(batch.estimatedEndTime)) : '--:--'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ovens' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Control de Hornos</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {ovenStatuses.length === 0 ? (
                  <div className="p-6 text-center">
                    <Flame className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No hay hornos configurados</p>
                  </div>
                ) : (
                  ovenStatuses.map((oven) => (
                    <div key={oven.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{oven.name}</h3>
                          <p className="text-sm text-gray-600">
                            {oven.currentTemperature}°C
                            {oven.targetTemperature > 0 && ` / ${oven.targetTemperature}°C`}
                          </p>
                          <p className="text-xs text-gray-500">Eficiencia: {oven.efficiency}%</p>
                          {oven.currentBatchId && (
                            <p className="text-xs text-blue-600">Lote: {oven.currentBatchId}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${oven.status === 'idle' ? 'bg-gray-100 text-gray-800' :
                            oven.status === 'heating' ? 'bg-yellow-100 text-yellow-800' :
                              oven.status === 'baking' ? 'bg-orange-100 text-orange-800' :
                                oven.status === 'paused' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                            }`}>
                            {oven.status === 'idle' && 'Inactivo'}
                            {oven.status === 'heating' && 'Calentando'}
                            {oven.status === 'baking' && 'Horneando'}
                            {oven.status === 'paused' && 'Pausado'}
                            {oven.status === 'maintenance' && 'Mantenimiento'}
                          </span>
                        </div>
                      </div>

                      {/* Controles del horno */}
                      <div className="flex flex-wrap gap-2">
                        {oven.status === 'idle' && (
                          <button
                            onClick={() => handleStartOven(oven.id, 180)}
                            disabled={loadingStates[oven.id]}
                            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                          >
                            {loadingStates[oven.id] ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                            <span>Iniciar</span>
                          </button>
                        )}

                        {(oven.status === 'heating' || oven.status === 'baking') && (
                          <>
                            <button
                              onClick={() => handlePauseOven(oven.id)}
                              disabled={loadingStates[oven.id]}
                              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                            >
                              <Pause className="h-3 w-3" />
                              <span>Pausar</span>
                            </button>
                            <button
                              onClick={() => handleStopOven(oven.id)}
                              disabled={loadingStates[oven.id]}
                              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                            >
                              <Square className="h-3 w-3" />
                              <span>Detener</span>
                            </button>
                          </>
                        )}

                        {oven.status === 'paused' && (
                          <>
                            <button
                              onClick={() => handleResumeOven(oven.id)}
                              disabled={loadingStates[oven.id]}
                              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                            >
                              <Play className="h-3 w-3" />
                              <span>Reanudar</span>
                            </button>
                            <button
                              onClick={() => handleStopOven(oven.id)}
                              disabled={loadingStates[oven.id]}
                              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                            >
                              <Square className="h-3 w-3" />
                              <span>Detener</span>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Barra de progreso de temperatura */}
                      {oven.targetTemperature > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Temperatura</span>
                            <span>{Math.round((oven.currentTemperature / oven.targetTemperature) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((oven.currentTemperature / oven.targetTemperature) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Alertas de Stock</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {(unacknowledgedAlerts || []).length === 0 ? (
                  <div className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No hay alertas pendientes</p>
                    <p className="text-xs text-gray-400">Todos los materiales tienen stock suficiente</p>
                  </div>
                ) : (
                  (unacknowledgedAlerts || []).map((alert) => (
                    <div key={alert.id} className="p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.alertLevel === 'critical' ? 'text-red-500' :
                          alert.alertLevel === 'low' ? 'text-yellow-500' : 'text-orange-500'
                          }`} />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{alert.materialName}</h3>
                          <p className="text-sm text-gray-600">
                            Stock actual: {alert.currentStock} unidades
                          </p>
                          <p className="text-sm text-gray-600">
                            Stock mínimo: {alert.minStock} unidades
                          </p>
                          <p className="text-xs text-gray-500">
                            Nivel: {alert.alertLevel === 'critical' ? 'Crítico' :
                              alert.alertLevel === 'low' ? 'Bajo' : 'Medio'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${alert.alertLevel === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.alertLevel === 'low' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                            {alert.alertLevel === 'critical' && 'Crítico'}
                            {alert.alertLevel === 'low' && 'Bajo'}
                            {alert.alertLevel === 'out' && 'Agotado'}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleResolveAlert(alert.id, 'restock')}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>Reabastecer</span>
                        </button>
                        <button
                          onClick={() => handleResolveAlert(alert.id, 'adjust_threshold')}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                        >
                          <Settings className="h-3 w-3" />
                          <span>Ajustar</span>
                        </button>
                        <button
                          onClick={() => handleResolveAlert(alert.id, 'ignore')}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                        >
                          <XCircle className="h-3 w-3" />
                          <span>Ignorar</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de salida de materiales */}
      {showMaterialOutput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Salida de Material</h3>
                <button
                  onClick={() => setShowMaterialOutput(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <select
                  value={materialOutputForm.materialId}
                  onChange={(e) => setMaterialOutputForm(prev => ({ ...prev, materialId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Seleccionar...</option>
                  {availableMaterials.map((material) => (
                    <option key={material.id} value={material.productId}>
                      {material.productName} ({material.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={materialOutputForm.quantity}
                  onChange={(e) => setMaterialOutputForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Cantidad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo
                </label>
                <input
                  type="text"
                  value={materialOutputForm.reason}
                  onChange={(e) => setMaterialOutputForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Motivo"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowMaterialOutput(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleMaterialOutput}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md text-sm transition-colors"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-xs">
            <div className="p-6 text-center">
              <LogOut className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cerrar Sesión</h3>
              <p className="text-gray-600 mb-6 text-sm">
                ¿Estás seguro de que quieres cerrar sesión?
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileBakerDashboard;