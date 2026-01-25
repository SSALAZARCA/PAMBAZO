import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Utensils,
  Timer,
  UserCheck
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface TableOrder {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  timestamp: Date;
}

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrder?: TableOrder | undefined;
  assignedWaiter?: string | undefined;
  occupiedSince?: Date | undefined;
  estimatedTime?: number | undefined; // minutes
  customerCount?: number | undefined;
  notes?: string | undefined;
}

interface Waiter {
  id: string;
  name: string;
  isActive: boolean;
  tablesAssigned: number;
}

export function TableManagement() {

  // Usar el store de Zustand
  const { tables, updateTableStatus, getTables, updateOrderStatus, initializeTables, user } = useStore();

  // Estado local para las mesas
  const [localTables, setLocalTables] = useState<Table[]>([]);

  // Convertir las mesas del store al formato del componente
  const convertStoreTableToComponentTable = (storeTable: any): Table => {
    // Buscar la orden activa si existe
    let currentOrder: TableOrder | undefined = undefined;
    if (storeTable.currentOrder && typeof storeTable.currentOrder === 'string') {
      const order = useStore.getState().orders.find(o => o.id === storeTable.currentOrder);
      if (order) {
        currentOrder = {
          id: order.id,
          items: order.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price
          })),
          total: order.total,
          status: (order.status === 'completed' || order.status === 'delivered') ? 'delivered' : (order.status as any),
          timestamp: new Date(order.createdAt)
        };
      }
    }

    return {
      id: storeTable.id,
      number: storeTable.number,
      capacity: storeTable.capacity,
      status: storeTable.status,
      assignedWaiter: storeTable.assignedWaiter || storeTable.waiterName, // Handle both field names
      occupiedSince: storeTable.occupiedSince ? new Date(storeTable.occupiedSince) : undefined,
      customerCount: storeTable.customerCount || storeTable.guestCount, // Handle both field names
      estimatedTime: 15, // valor por defecto
      notes: storeTable.notes || '',
      currentOrder
    };
  };

  // Inicializar las mesas cuando se monta el componente
  useEffect(() => {
    initializeTables();
    const allTables = getTables();
    setLocalTables(allTables.map(convertStoreTableToComponentTable));
  }, [initializeTables, getTables, user]);

  // Usar las mesas del store convertidas
  const tablesWithOrders: Table[] = localTables.map(convertStoreTableToComponentTable);

  const [waiters] = useState<Waiter[]>([
    { id: '1', name: 'Ana García', isActive: true, tablesAssigned: 2 },
    { id: '2', name: 'Carlos Ruiz', isActive: true, tablesAssigned: 1 },
    { id: '3', name: 'María López', isActive: false, tablesAssigned: 0 },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TableOrder | null>(null);

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'cleaning':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Ocupada';
      case 'reserved':
        return 'Reservada';
      case 'cleaning':
        return 'Limpieza';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'occupied':
        return <Users className="h-4 w-4" />;
      case 'reserved':
        return <Clock className="h-4 w-4" />;
      case 'cleaning':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getOrderStatusColor = (status: TableOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleChangeTableStatus = (tableId: string, newStatus: Table['status'], guestCount?: number, waiterName?: string) => {
    // Validar transiciones de estado válidas
    const validTransitions: Record<Table['status'], Table['status'][]> = {
      'available': ['occupied', 'reserved', 'cleaning'],
      'occupied': ['available', 'cleaning'],
      'reserved': ['occupied', 'available'],
      'cleaning': ['available']
    };

    const table = tablesWithOrders.find(t => t.id === tableId);
    if (!table) {
      console.error('Mesa no encontrada:', tableId);
      return;
    }

    if (!validTransitions[table.status].includes(newStatus)) {
      console.warn(`Transición no válida de ${table.status} a ${newStatus}`);
      return;
    }

    try {
      // Actualizar estado local inmediatamente
      setLocalTables(prev =>
        prev.map(t =>
          t.id === tableId
            ? {
              ...t,
              status: newStatus,
              customerCount: guestCount || t.customerCount,
              assignedWaiter: waiterName || t.assignedWaiter,
              occupiedSince: newStatus === 'occupied' ? new Date() : t.occupiedSince
            }
            : t
        )
      );

      // Actualizar la mesa seleccionada si está abierto el diálogo
      if (selectedTable && selectedTable.id === tableId) {
        setSelectedTable({ ...selectedTable, status: newStatus });
      }

      // Actualizar en el store global con un pequeño delay para evitar conflictos
      setTimeout(() => {
        updateTableStatus(tableId, newStatus, guestCount, waiterName);
      }, 50);
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  const handleAssignWaiter = (tableId: string, waiterId: string) => {
    // Validar que la mesa existe
    const table = tablesWithOrders.find(t => t.id === tableId);
    if (!table) {
      console.error('Mesa no encontrada:', tableId);
      return;
    }

    // Validar que el mesero existe y está activo
    const waiter = waiters.find(w => w.name === waiterId && w.isActive);
    if (!waiter) {
      console.error('Mesero no válido o inactivo:', waiterId);
      return;
    }

    const tableFromStore = tables.find(t => t.id === tableId);
    if (tableFromStore) {
      updateTableStatus(tableId, tableFromStore.status, tableFromStore.guestCount, waiterId);
    }

    // Actualizar los datos locales
    const updatedTables = tablesWithOrders.map(table =>
      table.id === tableId ? { ...table, assignedWaiter: waiterId } : table
    );
    setLocalTables(updatedTables);

    // Actualizar la mesa seleccionada si está abierto el diálogo
    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable({ ...selectedTable, assignedWaiter: waiterId });
    }
  };

  const handleTableDetails = (table: Table) => {
    setSelectedTable(table);
    setIsDialogOpen(true);
  };

  const handleViewOrder = (order: TableOrder) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  // Usar localTables como fuente principal de datos
  const currentTables: Table[] = localTables.length > 0
    ? localTables
    : (tables.length > 0 ? tables.map(convertStoreTableToComponentTable) : tablesWithOrders);

  const handleServeOrder = (tableId: string) => {
    // Buscar la mesa y su pedido actual
    const table = tablesWithOrders.find(t => t.id === tableId);
    if (!table) {
      console.error('Mesa no encontrada:', tableId);
      return;
    }

    if (!table.currentOrder) {
      console.warn('No hay pedido actual para servir en la mesa:', tableId);
      return;
    }

    if (table.currentOrder.status !== 'ready') {
      console.warn('El pedido no está listo para servir. Estado actual:', table.currentOrder.status);
      return;
    }

    updateOrderStatus(table.currentOrder.id, 'delivered');
  };

  const handleConfirmReservation = (tableId: string) => {
    updateTableStatus(tableId, 'occupied');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: TableOrder['status']) => {
    // Validar que el pedido existe
    const table = tablesWithOrders.find(t => t.currentOrder?.id === orderId);
    if (!table || !table.currentOrder) {
      console.error('Pedido no encontrado:', orderId);
      return;
    }

    // Validar transiciones de estado válidas para pedidos
    const validOrderTransitions: Record<TableOrder['status'], TableOrder['status'][]> = {
      'pending': ['preparing', 'ready'],
      'preparing': ['ready'],
      'ready': ['delivered'],
      'delivered': [] // Estado final
    };

    if (!validOrderTransitions[table.currentOrder.status].includes(newStatus)) {
      console.warn(`Transición de pedido no válida de ${table.currentOrder.status} a ${newStatus}`);
      return;
    }

    try {
      updateOrderStatus(orderId, newStatus);

      // Actualizar el pedido seleccionado si está abierto el diálogo
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filtrar mesas basado en el filtro de estado
  const filteredTables = statusFilter === 'all'
    ? currentTables
    : currentTables.filter(table => table.status === statusFilter);

  const statusOptions = [
    { value: 'all', label: 'Todas', count: currentTables.length },
    { value: 'available', label: 'Disponibles', count: currentTables.filter(t => t.status === 'available').length },
    { value: 'occupied', label: 'Ocupadas', count: currentTables.filter(t => t.status === 'occupied').length },
    { value: 'reserved', label: 'Reservadas', count: currentTables.filter(t => t.status === 'reserved').length },
    { value: 'cleaning', label: 'Limpieza', count: currentTables.filter(t => t.status === 'cleaning').length },
  ];

  return (
    <div className="space-y-4">


      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Gestión de Mesas
          </h2>
          <p className="text-sm text-muted-foreground">
            {currentTables.length} mesas registradas
          </p>

        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(option.value)}
            className="whitespace-nowrap"
          >
            {option.label} ({option.count})
          </Button>
        ))}
      </div>

      {/* Waiters Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Meseros Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {waiters.filter(w => w.isActive).map((waiter) => (
              <div key={waiter.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{waiter.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {waiter.tablesAssigned} mesas asignadas
                  </p>
                </div>
                <Badge variant="outline">
                  Activo
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredTables.map((table) => (
          <Card key={table.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4" onClick={() => handleTableDetails(table)}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold">
                        {table.number}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Mesa
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {table.customerCount || 0}/{table.capacity}
                        </span>
                      </div>
                      {table.assignedWaiter && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Mesero: {table.assignedWaiter}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(table.status)}>
                    {getStatusIcon(table.status)}
                    <span className="ml-1">{getStatusText(table.status)}</span>
                  </Badge>
                </div>

                {table.status === 'occupied' && table.occupiedSince && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Desde: {formatTime(table.occupiedSince)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        {table.estimatedTime}m restantes
                      </span>
                    </div>

                    {table.currentOrder && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Pedido actual</span>
                          <Badge className={getOrderStatusColor(table.currentOrder.status)}>
                            {table.currentOrder.status === 'pending' && 'Pendiente'}
                            {table.currentOrder.status === 'preparing' && 'Preparando'}
                            {table.currentOrder.status === 'ready' && 'Listo'}
                            {table.currentOrder.status === 'delivered' && 'Servido'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {table.currentOrder.items.length} productos
                          </span>
                          <span className="text-sm font-medium">
                            ${table.currentOrder.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {table.status === 'reserved' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    En {table.estimatedTime} minutos
                  </div>
                )}

                {table.status === 'cleaning' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    {table.estimatedTime} min restantes
                  </div>
                )}

                {table.notes && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    {table.notes}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {/* Botones de acción estandarizados para todas las mesas */}
                  <div className="grid grid-cols-2 gap-1">
                    {/* Botón principal de cambio de estado */}
                    <Button
                      size="sm"
                      variant={table.status === 'available' ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (table.status === 'available') {
                          handleChangeTableStatus(table.id, 'occupied');
                        } else if (table.status === 'occupied') {
                          handleChangeTableStatus(table.id, 'cleaning');
                        } else if (table.status === 'cleaning') {
                          handleChangeTableStatus(table.id, 'available');
                        } else if (table.status === 'reserved') {
                          handleConfirmReservation(table.id);
                        }
                      }}
                    >
                      {table.status === 'available' && '🔄 Ocupar'}
                      {table.status === 'occupied' && '✅ Liberar'}
                      {table.status === 'cleaning' && '🧹 Terminado'}
                      {table.status === 'reserved' && '👥 Confirmar'}
                    </Button>

                    {/* Botones unificados de gestión de pedidos - disponibles para todas las mesas */}
                    {table.currentOrder ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(table.currentOrder!);
                          }}
                        >
                          📋 Ver Pedido
                        </Button>
                        {table.currentOrder.status === 'ready' && (
                          <Button
                            size="sm"
                            variant="default"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleServeOrder(table.id);
                            }}
                          >
                            🍽️ Servir
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTableDetails(table);
                        }}
                      >
                        ➕ Crear Pedido
                      </Button>
                    )}

                    {/* Botón de detalles - disponible para todas las mesas */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs col-span-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTableDetails(table);
                      }}
                    >
                      ⚙️ Gestionar Mesa
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Mesa {selectedTable?.number} - Detalles
            </DialogTitle>
            <DialogDescription>
              Información completa de la mesa y gestión de estado
            </DialogDescription>
          </DialogHeader>

          {selectedTable && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Estado</span>
                  <Badge className={getStatusColor(selectedTable.status)}>
                    {getStatusText(selectedTable.status)}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span>Capacidad</span>
                  <span>{selectedTable.capacity} personas</span>
                </div>

                {selectedTable.customerCount && (
                  <div className="flex justify-between">
                    <span>Clientes actuales</span>
                    <span>{selectedTable.customerCount}</span>
                  </div>
                )}

                {selectedTable.assignedWaiter && (
                  <div className="flex justify-between">
                    <span>Mesero asignado</span>
                    <span>{selectedTable.assignedWaiter}</span>
                  </div>
                )}

                {selectedTable.occupiedSince && (
                  <div className="flex justify-between">
                    <span>Ocupada desde</span>
                    <span>{formatTime(selectedTable.occupiedSince)}</span>
                  </div>
                )}

                {selectedTable.estimatedTime && (
                  <div className="flex justify-between">
                    <span>Tiempo estimado</span>
                    <span>{selectedTable.estimatedTime} minutos</span>
                  </div>
                )}
              </div>

              {selectedTable.currentOrder && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-medium">Pedido Actual</h4>
                  <div className="space-y-2">
                    {selectedTable.currentOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total</span>
                      <span>${selectedTable.currentOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Badge className={getOrderStatusColor(selectedTable.currentOrder.status)}>
                    Estado: {selectedTable.currentOrder.status === 'delivered' ? 'Servido' : selectedTable.currentOrder.status}
                  </Badge>
                </div>
              )}

              {selectedTable.notes && (
                <div className="space-y-2 border-t pt-4">
                  <h4 className="font-medium">Notas</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTable.notes}
                  </p>
                </div>
              )}

              <div className="space-y-2 border-t pt-4">
                <Label>Cambiar estado</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedTable.status === 'available' ? 'default' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleChangeTableStatus(selectedTable.id, 'available');
                      setIsDialogOpen(false);
                    }}
                  >
                    🟢 Disponible
                  </Button>
                  <Button
                    variant={selectedTable.status === 'occupied' ? 'default' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleChangeTableStatus(selectedTable.id, 'occupied');
                      setIsDialogOpen(false);
                    }}
                  >
                    🔴 Ocupada
                  </Button>
                  <Button
                    variant={selectedTable.status === 'reserved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleChangeTableStatus(selectedTable.id, 'reserved');
                      setIsDialogOpen(false);
                    }}
                  >
                    🟡 Reservada
                  </Button>
                  <Button
                    variant={selectedTable.status === 'cleaning' ? 'default' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleChangeTableStatus(selectedTable.id, 'cleaning');
                      setIsDialogOpen(false);
                    }}
                  >
                    🧹 Limpieza
                  </Button>
                </div>
              </div>

              {/* Botones de gestión de pedidos - disponibles para todas las mesas */}
              <div className="space-y-2 border-t pt-4">
                <Label>Gestión de Pedidos</Label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Botones unificados - siempre disponibles */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedTable.currentOrder) {
                        handleViewOrder(selectedTable.currentOrder);
                        setIsDialogOpen(false);
                      } else {
                        // Crear nuevo pedido - funcionalidad a implementar
                        console.log('Crear nuevo pedido para mesa', selectedTable.id);
                      }
                    }}
                  >
                    {selectedTable.currentOrder ? '📋 Ver Pedido' : '➕ Crear Pedido'}
                  </Button>

                  {selectedTable.currentOrder && selectedTable.currentOrder.status === 'ready' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        handleServeOrder(selectedTable.id);
                        setIsDialogOpen(false);
                      }}
                    >
                      🍽️ Servir
                    </Button>
                  )}

                  {/* Botón para gestión avanzada de pedidos */}
                  {selectedTable.currentOrder && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={selectedTable.currentOrder.status === 'ready' ? '' : 'col-span-2'}
                      onClick={() => {
                        handleViewOrder(selectedTable.currentOrder!);
                        setIsDialogOpen(false);
                      }}
                    >
                      ⚙️ Gestionar Pedido
                    </Button>
                  )}
                </div>
              </div>

              {/* Sección de notas - disponible para todas las mesas */}
              <div className="space-y-2 border-t pt-4">
                <Label>Notas de la Mesa</Label>
                <Textarea
                  placeholder="Agregar notas sobre la mesa..."
                  value={selectedTable.notes || ''}
                  onChange={(e) => {
                    setSelectedTable({ ...selectedTable, notes: e.target.value });
                  }}
                  className="min-h-[60px]"
                />
              </div>

              {/* Acciones rápidas adicionales */}
              <div className="space-y-2 border-t pt-4">
                <Label>Acciones Rápidas</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Limpiar notas
                      setSelectedTable({ ...selectedTable, notes: '' });
                    }}
                  >
                    🗑️ Limpiar Notas
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Resetear mesa completamente
                      handleChangeTableStatus(selectedTable.id, 'available');
                      setIsDialogOpen(false);
                    }}
                  >
                    🔄 Resetear Mesa
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Asignar mesero</Label>
                <Select
                  value={selectedTable.assignedWaiter || ''}
                  onValueChange={(value) => handleAssignWaiter(selectedTable.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mesero" />
                  </SelectTrigger>
                  <SelectContent>
                    {waiters.filter(w => w.isActive).map((waiter) => (
                      <SelectItem key={waiter.id} value={waiter.name}>
                        {waiter.name} ({waiter.tablesAssigned} mesas)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalles del Pedido
            </DialogTitle>
            <DialogDescription>
              Información completa del pedido y opciones de gestión
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Estado del Pedido</span>
                  <Badge className={getOrderStatusColor(selectedOrder.status)}>
                    {selectedOrder.status === 'pending' && 'Pendiente'}
                    {selectedOrder.status === 'preparing' && 'Preparando'}
                    {selectedOrder.status === 'ready' && 'Listo'}
                    {selectedOrder.status === 'delivered' && 'Servido'}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span>Hora del Pedido</span>
                  <span>{formatTime(selectedOrder.timestamp)}</span>
                </div>

                <div className="flex justify-between">
                  <span>ID del Pedido</span>
                  <span className="font-mono text-sm">{selectedOrder.id}</span>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium">Productos del Pedido</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                      <div>
                        <span className="font-medium">{item.quantity}x {item.name}</span>
                      </div>
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.status !== 'delivered' && (
                <div className="space-y-2 border-t pt-4">
                  <h4 className="font-medium">Cambiar Estado del Pedido</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Botones disponibles según el estado actual */}
                    {selectedOrder.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUpdateOrderStatus(selectedOrder.id, 'preparing');
                          }}
                        >
                          🍳 Preparando
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUpdateOrderStatus(selectedOrder.id, 'ready');
                          }}
                        >
                          ✅ Listo
                        </Button>
                      </>
                    )}
                    {selectedOrder.status === 'preparing' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="col-span-2"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpdateOrderStatus(selectedOrder.id, 'ready');
                        }}
                      >
                        ✅ Marcar como Listo
                      </Button>
                    )}
                    {selectedOrder.status === 'ready' && (
                      <Button
                        variant="default"
                        size="sm"
                        className="col-span-2"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpdateOrderStatus(selectedOrder.id, 'delivered');
                          setIsOrderDialogOpen(false);
                        }}
                      >
                        🍽️ Marcar como Servido
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredTables.length === 0 && (
        <div className="text-center py-8">
          <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No se encontraron mesas</p>
        </div>
      )}
    </div>
  );
}

export default TableManagement;