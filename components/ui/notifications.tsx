import { useState } from 'react';
import { Bell, X, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'order_ready' | 'table_request' | 'urgent_order' | 'tip_received' | 'shift_reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  tableNumber?: number | undefined;
  orderId?: string | undefined;
  amount?: number | undefined;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  className?: string;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  className = ''
}: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order_ready':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'table_request':
        return <Bell className="h-4 w-4 text-blue-600" />;
      case 'urgent_order':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'tip_received':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'shift_reminder':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-orange-200 bg-orange-50';
      case 'low':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Notificaciones</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="text-xs"
                  >
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No hay notificaciones
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''
                    } ${getPriorityColor(notification.priority)}`}
                  onClick={() => {
                    if (!notification.read) {
                      onMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismiss(notification.id);
                            }}
                            className="h-4 w-4 p-0 hover:bg-gray-200"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.tableNumber && (
                        <Badge variant="outline" className="mt-1">
                          Mesa {notification.tableNumber}
                        </Badge>
                      )}
                      {notification.amount && (
                        <Badge variant="outline" className="mt-1 ml-1">
                          ${notification.amount.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook para generar notificaciones automáticas
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Mostrar toast para notificaciones de alta prioridad
    if (notification.priority === 'high') {
      toast.error(notification.title, {
        description: notification.message
      });
    } else if (notification.priority === 'medium') {
      toast.warning(notification.title, {
        description: notification.message
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Generar notificaciones automáticas basadas en eventos
  const generateOrderReadyNotification = (orderId: string, tableNumber?: number) => {
    addNotification({
      type: 'order_ready',
      title: 'Pedido listo',
      message: `El pedido ${orderId.slice(-4)} está listo para entregar`,
      priority: 'high',
      tableNumber,
      orderId
    });
  };

  const generateUrgentOrderNotification = (orderId: string, minutes: number, tableNumber?: number) => {
    addNotification({
      type: 'urgent_order',
      title: 'Pedido urgente',
      message: `El pedido ${orderId.slice(-4)} lleva ${minutes} minutos esperando`,
      priority: 'high',
      tableNumber,
      orderId
    });
  };

  const generateTipNotification = (amount: number, tableNumber?: number) => {
    addNotification({
      type: 'tip_received',
      title: 'Propina recibida',
      message: `Has recibido una propina de $${amount.toFixed(2)}`,
      priority: 'medium',
      tableNumber,
      amount
    });
  };

  const generateTableRequestNotification = (tableNumber: number, request: string) => {
    addNotification({
      type: 'table_request',
      title: `Solicitud Mesa ${tableNumber}`,
      message: request,
      priority: 'medium',
      tableNumber
    });
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    generateOrderReadyNotification,
    generateUrgentOrderNotification,
    generateTipNotification,
    generateTableRequestNotification
  };
}

export default NotificationCenter;