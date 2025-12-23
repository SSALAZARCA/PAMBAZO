import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';
import PreparationTracker from '../components/PreparationTracker';
import ProductionFlowIndicator from '../components/ProductionFlowIndicator';
import HistoricalProductsView from '../components/HistoricalProductsView';
import {
  ChefHat,
  AlertTriangle,
  TrendingUp,
  Thermometer,
  Package,
  BarChart3,
  Settings,
  RefreshCw,
  Bell,
  Play,
  Pause,
  Timer,
  Flame,
  CheckCircle,
  XCircle,
  ArrowRight,
  Plus,
  Trash2,
  Square,
  LogOut
} from 'lucide-react';
import type { User } from '../../shared/types';

interface BakerDashboardProps {
  user: User;
  onLogout: () => void;
}

const BakerDashboard: React.FC<BakerDashboardProps> = ({ user: _propUser, onLogout: _onLogout }) => {
  const {
    user,
    ovenStatuses,
    productionBatches,
    inventoryEntries,
    finishedProducts,
    getUnacknowledgedAlerts,
    initializeOvenStatuses,
    startOven,
    stopOven,
    pauseOven,
    resumeOven,
    moveProductToNextStage,
    recordMaterialOutput,
    resolveStockAlert: _resolveStockAlert,
    acknowledgeStockAlert: _acknowledgeStockAlert,
    addNotification,
    addMaterialUsage,
    addProductionBatch,
    updateOvenStatus,
    getAvailableOvens,
    addBakerKPI,
    initializeInventory,
    createPreparationWorkflow,
    initializePreparationTemplates,
    addFinishedProduct,
    markProductAvailableForSale,
    getReadyProducts,
    addOven,
    removeOven,
    canRemoveOven,
    getOvenUtilizationStats,
    getOvensRequiringMaintenance,
    checkMaintenanceSchedule,
    debugOvenAvailability,
    forceOvenAvailable,
    resetAllOvens,
    ensureOvenAvailability
  } = useStore();

  // Obtener alertas no reconocidas
  const unacknowledgedAlerts = getUnacknowledgedAlerts() || [];

  // Obtener productos listos
  const readyProducts = getReadyProducts() || [];

  // Estados del componente
  const [currentTime, _setCurrentTime] = useState(new Date());
  // Removed unused showMaterialOutput
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [showHistoricalView, setShowHistoricalView] = useState(false);
  const [showOvenManagement, setShowOvenManagement] = useState(false);
  const [showAddOven, setShowAddOven] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  // Removed unused materialOutputForm
  const [createBatchForm, setCreateBatchForm] = useState({
    productId: '',
    productName: '',
    quantity: 0,
    ovenId: '',
    notes: '',
    estimatedDuration: 0
  });
  const [materialQuantities, setMaterialQuantities] = useState<{ [key: string]: number }>({});
  const [addOvenForm, setAddOvenForm] = useState({
    name: '',
    capacity: 10,
    maxTemperature: 250,
    energyConsumption: 3.0,
    maintenanceInterval: 30,
    isRemovable: true
  });
  const [ovenSelectKey, setOvenSelectKey] = useState(0); // Para forzar re-render del select

  // Inicializar hornos, inventario y plantillas de preparación si no existen
  useEffect(() => {
    console.log('🔄 Inicializando componente BakerDashboard...');
    initializeOvenStatuses();
    initializeInventory();
    initializePreparationTemplates();

    // Verificar hornos después de la inicialización
    setTimeout(() => {
      console.log('🔍 Verificando hornos después de inicialización...');
      const availableOvens = getAvailableOvens();
      console.log(`📊 Hornos disponibles tras inicialización: ${availableOvens.length}`);
      if (availableOvens.length === 0) {
        console.warn('⚠️ No hay hornos disponibles después de la inicialización. Ejecutando diagnóstico...');
        debugOvenAvailability();
      }
    }, 1000);
  }, [initializeOvenStatuses, initializeInventory, initializePreparationTemplates, getAvailableOvens, debugOvenAvailability]);

  // Exponer función de debug globalmente para uso en consola
  useEffect(() => {
    (window as any).debugOvens = () => {
      console.log('🚨 Ejecutando diagnóstico desde consola...');
      return debugOvenAvailability();
    };

    (window as any).getAvailableOvens = () => {
      console.log('🔍 Obteniendo hornos disponibles desde consola...');
      return getAvailableOvens();
    };

    console.log('🔧 Funciones de debug disponibles en consola:');
    console.log('  - debugOvens(): Diagnóstico completo de hornos');
    console.log('  - getAvailableOvens(): Lista de hornos disponibles');

    return () => {
      delete (window as any).debugOvens;
      delete (window as any).getAvailableOvens;
    };
  }, [debugOvenAvailability, getAvailableOvens]);

  // Forzar re-render cuando cambien los estados de los hornos para sincronizar el select
  useEffect(() => {
    // Este efecto se ejecuta cada vez que cambian los ovenStatuses
    // Asegura que el select se actualice automáticamente
    if (showCreateBatch && (ovenStatuses || []).length > 0) {
      const availableOvens = getAvailableOvens();
      console.log('🔄 Hornos disponibles actualizados:', (availableOvens || []).length, 'de', (ovenStatuses || []).length);

      // Forzar re-render del select
      setOvenSelectKey(prev => prev + 1);

      // Si el horno seleccionado ya no está disponible, limpiar la selección
      if (createBatchForm.ovenId && !availableOvens.find(oven => oven.id === createBatchForm.ovenId)) {
        setCreateBatchForm(prev => ({ ...prev, ovenId: '' }));
        toast.warning('El horno seleccionado ya no está disponible');
      }
    }
  }, [ovenStatuses, showCreateBatch, createBatchForm.ovenId, getAvailableOvens]);

  // Verificar mantenimiento de hornos cada 5 minutos
  useEffect(() => {
    const checkMaintenance = () => {
      checkMaintenanceSchedule();
    };

    // Verificar inmediatamente
    checkMaintenance();

    // Configurar intervalo para verificar cada 5 minutos
    const interval = setInterval(checkMaintenance, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkMaintenanceSchedule]);

  // Verificar disponibilidad de hornos automáticamente cada 5 segundos
  useEffect(() => {
    const checkAvailability = () => {
      const availableOvens = getAvailableOvens();
      if (availableOvens.length === 0) {
        console.warn('⚠️ No hay hornos disponibles. Ejecutando reset automático...');
        const success = ensureOvenAvailability();
        if (success) {
          toast.success('Sistema de hornos restablecido automáticamente');
        } else {
          toast.error('Error al restablecer hornos automáticamente');
        }
      }
    };

    // Verificar cada 5 segundos
    const interval = setInterval(checkAvailability, 5000);

    return () => clearInterval(interval);
  }, [getAvailableOvens, ensureOvenAvailability]);

  // Función para mover productos entre estados
  const handleMoveProduct = async (batchId: string) => {
    setLoadingStates(prev => ({ ...prev, [batchId]: true }));
    try {
      const batch = (productionBatches || []).find(b => b.id === batchId);
      moveProductToNextStage(batchId);

      // Si el producto se movió a 'ready', crear registro de producto terminado
      if (batch && batch.status === 'cooling') {
        addFinishedProduct({
          batchId: batchId,
          productId: batch.productId,
          productName: batch.productName,
          quantity: batch.quantity,
          completedAt: new Date(),
          completionTime: new Date(), // Mantener por compatibilidad
          bakerId: user?.id || 'unknown',
          bakerName: user?.name || 'Desconocido',
          status: 'ready',
          qualityScore: 85,
          qualityNotes: 'Producto terminado correctamente'
        });
      }

      toast.success('Producto movido al siguiente estado');
    } catch (_error) {
      toast.error('Error al mover el producto');
    } finally {
      setLoadingStates(prev => ({ ...prev, [batchId]: false }));
    }
  };

  // Función para obtener estimación inteligente basada en el nombre del producto
  const getEstimatedQuantity = (productName: string, baseQuantity: number) => {
    const name = productName.toLowerCase();
    if (name.includes('harina')) return baseQuantity * 0.5;
    if (name.includes('agua')) return baseQuantity * 0.3;
    if (name.includes('levadura')) return baseQuantity * 0.02;
    if (name.includes('sal')) return baseQuantity * 0.01;
    if (name.includes('azucar') || name.includes('azúcar')) return baseQuantity * 0.1;
    if (name.includes('mantequilla') || name.includes('aceite')) return baseQuantity * 0.05;
    return baseQuantity * 0.1;
  };

  // Actualizar cantidades de materiales cuando cambie la cantidad de productos
  useEffect(() => {
    if (createBatchForm.quantity > 0 && inventoryEntries.length > 0) {
      const newQuantities: { [key: string]: number } = {};
      (inventoryEntries || []).filter(entry => entry.quantity > 0 && entry.productId).forEach(entry => {
        const estimatedQty = getEstimatedQuantity(entry.productName || '', createBatchForm.quantity);
        if (entry.productId) {
          newQuantities[entry.productId] = estimatedQty;
        }
      });
      setMaterialQuantities(newQuantities);
    }
  }, [createBatchForm.quantity, inventoryEntries]);

  // Función para crear lote de producción
  const handleCreateBatch = async () => {
    if (!createBatchForm.productId || !createBatchForm.productName || createBatchForm.quantity <= 0 || !createBatchForm.ovenId) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar que el horno esté disponible usando getAvailableOvens
    const availableOvens = getAvailableOvens();
    const selectedOven = availableOvens.find(oven => oven.id === createBatchForm.ovenId);
    if (!selectedOven) {
      toast.error('El horno seleccionado no está disponible o no cumple con los requisitos de seguridad');
      return;
    }

    // Validar capacidad del horno
    if (selectedOven.capacity && createBatchForm.quantity > selectedOven.capacity) {
      toast.error(`El horno ${selectedOven.name} tiene capacidad máxima de ${selectedOven.capacity} unidades. Cantidad solicitada: ${createBatchForm.quantity}`);
      return;
    }

    // Validar que el horno no tenga mantenimiento próximo
    if (selectedOven.maintenanceSchedule?.nextMaintenance) {
      const maintenanceTime = new Date(selectedOven.maintenanceSchedule.nextMaintenance);
      const estimatedEndTime = new Date(Date.now() + (createBatchForm.estimatedDuration || 120) * 60000);
      if (estimatedEndTime > maintenanceTime) {
        toast.error(`El horno ${selectedOven.name} tiene mantenimiento programado antes de que termine el lote`);
        return;
      }
    }

    // Validar materiales
    const requiredMaterials = [];
    const insufficientMaterials = [];

    for (const [productId, quantity] of Object.entries(materialQuantities)) {
      if (quantity > 0) {
        const inventoryItem = inventoryEntries.find(entry => entry.productId === productId);
        if (inventoryItem) {
          requiredMaterials.push({
            id: productId,
            name: inventoryItem.productName,
            required: quantity
          });

          if (inventoryItem.quantity < quantity) {
            insufficientMaterials.push(inventoryItem.productName);
          }
        }
      }
    }

    if (insufficientMaterials.length > 0) {
      toast.error(`Stock insuficiente para: ${insufficientMaterials.join(', ')}`);
      return;
    }

    setLoadingStates(prev => ({ ...prev, createBatch: true }));

    try {
      const now = new Date();
      const estimatedEndTime = new Date(now.getTime() + (createBatchForm.estimatedDuration || 120) * 60000);

      // Crear el lote de producción
      const batchId = Date.now().toString();
      const newBatch = {
        id: batchId,
        productId: createBatchForm.productId,
        productName: createBatchForm.productName,
        quantity: createBatchForm.quantity,
        startTime: now,
        estimatedEndTime,
        status: 'preparing' as const,
        ovenId: createBatchForm.ovenId,
        temperature: 180,
        bakerId: user?.id || 'baker-1',
        bakerName: user?.name || 'Panadero',
        notes: createBatchForm.notes,
        materialsUsed: []
      };

      addProductionBatch(newBatch);

      // Crear workflow de preparación
      createPreparationWorkflow(
        batchId,
        createBatchForm.productId,
        createBatchForm.productName,
        user?.id || 'baker-1',
        user?.name || 'Panadero'
      );

      // Registrar uso de materiales
      for (const material of requiredMaterials) {
        const inventoryItem = inventoryEntries.find(entry => entry.productId === material.id);
        if (inventoryItem) {
          addMaterialUsage({
            materialId: material.id,
            materialName: material.name || '',
            quantityUsed: material.required,
            unit: 'kg',
            cost: material.required * (inventoryItem.unitCost || 0),
            batchId: batchId,
            usageDate: now,
            date: now
          });

          recordMaterialOutput(material.id, material.required, `Lote ${createBatchForm.productName}`);
        }
      }

      // Asignar lote al horno
      updateOvenStatus(createBatchForm.ovenId, {
        status: 'preheating' as const,
        currentBatchId: batchId,
        targetTemperature: 180
      });

      // Crear notificación
      addNotification({
        type: 'order',
        title: 'Lote Creado',
        message: `Lote de ${createBatchForm.productName} (${createBatchForm.quantity} unidades) iniciado`,
        priority: 'medium'
      });

      // Actualizar KPIs
      addBakerKPI({
        date: now,
        totalProduction: createBatchForm.quantity,
        batchesCompleted: 0,
        averageBakeTime: createBatchForm.estimatedDuration || 120,
        ovenEfficiency: 95,
        materialWaste: 0,
        qualityScore: 0,
        bakerId: user?.id || 'baker-1'
      });

      toast.success(`Lote de ${createBatchForm.productName} creado exitosamente`);
      setShowCreateBatch(false);
      setCreateBatchForm({
        productId: '',
        productName: '',
        quantity: 0,
        ovenId: '',
        notes: '',
        estimatedDuration: 0
      });
      setMaterialQuantities({});

    } catch (error) {
      toast.error('Error al crear el lote de producción');
    } finally {
      setLoadingStates(prev => ({ ...prev, createBatch: false }));
    }
  };

  // Función de logout removida (usando la del prop)

  // Función para marcar producto como disponible para venta
  const handleMarkAvailableForSale = async (batchId: string, quantity: number) => {
    const loadingKey = `mark-${batchId}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));

    try {
      await markProductAvailableForSale(batchId, 0);
      toast.success('Producto marcado como disponible para venta');

      addNotification({
        type: 'success',
        title: 'Producto Disponible',
        message: `${quantity} unidades de producto están disponibles para venta en mostrador`,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error al marcar producto como disponible:', error);
      toast.error('Error al marcar producto como disponible para venta');
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

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

  // Funciones para gestión de hornos
  const handleAddOven = async () => {
    if (!addOvenForm.name.trim()) {
      toast.error('Por favor ingresa un nombre para el horno');
      return;
    }

    setLoadingStates(prev => ({ ...prev, addOven: true }));
    try {
      const now = new Date();
      addOven({
        name: addOvenForm.name,
        status: 'idle',
        currentTemperature: 25,
        targetTemperature: 0,
        lastMaintenance: now,
        efficiency: 90,
        capacity: addOvenForm.capacity,
        maxTemperature: addOvenForm.maxTemperature,
        energyConsumption: addOvenForm.energyConsumption,
        maintenanceSchedule: {
          nextMaintenance: new Date(now.getTime() + addOvenForm.maintenanceInterval * 24 * 60 * 60 * 1000),
          maintenanceInterval: addOvenForm.maintenanceInterval,
          maintenanceType: 'routine'
        },
        utilizationStats: {
          totalHoursUsed: 0,
          batchesCompleted: 0,
          averageEfficiency: 90
        },
        isRemovable: addOvenForm.isRemovable
      });

      toast.success(`Horno "${addOvenForm.name}" agregado exitosamente`);
      setAddOvenForm({
        name: '',
        capacity: 10,
        maxTemperature: 250,
        energyConsumption: 3.0,
        maintenanceInterval: 30,
        isRemovable: true
      });
      setShowAddOven(false);
    } catch (error) {
      toast.error('Error al agregar el horno');
    } finally {
      setLoadingStates(prev => ({ ...prev, addOven: false }));
    }
  };

  const handleRemoveOven = async (ovenId: string, ovenName: string) => {
    if (!canRemoveOven(ovenId)) {
      toast.error('No se puede eliminar este horno porque está en uso o no es removible');
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar el horno "${ovenName}"?`)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, [ovenId]: true }));
    try {
      const success = removeOven(ovenId);
      if (success) {
        toast.success(`Horno "${ovenName}" eliminado exitosamente`);
      }
    } catch (error) {
      toast.error('Error al eliminar el horno');
    } finally {
      setLoadingStates(prev => ({ ...prev, [ovenId]: false }));
    }
  };

  // Funciones para gestión de hornos

  // Datos calculados
  const activeBatches = (productionBatches || []).filter(batch => batch.status !== 'ready');
  const todayStats = {
    batchesInProgress: activeBatches.filter(b => b.status === 'baking').length,
    batchesReady: readyProducts.length,
    totalProduction: (productionBatches || []).length,
    criticalAlerts: (unacknowledgedAlerts || []).filter(a => a.alertLevel === 'critical').length
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'baking': return 'bg-orange-100 text-orange-800';
      case 'cooling': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOvenStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-100 text-gray-800';
      case 'heating': return 'bg-yellow-100 text-yellow-800';
      case 'baking': return 'bg-orange-100 text-orange-800';
      case 'paused': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel del Panadero</h1>
              <p className="text-gray-600">Bienvenido, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Hora actual</p>
              <p className="text-lg font-semibold text-gray-900">{formatTime(currentTime)}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowHistoricalView(!showHistoricalView)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${showHistoricalView
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Historial</span>
              </button>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Horneado</p>
              <p className="text-2xl font-bold text-orange-600">{todayStats.batchesInProgress}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Thermometer className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Listos</p>
              <p className="text-2xl font-bold text-green-600">{todayStats.batchesReady}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Producción Total</p>
              <p className="text-2xl font-bold text-blue-600">{todayStats.totalProduction}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertas</p>
              <p className="text-2xl font-bold text-red-600">{todayStats.criticalAlerts}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lotes activos */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Lotes en Producción</h2>
              <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                Ver todos
              </button>
            </div>
          </div>
          <div className="p-6">
            {activeBatches.length === 0 ? (
              <div className="text-center py-8">
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay lotes en producción</p>
                <button
                  onClick={() => setShowCreateBatch(true)}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Iniciar preparación de lote</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBatches.slice(0, 5).map((batch) => (
                  <div key={batch.id} className="bg-gray-50 rounded-lg border border-gray-200">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${batch.status === 'preparing' ? 'bg-yellow-500' :
                            batch.status === 'baking' ? 'bg-orange-500' :
                              batch.status === 'cooling' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                          <div>
                            <h3 className="font-medium text-gray-900">{batch.productName}</h3>
                            <p className="text-sm text-gray-600">{batch.quantity} unidades</p>
                            <p className="text-xs text-gray-500">Lote: {batch.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                            {batch.status === 'preparing' && 'Preparando'}
                            {batch.status === 'baking' && 'Horneando'}
                            {batch.status === 'cooling' && 'Enfriando'}
                            {batch.status === 'ready' && 'Listo'}
                          </span>
                          {batch.status !== 'ready' && (
                            <button
                              onClick={() => handleMoveProduct(batch.id)}
                              disabled={loadingStates[batch.id]}
                              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs flex items-center space-x-1 transition-colors"
                            >
                              {loadingStates[batch.id] ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <ArrowRight className="h-3 w-3" />
                              )}
                              <span>Siguiente</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Indicador de flujo de producción */}
                      <div className="mb-4">
                        <ProductionFlowIndicator
                          currentStatus={batch.status}
                          size="sm"
                          showLabels={true}
                        />
                      </div>

                      {/* Mostrar PreparationTracker solo para lotes en preparación */}
                      {batch.status === 'preparing' && (
                        <div className="border-t border-gray-200 p-4">
                          <PreparationTracker batchId={batch.id} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Estado de hornos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-semibold text-gray-900">Control de Hornos</h2>
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-600">
                    Disponibles: {(getAvailableOvens() || []).length} de {(ovenStatuses || []).length}
                  </div>
                  <button
                    onClick={() => {
                      console.log('🚨 Ejecutando diagnóstico de hornos...');
                      const result = debugOvenAvailability();
                      toast.info(`Diagnóstico completado: ${result.availableOvens} de ${result.totalOvens} hornos disponibles. Ver consola para detalles.`);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                  >
                    <Settings className="h-3 w-3" />
                    <span>Debug</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔄 Reseteando todos los hornos...');
                      resetAllOvens();
                      toast.success('Todos los hornos han sido reseteados a estado disponible');
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                  >
                    <Flame className="h-3 w-3" />
                    <span>Reset Todos</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {(ovenStatuses || []).length === 0 ? (
                <p className="text-gray-500 text-sm">No hay hornos configurados</p>
              ) : (
                <div className="space-y-4">
                  {ovenStatuses.slice(0, 4).map((oven) => (
                    <div key={oven.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{oven.name}</p>
                          <p className="text-sm text-gray-600">
                            {oven.currentTemperature}°C
                            {oven.targetTemperature > 0 && `/ ${oven.targetTemperature}°C`}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOvenStatusColor(oven.status)}`}>
                          {oven.status === 'idle' && 'Inactivo'}
                          {oven.status === 'heating' && 'Calentando'}
                          {oven.status === 'baking' && 'Horneando'}
                          {oven.status === 'paused' && 'Pausado'}
                          {oven.status === 'maintenance' && 'Mantenimiento'}
                        </span>
                      </div>

                      {/* Controles del horno */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {/* Debug: Mostrar estado actual */}
                        <div className="text-xs text-gray-500 w-full mb-1">
                          Estado: {oven.status} | ID: {oven.id}
                        </div>

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

                        {/* Botón de emergencia para forzar estado idle */}
                        {oven.status !== 'idle' && (
                          <button
                            onClick={() => {
                              console.log('Forzando estado idle para horno:', oven.id);
                              updateOvenStatus(oven.id, { status: 'idle', currentBatchId: undefined, targetTemperature: 0 });
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                          >
                            <span>Forzar Idle</span>
                          </button>
                        )}

                        {/* Botón para forzar horno disponible */}
                        <button
                          onClick={() => {
                            console.log('🔧 Forzando horno disponible:', oven.id);
                            forceOvenAvailable(oven.id);
                            toast.success(`Horno ${oven.name} forzado a estado disponible`);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                        >
                          <Settings className="h-3 w-3" />
                          <span>Forzar Disponible</span>
                        </button>

                        {(oven.status === 'heating' || oven.status === 'baking') && (
                          <>
                            <button
                              onClick={() => handlePauseOven(oven.id)}
                              disabled={loadingStates[oven.id]}
                              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                            >
                              {loadingStates[oven.id] ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Pause className="h-3 w-3" />
                              )}
                              <span>Pausar</span>
                            </button>
                            <button
                              onClick={() => handleStopOven(oven.id)}
                              disabled={loadingStates[oven.id]}
                              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                            >
                              {loadingStates[oven.id] ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Square className="h-3 w-3" />
                              )}
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
                              {loadingStates[oven.id] ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                              <span>Reanudar</span>
                            </button>
                            <button
                              onClick={() => handleStopOven(oven.id)}
                              disabled={loadingStates[oven.id]}
                              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                            >
                              {loadingStates[oven.id] ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Square className="h-3 w-3" />
                              )}
                              <span>Detener</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Gestión de Hornos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold text-gray-900">Gestión de Hornos</h2>
                  <Settings className="h-5 w-5 text-gray-500" />
                </div>
                <button
                  onClick={() => setShowOvenManagement(!showOvenManagement)}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  {showOvenManagement ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            {showOvenManagement && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    Total de hornos: {(ovenStatuses || []).length}
                  </div>
                  <button
                    onClick={() => setShowAddOven(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Horno</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {ovenStatuses.map((oven) => {
                    const canRemove = canRemoveOven(oven.id);
                    const utilizationStats = getOvenUtilizationStats().find(stat => stat.ovenId === oven.id);

                    return (
                      <div key={oven.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-medium text-gray-900">{oven.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOvenStatusColor(oven.status)}`}>
                                {oven.status === 'idle' && 'Inactivo'}
                                {oven.status === 'heating' && 'Calentando'}
                                {oven.status === 'baking' && 'Horneando'}
                                {oven.status === 'paused' && 'Pausado'}
                                {oven.status === 'maintenance' && 'Mantenimiento'}
                              </span>
                              {!oven.isRemovable && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                  Principal
                                </span>
                              )}
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>Capacidad: {oven.capacity} unidades</div>
                              <div>Eficiencia: {utilizationStats?.efficiency || oven.efficiency}%</div>
                              <div>Temp. Máx: {oven.maxTemperature}°C</div>
                              <div>Consumo: {oven.energyConsumption} kW/h</div>
                            </div>
                            {oven.currentBatchId && (
                              <div className="mt-2 text-sm text-blue-600">
                                Lote actual: {oven.currentBatchId}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {canRemove && (
                              <button
                                onClick={() => handleRemoveOven(oven.id, oven.name)}
                                disabled={loadingStates[oven.id]}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                              >
                                {loadingStates[oven.id] ? (
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                                <span>Eliminar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Estadísticas de utilización */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Estadísticas de Utilización</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(getOvenUtilizationStats() || []).map((stat) => {
                      const oven = ovenStatuses.find(o => o.id === stat.ovenId);
                      return (
                        <div key={stat.ovenId} className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-900">{oven?.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            Utilización: {stat.utilizationRate}%
                          </div>
                          <div className="text-xs text-gray-600">
                            Eficiencia: {stat.efficiency}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alertas de mantenimiento */}
                {(getOvensRequiringMaintenance() || []).length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Mantenimiento Requerido</span>
                    </div>
                    <div className="text-sm text-yellow-700">
                      Los siguientes hornos requieren mantenimiento:
                      <ul className="mt-1 list-disc list-inside">
                        {(getOvensRequiringMaintenance() || []).map((oven) => (
                          <li key={oven.id}>{oven.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Productos Listos */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Productos Listos</h2>
                <p className="text-sm text-gray-600">Productos terminados listos para venta</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Total: {readyProducts.length}</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {readyProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay productos listos para venta</p>
              <p className="text-sm text-gray-400 mt-2">Los productos aparecerán aquí cuando terminen el proceso de producción</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyProducts.map((batch) => {
                const finishedProduct = (finishedProducts || []).find(fp => fp.batchId === batch.id);
                const isAvailableForSale = finishedProduct?.status === 'available_for_sale';

                return (
                  <div key={batch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{batch.productName}</h3>
                        <p className="text-sm text-gray-600">{batch.quantity} unidades</p>
                        <p className="text-xs text-gray-500">Lote: {batch.id}</p>
                        {finishedProduct && (
                          <p className="text-xs text-gray-500 mt-1">
                            Terminado: {new Date(finishedProduct.completedAt).toLocaleString('es-CO')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isAvailableForSale
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {isAvailableForSale ? 'Disponible para Venta' : 'Listo'}
                        </span>
                        {!isAvailableForSale && (
                          <button
                            onClick={() => handleMarkAvailableForSale(batch.id, batch.quantity)}
                            disabled={loadingStates[`mark-${batch.id}`]}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs flex items-center space-x-1 transition-colors"
                          >
                            {loadingStates[`mark-${batch.id}`] ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            <span>Marcar Disponible</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Indicador de flujo de producción */}
                    <div className="mb-3">
                      <ProductionFlowIndicator
                        currentStatus={isAvailableForSale ? 'available_for_sale' : 'ready'}
                        size="sm"
                        showLabels={false}
                      />
                    </div>

                    {/* Información adicional */}
                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Horno: {batch.ovenId}</span>
                        <span>Panadero: {user?.name}</span>
                      </div>
                      {finishedProduct?.qualityNotes && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Notas:</span> {finishedProduct.qualityNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Vista Histórica */}
      {showHistoricalView && (
        <div className="mt-8">
          <HistoricalProductsView />
        </div>
      )}

      {/* Modal de creación de lote */}
      {showCreateBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Crear Nuevo Lote de Producción</h3>
              <button
                onClick={() => setShowCreateBatch(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Selector de producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Producto *
                </label>
                <select
                  value={createBatchForm.productId}
                  onChange={(e) => {
                    const selectedProduct = e.target.value;
                    const productName = e.target.options[e.target.selectedIndex]?.text || '';
                    setCreateBatchForm(prev => ({
                      ...prev,
                      productId: selectedProduct,
                      productName: productName !== 'Seleccionar producto...' ? productName : '',
                      estimatedDuration: selectedProduct ? 120 : 0
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Seleccionar producto...</option>
                  <option value="pan-frances">Pan Francés</option>
                  <option value="croissant">Croissant</option>
                  <option value="pan-integral">Pan Integral</option>
                  <option value="baguette">Baguette</option>
                  <option value="pan-dulce">Pan Dulce</option>
                  <option value="empanadas">Empanadas</option>
                </select>
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad (unidades) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={createBatchForm.quantity}
                  onChange={(e) => setCreateBatchForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ej: 20"
                />
                <p className="text-xs text-gray-500 mt-1">Cantidad mínima: 1, máxima: 100</p>
              </div>

              {/* Selector de horno */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Horno *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      // Forzar actualización del estado y re-render del select
                      initializeOvenStatuses();
                      setOvenSelectKey(prev => prev + 1);
                      setCreateBatchForm(prev => ({ ...prev, ovenId: '' })); // Limpiar selección
                      toast.info('Hornos actualizados - Select sincronizado');
                    }}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Actualizar</span>
                  </button>
                </div>
                <select
                  key={`oven-select-${ovenSelectKey}`}
                  value={createBatchForm.ovenId}
                  onChange={(e) => setCreateBatchForm(prev => ({ ...prev, ovenId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Seleccionar horno...</option>
                  {getAvailableOvens().map((oven) => (
                    <option key={oven.id} value={oven.id}>
                      {oven.name} (Estado: {oven.status} - {oven.currentTemperature}°C)
                    </option>
                  ))}
                </select>

                {/* Información de debugging */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      Hornos disponibles: {(getAvailableOvens() || []).length} de {(ovenStatuses || []).length}
                    </span>
                    <span className="text-gray-500">
                      Total hornos: {(ovenStatuses || []).length}
                    </span>
                  </div>

                  {/* Mostrar estado de todos los hornos */}
                  <div className="text-xs text-gray-500">
                    Estados: {ovenStatuses.map(oven => `${oven.name}(${oven.status})`).join(', ')}
                  </div>

                  {(getAvailableOvens() || []).length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                      <p className="text-xs text-yellow-700 font-medium">⚠️ No hay hornos disponibles</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Verifica que los hornos estén en estado 'idle' y sin lotes asignados
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tiempo estimado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo estimado (minutos)
                </label>
                <input
                  type="number"
                  min="30"
                  max="480"
                  value={createBatchForm.estimatedDuration}
                  onChange={(e) => setCreateBatchForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="120"
                />
                <p className="text-xs text-gray-500 mt-1">Tiempo total de producción (30-480 minutos)</p>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={createBatchForm.notes}
                  onChange={(e) => setCreateBatchForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Instrucciones especiales, observaciones..."
                />
              </div>

              {/* Registro de materiales utilizados */}
              {createBatchForm.quantity > 0 && (inventoryEntries || []).filter(entry => entry.quantity > 0).length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-3">Registro de Materiales Utilizados:</h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {(inventoryEntries || []).filter(entry => entry.quantity > 0 && entry.productId && entry.productName).map((entry) => {
                      const productId = entry.productId!;
                      const productName = entry.productName!;
                      const currentQuantity = materialQuantities[productId] || 0;
                      const isExceeded = currentQuantity > entry.quantity;
                      const step = productName.toLowerCase().includes('levadura') ? '0.01' : '0.1';
                      const decimals = productName.toLowerCase().includes('levadura') ? 2 : 1;

                      return (
                        <div key={entry.productId}>
                          <label className="block text-sm font-medium text-blue-800 mb-1">
                            {entry.productName} (kg)
                          </label>
                          <input
                            type="number"
                            step={step}
                            min="0"
                            max={entry.quantity}
                            value={currentQuantity}
                            onChange={(e) => setMaterialQuantities(prev => ({
                              ...prev,
                              [entry.productId || 'unknown']: parseFloat(e.target.value) || 0
                            }))}
                            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isExceeded
                              ? 'border-red-300 focus:ring-red-500 bg-red-50'
                              : 'border-blue-300 focus:ring-blue-500 bg-white'
                              }`}
                            placeholder={`0.${'0'.repeat(decimals)}`}
                          />
                          <div className="mt-1 text-xs">
                            <div className="flex justify-between text-blue-600">
                              <span>Stock actual: {entry.quantity.toFixed(decimals)} kg</span>
                              <span className={isExceeded ? 'text-red-600 font-medium' : 'text-green-600'}>
                                Después: {(entry.quantity - currentQuantity).toFixed(decimals)} kg
                              </span>
                            </div>
                            {isExceeded && (
                              <p className="text-red-600 font-medium">⚠️ Cantidad excede el stock disponible</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-xs text-blue-600">
                    <p>💡 Solo se mostrarán los materiales con stock disponible</p>
                  </div>
                </div>
              )}

              {/* Tiempo estimado de finalización */}
              {createBatchForm.estimatedDuration > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Finalización estimada: {new Date(Date.now() + createBatchForm.estimatedDuration * 60000).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateBatch(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateBatch}
                disabled={loadingStates['createBatch'] || !createBatchForm.productId || !createBatchForm.ovenId || createBatchForm.quantity <= 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {loadingStates['createBatch'] ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Iniciar preparación de lote</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar horno */}
      {showAddOven && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Agregar Nuevo Horno</h3>
              <button
                onClick={() => setShowAddOven(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nombre del horno */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Horno *
                </label>
                <input
                  type="text"
                  value={addOvenForm.name}
                  onChange={(e) => setAddOvenForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ej: Horno Industrial 1"
                />
              </div>

              {/* Capacidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad (unidades)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={addOvenForm.capacity}
                  onChange={(e) => setAddOvenForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 10 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">Cantidad máxima de productos que puede hornear simultáneamente</p>
              </div>

              {/* Temperatura máxima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperatura Máxima (°C)
                </label>
                <input
                  type="number"
                  min="180"
                  max="300"
                  value={addOvenForm.maxTemperature}
                  onChange={(e) => setAddOvenForm(prev => ({ ...prev, maxTemperature: parseInt(e.target.value) || 250 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="250"
                />
                <p className="text-xs text-gray-500 mt-1">Temperatura máxima que puede alcanzar el horno</p>
              </div>

              {/* Consumo energético */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consumo Energético (kW/h)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="10.0"
                  value={addOvenForm.energyConsumption}
                  onChange={(e) => setAddOvenForm(prev => ({ ...prev, energyConsumption: parseFloat(e.target.value) || 3.0 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="3.0"
                />
                <p className="text-xs text-gray-500 mt-1">Consumo energético promedio por hora de uso</p>
              </div>

              {/* Intervalo de mantenimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervalo de Mantenimiento (días)
                </label>
                <input
                  type="number"
                  min="7"
                  max="90"
                  value={addOvenForm.maintenanceInterval}
                  onChange={(e) => setAddOvenForm(prev => ({ ...prev, maintenanceInterval: parseInt(e.target.value) || 30 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-1">Frecuencia recomendada para mantenimiento preventivo</p>
              </div>

              {/* Es removible */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isRemovable"
                  checked={addOvenForm.isRemovable}
                  onChange={(e) => setAddOvenForm(prev => ({ ...prev, isRemovable: e.target.checked }))}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="isRemovable" className="text-sm text-gray-700">
                  Permitir eliminación del horno
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-7">Si está desactivado, el horno no podrá ser eliminado del sistema</p>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddOven(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddOven}
                disabled={loadingStates['addOven'] || !addOvenForm.name.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {loadingStates['addOven'] ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Agregando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Agregar Horno</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <div className="text-center">
              <LogOut className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cerrar Sesión</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres cerrar sesión?
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    toast.success('Sesión cerrada correctamente');
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
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

export default BakerDashboard;