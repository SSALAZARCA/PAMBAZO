import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import ProductionFlowIndicator from './ProductionFlowIndicator';
import { Calendar, Filter, Search, Download, Eye } from 'lucide-react';
import { PAMBAZO, FinishedProduct, ProductSaleRecord } from '../../shared/types';

interface HistoricalProductsViewProps {
  className?: string;
}

const HistoricalProductsView: React.FC<HistoricalProductsViewProps> = ({ className = '' }) => {
  const {
    finishedProducts,
    productSaleRecords
  } = useStore();

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    productType: '',
    bakerName: '',
    status: '' as PAMBAZO.FinishedProductStatus | ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'products' | 'sales'>('products');

  // Obtener datos filtrados
  const filteredData = useMemo(() => {
    let data: (FinishedProduct | ProductSaleRecord)[] = viewMode === 'products' ? finishedProducts : productSaleRecords;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      data = data.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ('bakerName' in item && item.bakerName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por fecha
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      data = data.filter(item => {
        const itemDate = new Date('completedAt' in item ? item.completedAt : item.saleDate);
        return itemDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Incluir todo el día
      data = data.filter(item => {
        const itemDate = new Date('completedAt' in item ? item.completedAt : item.saleDate);
        return itemDate <= toDate;
      });
    }

    // Filtrar por tipo de producto
    if (filters.productType) {
      data = data.filter(item =>
        item.productName.toLowerCase().includes(filters.productType.toLowerCase())
      );
    }

    // Filtrar por panadero
    if (filters.bakerName) {
      data = data.filter(item =>
        'bakerName' in item && item.bakerName.toLowerCase().includes(filters.bakerName.toLowerCase())
      );
    }

    // Filtrar por estado (solo para productos)
    if (filters.status && viewMode === 'products') {
      data = data.filter(item =>
        'status' in item && item.status === filters.status
      );
    }

    return data.sort((a, b) => {
      const dateA = new Date('completedAt' in a ? a.completedAt : a.saleDate);
      const dateB = new Date('completedAt' in b ? b.completedAt : b.saleDate);
      return dateB.getTime() - dateA.getTime(); // Más recientes primero
    });
  }, [finishedProducts, productSaleRecords, filters, searchTerm, viewMode]);

  // Obtener opciones únicas para los filtros
  const uniqueProductTypes = useMemo(() => {
    const types = new Set<string>();
    finishedProducts.filter(p => p.productName).forEach(product => {
      const type = product.productName.split(' ')[0];
      if (type) types.add(type);
    });
    return Array.from(types).sort();
  }, [finishedProducts]);

  const uniqueBakers = useMemo(() => {
    const bakers = new Set<string>();
    finishedProducts.forEach(product => {
      if (product.bakerName) bakers.add(product.bakerName);
    });
    return Array.from(bakers).sort();
  }, [finishedProducts]);

  const handleExport = () => {
    const csvContent = generateCSV(filteredData, viewMode);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${viewMode}_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSV = (data: any[], mode: 'products' | 'sales') => {
    if (mode === 'products') {
      const headers = ['Fecha', 'Producto', 'Cantidad', 'Panadero', 'Estado', 'Calidad', 'Notas'];
      const rows = data.map(item => [
        new Date(item.completedAt).toLocaleDateString('es-CO'),
        item.productName,
        item.quantity,
        item.bakerName,
        item.status,
        item.qualityScore || '',
        item.qualityNotes || ''
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      const headers = ['Fecha', 'Producto', 'Cantidad', 'Tipo Venta', 'Total', 'Cliente'];
      const rows = data.map(item => [
        new Date(item.saleDate).toLocaleDateString('es-CO'),
        item.productName,
        item.quantity,
        item.saleType,
        item.totalAmount || '',
        item.customerInfo || ''
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      productType: '',
      bakerName: '',
      status: ''
    });
    setSearchTerm('');
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Historial de Productos</h2>
              <p className="text-sm text-gray-600">Registro histórico de producción y ventas</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Selector de vista */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setViewMode('products')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${viewMode === 'products'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Productos Terminados
          </button>
          <button
            onClick={() => setViewMode('sales')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${viewMode === 'sales'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Registro de Ventas
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por producto o panadero..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Producto</label>
            <select
              value={filters.productType}
              onChange={(e) => setFilters(prev => ({ ...prev, productType: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {uniqueProductTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Panadero</label>
            <select
              value={filters.bakerName}
              onChange={(e) => setFilters(prev => ({ ...prev, bakerName: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {uniqueBakers.map(baker => (
                <option key={baker} value={baker}>{baker}</option>
              ))}
            </select>
          </div>
          {viewMode === 'products' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as PAMBAZO.FinishedProductStatus }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="ready">Listo</option>
                <option value="available_for_sale">Disponible para Venta</option>
                <option value="sold">Vendido</option>
              </select>
            </div>
          )}
        </div>

        {/* Botón limpiar filtros */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
          >
            <Filter className="h-4 w-4" />
            <span>Limpiar filtros</span>
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {filteredData.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron registros</p>
            <p className="text-sm text-gray-400 mt-2">Ajusta los filtros para ver más resultados</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Mostrando {filteredData.length} registro{filteredData.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((item, index) => {
                // Safe casting based on viewMode
                // Note: We rely on viewMode logic in filteredData to ensure correct types in each mode
                if (viewMode === 'products') {
                  const product = item as FinishedProduct;
                  return (
                    <div key={`${product.id}-${index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div>
                        {/* Product View Content */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{product.productName}</h3>
                            <p className="text-sm text-gray-600">{product.quantity} unidades</p>
                            <p className="text-xs text-gray-500">
                              {new Date(product.completedAt).toLocaleString('es-CO')}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'available_for_sale' ? 'bg-blue-100 text-blue-800' :
                            product.status === 'sold' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                            {product.status === 'ready' && 'Listo'}
                            {product.status === 'available_for_sale' && 'Disponible'}
                            {product.status === 'sold' && 'Vendido'}
                          </span>
                        </div>

                        <div className="mb-3">
                          <ProductionFlowIndicator
                            currentStatus={product.status as any}
                            size="sm"
                            showLabels={false}
                          />
                        </div>

                        <div className="border-t border-gray-100 pt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Panadero: {product.bakerName}</span>
                            {product.qualityScore && (
                              <span>Calidad: {product.qualityScore}%</span>
                            )}
                          </div>
                          {product.qualityNotes && (
                            <p className="text-xs text-gray-600 mt-1">
                              {product.qualityNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const sale = item as unknown as ProductSaleRecord;
                  return (
                    <div key={`${sale.id}-${index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div>
                        {/* Sales View Content */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{sale.productName}</h3>
                            <p className="text-sm text-gray-600">{sale.quantitySold} unidades</p>
                            <p className="text-xs text-gray-500">
                              {new Date(sale.saleDate).toLocaleString('es-CO')}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${sale.saleType === 'counter' ? 'bg-green-100 text-green-800' :
                            sale.saleType === 'pre_order' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {sale.saleType === 'counter' && 'Mostrador'}
                            {sale.saleType === 'pre_order' && 'Pedido'}
                            {sale.saleType === 'delivery' && 'Domicilio'}
                          </span>
                        </div>

                        <div className="border-t border-gray-100 pt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Lote: {sale.finishedProductId}</span>
                            {sale.totalAmount && (
                              <span className="font-medium text-green-600">
                                ${sale.totalAmount.toLocaleString('es-CO')}
                              </span>
                            )}
                          </div>
                          {sale.customerName && (
                            <p className="text-xs text-gray-600 mt-1">
                              Cliente: {sale.customerName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalProductsView;