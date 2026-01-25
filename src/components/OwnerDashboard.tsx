import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent } from './ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MobileProductManagement } from './MobileProductManagement';
import { MobileOrderManagement } from './MobileOrderManagement';
import { DeliveryManagement } from './DeliveryManagement';
import { PaymentManagement } from './PaymentManagement';
import { StatsOverview } from './StatsOverview';
import { InventoryManagement } from './InventoryManagement';
import { TableManagement } from './TableManagement';
import { InventoryEntryDialog } from './InventoryEntryDialog';
import { Cake, LogOut, Settings, Menu, Package, Boxes, AlertTriangle, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { User } from '../shared/types';

interface OwnerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function OwnerDashboard({ user, onLogout }: OwnerDashboardProps) {
  const { createUser, getAllUsers } = useStore();
  const [activeTab, setActiveTab] = useState('tables');
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'waiter' as User['role'],
    phone: '',
    password: ''
  });

  // Debug log para verificar cambios de pestaña
  console.log('🔥🔥🔥 OwnerDashboard - Pestaña activa:', activeTab);
  const [entryDialog, setEntryDialog] = useState<{
    isOpen: boolean;
    item: {
      id: string;
      name: string;
      unit: string;
      currentStock: number;
      costPerUnit?: number;
    } | null;
  }>({ isOpen: false, item: null });



  const handleCloseEntryDialog = () => {
    setEntryDialog({ isOpen: false, item: null });
  };

  // Funciones para gestión de usuarios
  const handleCreateUser = async () => {
    try {
      if (!newUserData.name || !newUserData.email || !newUserData.password) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }

      if (newUserData.password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      await createUser(newUserData);
      setCreateUserDialog(false);
      setNewUserData({
        name: '',
        email: '',
        role: 'waiter',
        phone: '',
        password: ''
      });
      alert('Usuario creado exitosamente');

      // Refresh the users list to show the new user
      getAllUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al crear usuario';
      alert(errorMessage);
    }
  };

  const handleCloseCreateUserDialog = () => {
    setCreateUserDialog(false);
    setNewUserData({
      name: '',
      email: '',
      role: 'waiter',
      phone: '',
      password: ''
    });
  };

  // Mock data for owner stats
  const ownerStats = [
    {
      title: 'Total Materias Primas',
      value: '45',
      change: '+2 nuevas',
      color: 'text-blue-600',
      icon: Package,
    },
    {
      title: 'Stock Bajo',
      value: '8',
      change: 'Requiere atención',
      color: 'text-red-600',
      icon: AlertTriangle,
    },
    {
      title: 'Productos Fabricados',
      value: '156',
      change: '+12 hoy',
      color: 'text-green-600',
      icon: Boxes,
    },
    {
      title: 'Eficiencia',
      value: '94%',
      change: '+3% vs mes anterior',
      color: 'text-purple-600',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cake className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-lg font-semibold">PAMBAZO</h1>
              <p className="text-xs text-muted-foreground">Propietario</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="space-y-4 pt-6">
                  <div className="px-3">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">Propietario</p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('overview')}
                    >
                      📊 Resumen
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('products')}
                    >
                      📦 Productos
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('inventory')}
                    >
                      🏭 Inventario
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('tables')}
                    >
                      🍽️ Mesas
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('orders')}
                    >
                      🛍️ Pedidos
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('production')}
                    >
                      🔄 Producción
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('deliveries')}
                    >
                      🚚 Envíos
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('payments')}
                    >
                      💳 Pagos
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('users')}
                    >
                      👥 Gestión de Usuarios
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('settings')}
                    >
                      ⚙️ Configuración
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    <Button variant="outline" className="w-full" onClick={onLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Mobile Navigation */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { id: 'overview', label: '📊', title: 'Resumen' },
              { id: 'products', label: '📦', title: 'Productos' },
              { id: 'inventory', label: '🏭', title: 'Inventario' },
              { id: 'tables', label: '🍽️', title: 'Mesas' },
              { id: 'orders', label: '🛍️', title: 'Pedidos' },
              { id: 'users', label: '👥', title: 'Usuarios' },
            ].slice(0, 6).map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col p-3 h-auto"
              >
                <span className="text-lg mb-1">{tab.label}</span>
                <span className="text-xs">{tab.title}</span>
              </Button>
            ))}
          </div>

          <TabsContent value="overview">
            <div className="space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                {ownerStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Icon className={`h-6 w-6 ${stat.color}`} />
                            <span className={`text-xs ${stat.color}`}>
                              {stat.change}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{stat.title}</p>
                            <p className="text-xl font-bold">{stat.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" onClick={() => setActiveTab('inventory')}>
                    <Package className="h-4 w-4 mr-2" />
                    Gestionar Inventario
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('tables')}>
                    <Boxes className="h-4 w-4 mr-2" />
                    Administrar Mesas
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('production')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Ver Producción
                  </Button>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Alertas Importantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-red-800">Harina de Trigo</p>
                        <p className="text-sm text-red-600">Stock crítico: 5 kg restantes</p>
                      </div>
                      <Button size="sm" variant="destructive">
                        Ordenar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-800">Mesa 5</p>
                        <p className="text-sm text-yellow-600">Requiere atención urgente</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Ver
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-orange-800">Producción</p>
                        <p className="text-sm text-orange-600">75% del objetivo diario</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Revisar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <StatsOverview />
            </div>
          </TabsContent>

          <TabsContent value="products">
            <MobileProductManagement />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManagement />
          </TabsContent>



          <TabsContent value="tables">
            <TableManagement />
          </TabsContent>

          <TabsContent value="orders">
            <MobileOrderManagement role="owner" />
          </TabsContent>

          <TabsContent value="production">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Control de Producción</h2>
                <p className="text-sm text-muted-foreground">
                  Seguimiento de la producción diaria
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Producción de Hoy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { product: 'Pan Dulce', produced: 150, target: 200, percentage: 75 },
                    { product: 'Pan de Caja', produced: 80, target: 100, percentage: 80 },
                    { product: 'Galletas', produced: 120, target: 150, percentage: 80 },
                    { product: 'Pasteles', produced: 25, target: 30, percentage: 83 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.product}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.produced}/{item.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.percentage}% completado
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reportes y Análisis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Consumo materias primas hoy</span>
                      <span className="font-medium">$2,450.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eficiencia de producción</span>
                      <span className="font-medium text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiempo promedio</span>
                      <span className="font-medium">2.5 hrs</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Mejora vs ayer</span>
                      <span className="font-medium">+8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deliveries">
            <DeliveryManagement />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Gestión de Usuarios</h2>
                  <p className="text-sm text-muted-foreground">
                    Solo el propietario puede crear y gestionar usuarios
                  </p>
                </div>
                <Button onClick={() => setCreateUserDialog(true)}>
                  👤 Crear Usuario
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Usuarios del Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getAllUsers().length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay usuarios registrados</p>
                      <p className="text-sm">Crea el primer usuario del sistema</p>
                    </div>
                  ) : (
                    getAllUsers().map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.role === 'waiter' ? 'Mesero' :
                              user.role === 'baker' ? 'Panadero' :
                                user.role === 'admin' ? 'Administrador' :
                                  user.role === 'cocina' ? 'Cocina' : user.role}
                          </p>
                          {user.phone && (
                            <p className="text-xs text-muted-foreground">{user.phone}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Activo
                          </span>
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Roles y Permisos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">👤 Propietario</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Acceso completo: gestión de usuarios, inventario, finanzas, configuración
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">🔧 Administrador</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gestión de inventario, pedidos, mesas, reportes (sin crear usuarios)
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">🍽️ Mesero</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gestión de mesas, pedidos, atención al cliente
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">👨‍🍳 Chef</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gestión de cocina, preparación de pedidos, inventario de cocina
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Información de la Panadería
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">PAMBAZO</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-medium">Av. Principal 123, Ciudad</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">+1 234 567 8900</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">info@pambazo.com</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Horarios de Operación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Lunes - Viernes</span>
                    <span className="font-medium">6:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábados</span>
                    <span className="font-medium">6:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingos</span>
                    <span className="font-medium">7:00 AM - 7:00 PM</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Inventory Entry Dialog */}
      {entryDialog.isOpen && entryDialog.item && (
        <InventoryEntryDialog
          isOpen={entryDialog.isOpen}
          onClose={handleCloseEntryDialog}
          item={entryDialog.item}
        />
      )}

      {/* Create User Dialog */}
      <Dialog open={createUserDialog} onOpenChange={setCreateUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa la información para crear un nuevo usuario del sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                className="col-span-3"
                placeholder="Nombre completo"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                className="col-span-3"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol
              </Label>
              <Select
                value={newUserData.role}
                onValueChange={(value: User['role']) => setNewUserData({ ...newUserData, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waiter">Mesero</SelectItem>
                  <SelectItem value="baker">Panadero</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="cocina">Cocina</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Teléfono
              </Label>
              <Input
                id="phone"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                className="col-span-3"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                className="col-span-3"
                placeholder="Contraseña del usuario"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateUserDialog}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default OwnerDashboard;