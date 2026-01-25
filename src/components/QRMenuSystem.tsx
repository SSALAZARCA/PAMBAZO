import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Download,
  Copy,
  ExternalLink,
  MapPin,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useToast } from './NotificationSystem';


interface QRMenu {
  id: string;
  name: string;
  description: string;
  url: string;
  qrCode: string;
  tableNumber?: number;
  location: string;
  isActive: boolean;
  createdAt: Date;
  lastAccessed?: Date;
  accessCount: number;
  customization: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    backgroundImage?: string;
    fontFamily: string;
    showPrices: boolean;
    showImages: boolean;
    showDescriptions: boolean;
    language: string;
  };
  analytics: {
    totalScans: number;
    uniqueVisitors: number;
    averageSessionTime: number;
    popularItems: string[];
    peakHours: { hour: number; scans: number }[];
  };
}

interface QRTemplate {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  preview: string;
}

// QR Templates
const QR_TEMPLATES: QRTemplate[] = [
  {
    id: 'classic',
    name: 'Clásico',
    description: 'Diseño limpio y profesional',
    primaryColor: '#f97316',
    secondaryColor: '#fed7aa',
    fontFamily: 'Inter',
    preview: '/templates/classic.png'
  },
  {
    id: 'modern',
    name: 'Moderno',
    description: 'Estilo contemporáneo con gradientes',
    primaryColor: '#3b82f6',
    secondaryColor: '#dbeafe',
    fontFamily: 'Poppins',
    preview: '/templates/modern.png'
  },
  {
    id: 'elegant',
    name: 'Elegante',
    description: 'Sofisticado para restaurantes premium',
    primaryColor: '#1f2937',
    secondaryColor: '#f3f4f6',
    fontFamily: 'Playfair Display',
    preview: '/templates/elegant.png'
  },
  {
    id: 'vibrant',
    name: 'Vibrante',
    description: 'Colores llamativos para ambientes juveniles',
    primaryColor: '#ec4899',
    secondaryColor: '#fce7f3',
    fontFamily: 'Nunito',
    preview: '/templates/vibrant.png'
  }
];

// Mock QR Menus
const mockQRMenus: QRMenu[] = [
  {
    id: '1',
    name: 'Mesa 1 - Terraza',
    description: 'Menú digital para mesa 1 en la terraza',
    url: 'https://pambazo.com/menu/mesa-1',
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=',
    tableNumber: 1,
    location: 'Terraza',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000),
    lastAccessed: new Date(Date.now() - 3600000),
    accessCount: 45,
    customization: {
      primaryColor: '#f97316',
      secondaryColor: '#fed7aa',
      fontFamily: 'Inter',
      showPrices: true,
      showImages: true,
      showDescriptions: true,
      language: 'es'
    },
    analytics: {
      totalScans: 156,
      uniqueVisitors: 89,
      averageSessionTime: 4.2,
      popularItems: ['Hamburguesa Clásica', 'Papas Fritas', 'Coca Cola'],
      peakHours: [
        { hour: 12, scans: 25 },
        { hour: 13, scans: 32 },
        { hour: 19, scans: 28 },
        { hour: 20, scans: 35 }
      ]
    }
  },
  {
    id: '2',
    name: 'Mesa 5 - Interior',
    description: 'Menú digital para mesa 5 en el interior',
    url: 'https://pambazo.com/menu/mesa-5',
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=',
    tableNumber: 5,
    location: 'Interior',
    isActive: true,
    createdAt: new Date(Date.now() - 172800000),
    lastAccessed: new Date(Date.now() - 7200000),
    accessCount: 32,
    customization: {
      primaryColor: '#3b82f6',
      secondaryColor: '#dbeafe',
      fontFamily: 'Poppins',
      showPrices: true,
      showImages: true,
      showDescriptions: true,
      language: 'es'
    },
    analytics: {
      totalScans: 98,
      uniqueVisitors: 67,
      averageSessionTime: 3.8,
      popularItems: ['Hamburguesa Premium', 'Ensalada César', 'Limonada'],
      peakHours: [
        { hour: 12, scans: 15 },
        { hour: 13, scans: 22 },
        { hour: 19, scans: 18 },
        { hour: 20, scans: 25 }
      ]
    }
  }
];

// QR Code Generator Component
const QRCodeGenerator = ({ size = 200 }: { size?: number }) => {
  // In a real implementation, you would use a QR code library like qrcode.js
  const qrCodeSVG = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#fff"/>
      <rect x="20" y="20" width="20" height="20" fill="#000"/>
      <rect x="60" y="20" width="20" height="20" fill="#000"/>
      <rect x="100" y="20" width="20" height="20" fill="#000"/>
      <rect x="140" y="20" width="20" height="20" fill="#000"/>
      <rect x="160" y="20" width="20" height="20" fill="#000"/>
      <!-- More QR pattern would be generated here -->
      <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dy=".3em" font-size="12" fill="#666">QR Menu</text>
    </svg>
  `;

  const dataUrl = `data:image/svg+xml;base64,${btoa(qrCodeSVG)}`;

  return (
    <div className="flex items-center justify-center p-4 bg-white rounded-lg border">
      <img src={dataUrl} alt="QR Code" className="max-w-full h-auto" />
    </div>
  );
};

// QR Menu Card Component
const QRMenuCard = ({
  menu,
  onEdit,
  onDelete,
  onToggleActive,
  onViewAnalytics
}: {
  menu: QRMenu;
  onEdit: (menu: QRMenu) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onViewAnalytics: (menu: QRMenu) => void;
}) => {
  const notify = useToast();

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(menu.url);
    notify.success('URL copiada', 'La URL del menú ha sido copiada al portapapeles');
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = menu.qrCode;
    link.download = `qr-menu-${menu.tableNumber || menu.id}.png`;
    link.click();
    notify.success('QR descargado', 'El código QR ha sido descargado');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${!menu.isActive ? 'opacity-60' : ''}`}
    >
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {menu.tableNumber && (
                  <Badge variant="outline">Mesa {menu.tableNumber}</Badge>
                )}
                {menu.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {menu.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={menu.isActive ? 'default' : 'secondary'}>
                {menu.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
              <Switch
                checked={menu.isActive}
                onCheckedChange={() => onToggleActive(menu.id)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* QR Code Preview */}
            <div className="space-y-2">
              <Label>Código QR</Label>
              <QRCodeGenerator size={150} />
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={handleDownloadQR}>
                  <Download className="h-3 w-3 mr-1" />
                  Descargar
                </Button>
                <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar URL
                </Button>
              </div>
            </div>

            {/* Menu Info */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Ubicación</Label>
                <p className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3" />
                  {menu.location}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Último acceso</Label>
                <p className="flex items-center gap-1 text-sm">
                  <Clock className="h-3 w-3" />
                  {menu.lastAccessed ? formatDate(menu.lastAccessed) : 'Nunca'}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Total de escaneos</Label>
                <p className="flex items-center gap-1 text-sm font-medium">
                  <BarChart3 className="h-3 w-3" />
                  {menu.analytics.totalScans}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Visitantes únicos</Label>
                <p className="flex items-center gap-1 text-sm font-medium">
                  <Users className="h-3 w-3" />
                  {menu.analytics.uniqueVisitors}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button size="sm" variant="outline" onClick={() => window.open(menu.url, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Menú
            </Button>
            <Button size="sm" variant="outline" onClick={() => onViewAnalytics(menu)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(menu)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(menu.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Menu Creation Form
const MenuCreationForm = ({
  onSubmit,
  onCancel,
  editingMenu
}: {
  onSubmit: (menu: Partial<QRMenu>) => void;
  onCancel: () => void;
  editingMenu?: QRMenu | null;
}) => {
  const [formData, setFormData] = useState({
    name: editingMenu?.name || '',
    description: editingMenu?.description || '',
    tableNumber: editingMenu?.tableNumber?.toString() || '',
    location: editingMenu?.location || '',
    template: 'classic'
  });

  const [selectedTemplate, setSelectedTemplate] = useState<QRTemplate>(QR_TEMPLATES[0]!);
  const notify = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location) {
      notify.warning('Campos requeridos', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const menuData: Partial<QRMenu> = {
      name: formData.name,
      description: formData.description,
      tableNumber: formData.tableNumber ? parseInt(formData.tableNumber) : 0,
      location: formData.location,
      url: `https://pambazo.com/menu/${formData.name.toLowerCase().replace(/\s+/g, '-')}`,
      isActive: true,
      customization: {
        primaryColor: selectedTemplate.primaryColor,
        secondaryColor: selectedTemplate.secondaryColor,
        fontFamily: selectedTemplate.fontFamily,
        showPrices: true,
        showImages: true,
        showDescriptions: true,
        language: 'es'
      }
    };

    onSubmit(menuData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre del Menú *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Mesa 1 - Terraza"
          />
        </div>

        <div>
          <Label htmlFor="tableNumber">Número de Mesa</Label>
          <Input
            id="tableNumber"
            type="number"
            value={formData.tableNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, tableNumber: e.target.value }))}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descripción del menú o ubicación específica"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="location">Ubicación *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Ej: Terraza, Interior, Barra"
        />
      </div>

      {/* Template Selection */}
      <div>
        <Label>Plantilla de Diseño</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {QR_TEMPLATES.map(template => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`cursor-pointer border-2 rounded-lg p-3 transition-colors ${selectedTemplate.id === template.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div
                className="w-full h-16 rounded mb-2"
                style={{
                  background: `linear-gradient(135deg, ${template.primaryColor}, ${template.secondaryColor})`
                }}
              />
              <p className="text-sm font-medium">{template.name}</p>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {editingMenu ? 'Actualizar Menú' : 'Crear Menú'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

// Analytics Modal
const AnalyticsModal = ({ menu, onClose }: { menu: QRMenu; onClose: () => void }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Analytics - {menu.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <QrCode className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{menu.analytics.totalScans}</p>
                <p className="text-sm text-muted-foreground">Total Escaneos</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{menu.analytics.uniqueVisitors}</p>
                <p className="text-sm text-muted-foreground">Visitantes Únicos</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{menu.analytics.averageSessionTime}m</p>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold">
                  {Math.round((menu.analytics.uniqueVisitors / menu.analytics.totalScans) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
              </CardContent>
            </Card>
          </div>

          {/* Popular Items */}
          <Card>
            <CardHeader>
              <CardTitle>Productos Más Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {menu.analytics.popularItems.map((item, index) => (
                  <div key={item} className="flex items-center justify-between">
                    <span className="text-sm">{index + 1}. {item}</span>
                    <Badge variant="outline">{Math.floor(Math.random() * 50) + 10} vistas</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Horas Pico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {menu.analytics.peakHours.map(({ hour, scans }) => {
                  const maxScans = Math.max(...menu.analytics.peakHours.map(h => h.scans));
                  const percentage = (scans / maxScans) * 100;

                  return (
                    <div key={hour} className="flex items-center gap-3">
                      <span className="text-sm w-12">{hour}:00</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: hour * 0.05 }}
                          className="bg-primary h-2 rounded-full"
                        />
                      </div>
                      <span className="text-sm w-8">{scans}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main QR Menu System Component
export const QRMenuSystem = () => {
  const [menus, setMenus] = useState<QRMenu[]>(mockQRMenus);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<QRMenu | null>(null);
  const [analyticsMenu, setAnalyticsMenu] = useState<QRMenu | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const notify = useToast();

  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateMenu = (menuData: Partial<QRMenu>) => {
    const newMenu: QRMenu = {
      id: Date.now().toString(),
      ...menuData,
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=',
      createdAt: new Date(),
      accessCount: 0,
      analytics: {
        totalScans: 0,
        uniqueVisitors: 0,
        averageSessionTime: 0,
        popularItems: [],
        peakHours: []
      }
    } as QRMenu;

    setMenus(prev => [...prev, newMenu]);
    setShowCreateForm(false);
    notify.success('Menú creado', 'El menú QR ha sido creado exitosamente');
  };

  const handleEditMenu = (menuData: Partial<QRMenu>) => {
    if (!editingMenu) return;

    setMenus(prev => prev.map(menu =>
      menu.id === editingMenu.id
        ? { ...menu, ...menuData }
        : menu
    ));

    setEditingMenu(null);
    notify.success('Menú actualizado', 'Los cambios han sido guardados');
  };

  const handleDeleteMenu = (id: string) => {
    setMenus(prev => prev.filter(menu => menu.id !== id));
    notify.success('Menú eliminado', 'El menú ha sido eliminado exitosamente');
  };

  const handleToggleActive = (id: string) => {
    setMenus(prev => prev.map(menu =>
      menu.id === id
        ? { ...menu, isActive: !menu.isActive }
        : menu
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Menús QR</h2>
          <p className="text-muted-foreground">Gestiona los códigos QR para tus menús digitales</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Menú QR
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar menús por nombre o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Menus Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredMenus.map(menu => (
            <QRMenuCard
              key={menu.id}
              menu={menu}
              onEdit={setEditingMenu}
              onDelete={handleDeleteMenu}
              onToggleActive={handleToggleActive}
              onViewAnalytics={setAnalyticsMenu}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredMenus.length === 0 && (
        <div className="text-center py-12">
          <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No hay menús QR</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No se encontraron menús que coincidan con tu búsqueda' : 'Crea tu primer menú QR para comenzar'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Menú
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateForm || !!editingMenu} onOpenChange={(open) => {
        if (!open) {
          setShowCreateForm(false);
          setEditingMenu(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMenu ? 'Editar Menú QR' : 'Crear Nuevo Menú QR'}
            </DialogTitle>
          </DialogHeader>
          <MenuCreationForm
            onSubmit={editingMenu ? handleEditMenu : handleCreateMenu}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingMenu(null);
            }}
            editingMenu={editingMenu ?? null}
          />
        </DialogContent>
      </Dialog>

      {/* Analytics Modal */}
      {analyticsMenu && (
        <AnalyticsModal
          menu={analyticsMenu}
          onClose={() => setAnalyticsMenu(null)}
        />
      )}
    </div>
  );
};

export default QRMenuSystem;