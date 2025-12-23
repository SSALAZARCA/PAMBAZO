
import { motion } from 'framer-motion';
import { Bell, Volume2, VolumeX, Smartphone, Mail, Clock, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Separator } from './ui/separator';

import { Badge } from './ui/badge';

export const NotificationSettings = () => {
  // Mock settings until store is updated
  const settings = {
    notificationSettings: {
      enablePush: true,
      enableSound: true,
      enableVibration: false,
      enableEmail: false,
      frequency: 'immediate' as const,
      types: {
        orders: true,
        promotions: true,
        inventory: true,
        system: true,
        reminders: true
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    }
  };
  const updateSettings = (_updates: any) => { };
  const { notificationSettings } = settings;

  const updateNotificationSettings = (updates: any) => {
    updateSettings({
      notificationSettings: {
        ...notificationSettings,
        ...updates
      }
    });
  };

  const updateNotificationTypes = (type: string, enabled: boolean) => {
    updateNotificationSettings({
      types: {
        ...notificationSettings.types,
        [type]: enabled
      }
    });
  };

  const updateQuietHours = (updates: any) => {
    updateNotificationSettings({
      quietHours: {
        ...notificationSettings.quietHours,
        ...updates
      }
    });
  };

  const notificationTypeLabels = {
    orders: { label: 'Pedidos', description: 'Nuevos pedidos y cambios de estado', icon: '🍽️' },
    promotions: { label: 'Promociones', description: 'Ofertas especiales y descuentos', icon: '🎉' },
    inventory: { label: 'Inventario', description: 'Stock bajo y alertas de productos', icon: '📦' },
    system: { label: 'Sistema', description: 'Actualizaciones y mantenimiento', icon: '⚙️' },
    reminders: { label: 'Recordatorios', description: 'Tareas pendientes y recordatorios', icon: '⏰' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Configuración de Notificaciones</h2>
          <p className="text-sm text-muted-foreground">
            Personaliza cómo y cuándo recibir notificaciones
          </p>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notificaciones Push</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones en el navegador
              </p>
            </div>
            <Switch
              checked={notificationSettings.enablePush}
              onCheckedChange={(checked) => updateNotificationSettings({ enablePush: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                {notificationSettings.enableSound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Sonidos
              </Label>
              <p className="text-sm text-muted-foreground">
                Reproducir sonidos con las notificaciones
              </p>
            </div>
            <Switch
              checked={notificationSettings.enableSound}
              onCheckedChange={(checked) => updateNotificationSettings({ enableSound: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Vibración
              </Label>
              <p className="text-sm text-muted-foreground">
                Vibrar en dispositivos móviles
              </p>
            </div>
            <Switch
              checked={notificationSettings.enableVibration}
              onCheckedChange={(checked) => updateNotificationSettings({ enableVibration: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Notificaciones por Email
              </Label>
              <p className="text-sm text-muted-foreground">
                Recibir resúmenes por correo electrónico
              </p>
            </div>
            <Switch
              checked={notificationSettings.enableEmail}
              onCheckedChange={(checked) => updateNotificationSettings({ enableEmail: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificaciones</CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecciona qué tipos de notificaciones deseas recibir
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notificationTypeLabels).map(([key, config]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{config.icon}</span>
                <div>
                  <Label className="text-base font-medium">{config.label}</Label>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.types[key as keyof typeof notificationSettings.types]}
                onCheckedChange={(checked) => updateNotificationTypes(key, checked)}
              />
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Frequency Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Frecuencia y Horarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Frecuencia de Notificaciones</Label>
            <Select
              value={notificationSettings.frequency}
              onValueChange={(value: 'immediate' | 'hourly' | 'daily') =>
                updateNotificationSettings({ frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Inmediato</Badge>
                    <span>Recibir notificaciones al instante</span>
                  </div>
                </SelectItem>
                <SelectItem value="hourly">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Cada hora</Badge>
                    <span>Agrupar notificaciones cada hora</span>
                  </div>
                </SelectItem>
                <SelectItem value="daily">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Diario</Badge>
                    <span>Resumen diario de notificaciones</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Horario Silencioso</Label>
                <p className="text-sm text-muted-foreground">
                  No recibir notificaciones durante estas horas
                </p>
              </div>
              <Switch
                checked={notificationSettings.quietHours.enabled}
                onCheckedChange={(checked) => updateQuietHours({ enabled: checked })}
              />
            </div>

            {notificationSettings.quietHours.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20"
              >
                <div className="space-y-2">
                  <Label className="text-sm">Hora de inicio</Label>
                  <Input
                    type="time"
                    value={notificationSettings.quietHours.start}
                    onChange={(e) => updateQuietHours({ start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Hora de fin</Label>
                  <Input
                    type="time"
                    value={notificationSettings.quietHours.end}
                    onChange={(e) => updateQuietHours({ end: e.target.value })}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-primary">Configuración Actual</h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>• {notificationSettings.enablePush ? 'Push activado' : 'Push desactivado'}</p>
                <p>• {notificationSettings.enableSound ? 'Sonidos activados' : 'Sonidos desactivados'}</p>
                <p>• Frecuencia: {notificationSettings.frequency === 'immediate' ? 'Inmediata' : notificationSettings.frequency === 'hourly' ? 'Cada hora' : 'Diaria'}</p>
                <p>• Tipos activos: {Object.values(notificationSettings.types).filter(Boolean).length} de {Object.keys(notificationSettings.types).length}</p>
                {notificationSettings.quietHours.enabled && (
                  <p>• Horario silencioso: {notificationSettings.quietHours.start} - {notificationSettings.quietHours.end}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;