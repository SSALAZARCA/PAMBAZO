import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Truck, MapPin, Clock, Eye, User, Package } from 'lucide-react';

interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed';
  assignedDriver?: string | undefined;
  driverPhone?: string | undefined;
  estimatedTime: string;
  actualDeliveryTime?: string | undefined;
  notes?: string | undefined;
  total: number;
}

export function DeliveryManagement() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: 'D001',
      orderId: '1234',
      customerName: 'Ana López',
      customerPhone: '+1 234 567 8901',
      address: 'Calle Principal 456, Col. Centro',
      status: 'assigned',
      assignedDriver: 'Juan Pérez',
      driverPhone: '+1 234 567 8920',
      estimatedTime: '30 min',
      total: 400.00,
      notes: 'Entrega antes de las 3 PM por favor',
    },
    {
      id: 'D002',
      orderId: '1235',
      customerName: 'Carlos Ruiz',
      customerPhone: '+1 234 567 8902',
      address: 'Av. Secundaria 789, Col. Norte',
      status: 'in_transit',
      assignedDriver: 'María García',
      driverPhone: '+1 234 567 8921',
      estimatedTime: '15 min',
      total: 195.00,
    },
    {
      id: 'D003',
      orderId: '1236',
      customerName: 'Luis Hernández',
      customerPhone: '+1 234 567 8903',
      address: 'Calle Tercera 321, Col. Sur',
      status: 'pending',
      estimatedTime: '45 min',
      total: 320.00,
    },
  ]);

  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  // const [isDialogOpen, setIsDialogOpen] = useState(false); // Unused
  const [assignmentData, setAssignmentData] = useState({
    driverName: '',
    driverPhone: '',
    estimatedTime: '',
  });

  const drivers = [
    { name: 'Juan Pérez', phone: '+1 234 567 8920', available: true },
    { name: 'María García', phone: '+1 234 567 8921', available: false },
    { name: 'Carlos López', phone: '+1 234 567 8922', available: true },
    { name: 'Ana Martínez', phone: '+1 234 567 8923', available: true },
  ];

  const updateDeliveryStatus = (deliveryId: string, newStatus: Delivery['status']) => {
    setDeliveries(deliveries.map(delivery =>
      delivery.id === deliveryId
        ? {
          ...delivery,
          status: newStatus,
          actualDeliveryTime: newStatus === 'delivered' ? new Date().toLocaleTimeString() : delivery.actualDeliveryTime
        }
        : delivery
    ));
  };

  const assignDriver = (deliveryId: string) => {
    setDeliveries(deliveries.map(delivery =>
      delivery.id === deliveryId
        ? {
          ...delivery,
          status: 'assigned' as const,
          assignedDriver: assignmentData.driverName,
          driverPhone: assignmentData.driverPhone,
          estimatedTime: assignmentData.estimatedTime || delivery.estimatedTime,
        }
        : delivery
    ));
    setAssignmentData({ driverName: '', driverPhone: '', estimatedTime: '' });
  };

  const getStatusIcon = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'assigned':
        return <User className="h-4 w-4" />;
      case 'in_transit':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <Package className="h-4 w-4" />;
      case 'failed':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'assigned':
        return 'Asignado';
      case 'in_transit':
        return 'En Camino';
      case 'delivered':
        return 'Entregado';
      case 'failed':
        return 'Fallido';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Gestión de Envíos
          </CardTitle>
          <CardDescription>
            Administra las entregas a domicilio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Pendientes', value: deliveries.filter(d => d.status === 'pending').length, color: 'text-yellow-600' },
              { label: 'Asignados', value: deliveries.filter(d => d.status === 'assigned').length, color: 'text-blue-600' },
              { label: 'En Camino', value: deliveries.filter(d => d.status === 'in_transit').length, color: 'text-purple-600' },
              { label: 'Entregados Hoy', value: deliveries.filter(d => d.status === 'delivered').length, color: 'text-green-600' },
            ].map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-sm ${stat.color}`}>{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Deliveries Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Envío</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Repartidor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tiempo Est.</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">#{delivery.id}</p>
                      <p className="text-sm text-muted-foreground">Pedido #{delivery.orderId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{delivery.customerName}</p>
                      <p className="text-sm text-muted-foreground">{delivery.customerPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm truncate">{delivery.address}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {delivery.assignedDriver ? (
                      <div>
                        <p className="font-medium">{delivery.assignedDriver}</p>
                        <p className="text-sm text-muted-foreground">{delivery.driverPhone}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No asignado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(delivery.status)}>
                      {getStatusIcon(delivery.status)}
                      <span className="ml-1">{getStatusText(delivery.status)}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{delivery.estimatedTime}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDelivery(delivery)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Detalles del Envío #{delivery.id}</DialogTitle>
                            <DialogDescription>
                              Información completa del envío y gestión de estado
                            </DialogDescription>
                          </DialogHeader>
                          {selectedDelivery && selectedDelivery.id === delivery.id && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Información del Cliente</h4>
                                <div className="space-y-1 text-sm">
                                  <p><strong>Nombre:</strong> {selectedDelivery.customerName}</p>
                                  <p><strong>Teléfono:</strong> {selectedDelivery.customerPhone}</p>
                                  <p><strong>Dirección:</strong> {selectedDelivery.address}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Información del Pedido</h4>
                                <div className="space-y-1 text-sm">
                                  <p><strong>Pedido:</strong> #{selectedDelivery.orderId}</p>
                                  <p><strong>Total:</strong> ${selectedDelivery.total.toFixed(2)}</p>
                                  {selectedDelivery.notes && (
                                    <p><strong>Notas:</strong> {selectedDelivery.notes}</p>
                                  )}
                                </div>
                              </div>

                              {selectedDelivery.assignedDriver && (
                                <div>
                                  <h4 className="font-medium mb-2">Repartidor Asignado</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Nombre:</strong> {selectedDelivery.assignedDriver}</p>
                                    <p><strong>Teléfono:</strong> {selectedDelivery.driverPhone}</p>
                                  </div>
                                </div>
                              )}

                              <div>
                                <h4 className="font-medium mb-2">Cambiar Estado</h4>
                                <div className="flex gap-2 flex-wrap">
                                  {['assigned', 'in_transit', 'delivered', 'failed'].map((status) => (
                                    <Button
                                      key={status}
                                      variant={selectedDelivery.status === status ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => updateDeliveryStatus(selectedDelivery.id, status as Delivery['status'])}
                                    >
                                      {getStatusText(status as Delivery['status'])}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {delivery.status === 'pending' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              Asignar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Asignar Repartidor</DialogTitle>
                              <DialogDescription>
                                Selecciona un repartidor para este envío
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Repartidor Disponible</Label>
                                <Select
                                  value={assignmentData.driverName}
                                  onValueChange={(value) => {
                                    const driver = drivers.find(d => d.name === value);
                                    setAssignmentData({
                                      ...assignmentData,
                                      driverName: value,
                                      driverPhone: driver?.phone || '',
                                    });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un repartidor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {drivers.filter(d => d.available).map((driver) => (
                                      <SelectItem key={driver.name} value={driver.name}>
                                        {driver.name} - {driver.phone}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Tiempo Estimado (opcional)</Label>
                                <Input
                                  value={assignmentData.estimatedTime}
                                  onChange={(e) => setAssignmentData({ ...assignmentData, estimatedTime: e.target.value })}
                                  placeholder="Ej: 30 min"
                                />
                              </div>

                              <Button
                                onClick={() => assignDriver(delivery.id)}
                                className="w-full"
                                disabled={!assignmentData.driverName}
                              >
                                Asignar Repartidor
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Available Drivers */}
      <Card>
        <CardHeader>
          <CardTitle>Repartidores Disponibles</CardTitle>
          <CardDescription>
            Estado actual de los repartidores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {drivers.map((driver) => (
              <Card key={driver.name} className={driver.available ? 'border-green-200' : 'border-red-200'}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">{driver.phone}</p>
                    </div>
                    <Badge variant={driver.available ? 'default' : 'secondary'}>
                      {driver.available ? 'Disponible' : 'Ocupado'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}