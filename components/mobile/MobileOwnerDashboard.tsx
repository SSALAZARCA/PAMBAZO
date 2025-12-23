import { useState } from 'react';
import type { User } from '../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { InventoryEntryDialog } from '../InventoryEntryDialog';
import { InventoryManagement } from '../InventoryManagement';
import { Separator } from '../ui/separator';
import { MobileHeader } from '../MobileHeader';
import { MobileBottomNav } from '../MobileBottomNav';
import { useSwipeGesture } from '../hooks/useMobile';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Coffee,
  Calendar,
  BarChart3,
  Clock,
  Target,
  Award,
  AlertTriangle,
  Eye,
  Settings,
  Package,
  UserCheck,
  Search,
  Plus,
  ChevronRight,
  Timer,
  Star,
  CreditCard,
  FileText,
  Download,
  FileSpreadsheet,
  Mail
} from 'lucide-react';

interface MobileOwnerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function MobileOwnerDashboard({ user, onLogout }: MobileOwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Helper function for currency formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showOrderMetrics, setShowOrderMetrics] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInventorySheet, setShowInventorySheet] = useState(false);
  const [showPersonalSheet, setShowPersonalSheet] = useState(false);
  const [showTablesSheet, setShowTablesSheet] = useState(false);
  const [showConfigSheet, setShowConfigSheet] = useState(false);
  const [showReportsSheet, setShowReportsSheet] = useState(false);
  const [showFinancesSheet, setShowFinancesSheet] = useState(false);

  // Estados para funcionalidad de botones
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('Español');
  const [taxRate, setTaxRate] = useState(15);
  const [tipOptions, setTipOptions] = useState([10, 15, 20]);
  const [showNotificationConfig, setShowNotificationConfig] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showTaxEditor, setShowTaxEditor] = useState(false);
  const [showTipEditor, setShowTipEditor] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);

  // Estados para gestión de personal
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showScheduleManagement, setShowScheduleManagement] = useState(false);
  const [showPayrollManagement, setShowPayrollManagement] = useState(false);
  const [showPerformanceEvaluation, setShowPerformanceEvaluation] = useState(false);

  // Estados adicionales para funcionalidades faltantes
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showEditInventory, setShowEditInventory] = useState(false);
  const [showTableReservation, setShowTableReservation] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [showEmployeeSchedule, setShowEmployeeSchedule] = useState(false);
  const [showEmployeeReport, setShowEmployeeReport] = useState(false);

  // Estados para datos seleccionados
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [inventorySearch, setInventorySearch] = useState('');

  // Estado para diálogo de entrada de inventario
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

  // Función para abrir diálogo de entrada
  const handleOpenEntryDialog = (item: {
    id: string;
    name: string;
    unit: string;
    currentStock: number;
    costPerUnit?: number;
  }) => {
    setEntryDialog({ isOpen: true, item });
  };

  const handleCloseEntryDialog = () => {
    setEntryDialog({ isOpen: false, item: null });
  };

  // Estados para formularios
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    stock: '',
    unit: '',
    cost: '',
    minStock: ''
  });

  const [tableReservationForm, setTableReservationForm] = useState({
    customerName: '',
    phone: '',
    date: '',
    time: '',
    guests: '',
    notes: ''
  });

  const [employeeEditForm, setEmployeeEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    salary: '',
    startDate: ''
  });

  // Estados para formularios
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    salary: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    employee: '',
    date: '',
    shift: '',
    notes: ''
  });

  const [evaluationForm, setEvaluationForm] = useState({
    employee: '',
    punctuality: '',
    quality: '',
    teamwork: '',
    initiative: '',
    comments: ''
  });

  const [payrollForm, setPayrollForm] = useState({
    employee: '',
    period: '',
    baseSalary: '',
    extraHours: '',
    bonuses: '',
    deductions: '',
    totalPay: ''
  });

  // Handle opening order details
  const handleOpenOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Handle opening order metrics
  const handleOpenOrderMetrics = (order: any) => {
    setSelectedOrder(order);
    setShowOrderMetrics(true);
  };

  // Funciones para manejar botones
  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Aquí se aplicaría el tema oscuro a la aplicación
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const handleConfigureNotifications = () => {
    setShowNotificationConfig(true);
  };

  const handleChangeLanguage = () => {
    setShowLanguageSelector(true);
  };

  const handleEditSchedule = () => {
    setShowScheduleEditor(true);
  };

  const handleEditTax = () => {
    setShowTaxEditor(true);
  };

  const handleEditTips = () => {
    setShowTipEditor(true);
  };

  const handleSelectLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    setShowLanguageSelector(false);
    // Aquí se cambiaría el idioma de la aplicación
  };

  const handleSaveTax = (newTaxRate: number) => {
    setTaxRate(newTaxRate);
    setShowTaxEditor(false);
  };

  const handleSaveTips = (newTipOptions: number[]) => {
    setTipOptions(newTipOptions);
    setShowTipEditor(false);
  };

  // Funciones para herramientas de gestión de personal
  const handleAddEmployee = () => {
    setShowAddEmployee(true);
  };

  const handleManageSchedules = () => {
    setShowScheduleManagement(true);
  };

  const handleProcessPayroll = () => {
    setShowPayrollManagement(true);
  };

  const handleEvaluatePerformance = () => {
    setShowPerformanceEvaluation(true);
  };

  const handleSaveEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.position) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    toast.success(`Empleado ${newEmployee.name} agregado exitosamente`);
    setNewEmployee({ name: '', email: '', phone: '', position: '', salary: '' });
    setShowAddEmployee(false);
  };

  const handleSaveSchedule = () => {
    if (!scheduleForm.employee || !scheduleForm.date || !scheduleForm.shift) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    toast.success('Horario programado exitosamente');
    setScheduleForm({ employee: '', date: '', shift: '', notes: '' });
    setShowScheduleManagement(false);
  };

  const handleSavePayroll = () => {
    if (!payrollForm.employee || !payrollForm.period || !payrollForm.baseSalary) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    toast.success('Nómina procesada exitosamente');
    setPayrollForm({ employee: '', period: '', baseSalary: '', extraHours: '', bonuses: '', deductions: '', totalPay: '' });
    setShowPayrollManagement(false);
  };

  const handleSaveEvaluation = () => {
    if (!evaluationForm.employee || !evaluationForm.punctuality || !evaluationForm.quality) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    toast.success('Evaluación guardada exitosamente');
    setEvaluationForm({ employee: '', punctuality: '', quality: '', teamwork: '', initiative: '', comments: '' });
    setShowPerformanceEvaluation(false);
  };

  // Inventory handlers
  const handleSearchInventory = (term: string) => {
    setInventorySearch(term);
  };

  const handleAddInventoryItem = () => {
    setInventoryForm({ name: '', stock: '', unit: '', cost: '', minStock: '' });
    setShowAddInventory(true);
  };

  const handleEditInventoryItem = (item: any) => {
    setSelectedInventoryItem(item);
    setInventoryForm({
      name: item.name,
      stock: item.stock.toString(),
      unit: item.unit,
      cost: item.cost.toString(),
      minStock: item.minStock?.toString() || ''
    });
    setShowEditInventory(true);
  };

  const handleSaveInventory = () => {
    if (!inventoryForm.name || !inventoryForm.stock || !inventoryForm.unit || !inventoryForm.cost) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    toast.success(`Producto ${inventoryForm.name} ${selectedInventoryItem ? 'actualizado' : 'agregado'} exitosamente`);
    setInventoryForm({ name: '', stock: '', unit: '', cost: '', minStock: '' });
    setSelectedInventoryItem(null);
    setShowAddInventory(false);
    setShowEditInventory(false);
  };

  // Table management handlers
  const handleTableAction = (tableId: number, action: string) => {
    switch (action) {
      case 'occupy':
        toast.success(`Mesa ${tableId} marcada como ocupada`);
        break;
      case 'clean':
        toast.success(`Mesa ${tableId} enviada a limpieza`);
        break;
      case 'reserve':
        setSelectedTable(tableId);
        setTableReservationForm({ customerName: '', phone: '', date: '', time: '', guests: '', notes: '' });
        setShowTableReservation(true);
        break;
      case 'free':
        toast.success(`Mesa ${tableId} liberada`);
        break;
    }
  };

  const handleSaveTableReservation = () => {
    if (!tableReservationForm.customerName || !tableReservationForm.date || !tableReservationForm.time) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    toast.success(`Mesa ${selectedTable} reservada para ${tableReservationForm.customerName}`);
    setTableReservationForm({ customerName: '', phone: '', date: '', time: '', guests: '', notes: '' });
    setSelectedTable(null);
    setShowTableReservation(false);
  };

  // Employee individual handlers
  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setEmployeeEditForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.role,
      salary: employee.salary?.toString() || '',
      startDate: employee.startDate || ''
    });
    setShowEditEmployee(true);
  };

  const handleEmployeeSchedule = (employee: any) => {
    setSelectedEmployee(employee);
    setShowEmployeeSchedule(true);
  };

  const handleEmployeeReport = (employee: any) => {
    setSelectedEmployee(employee);
    setShowEmployeeReport(true);
  };

  const handleSaveEmployeeEdit = () => {
    if (!employeeEditForm.name || !employeeEditForm.email || !employeeEditForm.position) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    toast.success(`Información de ${employeeEditForm.name} actualizada exitosamente`);
    setEmployeeEditForm({ name: '', email: '', phone: '', position: '', salary: '', startDate: '' });
    setSelectedEmployee(null);
    setShowEditEmployee(false);
  };

  const { orders } = useStore();

  // Swipe gestures for tab navigation
  const swipeHandlers = useSwipeGesture(
    () => {
      const tabs = ['overview', 'analytics', 'orders', 'manage'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1] || activeTab);
      }
    },
    () => {
      const tabs = ['overview', 'analytics', 'orders', 'manage'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1] || activeTab);
      }
    }
  );

  // Mock data with different time ranges
  const statsData = {
    today: {
      totalSales: 2840.50,
      ordersCount: 47,
      customers: 38,
      avgOrderValue: 60.43,
      growthPercent: 12.5,
      comparison: 'vs ayer'
    },
    week: {
      totalSales: 18640.25,
      ordersCount: 312,
      customers: 245,
      avgOrderValue: 59.75,
      growthPercent: 8.3,
      comparison: 'vs semana anterior'
    },
    month: {
      totalSales: 78420.80,
      ordersCount: 1285,
      customers: 890,
      avgOrderValue: 61.02,
      growthPercent: 15.7,
      comparison: 'vs mes anterior'
    }
  };

  const currentStats = statsData[timeRange];

  const topProducts = [
    { name: 'Café Americano', sales: 145, revenue: 5075.00, growth: 8.2 },
    { name: 'Pan Dulce Tradicional', sales: 89, revenue: 2225.00, growth: 12.1 },
    { name: 'Croissant', sales: 67, revenue: 2010.00, growth: -2.3 },
    { name: 'Pastel de Chocolate', sales: 23, revenue: 5750.00, growth: 18.5 },
  ];

  const teamPerformance = [
    { name: 'Ana García', role: 'Mesero', orders: 23, rating: 4.8, tips: 340.50 },
    { name: 'Carlos Mendoza', role: 'Barista', orders: 45, rating: 4.9, tips: 890.00 },
    { name: 'María González', role: 'Admin', orders: 0, rating: 4.7, tips: 0 },
  ];

  const alerts = [
    { type: 'stock', message: 'Harina de trigo: Stock bajo (15kg restantes)', priority: 'high' },
    { type: 'equipment', message: 'Horno #2: Mantenimiento programado mañana', priority: 'medium' },
    { type: 'sales', message: 'Meta diaria alcanzada al 85%', priority: 'low' },
    { type: 'staff', message: 'Ana García: Horario extra solicitado', priority: 'medium' },
  ];

  const recentOrders = [
    {
      id: '1001',
      customerName: 'María González',
      total: 145.00,
      status: 'preparing',
      time: '10:30 AM',
      waiter: 'Ana García',
      tableNumber: 'Mesa 5',
      timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
      items: [
        { name: 'Café Americano', quantity: 2, price: 25.00 },
        { name: 'Pan Dulce', quantity: 3, price: 31.67 },
        { name: 'Croissant', quantity: 1, price: 88.33 }
      ]
    },
    {
      id: '1002',
      customerName: 'Carlos López',
      total: 250.00,
      status: 'ready',
      time: '10:25 AM',
      waiter: 'Ana García',
      tableNumber: 'Mesa 3',
      timestamp: new Date(Date.now() - 35 * 60000), // 35 minutes ago
      items: [
        { name: 'Pastel de Chocolate', quantity: 1, price: 150.00 },
        { name: 'Café Latte', quantity: 2, price: 50.00 }
      ]
    },
    {
      id: '1003',
      customerName: 'Ana Rivera',
      total: 105.00,
      status: 'completed',
      time: '10:20 AM',
      waiter: 'Ana García',
      tableNumber: 'Mesa 7',
      timestamp: new Date(Date.now() - 40 * 60000), // 40 minutes ago
      items: [
        { name: 'Sandwich Club', quantity: 1, price: 75.00 },
        { name: 'Jugo Natural', quantity: 1, price: 30.00 }
      ]
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'stock': return <Package className="h-4 w-4" />;
      case 'equipment': return <Settings className="h-4 w-4" />;
      case 'sales': return <TrendingUp className="h-4 w-4" />;
      case 'staff': return <UserCheck className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const renderOverviewContent = () => (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        {(['today', 'week', 'month'] as const).map((range) => (
          <Button
            key={range}
            size="sm"
            variant={timeRange === range ? 'default' : 'ghost'}
            onClick={() => setTimeRange(range)}
            className="flex-1"
          >
            {range === 'today' ? 'Hoy' : range === 'week' ? 'Semana' : 'Mes'}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventas</p>
                <p className="text-lg font-bold">${currentStats.totalSales.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+{currentStats.growthPercent}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos</p>
                <p className="text-lg font-bold">{currentStats.ordersCount}</p>
                <p className="text-xs text-muted-foreground">{currentStats.comparison}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-lg font-bold">{currentStats.customers}</p>
                <p className="text-xs text-muted-foreground">únicos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promedio</p>
                <p className="text-lg font-bold">${currentStats.avgOrderValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">por pedido</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Productos Destacados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topProducts.slice(0, 3).map((product, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.sales} ventas • ${product.revenue.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {product.growth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(product.growth)}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.slice(0, 3).map((alert, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="p-1 rounded">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm">{alert.message}</p>
              </div>
              <Badge className={getPriorityColor(alert.priority)} variant="outline">
                {alert.priority === 'high' ? 'Alto' :
                  alert.priority === 'medium' ? 'Medio' : 'Bajo'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsContent = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Análisis de Negocio</h2>
        <p className="text-sm text-muted-foreground">
          Métricas detalladas y rendimiento
        </p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rendimiento del Equipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamPerformance.map((member, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm">{member.rating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pedidos</p>
                    <p className="font-medium">{member.orders}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Propinas</p>
                    <p className="font-medium">${member.tips.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm">{product.name}</p>
                  <div className="flex items-center gap-1">
                    {product.growth > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(product.growth)}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={(product.sales / Math.max(...topProducts.map(p => p.sales))) * 100}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{product.sales} ventas</span>
                  <span>${product.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Métricas Clave</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">85%</p>
              <p className="text-xs text-muted-foreground">Meta Diaria</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">4.7</p>
              <p className="text-xs text-muted-foreground">Satisfacción</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">23min</p>
              <p className="text-xs text-muted-foreground">Tiempo Promedio</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">12%</p>
              <p className="text-xs text-muted-foreground">Margen Neto</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOrdersContent = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Supervisión de Pedidos</h2>
          <p className="text-sm text-muted-foreground">
            Vista general de todos los pedidos
          </p>
        </div>
        <Sheet open={showAllOrders} onOpenChange={setShowAllOrders}>
          <SheetTrigger asChild>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Ver Todos
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh]">
            <SheetHeader>
              <SheetTitle>Todos los Pedidos</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              {/* Filters */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pedidos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={orderFilter} onValueChange={setOrderFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="preparing">Preparando</SelectItem>
                    <SelectItem value="ready">Listos</SelectItem>
                    <SelectItem value="completed">Completados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orders List */}
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {orders.filter(order => {
                  const matchesSearch = order.id.toString().includes(searchTerm) ||
                    (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
                  return matchesSearch && matchesFilter;
                }).map((order) => (
                  <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">#{order.id}</h4>
                          <p className="text-sm text-muted-foreground">{order.customerName || 'Cliente'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${order.total.toFixed(2)}</p>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'outline'}>
                            {order.status === 'pending' ? 'Pendiente' :
                              order.status === 'preparing' ? 'Preparando' :
                                order.status === 'ready' ? 'Listo' : 'Completado'}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-3">
        {recentOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">#{order.id}</h4>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.time} • Mesero: {order.waiter}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                    <Badge
                      variant={order.status === 'delivered' ? 'default' : 'outline'}
                      className={
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                      }
                    >
                      {order.status === 'preparing' ? 'Preparando' :
                        order.status === 'ready' ? 'Listo' : 'Completado'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1"
                        onClick={() => handleOpenOrderDetails(order)}>
                        <Eye className="h-3 w-3 mr-1" />
                        Detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Detalles del Pedido #{selectedOrder?.id}</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="space-y-4">
                          {/* Customer Info */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Información del Cliente</h4>
                            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                              <p className="text-sm"><strong>Nombre:</strong> {selectedOrder.customerName || 'Cliente'}</p>
                              <p className="text-sm"><strong>Mesa:</strong> {selectedOrder.tableNumber || 'N/A'}</p>
                              <p className="text-sm"><strong>Fecha:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Items del Pedido</h4>
                            <div className="space-y-2">
                              {selectedOrder.items.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                                  <div>
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                                  </div>
                                  <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Status */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Estado del Pedido</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={selectedOrder.status === 'delivered' ? 'default' : 'outline'}>
                                {selectedOrder.status === 'pending' ? 'Pendiente' :
                                  selectedOrder.status === 'preparing' ? 'Preparando' :
                                    selectedOrder.status === 'ready' ? 'Listo' : 'Completado'}
                              </Badge>
                              <Timer className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {Math.floor((Date.now() - new Date(selectedOrder.createdAt).getTime()) / 60000)} min
                              </span>
                            </div>
                          </div>

                          {/* Total */}
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total:</span>
                            <span className="text-lg font-bold">${selectedOrder.total.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showOrderMetrics} onOpenChange={setShowOrderMetrics}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1"
                        onClick={() => handleOpenOrderMetrics(order)}>
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Métricas
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Métricas del Pedido #{selectedOrder?.id}</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="space-y-4">
                          {/* Preparation Time */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Tiempo de Preparación</h4>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Tiempo actual:</span>
                                <span className="font-semibold">
                                  {Math.floor((Date.now() - new Date(selectedOrder.createdAt).getTime()) / 60000)} min
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Promedio esperado:</span>
                                <span className="text-sm text-muted-foreground">15-20 min</span>
                              </div>
                              <Progress
                                value={Math.min((Math.floor((Date.now() - new Date(selectedOrder.createdAt).getTime()) / 60000) / 20) * 100, 100)}
                                className="mt-2"
                              />
                            </div>
                          </div>

                          {/* Profitability */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Rentabilidad</h4>
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Ingresos:</span>
                                <span className="font-semibold text-green-600">{formatCurrency(selectedOrder.total)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Costo estimado:</span>
                                <span className="text-sm text-muted-foreground">{formatCurrency(selectedOrder.total * 0.4)}</span>
                              </div>
                              <div className="flex justify-between items-center font-semibold">
                                <span className="text-sm">Ganancia:</span>
                                <span className="text-green-600">{formatCurrency(selectedOrder.total * 0.6)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Performance Indicators */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Indicadores</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-muted/50 p-2 rounded text-center">
                                <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                                <p className="text-xs text-muted-foreground">Satisfacción</p>
                                <p className="text-sm font-semibold">4.8/5</p>
                              </div>
                              <div className="bg-muted/50 p-2 rounded text-center">
                                <Clock className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                                <p className="text-xs text-muted-foreground">Eficiencia</p>
                                <p className="text-sm font-semibold">95%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderManageContent = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Centro de Gestión</h2>
        <p className="text-sm text-muted-foreground">
          Herramientas administrativas
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowInventorySheet(true)}>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-medium">Inventario</h3>
            <p className="text-xs text-muted-foreground mt-1">Gestionar productos</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowPersonalSheet(true)}>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-medium">Personal</h3>
            <p className="text-xs text-muted-foreground mt-1">Administrar equipo</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTablesSheet(true)}>
          <CardContent className="p-4 text-center">
            <Coffee className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-medium">Mesas</h3>
            <p className="text-xs text-muted-foreground mt-1">Control de mesas</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowConfigSheet(true)}>
          <CardContent className="p-4 text-center">
            <Settings className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium">Configuración</h3>
            <p className="text-xs text-muted-foreground mt-1">Ajustes del sistema</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowReportsSheet(true)}>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <h3 className="font-medium">Reportes</h3>
            <p className="text-xs text-muted-foreground mt-1">Análisis detallado</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowFinancesSheet(true)}>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-medium">Finanzas</h3>
            <p className="text-xs text-muted-foreground mt-1">Control financiero</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Alertas del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-start gap-3 p-2 rounded-lg border">
              <div className="p-1 rounded">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm">{alert.message}</p>
              </div>
              <Badge className={getPriorityColor(alert.priority)}>
                {alert.priority === 'high' ? 'Alto' :
                  alert.priority === 'medium' ? 'Medio' : 'Bajo'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderInventoryContent = () => (
    <div className="space-y-4">
      <InventoryManagement />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverviewContent();
      case 'analytics': return renderAnalyticsContent();
      case 'orders': return renderOrdersContent();
      case 'inventory': return renderInventoryContent();
      case 'manage': return renderManageContent();
      default: return renderOverviewContent();
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Panel Ejecutivo';
      case 'analytics': return 'Análisis de Negocio';
      case 'orders': return 'Supervisión de Pedidos';
      case 'inventory': return 'Gestión de Inventario';
      case 'manage': return 'Centro de Gestión';
      default: return 'Panel Ejecutivo';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader
        user={user}
        onLogout={onLogout}
        title={getTabTitle()}
      />

      <main
        className="flex-1 px-4 py-4 pb-20 overflow-y-auto"
        {...swipeHandlers}
      >
        {renderContent()}
      </main>

      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
      />

      {/* Inventory Management Sheet */}
      <Sheet open={showInventorySheet} onOpenChange={setShowInventorySheet}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Gestión de Inventario
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar productos..."
                className="flex-1"
                value={inventorySearch}
                onChange={(e) => handleSearchInventory(e.target.value)}
              />
              <Button size="sm" onClick={handleAddInventoryItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {[
                { name: 'Harina de Trigo', stock: 15, unit: 'kg', status: 'low', cost: 2.50 },
                { name: 'Azúcar', stock: 25, unit: 'kg', status: 'normal', cost: 1.80 },
                { name: 'Huevos', stock: 120, unit: 'unidades', status: 'normal', cost: 0.25 },
                { name: 'Mantequilla', stock: 8, unit: 'kg', status: 'low', cost: 5.00 },
                { name: 'Café en Grano', stock: 50, unit: 'kg', status: 'normal', cost: 12.00 }
              ].filter(item =>
                inventorySearch === '' ||
                item.name.toLowerCase().includes(inventorySearch.toLowerCase())
              ).map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.stock} {item.unit}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={item.status === 'low' ? 'destructive' : 'default'}>
                            {item.status === 'low' ? 'Stock Bajo' : 'Normal'}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">${item.cost}/{item.unit}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            handleOpenEntryDialog({
                              id: index.toString(),
                              name: item.name,
                              unit: item.unit,
                              currentStock: item.stock,
                              costPerUnit: item.cost
                            });
                          }}
                        >
                          Entrada
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditInventoryItem(item)}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Personal Management Sheet */}
      <Sheet open={showPersonalSheet} onOpenChange={setShowPersonalSheet}>
        <SheetContent side="bottom" className="h-[95vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Gestión Completa de Personal
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-6 max-h-[85vh] overflow-y-auto">

            {/* Resumen del Equipo */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-r from-green-50 to-green-100">
                <CardContent className="p-3 text-center">
                  <Users className="h-6 w-6 mx-auto mb-1 text-green-600" />
                  <p className="text-lg font-bold text-green-700">12</p>
                  <p className="text-xs text-green-600">Empleados Activos</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardContent className="p-3 text-center">
                  <Clock className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <p className="text-lg font-bold text-blue-700">8</p>
                  <p className="text-xs text-blue-600">En Turno Actual</p>
                </CardContent>
              </Card>
            </div>

            {/* Lista Completa de Empleados */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Información Completa del Personal
              </h3>
              {[
                {
                  name: 'Ana García',
                  role: 'Mesero Senior',
                  status: 'active',
                  shift: 'Mañana (8:00-16:00)',
                  rating: 4.8,
                  phone: '555-0123',
                  email: 'ana.garcia@pambazo.com',
                  startDate: '2022-03-15',
                  salary: 2800,
                  tips: 680,
                  tablesServed: 45,
                  hoursWorked: 40,
                  efficiency: 92
                },
                {
                  name: 'Carlos Mendoza',
                  role: 'Barista Especialista',
                  status: 'active',
                  shift: 'Tarde (14:00-22:00)',
                  rating: 4.9,
                  phone: '555-0456',
                  email: 'carlos.mendoza@pambazo.com',
                  startDate: '2021-08-20',
                  salary: 3200,
                  tips: 890,
                  tablesServed: 0,
                  hoursWorked: 42,
                  efficiency: 96
                },
                {
                  name: 'María González',
                  role: 'Administradora',
                  status: 'active',
                  shift: 'Completo (9:00-18:00)',
                  rating: 4.7,
                  phone: '555-0789',
                  email: 'maria.gonzalez@pambazo.com',
                  startDate: '2020-01-10',
                  salary: 4500,
                  tips: 0,
                  tablesServed: 0,
                  hoursWorked: 45,
                  efficiency: 88
                },
                {
                  name: 'Luis Rodríguez',
                  role: 'Chef Principal',
                  status: 'break',
                  shift: 'Mañana (6:00-14:00)',
                  rating: 4.6,
                  phone: '555-0321',
                  email: 'luis.rodriguez@pambazo.com',
                  startDate: '2021-11-05',
                  salary: 3800,
                  tips: 240,
                  tablesServed: 0,
                  hoursWorked: 38,
                  efficiency: 94
                },
                {
                  name: 'Sofia Martínez',
                  role: 'Mesero',
                  status: 'active',
                  shift: 'Tarde (15:00-23:00)',
                  rating: 4.5,
                  phone: '555-0654',
                  email: 'sofia.martinez@pambazo.com',
                  startDate: '2023-02-28',
                  salary: 2600,
                  tips: 520,
                  tablesServed: 38,
                  hoursWorked: 40,
                  efficiency: 85
                }
              ].map((employee, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Información Básica */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">{employee.role}</p>
                          <p className="text-xs text-muted-foreground">{employee.shift}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                            {employee.status === 'active' ? 'En Turno' : 'Descanso'}
                          </Badge>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm font-medium">{employee.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Información de Contacto */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Teléfono:</p>
                          <p className="font-medium">{employee.phone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email:</p>
                          <p className="font-medium">{employee.email}</p>
                        </div>
                      </div>

                      {/* Información Laboral */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Fecha de Ingreso:</p>
                          <p className="font-medium">{new Date(employee.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Antigüedad:</p>
                          <p className="font-medium">{Math.floor((Date.now() - new Date(employee.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} años</p>
                        </div>
                      </div>

                      {/* Información Financiera */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Salario Base:</p>
                          <p className="font-medium text-green-600">${employee.salary}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Propinas (Sem):</p>
                          <p className="font-medium text-blue-600">${employee.tips}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total:</p>
                          <p className="font-medium text-purple-600">${employee.salary + employee.tips}</p>
                        </div>
                      </div>

                      {/* Métricas de Rendimiento */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Mesas Atendidas:</p>
                          <p className="font-medium">{employee.tablesServed}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Horas Trabajadas:</p>
                          <p className="font-medium">{employee.hoursWorked}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Eficiencia:</p>
                          <p className="font-medium text-green-600">{employee.efficiency}%</p>
                        </div>
                      </div>

                      {/* Barra de Eficiencia */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Eficiencia General</span>
                          <span className="font-medium">{employee.efficiency}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${employee.efficiency >= 90 ? 'bg-green-500' :
                                employee.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${employee.efficiency}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1"
                          onClick={() => handleEditEmployee(employee)}>
                          <Settings className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1"
                          onClick={() => handleEmployeeSchedule(employee)}>
                          <Calendar className="h-3 w-3 mr-1" />
                          Horarios
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1"
                          onClick={() => handleEmployeeReport(employee)}>
                          <FileText className="h-3 w-3 mr-1" />
                          Reporte
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Análisis de Rendimiento del Equipo */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Análisis de Rendimiento del Equipo
              </h3>

              <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Top Performers de la Semana</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Carlos Mendoza', metric: 'Eficiencia', value: '96%', icon: '🥇' },
                      { name: 'Luis Rodríguez', metric: 'Calidad', value: '94%', icon: '🥈' },
                      { name: 'Ana García', metric: 'Ventas', value: '$1,240', icon: '🥉' }
                    ].map((performer, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{performer.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{performer.name}</p>
                            <p className="text-xs text-muted-foreground">{performer.metric}</p>
                          </div>
                        </div>
                        <span className="font-bold text-blue-600">{performer.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gestión de Horarios */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Gestión de Horarios y Turnos
              </h3>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Turnos de Hoy</h4>
                  <div className="space-y-2">
                    {[
                      { time: '6:00 - 14:00', employees: ['Luis Rodríguez', 'Ana García'], shift: 'Mañana' },
                      { time: '14:00 - 22:00', employees: ['Carlos Mendoza', 'Sofia Martínez'], shift: 'Tarde' },
                      { time: '9:00 - 18:00', employees: ['María González'], shift: 'Administrativo' }
                    ].map((turn, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{turn.shift}</p>
                          <p className="text-xs text-muted-foreground">{turn.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{turn.employees.join(', ')}</p>
                          <p className="text-xs text-muted-foreground">{turn.employees.length} empleados</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* KPIs del Personal */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                KPIs y Métricas del Personal
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <Timer className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-lg font-bold">3.2 min</p>
                    <p className="text-xs text-muted-foreground">Tiempo Promedio de Atención</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <Star className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                    <p className="text-lg font-bold">4.7</p>
                    <p className="text-xs text-muted-foreground">Satisfacción Promedio</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <p className="text-lg font-bold">89%</p>
                    <p className="text-xs text-muted-foreground">Eficiencia General</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <Award className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                    <p className="text-lg font-bold">{formatCurrency(2330)}</p>
                    <p className="text-xs text-muted-foreground">Propinas Totales</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Herramientas de Gestión */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Herramientas de Gestión
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-auto p-3 flex flex-col gap-1"
                  onClick={handleAddEmployee}
                >
                  <UserCheck className="h-4 w-4" />
                  <span className="text-xs">Agregar Empleado</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-3 flex flex-col gap-1"
                  onClick={handleManageSchedules}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Gestionar Horarios</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-3 flex flex-col gap-1"
                  onClick={handleProcessPayroll}
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs">Procesar Nómina</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-3 flex flex-col gap-1"
                  onClick={handleEvaluatePerformance}
                >
                  <Award className="h-4 w-4" />
                  <span className="text-xs">Evaluaciones</span>
                </Button>
              </div>
            </div>

            {/* Reportes de Personal */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reportes de Personal
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Reporte de Asistencia', icon: Clock },
                  { name: 'Reporte de Productividad', icon: TrendingUp },
                  { name: 'Reporte de Nómina', icon: CreditCard },
                  { name: 'Exportar Excel', icon: FileSpreadsheet }
                ].map((report, index) => {
                  const IconComponent = report.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-3 flex flex-col gap-1"
                      onClick={() => {
                        toast.success(`Descargando ${report.name}...`);
                      }}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-xs text-center">{report.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Proyecciones y Metas */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Proyecciones y Metas del Equipo
              </h3>

              <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Metas del Mes</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Eficiencia del Equipo</span>
                        <span className="font-medium">89% / 90%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Satisfacción del Cliente</span>
                        <span className="font-medium">4.7 / 4.8</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Retención de Personal</span>
                        <span className="font-medium">95% / 95%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="pb-4"></div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Tables Management Sheet */}
      <Sheet open={showTablesSheet} onOpenChange={setShowTablesSheet}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-orange-600" />
              Control de Mesas
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
              {Array.from({ length: 12 }, (_, i) => {
                const tableNumber = i + 1;
                const statuses = ['available', 'occupied', 'reserved', 'cleaning'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                return (
                  <Card key={tableNumber} className={`cursor-pointer hover:shadow-md transition-shadow ${status === 'available' ? 'border-green-200 bg-green-50' :
                      status === 'occupied' ? 'border-red-200 bg-red-50' :
                        status === 'reserved' ? 'border-yellow-200 bg-yellow-50' :
                          'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => {
                      if (status === 'available') {
                        handleTableAction(tableNumber, 'reserve');
                      } else if (status === 'occupied') {
                        handleTableAction(tableNumber, 'free');
                      } else if (status === 'cleaning') {
                        handleTableAction(tableNumber, 'occupy');
                      }
                    }}>
                    <CardContent className="p-3 text-center">
                      <h4 className="font-medium">Mesa {tableNumber}</h4>
                      <Badge variant="outline" className="mt-1">
                        {status === 'available' ? 'Disponible' :
                          status === 'occupied' ? 'Ocupada' :
                            status === 'reserved' ? 'Reservada' : 'Limpieza'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {status === 'available' ? 'Toca para reservar' :
                          status === 'occupied' ? 'Toca para liberar' :
                            status === 'reserved' ? 'Reservada' : 'Toca para ocupar'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Configuration Sheet */}
      <Sheet open={showConfigSheet} onOpenChange={setShowConfigSheet}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Configuración del Sistema
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Configuración General</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Modo Oscuro</span>
                    <Button
                      variant={darkMode ? "default" : "outline"}
                      size="sm"
                      onClick={handleToggleDarkMode}
                    >
                      {darkMode ? 'Activado' : 'Desactivado'}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Notificaciones</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleConfigureNotifications}
                    >
                      Configurar
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Idioma</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleChangeLanguage}
                    >
                      {language}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Configuración del Restaurante</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Horario de Operación</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditSchedule}
                    >
                      Editar
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Impuestos</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditTax}
                    >
                      {taxRate}%
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Propinas Sugeridas</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditTips}
                    >
                      {tipOptions.join('%, ')}%
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>

      {/* Reports Sheet */}
      <Sheet open={showReportsSheet} onOpenChange={setShowReportsSheet}>
        <SheetContent side="bottom" className="h-[95vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-600" />
              Reportes y Análisis Completo
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-6 max-h-[85vh] overflow-y-auto">

            {/* Dashboard de Análisis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Dashboard de Análisis
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium">Ventas Diarias</h4>
                    <p className="text-2xl font-bold text-green-600">$2,840</p>
                    <p className="text-xs text-green-600">+12% vs ayer</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-medium">Clientes Atendidos</h4>
                    <p className="text-2xl font-bold text-blue-600">127</p>
                    <p className="text-xs text-blue-600">+8% vs ayer</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-medium">Tiempo Promedio</h4>
                    <p className="text-2xl font-bold text-purple-600">42min</p>
                    <p className="text-xs text-purple-600">-5min vs ayer</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <h4 className="font-medium">Ticket Promedio</h4>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(22.36)}</p>
                    <p className="text-xs text-orange-600">+3% vs ayer</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Análisis de Ventas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Análisis de Ventas
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Productos Más Vendidos</h4>
                    <div className="space-y-3">
                      {topProducts.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                  index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                              }`}></div>
                            <span className="text-sm">{product.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">{product.sales} ventas</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-green-600 h-1.5 rounded-full"
                                style={{ width: `${(product.sales / 247) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Ventas por Categoría</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Bebidas Calientes</span>
                        <div className="text-right">
                          <span className="text-sm font-medium">$1,420 (50%)</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Panadería</span>
                        <div className="text-right">
                          <span className="text-sm font-medium">$980 (35%)</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Bebidas Frías</span>
                        <div className="text-right">
                          <span className="text-sm font-medium">$440 (15%)</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Análisis de Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Análisis de Personal
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Rendimiento por Empleado</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <div>
                          <span className="text-sm font-medium">Ana García</span>
                          <p className="text-xs text-muted-foreground">Mesera</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-green-600">{formatCurrency(1240)}</span>
                          <p className="text-xs text-green-600">32 mesas | {formatCurrency(680)} propinas</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <div>
                          <span className="text-sm font-medium">Carlos Mendoza</span>
                          <p className="text-xs text-muted-foreground">Mesero</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-blue-600">$980</span>
                          <p className="text-xs text-blue-600">28 mesas | $520 propinas</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                        <div>
                          <span className="text-sm font-medium">María González</span>
                          <p className="text-xs text-muted-foreground">Mesera</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-purple-600">$760</span>
                          <p className="text-xs text-purple-600">22 mesas | $380 propinas</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Análisis Temporal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Análisis Temporal
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Horas Pico</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">12:00 - 14:00</span>
                        <span className="text-sm font-medium text-red-600">Alto</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">19:00 - 21:00</span>
                        <span className="text-sm font-medium text-red-600">Alto</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">15:00 - 17:00</span>
                        <span className="text-sm font-medium text-yellow-600">Medio</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Días Más Rentables</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Sábado</span>
                        <span className="text-sm font-medium">$3,240</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Viernes</span>
                        <span className="text-sm font-medium">$2,980</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Domingo</span>
                        <span className="text-sm font-medium">$2,640</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* KPIs y Métricas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                KPIs y Métricas Clave
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <h4 className="font-medium mb-2">Rotación de Mesas</h4>
                    <p className="text-2xl font-bold text-blue-600">3.2</p>
                    <p className="text-xs text-muted-foreground">veces por día</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <h4 className="font-medium mb-2">Satisfacción</h4>
                    <p className="text-2xl font-bold text-green-600">4.7</p>
                    <p className="text-xs text-muted-foreground">de 5 estrellas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <h4 className="font-medium mb-2">Eficiencia</h4>
                    <p className="text-2xl font-bold text-purple-600">87%</p>
                    <p className="text-xs text-muted-foreground">operativa</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <h4 className="font-medium mb-2">Crecimiento</h4>
                    <p className="text-2xl font-bold text-orange-600">+15%</p>
                    <p className="text-xs text-muted-foreground">vs mes anterior</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Reportes Exportables */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Reportes Exportables
              </h3>
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => toast.success('Reporte diario descargado')}
                    >
                      <Download className="h-4 w-4" />
                      Reporte Diario
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => toast.success('Reporte semanal descargado')}
                    >
                      <Download className="h-4 w-4" />
                      Reporte Semanal
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => toast.success('Reporte mensual descargado')}
                    >
                      <Download className="h-4 w-4" />
                      Reporte Mensual
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => toast.success('Datos exportados a Excel')}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Exportar Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => toast.success('Reporte de inventario descargado')}
                    >
                      <Package className="h-4 w-4" />
                      Inventario
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => toast.success('Reporte financiero descargado')}
                    >
                      <DollarSign className="h-4 w-4" />
                      Financiero
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Análisis Financiero Resumido */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Resumen Financiero
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3 text-green-700">Flujo de Caja Semanal</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Ingresos:</span>
                        <span className="text-sm font-bold text-green-600">+$18,640</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Gastos:</span>
                        <span className="text-sm font-bold text-red-600">-$12,450</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Ganancia Neta:</span>
                          <span className="text-lg font-bold text-green-600">$6,190</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">ROI de Inversiones</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Nuevo equipo de cocina:</span>
                        <span className="text-sm font-medium text-green-600">+23% ROI</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Marketing digital:</span>
                        <span className="text-sm font-medium text-green-600">+18% ROI</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Renovación local:</span>
                        <span className="text-sm font-medium text-blue-600">+12% ROI</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </SheetContent>
      </Sheet>

      {/* Finances Sheet */}
      <Sheet open={showFinancesSheet} onOpenChange={setShowFinancesSheet}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Control Financiero Completo
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Resumen Ejecutivo */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <h4 className="font-medium text-green-600">Ingresos Totales</h4>
                  <p className="text-2xl font-bold">{formatCurrency(18640)}</p>
                  <p className="text-xs text-green-600">+15.3% vs semana anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <h4 className="font-medium text-red-600">Gastos Totales</h4>
                  <p className="text-2xl font-bold">{formatCurrency(12450)}</p>
                  <p className="text-xs text-red-600">+8.2% vs semana anterior</p>
                </CardContent>
              </Card>
            </div>

            {/* Ganancia Neta */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-medium text-green-700">Ganancia Neta</h4>
                <p className="text-3xl font-bold text-green-600">$6,190</p>
                <p className="text-sm text-green-600">Margen: 33.2% | Promedio diario: $884</p>
              </CardContent>
            </Card>

            {/* Desglose de Ingresos */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Desglose de Ingresos
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Bebidas</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">$8,420</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Panadería</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">$6,890</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '37%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Especiales</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">$3,330</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métodos de Pago */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Métodos de Pago
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-xs text-muted-foreground">Tarjeta</p>
                    <p className="text-sm font-bold">$11,280</p>
                    <p className="text-xs text-blue-600">60.5%</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-xs text-muted-foreground">Efectivo</p>
                    <p className="text-sm font-bold">{formatCurrency(5940)}</p>
                    <p className="text-xs text-green-600">31.9%</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="text-xs text-muted-foreground">Digital</p>
                    <p className="text-sm font-bold">{formatCurrency(1420)}</p>
                    <p className="text-xs text-purple-600">7.6%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análisis de Tendencias */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Análisis de Tendencias
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Productos más vendidos:</span>
                    <span className="text-sm font-medium">Café Americano (247 unidades)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Hora pico de ventas:</span>
                    <span className="text-sm font-medium">2:00 PM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Día más rentable:</span>
                    <span className="text-sm font-medium">Sábado ($1,240)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Ticket promedio:</span>
                    <span className="text-sm font-medium">$24.80</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Control de Gastos Detallado */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Control de Gastos Detallado
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm">Ingredientes y Materia Prima</span>
                      <p className="text-xs text-muted-foreground">58% del total</p>
                    </div>
                    <span className="text-sm font-medium text-red-600">$7,200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm">Salarios y Nómina</span>
                      <p className="text-xs text-muted-foreground">31% del total</p>
                    </div>
                    <span className="text-sm font-medium text-red-600">{formatCurrency(3800)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm">Servicios (Luz, Agua, Gas)</span>
                      <p className="text-xs text-muted-foreground">8% del total</p>
                    </div>
                    <span className="text-sm font-medium text-red-600">$980</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm">Mantenimiento y Limpieza</span>
                      <p className="text-xs text-muted-foreground">3% del total</p>
                    </div>
                    <span className="text-sm font-medium text-red-600">$470</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Propinas y Empleados */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Propinas y Rendimiento
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total propinas recibidas:</span>
                    <span className="text-sm font-medium text-green-600">$2,790</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Promedio por empleado:</span>
                    <span className="text-sm font-medium">$465</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mejor mesero (propinas):</span>
                    <span className="text-sm font-medium">Ana García ($680)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reportes Rápidos */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Reportes Rápidos
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Reporte Diario
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Reporte Semanal
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Reporte Mensual
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Exportar Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Proyecciones */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2 text-blue-700">
                  <Target className="h-4 w-4" />
                  Proyecciones y Metas
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Meta mensual:</span>
                    <span className="text-sm font-medium text-blue-600">$75,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Progreso actual:</span>
                    <span className="text-sm font-medium text-green-600">$52,340 (69.8%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full" style={{ width: '69.8%' }}></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Proyección: $74,200 (98.9% de la meta)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>

      {/* Notification Configuration Dialog */}
      <Dialog open={showNotificationConfig} onOpenChange={setShowNotificationConfig}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Configurar Notificaciones</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipos de Notificaciones</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nuevos pedidos</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stock bajo</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Metas alcanzadas</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNotificationConfig(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => setShowNotificationConfig(false)} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Selector Dialog */}
      <Dialog open={showLanguageSelector} onOpenChange={setShowLanguageSelector}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Seleccionar Idioma</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {['Español', 'English', 'Français', 'Português'].map((lang) => (
                <Button
                  key={lang}
                  variant={language === lang ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSelectLanguage(lang)}
                >
                  {lang}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tax Editor Dialog */}
      <Dialog open={showTaxEditor} onOpenChange={setShowTaxEditor}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Configurar Impuestos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Porcentaje de Impuestos</label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                placeholder="Ingrese el porcentaje"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTaxEditor(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => handleSaveTax(taxRate)} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tip Editor Dialog */}
      <Dialog open={showTipEditor} onOpenChange={setShowTipEditor}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Configurar Propinas Sugeridas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Opciones de Propina (%)</label>
              <div className="grid grid-cols-3 gap-2">
                {tipOptions.map((tip, index) => (
                  <Input
                    key={index}
                    type="number"
                    value={tip}
                    onChange={(e) => {
                      const newTips = [...tipOptions];
                      newTips[index] = Number(e.target.value);
                      setTipOptions(newTips);
                    }}
                    placeholder="%"
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTipEditor(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => handleSaveTips(tipOptions)} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Editor Dialog */}
      <Dialog open={showScheduleEditor} onOpenChange={setShowScheduleEditor}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Horario de Operación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Días de la Semana</label>
              <div className="space-y-2">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm">{day}</span>
                    <div className="flex gap-2">
                      <Input type="time" defaultValue="08:00" className="w-20" />
                      <span className="text-sm self-center">-</span>
                      <Input type="time" defaultValue="20:00" className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowScheduleEditor(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => setShowScheduleEditor(false)} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value || '' })}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Posición</label>
                <select
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value || '' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Seleccionar</option>
                  <option value="Mesero">Mesero</option>
                  <option value="Cocinero">Cocinero</option>
                  <option value="Cajero">Cajero</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value || '' })}
                  placeholder="Número de teléfono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Salario Base</label>
                <Input
                  type="number"
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value || '' })}
                  placeholder="Salario mensual"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value || '' })}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddEmployee(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveEmployee} className="flex-1">
                Guardar Empleado
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Management Dialog */}
      <Dialog open={showScheduleManagement} onOpenChange={setShowScheduleManagement}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gestionar Horarios del Personal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Empleado</label>
              <select
                value={scheduleForm.employee}
                onChange={(e) => setScheduleForm({ ...scheduleForm, employee: e.target.value || '' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccionar empleado</option>
                <option value="María García">María García</option>
                <option value="Carlos López">Carlos López</option>
                <option value="Ana Martínez">Ana Martínez</option>
                <option value="Luis Rodríguez">Luis Rodríguez</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <Input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value || '' })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Turno</label>
                <select
                  value={scheduleForm.shift}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, shift: e.target.value || '' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Seleccionar turno</option>
                  <option value="Mañana">Mañana (8:00 - 16:00)</option>
                  <option value="Tarde">Tarde (16:00 - 24:00)</option>
                  <option value="Completo">Completo (8:00 - 20:00)</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas</label>
              <textarea
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value || '' })}
                placeholder="Notas adicionales..."
                className="w-full p-2 border rounded-md h-20 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowScheduleManagement(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveSchedule} className="flex-1">
                Programar Horario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Performance Evaluation Dialog */}
      <Dialog open={showPerformanceEvaluation} onOpenChange={setShowPerformanceEvaluation}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Evaluación de Desempeño</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Empleado a Evaluar</label>
              <select
                value={evaluationForm.employee}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, employee: e.target.value || '' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccionar empleado</option>
                <option value="María García">María García</option>
                <option value="Carlos López">Carlos López</option>
                <option value="Ana Martínez">Ana Martínez</option>
                <option value="Luis Rodríguez">Luis Rodríguez</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Puntualidad (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={evaluationForm.punctuality}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, punctuality: e.target.value || '' })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Calidad (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={evaluationForm.quality}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, quality: e.target.value || '' })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Trabajo en Equipo (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={evaluationForm.teamwork}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, teamwork: e.target.value || '' })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Iniciativa (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={evaluationForm.initiative}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, initiative: e.target.value || '' })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Comentarios</label>
              <textarea
                value={evaluationForm.comments}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, comments: e.target.value || '' })}
                placeholder="Comentarios sobre el desempeño..."
                className="w-full p-2 border rounded-md h-24 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPerformanceEvaluation(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveEvaluation} className="flex-1">
                Guardar Evaluación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payroll Management Dialog */}
      <Dialog open={showPayrollManagement} onOpenChange={setShowPayrollManagement}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gestión de Nómina</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Empleado</label>
              <select
                value={payrollForm.employee}
                onChange={(e) => setPayrollForm({ ...payrollForm, employee: e.target.value || '' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccionar empleado</option>
                <option value="María García">María García</option>
                <option value="Carlos López">Carlos López</option>
                <option value="Ana Martínez">Ana Martínez</option>
                <option value="Luis Rodríguez">Luis Rodríguez</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <select
                  value={payrollForm.period}
                  onChange={(e) => setPayrollForm({ ...payrollForm, period: e.target.value || '' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Seleccionar período</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Quincenal">Quincenal</option>
                  <option value="Mensual">Mensual</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Salario Base</label>
                <Input
                  type="number"
                  value={payrollForm.baseSalary}
                  onChange={(e) => setPayrollForm({ ...payrollForm, baseSalary: e.target.value || '' })}
                  placeholder="Salario base"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Horas Extra</label>
                <Input
                  type="number"
                  value={payrollForm.extraHours}
                  onChange={(e) => setPayrollForm({ ...payrollForm, extraHours: e.target.value || '' })}
                  placeholder="Horas trabajadas extra"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bonificaciones</label>
                <Input
                  type="number"
                  value={payrollForm.bonuses}
                  onChange={(e) => setPayrollForm({ ...payrollForm, bonuses: e.target.value || '' })}
                  placeholder="Bonificaciones"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deducciones</label>
                <Input
                  type="number"
                  value={payrollForm.deductions}
                  onChange={(e) => setPayrollForm({ ...payrollForm, deductions: e.target.value || '' })}
                  placeholder="Deducciones"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Total a Pagar</label>
                <Input
                  type="number"
                  value={payrollForm.totalPay}
                  onChange={(e) => setPayrollForm({ ...payrollForm, totalPay: e.target.value || '' })}
                  placeholder="Total calculado"
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPayrollManagement(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSavePayroll} className="flex-1">
                Procesar Nómina
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Inventory Dialog */}
      <Dialog open={showAddInventory} onOpenChange={setShowAddInventory}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar Producto al Inventario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Producto</label>
              <Input
                value={inventoryForm.name}
                onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                placeholder="Nombre del producto"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Actual</label>
                <Input
                  type="number"
                  value={inventoryForm.stock}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, stock: e.target.value })}
                  placeholder="Cantidad"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unidad</label>
                <select
                  value={inventoryForm.unit}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Seleccionar unidad</option>
                  <option value="kg">Kilogramos</option>
                  <option value="unidades">Unidades</option>
                  <option value="litros">Litros</option>
                  <option value="gramos">Gramos</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Costo por Unidad</label>
                <Input
                  type="number"
                  step="0.01"
                  value={inventoryForm.cost}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, cost: e.target.value })}
                  placeholder="Costo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Mínimo</label>
                <Input
                  type="number"
                  value={inventoryForm.minStock}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, minStock: e.target.value })}
                  placeholder="Stock mínimo"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddInventory(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveInventory} className="flex-1">
                Agregar Producto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Inventory Dialog */}
      <Dialog open={showEditInventory} onOpenChange={setShowEditInventory}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Producto del Inventario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Producto</label>
              <Input
                value={inventoryForm.name}
                onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                placeholder="Nombre del producto"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Actual</label>
                <Input
                  type="number"
                  value={inventoryForm.stock}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, stock: e.target.value })}
                  placeholder="Cantidad"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unidad</label>
                <select
                  value={inventoryForm.unit}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="kg">Kilogramos</option>
                  <option value="unidades">Unidades</option>
                  <option value="litros">Litros</option>
                  <option value="gramos">Gramos</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Costo por Unidad</label>
                <Input
                  type="number"
                  step="0.01"
                  value={inventoryForm.cost}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, cost: e.target.value })}
                  placeholder="Costo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Mínimo</label>
                <Input
                  type="number"
                  value={inventoryForm.minStock}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, minStock: e.target.value })}
                  placeholder="Stock mínimo"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditInventory(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveInventory} className="flex-1">
                Actualizar Producto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table Reservation Dialog */}
      <Dialog open={showTableReservation} onOpenChange={setShowTableReservation}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reservar Mesa {selectedTable}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Cliente</label>
              <Input
                value={tableReservationForm.customerName}
                onChange={(e) => setTableReservationForm({ ...tableReservationForm, customerName: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  value={tableReservationForm.phone}
                  onChange={(e) => setTableReservationForm({ ...tableReservationForm, phone: e.target.value })}
                  placeholder="Número de teléfono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Personas</label>
                <Input
                  type="number"
                  value={tableReservationForm.guests}
                  onChange={(e) => setTableReservationForm({ ...tableReservationForm, guests: e.target.value })}
                  placeholder="Personas"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <Input
                  type="date"
                  value={tableReservationForm.date}
                  onChange={(e) => setTableReservationForm({ ...tableReservationForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora</label>
                <Input
                  type="time"
                  value={tableReservationForm.time}
                  onChange={(e) => setTableReservationForm({ ...tableReservationForm, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas Especiales</label>
              <textarea
                value={tableReservationForm.notes}
                onChange={(e) => setTableReservationForm({ ...tableReservationForm, notes: e.target.value })}
                placeholder="Solicitudes especiales, alergias, etc."
                className="w-full p-2 border rounded-md h-20 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTableReservation(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveTableReservation} className="flex-1">
                Confirmar Reserva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={showEditEmployee} onOpenChange={setShowEditEmployee}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Información del Empleado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre Completo</label>
              <Input
                value={employeeEditForm.name}
                onChange={(e) => setEmployeeEditForm({ ...employeeEditForm, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={employeeEditForm.email}
                  onChange={(e) => setEmployeeEditForm({ ...employeeEditForm, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  value={employeeEditForm.phone}
                  onChange={(e) => setEmployeeEditForm({ ...employeeEditForm, phone: e.target.value })}
                  placeholder="Número de teléfono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Posición</label>
                <select
                  value={employeeEditForm.position}
                  onChange={(e) => setEmployeeEditForm({ ...employeeEditForm, position: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Seleccionar posición</option>
                  <option value="Mesero">Mesero</option>
                  <option value="Barista">Barista</option>
                  <option value="Chef">Chef</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Cajero">Cajero</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Salario</label>
                <Input
                  type="number"
                  value={employeeEditForm.salary}
                  onChange={(e) => setEmployeeEditForm({ ...employeeEditForm, salary: e.target.value })}
                  placeholder="Salario mensual"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de Ingreso</label>
              <Input
                type="date"
                value={employeeEditForm.startDate}
                onChange={(e) => setEmployeeEditForm({ ...employeeEditForm, startDate: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditEmployee(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveEmployeeEdit} className="flex-1">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Schedule Dialog */}
      <Dialog open={showEmployeeSchedule} onOpenChange={setShowEmployeeSchedule}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Horarios de {selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Horario Actual</h4>
              <p className="text-sm">{selectedEmployee?.shift || 'No asignado'}</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Modificar Horario</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Turno</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">Seleccionar turno</option>
                    <option value="Mañana (8:00-16:00)">Mañana (8:00-16:00)</option>
                    <option value="Tarde (14:00-22:00)">Tarde (14:00-22:00)</option>
                    <option value="Noche (22:00-6:00)">Noche (22:00-6:00)</option>
                    <option value="Completo (9:00-18:00)">Completo (9:00-18:00)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Días de Trabajo</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">Seleccionar días</option>
                    <option value="Lunes a Viernes">Lunes a Viernes</option>
                    <option value="Lunes a Sábado">Lunes a Sábado</option>
                    <option value="Fines de Semana">Fines de Semana</option>
                    <option value="Personalizado">Personalizado</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEmployeeSchedule(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => {
                toast.success(`Horario de ${selectedEmployee?.name} actualizado`);
                setShowEmployeeSchedule(false);
              }} className="flex-1">
                Actualizar Horario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Report Dialog */}
      <Dialog open={showEmployeeReport} onOpenChange={setShowEmployeeReport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reporte de {selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-3 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-lg font-bold">{selectedEmployee?.hoursWorked || 0}h</p>
                  <p className="text-xs text-muted-foreground">Horas Trabajadas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Star className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                  <p className="text-lg font-bold">{selectedEmployee?.rating || 0}</p>
                  <p className="text-xs text-muted-foreground">Calificación</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-3 text-center">
                  <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <p className="text-lg font-bold">${selectedEmployee?.tips || 0}</p>
                  <p className="text-xs text-muted-foreground">Propinas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-lg font-bold">{selectedEmployee?.efficiency || 0}%</p>
                  <p className="text-xs text-muted-foreground">Eficiencia</p>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Acciones de Reporte</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success(`Reporte individual de ${selectedEmployee?.name} descargado`);
                }}>
                  <Download className="h-4 w-4 mr-1" />
                  Descargar PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success(`Reporte enviado por email a ${selectedEmployee?.email}`);
                }}>
                  <Mail className="h-4 w-4 mr-1" />
                  Enviar Email
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEmployeeReport(false)} className="flex-1">
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inventory Entry Dialog */}
      {entryDialog.isOpen && entryDialog.item && (
        <InventoryEntryDialog
          isOpen={entryDialog.isOpen}
          onClose={handleCloseEntryDialog}
          item={entryDialog.item}
        />
      )}
      {entryDialog.isOpen && !entryDialog.item && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded">
            <p>Error: Diálogo abierto pero sin item</p>
            <button onClick={handleCloseEntryDialog}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileOwnerDashboard;