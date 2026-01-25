import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CreditCard, DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp, Calendar } from 'lucide-react';

interface Payment {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: Date;
  reference?: string;
}

export function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'PAY001',
      orderId: '1234',
      customerName: 'Ana López',
      amount: 400.00,
      method: 'card',
      status: 'completed',
      date: new Date('2024-01-15T10:30:00'),
      reference: 'TXN123456',
    },
    {
      id: 'PAY002',
      orderId: '1235',
      customerName: 'Carlos Ruiz',
      amount: 195.00,
      method: 'cash',
      status: 'completed',
      date: new Date('2024-01-15T11:15:00'),
    },
    {
      id: 'PAY003',
      orderId: '1236',
      customerName: 'María González',
      amount: 300.00,
      method: 'transfer',
      status: 'pending',
      date: new Date('2024-01-15T12:00:00'),
      reference: 'TRANSFER789',
    },
    {
      id: 'PAY004',
      orderId: '1237',
      customerName: 'Luis Hernández',
      amount: 150.00,
      method: 'card',
      status: 'failed',
      date: new Date('2024-01-15T12:30:00'),
      reference: 'TXN123457',
    },
  ]);

  // Mock data for charts
  const dailySalesData = [
    { day: 'Lun', efectivo: 1200, tarjeta: 2300, transferencia: 800 },
    { day: 'Mar', efectivo: 1500, tarjeta: 2100, transferencia: 600 },
    { day: 'Mié', efectivo: 1800, tarjeta: 1900, transferencia: 900 },
    { day: 'Jue', efectivo: 2100, tarjeta: 2500, transferencia: 1100 },
    { day: 'Vie', efectivo: 2400, tarjeta: 3200, transferencia: 1400 },
    { day: 'Sáb', efectivo: 2800, tarjeta: 3800, transferencia: 1900 },
    { day: 'Dom', efectivo: 2200, tarjeta: 3100, transferencia: 1500 },
  ];

  const paymentMethodData = [
    { name: 'Tarjeta', value: 45, color: '#8884d8' },
    { name: 'Efectivo', value: 35, color: '#82ca9d' },
    { name: 'Transferencia', value: 20, color: '#ffc658' },
  ];

  const updatePaymentStatus = (paymentId: string, newStatus: Payment['status']) => {
    setPayments(payments.map(payment =>
      payment.id === paymentId ? { ...payment, status: newStatus } : payment
    ));
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'refunded':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Payment['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completado';
      case 'failed':
        return 'Fallido';
      case 'refunded':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  const getMethodIcon = (method: Payment['method']) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'transfer':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getMethodText = (method: Payment['method']) => {
    switch (method) {
      case 'card':
        return 'Tarjeta';
      case 'cash':
        return 'Efectivo';
      case 'transfer':
        return 'Transferencia';
      default:
        return method;
    }
  };

  const totalSales = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Gestión de Pagos
          </CardTitle>
          <CardDescription>
            Administra los pagos y transacciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="transactions">Transacciones</TabsTrigger>
              <TabsTrigger value="reports">Reportes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Ventas del Día</p>
                        <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
                        <p className="text-sm text-green-600">+12.5% vs ayer</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pagos Pendientes</p>
                        <p className="text-2xl font-bold">{pendingPayments}</p>
                        <p className="text-sm text-yellow-600">Requieren atención</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pagos Fallidos</p>
                        <p className="text-2xl font-bold">{failedPayments}</p>
                        <p className="text-sm text-red-600">Revisar</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Transacciones</p>
                        <p className="text-2xl font-bold">{payments.length}</p>
                        <p className="text-sm text-blue-600">Hoy</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Transacciones Recientes</CardTitle>
                  <CardDescription>
                    Últimos pagos procesados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Pago</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.slice(0, 5).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">#{payment.id}</TableCell>
                          <TableCell>{payment.customerName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMethodIcon(payment.method)}
                              {getMethodText(payment.method)}
                            </div>
                          </TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(payment.status)}>
                              {getStatusIcon(payment.status)}
                              <span className="ml-1">{getStatusText(payment.status)}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>{payment.date.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Todas las Transacciones</CardTitle>
                  <CardDescription>
                    Historial completo de pagos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Pago</TableHead>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Referencia</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">#{payment.id}</TableCell>
                          <TableCell>#{payment.orderId}</TableCell>
                          <TableCell>{payment.customerName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMethodIcon(payment.method)}
                              {getMethodText(payment.method)}
                            </div>
                          </TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(payment.status)}>
                              {getStatusIcon(payment.status)}
                              <span className="ml-1">{getStatusText(payment.status)}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>{payment.reference || 'N/A'}</TableCell>
                          <TableCell>{payment.date.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {payment.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updatePaymentStatus(payment.id, 'completed')}
                                  >
                                    Confirmar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updatePaymentStatus(payment.id, 'failed')}
                                  >
                                    Rechazar
                                  </Button>
                                </>
                              )}
                              {payment.status === 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updatePaymentStatus(payment.id, 'refunded')}
                                >
                                  Reembolsar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <div className="space-y-6">
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Sales Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Ventas por Método de Pago
                      </CardTitle>
                      <CardDescription>
                        Distribución semanal de ingresos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailySalesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip formatter={(value, name) => [`$${value}`, name === 'efectivo' ? 'Efectivo' : name === 'tarjeta' ? 'Tarjeta' : 'Transferencia']} />
                          <Bar dataKey="efectivo" stackId="a" fill="#82ca9d" />
                          <Bar dataKey="tarjeta" stackId="a" fill="#8884d8" />
                          <Bar dataKey="transferencia" stackId="a" fill="#ffc658" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Payment Methods Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribución de Métodos de Pago</CardTitle>
                      <CardDescription>
                        Preferencias de pago de los clientes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={paymentMethodData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {paymentMethodData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen Financiero</CardTitle>
                    <CardDescription>
                      Estadísticas de pagos del período actual
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-medium">Ingresos por Método</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Tarjeta:</span>
                            <span className="font-medium">$2,850.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Efectivo:</span>
                            <span className="font-medium">$1,980.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transferencia:</span>
                            <span className="font-medium">$1,170.00</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Estadísticas de Transacciones</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total procesadas:</span>
                            <span className="font-medium">{payments.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Exitosas:</span>
                            <span className="font-medium text-green-600">
                              {payments.filter(p => p.status === 'completed').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fallidas:</span>
                            <span className="font-medium text-red-600">
                              {payments.filter(p => p.status === 'failed').length}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Promedio por Transacción</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Monto promedio:</span>
                            <span className="font-medium">
                              ${(totalSales / payments.filter(p => p.status === 'completed').length || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transacción máxima:</span>
                            <span className="font-medium">
                              ${Math.max(...payments.map(p => p.amount)).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transacción mínima:</span>
                            <span className="font-medium">
                              ${Math.min(...payments.map(p => p.amount)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}