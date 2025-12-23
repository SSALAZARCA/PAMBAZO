import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent } from './ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { InventoryManagement } from './InventoryManagement';
import { TableManagement } from './TableManagement';
import { InventoryEntryDialog } from './InventoryEntryDialog';
import { InventoryHistory } from './InventoryHistory';
import { Cake, LogOut, Package, Boxes, AlertTriangle, TrendingUp, Menu } from 'lucide-react';
import type { User } from '../shared/types';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
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

  // Mock data for admin stats
  const adminStats = [
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
              <p className="text-xs text-muted-foreground">Administrador - Pestaña: {activeTab}</p>

            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón de logout visible */}
            <Button
              variant="destructive"
              size="sm"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Cerrar Sesión
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="space-y-4 pt-6">
                  <div className="px-3">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">Administrador de Bodega</p>
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
                      onClick={() => setActiveTab('inventory')}
                    >
                      📦 Inventario
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
                      onClick={() => setActiveTab('production')}
                    >
                      🔄 Producción
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('reports')}
                    >
                      📈 Reportes
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setActiveTab('history')}
                    >
                      📋 Historial
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={onLogout}
                    >
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
              { id: 'inventory', label: '📦', title: 'Inventario' },
              { id: 'tables', label: '🍽️', title: 'Mesas' },
              { id: 'production', label: '🔄', title: 'Producción' },
              { id: 'reports', label: '📈', title: 'Reportes' },
              { id: 'history', label: '📋', title: 'Historial' },
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
                {adminStats.map((stat, index) => {
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
                        <p className="font-medium text-yellow-800">Levadura</p>
                        <p className="text-sm text-yellow-600">Stock bajo: 12 paquetes</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Revisar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-orange-800">Azúcar</p>
                        <p className="text-sm text-orange-600">Próximo a vencer: 3 días</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Ver
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-800">Mesa 1</p>
                        <p className="text-sm text-blue-600">Pedido listo para servir</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Notificar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="tables">
            <TableManagement />
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
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Reportes y Análisis</h2>
                <p className="text-sm text-muted-foreground">
                  Informes de rendimiento y costos
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Consumo de Materias Primas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Esta semana</span>
                        <span className="font-medium">$2,450.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mes anterior</span>
                        <span className="font-medium">$9,800.00</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Ahorro</span>
                        <span className="font-medium">+15%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Eficiencia de Producción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Productos completados</span>
                        <span className="font-medium">94%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tiempo promedio</span>
                        <span className="font-medium">2.5 hrs</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Mejora</span>
                        <span className="font-medium">+8%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Historial de Entradas</h2>
                <p className="text-sm text-muted-foreground">
                  Registro completo de entradas de inventario y transacciones financieras
                </p>
              </div>
              <InventoryHistory />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Inventory Entry Dialog */}
      {entryDialog.isOpen && (
        <div>
          {entryDialog.item ? (
            <InventoryEntryDialog
              isOpen={entryDialog.isOpen}
              onClose={handleCloseEntryDialog}
              item={entryDialog.item}
            />
          ) : (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded">
                <p>Error: Diálogo abierto pero sin item</p>
                <button onClick={handleCloseEntryDialog}>Cerrar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debug info */}
      {entryDialog.isOpen && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-2 rounded z-[9999]">
          <p>🔥 DIÁLOGO ABIERTO</p>
          <p>Item: {entryDialog.item?.name || 'NULL'}</p>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;