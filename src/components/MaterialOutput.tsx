import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { MaterialUsage, InventoryItem, ProductionBatch } from '../../shared/types';
import {
  Package,
  Minus,
  Search,
  Filter,
  CheckCircle,
  TrendingDown,
  Download,
  RefreshCw
} from 'lucide-react';

interface MaterialOutputProps {
  className?: string;
  showHeader?: boolean;
  batchId?: string; // Para mostrar solo materiales de un lote específico
}

const MaterialOutput: React.FC<MaterialOutputProps> = ({
  className = '',
  showHeader = true,
  batchId
}) => {
  const {
    materialUsages,
    productionBatches,
    addMaterialUsage
  } = useStore();

  // Mock inventory since useStore doesn't have it yet
  const inventory: InventoryItem[] = [
    { id: '1', name: 'Harina', currentStock: 50, unit: 'kg', cost: 1500, minStock: 10, maxStock: 100, lastRestocked: new Date() },
    { id: '2', name: 'Azúcar', currentStock: 20, unit: 'kg', cost: 1200, minStock: 5, maxStock: 50, lastRestocked: new Date() },
    { id: '3', name: 'Levadura', currentStock: 5, unit: 'kg', cost: 5000, minStock: 1, maxStock: 10, lastRestocked: new Date() },
  ];

  /* 
   * Filter available batches ensuring status is compatible. 
   * productionBatches status type: 'pending' | 'preparing' | 'baking' | 'cooling' | 'ready' | 'completed'
   * We want batches that are NOT completed/ready? Or just in progress.
   */
  const activeBatches = productionBatches.filter(b => b.status === 'preparing' || b.status === 'baking' || b.status === 'cooling');

  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedBatch, setSelectedBatch] = useState<string>(batchId || '');
  const [notes, setNotes] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar materiales disponibles
  const availableMaterials = inventory.filter((item: InventoryItem) =>
    item.currentStock > 0 &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock inventory since useStore doesn't have it yet

  // Filtrar usos de materiales
  const getFilteredUsages = () => {
    let filtered = materialUsages;

    // Filtrar por lote si se especifica
    if (batchId) {
      filtered = filtered.filter(u => u.batchId === batchId);
    }

    // Filtrar por fecha
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter((usage: MaterialUsage) => usage.usageDate >= startOfDay);
        break;
      case 'week':
        filtered = filtered.filter((usage: MaterialUsage) => usage.usageDate >= startOfWeek);
        break;
      case 'month':
        filtered = filtered.filter((usage: MaterialUsage) => usage.usageDate >= startOfMonth);
        break;
      // 'all' no filtra por fecha
    }

    return filtered.sort((a: MaterialUsage, b: MaterialUsage) => b.usageDate.getTime() - a.usageDate.getTime());
  };

  const filteredUsages = getFilteredUsages();

  // Calcular estadísticas
  const todayUsages = materialUsages.filter((usage: MaterialUsage) => {
    const today = new Date();
    const usageDate = new Date(usage.usageDate);
    return usageDate.toDateString() === today.toDateString();
  });

  const totalCostToday = todayUsages.reduce((sum: number, usage: MaterialUsage) => sum + usage.cost, 0);
  const totalQuantityToday = todayUsages.reduce((sum: number, usage: MaterialUsage) => sum + usage.quantityUsed, 0);
  const uniqueMaterialsToday = new Set(todayUsages.map((usage: MaterialUsage) => usage.materialId)).size;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial || !selectedBatch || quantity <= 0) return;

    setIsSubmitting(true);

    try {
      // Buscar el material en el inventario
      const material = inventory.find((item: InventoryItem) => item.id === selectedMaterial);
      if (!material) {
        alert('Material no encontrado');
        return;
      }

      // Verificar stock disponible
      if (material.currentStock < quantity) {
        alert(`Stock insuficiente. Disponible: ${material.currentStock} ${material.unit}`);
        return;
      }

      // Buscar el lote
      const batch = productionBatches.find((b: ProductionBatch) => b.id === selectedBatch);
      if (!batch) {
        alert('Lote no encontrado');
        return;
      }

      // Registrar el uso del material
      addMaterialUsage({
        materialId: selectedMaterial,
        materialName: material.name,
        quantityUsed: quantity,
        unit: material.unit,
        cost: material.cost * quantity,
        batchId: batchId || 'direct-usage',
        usageDate: new Date(),
        date: new Date()
      });

      // Simular actualización de inventario ya que updateInventoryItem no existe en store
      inventory.forEach(item => {
        if (item.id === selectedMaterial) {
          item.currentStock -= quantity;
        }
      });
      // En una implementación real, esto se sincronizaría con el backend/store


      // Limpiar formulario
      setSelectedMaterial('');
      setQuantity(0);
      setNotes('');
      if (!batchId) setSelectedBatch('');
      setShowForm(false);

      alert('Salida de material registrada exitosamente');
    } catch (error) {
      console.error('Error al registrar salida:', error);
      alert('Error al registrar la salida del material');
    } finally {
      setIsSubmitting(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Material', 'Cantidad', 'Unidad', 'Costo', 'Lote'];
    const csvContent = [
      headers.join(','),
      ...filteredUsages.map((usage: MaterialUsage) => [
        formatDate(usage.usageDate),
        usage.materialName,
        usage.quantityUsed,
        usage.unit,
        usage.cost,
        usage.batchId
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salidas_materiales_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingDown className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Salidas de Material</h2>
                <p className="text-sm text-gray-600">
                  {filteredUsages.length} registros • {formatCurrency(totalCostToday)} hoy
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {showForm ? 'Cancelar' : 'Nueva Salida'}
              </button>
              <button
                onClick={exportToCSV}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Exportar a CSV"
              >
                <Download className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalQuantityToday}</div>
            <div className="text-sm text-gray-600">Cantidad Total Hoy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCostToday)}</div>
            <div className="text-sm text-gray-600">Costo Total Hoy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{uniqueMaterialsToday}</div>
            <div className="text-sm text-gray-600">Materiales Únicos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{todayUsages.length}</div>
            <div className="text-sm text-gray-600">Salidas Hoy</div>
          </div>
        </div>
      </div>

      {/* Formulario de nueva salida */}
      {showForm && (
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Nueva Salida</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selector de material */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material *
                </label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar material...</option>
                  {availableMaterials.map((material: InventoryItem) => (
                    <option key={material.id} value={material.id}>
                      {material.name} (Stock: {material.currentStock} {material.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de lote */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lote de Producción *
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!!batchId}
                >
                  <option value="">Seleccionar lote...</option>
                  {activeBatches.map((batch: ProductionBatch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.productName} - {batch.quantity} unidades
                    </option>
                  ))}
                </select>
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad *
                </label>
                <input
                  type="number"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="0.01"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {selectedMaterial && (
                  <p className="text-xs text-gray-500 mt-1">
                    Disponible: {availableMaterials.find((m: InventoryItem) => m.id === selectedMaterial)?.currentStock} {availableMaterials.find((m: InventoryItem) => m.id === selectedMaterial)?.unit}
                  </p>
                )}
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionales..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedMaterial || !selectedBatch || quantity <= 0}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Registrar Salida</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controles de filtrado */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="all">Todos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de salidas */}
      <div className="p-6">
        {filteredUsages.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {materialUsages.length === 0
                ? 'No hay salidas de material registradas'
                : 'No hay salidas que coincidan con los filtros'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsages.map((usage: MaterialUsage) => {
              const material = inventory.find((item: InventoryItem) => item.id === usage.materialId);
              const batch = productionBatches.find((b: ProductionBatch) => b.id === usage.batchId);

              return (
                <div key={`${usage.materialId}-${usage.batchId}-${usage.usageDate.getTime()}`} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Minus className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{usage.materialName}</h3>
                        <p className="text-sm text-gray-600">
                          {usage.quantityUsed} {usage.unit} • {formatCurrency(usage.cost)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(usage.usageDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {batch?.productName || 'Lote no encontrado'}
                      </div>
                    </div>
                  </div>

                  {material && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                        <div>
                          <span>Stock actual:</span>
                          <div className="font-medium text-gray-900">{material.currentStock} {material.unit}</div>
                        </div>
                        <div>
                          <span>Stock mínimo:</span>
                          <div className="font-medium text-gray-900">{material.minStock} {material.unit}</div>
                        </div>
                        <div>
                          <span>Costo unitario:</span>
                          <div className="font-medium text-gray-900">{formatCurrency(material.cost || 0)}</div>
                        </div>
                        <div>
                          <span>Estado:</span>
                          <div className={`font-medium ${material.currentStock <= material.minStock * 0.5 ? 'text-red-600' :
                            material.currentStock <= material.minStock ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                            {material.currentStock <= material.minStock * 0.5 ? 'Crítico' :
                              material.currentStock <= material.minStock ? 'Bajo' : 'Normal'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialOutput;