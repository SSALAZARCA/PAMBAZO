import { useState } from 'react';
import type { User } from '../shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import {
  Clock,
  Users,
  ShoppingBag,
  DollarSign,
  CheckCircle,
  AlertCircle,
  LogOut,
  Calendar,
  MapPin,
  Home,
  ClipboardList,
  User as UserIcon,
  Edit,
  Save
} from 'lucide-react';

interface MobileEmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function MobileEmployeeDashboard({ user, onLogout }: MobileEmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: ''
  });

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

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-600">Órdenes</p>
                <p className="text-lg font-bold">{todayStats.ordersServed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Mesas</p>
                <p className="text-lg font-bold">{todayStats.tablesAssigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-600">Horas</p>
                <p className="text-lg font-bold">{todayStats.hoursWorked}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-600">Propinas</p>
                <p className="text-lg font-bold">${todayStats.tips}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Órdenes Recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentOrders.slice(0, 3).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-sm">{order.table}</p>
                  <p className="text-xs text-gray-600">{order.time}</p>
                </div>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-xs`}>
                {order.status === 'preparing' && 'Prep.'}
                {order.status === 'ready' && 'Listo'}
                {order.status === 'delivered' && 'Entregado'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Mis Órdenes</CardTitle>
          <CardDescription className="text-sm">Gestiona las órdenes de tus mesas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentOrders.map((order) => (
            <div key={order.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{order.table}</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status === 'preparing' && 'Preparando'}
                    {order.status === 'ready' && 'Listo'}
                    {order.status === 'delivered' && 'Entregado'}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">{order.time}</span>
              </div>

              <div className="space-y-1">
                {order.items.map((item, index) => (
                  <p key={index} className="text-sm text-gray-600">• {item}</p>
                ))}
              </div>

              {order.status === 'ready' && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    toast.success('Pedido marcado como entregado');
                    // Aquí se actualizaría el estado del pedido
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Entregado
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Mi Horario</CardTitle>
          <CardDescription className="text-sm">Horario de esta semana</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {schedule.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-sm">{day.day}</p>
                  <p className="text-xs text-gray-600">{day.shift}</p>
                </div>
              </div>
              <Badge className={getScheduleStatusColor(day.status)}>
                {day.status === 'confirmed' && 'Confirmado'}
                {day.status === 'pending' && 'Pendiente'}
                {day.status === 'off' && 'Libre'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Mi Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {(user.name || 'Usuario').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500">Empleado</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Teléfono</span>
              <span className="text-sm font-medium">{user.phone || 'No especificado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Posición</span>
              <span className="text-sm font-medium">Mesero</span>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowEditProfile(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setRequestType('schedule');
                setShowRequestDialog(true);
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Solicitar Cambio de Horario
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setRequestType('support');
                setShowRequestDialog(true);
              }}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Solicitar Soporte
            </Button>

            <Button variant="outline" className="w-full" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'orders': return renderOrders();
      case 'schedule': return renderSchedule();
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {(user.name || 'Usuario').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">PAMBAZO</h1>
                <p className="text-xs text-gray-600">Panel de Empleado</p>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'overview' ? 'text-orange-500' : 'text-gray-500'
              }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'orders' ? 'text-orange-500' : 'text-gray-500'
              }`}
          >
            <ClipboardList className="h-5 w-5" />
            <span className="text-xs">Órdenes</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'schedule' ? 'text-orange-500' : 'text-gray-500'
              }`}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Horario</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'profile' ? 'text-orange-500' : 'text-gray-500'
              }`}
          >
            <UserIcon className="h-5 w-5" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Tu nombre completo"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="Tu número de teléfono"
              />
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                placeholder="Tu dirección"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditProfile(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success('Perfil actualizado correctamente');
                  setShowEditProfile(false);
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {requestType === 'schedule' ? 'Solicitar Cambio de Horario' : 'Solicitar Soporte'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={requestType === 'schedule'
                  ? 'Describe el cambio de horario que necesitas...'
                  : 'Describe el problema o solicitud de soporte...'
                }
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRequestDialog(false);
                  setRequestMessage('');
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success('Solicitud enviada correctamente');
                  setShowRequestDialog(false);
                  setRequestMessage('');
                }}
                disabled={!requestMessage.trim()}
              >
                Enviar Solicitud
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}