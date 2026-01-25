import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Download,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { useToast } from './NotificationSystem';
import { StatsCardSkeleton } from './SkeletonLoaders';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  sellingPrice: number;
  supplier: string;
  location: string;
  lastUpdated: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  movements: StockMovement[];
}

interface StockMovement {
  id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string | undefined;
  timestamp: Date;
  userId: string;
  userName: string;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  topSellingItems: InventoryItem[];
  recentMovements: StockMovement[];
}

// Mock data
const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Hamburguesa Clásica',
    sku: 'BURG-001',
    category: 'Hamburguesas',
    currentStock: 25,
    minStock: 10,
    maxStock: 50,
    unitCost: 8000,
    sellingPrice: 15000,
    supplier: 'Carnes Premium',
    location: 'Refrigerador A1',
    lastUpdated: new Date(),
    status: 'in_stock',
    movements: []
  },
  {
    id: '2',
    name: 'Papas Fritas',
    sku: 'SIDE-001',
    category: 'Acompañamientos',
    currentStock: 5,
    minStock: 15,
    maxStock: 100,
    unitCost: 2000,
    sellingPrice: 5000,
    supplier: 'Distribuidora Central',
    location: 'Almacén B2',
    lastUpdated: new Date(),
    status: 'low_stock',
    movements: []
  },
  {
    id: '3',
    name: 'Coca Cola',
    sku: 'BEV-001',
    category: 'Bebidas',
    currentStock: 0,
    minStock: 20,
    maxStock: 200,
    unitCost: 1500,
    sellingPrice: 3000,
    supplier: 'Coca Cola Company',
    location: 'Refrigerador B1',
    lastUpdated: new Date(),
    status: 'out_of_stock',
    movements: []
  }
];

// Inventory Stats Component
const InventoryStatsCards = ({ stats, loading }: { stats: InventoryStats; loading: boolean }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Valor Total',
      value: `$${stats.totalValue.toLocaleString()}`,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Stock Bajo',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      title: 'Sin Stock',
      value: stats.outOfStockItems,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

// Inventory Item Row Component
const InventoryItemRow = ({
  item,
  onEdit,
  onDelete,
  onViewMovements
}: {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onViewMovements: (item: InventoryItem) => void;
}) => {
  const getStatusBadge = (status: InventoryItem['status']) => {
    const statusConfig = {
      in_stock: { label: 'En Stock', variant: 'default' as const, color: 'text-green-600' },
      low_stock: { label: 'Stock Bajo', variant: 'secondary' as const, color: 'text-yellow-600' },
      out_of_stock: { label: 'Sin Stock', variant: 'destructive' as const, color: 'text-red-600' },
      discontinued: { label: 'Descontinuado', variant: 'outline' as const, color: 'text-gray-600' }
    };

    return statusConfig[status];
  };

  const getStockPercentage = () => {
    if (item.maxStock === 0) return 0;
    return (item.currentStock / item.maxStock) * 100;
  };

  const statusConfig = getStatusBadge(item.status);
  const stockPercentage = getStockPercentage();

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b hover:bg-muted/50 transition-colors"
    >
      <td className="p-4">
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">{item.sku}</p>
        </div>
      </td>
      <td className="p-4">
        <Badge variant="outline">{item.category}</Badge>
      </td>
      <td className="p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${statusConfig.color}`}>
              {item.currentStock}
            </span>
            <span className="text-sm text-muted-foreground">/ {item.maxStock}</span>
          </div>
          <Progress value={stockPercentage} className="h-1" />
        </div>
      </td>
      <td className="p-4">
        <Badge variant={statusConfig.variant}>
          {statusConfig.label}
        </Badge>
      </td>
      <td className="p-4">
        <div>
          <p className="font-medium">${item.sellingPrice.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            Costo: ${item.unitCost.toLocaleString()}
          </p>
        </div>
      </td>
      <td className="p-4">
        <p className="text-sm">{item.supplier}</p>
      </td>
      <td className="p-4">
        <p className="text-sm">{item.location}</p>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewMovements(item)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </motion.tr>
  );
};

// Stock Movement Form
const StockMovementForm = ({
  onSubmit,
  onCancel
}: {

  onSubmit: (movement: Partial<StockMovement>) => void;
  onCancel: () => void;
}) => {
  const [type, setType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const notify = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || !reason) {
      notify.warning('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      notify.error('Cantidad inválida', 'La cantidad debe ser un número positivo');
      return;
    }

    onSubmit({
      type,
      quantity: quantityNum,
      reason,
      reference: reference || undefined,
      timestamp: new Date(),
      userId: 'current-user',
      userName: 'Usuario Actual'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Tipo de Movimiento</label>
        <Select value={type} onValueChange={(value: any) => setType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in">Entrada</SelectItem>
            <SelectItem value="out">Salida</SelectItem>
            <SelectItem value="adjustment">Ajuste</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Cantidad</label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Ingresa la cantidad"
          min="1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Motivo</label>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo del movimiento"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Referencia (Opcional)</label>
        <Input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Número de orden, factura, etc."
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Registrar Movimiento
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

// Main Inventory System Component
export const InventorySystem = () => {
  const [items, setItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const notify = useToast();

  // Calculate stats
  const stats: InventoryStats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0),
    lowStockItems: items.filter(item => item.status === 'low_stock').length,
    outOfStockItems: items.filter(item => item.status === 'out_of_stock').length,
    topSellingItems: items.slice(0, 5),
    recentMovements: []
  };

  // Filter items
  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, categoryFilter, statusFilter]);

  const handleStockMovement = (movement: Partial<StockMovement>) => {
    if (!selectedItem) return;

    const newMovement: StockMovement = {
      id: Date.now().toString(),
      ...movement
    } as StockMovement;

    let newStock = selectedItem.currentStock;

    switch (movement.type) {
      case 'in':
        newStock += movement.quantity!;
        break;
      case 'out':
        newStock = Math.max(0, newStock - movement.quantity!);
        break;
      case 'adjustment':
        newStock = movement.quantity!;
        break;
    }

    // Determine new status
    let newStatus: InventoryItem['status'] = 'in_stock';
    if (newStock === 0) {
      newStatus = 'out_of_stock';
    } else if (newStock <= selectedItem.minStock) {
      newStatus = 'low_stock';
    }

    const updatedItem = {
      ...selectedItem,
      currentStock: newStock,
      status: newStatus,
      lastUpdated: new Date(),
      movements: [...selectedItem.movements, newMovement]
    };

    setItems(prev => prev.map(item =>
      item.id === selectedItem.id ? updatedItem : item
    ));

    setShowMovementForm(false);
    setSelectedItem(null);

    notify.success(
      'Movimiento registrado',
      `Stock actualizado: ${newStock} unidades`
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    notify.success('Item eliminado', 'El producto ha sido eliminado del inventario');
  };

  const categories = [...new Set(items.map(item => item.category))];

  if (!items) return null;


  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <InventoryStatsCards stats={stats} loading={false} />

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestión de Inventario</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="in_stock">En Stock</SelectItem>
                <SelectItem value="low_stock">Stock Bajo</SelectItem>
                <SelectItem value="out_of_stock">Sin Stock</SelectItem>
                <SelectItem value="discontinued">Descontinuado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Producto</th>
                  <th className="text-left p-4 font-medium">Categoría</th>
                  <th className="text-left p-4 font-medium">Stock</th>
                  <th className="text-left p-4 font-medium">Estado</th>
                  <th className="text-left p-4 font-medium">Precio</th>
                  <th className="text-left p-4 font-medium">Proveedor</th>
                  <th className="text-left p-4 font-medium">Ubicación</th>
                  <th className="text-left p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredItems.map(item => (
                    <InventoryItemRow
                      key={item.id}
                      item={item}
                      onEdit={(item) => console.log('Edit', item)}
                      onDelete={handleDeleteItem}
                      onViewMovements={(item) => {
                        setSelectedItem(item);
                        setShowMovementForm(true);
                      }}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron productos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Movement Dialog */}
      <Dialog open={showMovementForm} onOpenChange={setShowMovementForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Movimiento de Stock - {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <StockMovementForm
              onSubmit={handleStockMovement}
              onCancel={() => {
                setShowMovementForm(false);
                setSelectedItem(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventorySystem;