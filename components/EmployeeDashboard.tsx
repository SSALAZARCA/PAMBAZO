import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Clock,
  Users,
  ShoppingBag,
  DollarSign,
  CheckCircle,
  LogOut,
  Calendar,
  MapPin
} from 'lucide-react';

import type { User } from '../shared/types';

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  // const { setUser } = useStore(); // Unused
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for employee dashboard
  const todayStats = {
    ordersServed: 23,
    tablesAssigned: 8,
    hoursWorked: 6.5,
    tips: 45.50
  };

  const currentOrders = [
    { id: 1, table: 'Mesa 5', items: ['Café Americano', 'Croissant'], status: 'preparing', time: '10:30' },
    { id: 2, table: 'Mesa 2', items: ['Cappuccino', 'Tarta de Manzana'], status: 'ready', time: '10:25' },
    { id: 3, table: 'Mesa 7', items: ['Té Verde', 'Sandwich'], status: 'delivered', time: '10:15' }
  ];

  const schedule = [
    { day: 'Lunes', shift: '08:00 - 16:00', status: 'confirmed' },
    { day: 'Martes', shift: '08:00 - 16:00', status: 'confirmed' },
    { day: 'Miércoles', shift: '14:00 - 22:00', status: 'confirmed' },
    { day: 'Jueves', shift: 'Libre', status: 'off' },
    { day: 'Viernes', shift: '08:00 - 16:00', status: 'pending' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'off': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Panel de Empleado</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="orders">Órdenes</TabsTrigger>
            <TabsTrigger value="schedule">Horario</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Órdenes Servidas</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.ordersServed}</div>
                  <p className="text-xs text-muted-foreground">Hoy</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mesas Asignadas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.tablesAssigned}</div>
                  <p className="text-xs text-muted-foreground">Actualmente</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Horas Trabajadas</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.hoursWorked}h</div>
                  <p className="text-xs text-muted-foreground">Hoy</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Propinas</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${todayStats.tips}</div>
                  <p className="text-xs text-muted-foreground">Hoy</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Órdenes Recientes</CardTitle>
                <CardDescription>Últimas órdenes asignadas a ti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{order.table}</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{order.items.join(', ')}</p>
                          <p className="text-xs text-gray-500">{order.time}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status === 'preparing' && 'Preparando'}
                        {order.status === 'ready' && 'Listo'}
                        {order.status === 'delivered' && 'Entregado'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Órdenes</CardTitle>
                <CardDescription>Administra las órdenes de tus mesas asignadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{order.table}</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{order.items.join(', ')}</p>
                          <p className="text-xs text-gray-500">{order.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status === 'preparing' && 'Preparando'}
                          {order.status === 'ready' && 'Listo'}
                          {order.status === 'delivered' && 'Entregado'}
                        </Badge>
                        {order.status === 'ready' && (
                          <Button size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Entregar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mi Horario</CardTitle>
                <CardDescription>Horario de trabajo de esta semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{day.day}</p>
                          <p className="text-sm text-gray-600">{day.shift}</p>
                        </div>
                      </div>
                      <Badge className={getScheduleStatusColor(day.status)}>
                        {day.status === 'confirmed' && 'Confirmado'}
                        {day.status === 'pending' && 'Pendiente'}
                        {day.status === 'off' && 'Libre'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
                <CardDescription>Información personal y configuración</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">Empleado</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Teléfono</label>
                    <p className="text-sm text-gray-600">{user.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Posición</label>
                    <p className="text-sm text-gray-600">Mesero</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}