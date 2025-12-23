import React, { useEffect, useState } from 'react';
import { wsClient } from '../utils/websocket';
import { pushNotifications } from '../utils/pushNotifications';
import { authService } from '../services/authService';

interface NotificationItem {
    id: string;
    type: 'order' | 'tip' | 'reservation' | 'table' | 'general';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    data?: any;
}

const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(false);

    useEffect(() => {
        initializeNotifications();
        setupWebSocketListeners();

        return () => {
            cleanupWebSocketListeners();
        };
    }, []);

    const initializeNotifications = async () => {
        // Check if push notifications are enabled
        const subscription = await pushNotifications.getSubscription();
        setPushEnabled(!!subscription);
    };

    const setupWebSocketListeners = () => {
        const user = authService.getUser();
        if (!user) return;

        // Connect WebSocket
        const token = authService.getAccessToken();
        if (token) {
            wsClient.connect(token);

            // Listen to events based on role
            if (user.role === 'waiter') {
                wsClient.onOrderReady((order) => {
                    addNotification({
                        type: 'order',
                        title: '🍽️ Orden Lista',
                        message: `Orden #${order.id} está lista para servir`,
                        data: order
                    });
                });

                wsClient.onTipReceived((tip) => {
                    addNotification({
                        type: 'tip',
                        title: '💰 Nueva Propina',
                        message: `Recibiste $${tip.amount} de propina`,
                        data: tip
                    });
                });
            }

            if (user.role === 'kitchen') {
                wsClient.onOrderCreated((order) => {
                    addNotification({
                        type: 'order',
                        title: '🔔 Nueva Orden',
                        message: `Nueva orden #${order.id} - Mesa ${order.table_number}`,
                        data: order
                    });
                });
            }

            if (user.role === 'admin' || user.role === 'owner') {
                wsClient.onReservationCreated((reservation) => {
                    addNotification({
                        type: 'reservation',
                        title: '📅 Nueva Reserva',
                        message: `Reserva para ${reservation.party_size} personas`,
                        data: reservation
                    });
                });

                wsClient.onTableStatusChanged((data) => {
                    addNotification({
                        type: 'table',
                        title: '🪑 Estado de Mesa',
                        message: `Mesa ${data.table_number} ahora está ${data.status}`,
                        data: data
                    });
                });
            }
        }
    };

    const cleanupWebSocketListeners = () => {
        wsClient.off('order:created');
        wsClient.off('order:ready');
        wsClient.off('tip:received');
        wsClient.off('reservation:created');
        wsClient.off('table:status-changed');
    };

    const addNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: NotificationItem = {
            ...notification,
            id: `notif-${Date.now()}`,
            timestamp: new Date(),
            read: false
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Show browser notification if enabled
        if (pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/icon-192.png',
                badge: '/badge-72.png'
            });
        }

        // Play sound
        playNotificationSound();
    };

    const playNotificationSound = () => {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {
            // Ignore errors if sound can't play
        });
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const enablePushNotifications = async () => {
        const initialized = await pushNotifications.initialize();
        if (initialized) {
            const hasPermission = await pushNotifications.requestPermission();
            if (hasPermission) {
                await pushNotifications.subscribe();
                setPushEnabled(true);
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <button className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-panel">
                    <div className="notification-header">
                        <h3>Notificaciones</h3>
                        <div className="header-actions">
                            {notifications.length > 0 && (
                                <>
                                    <button onClick={markAllAsRead} className="action-btn">
                                        Marcar todas como leídas
                                    </button>
                                    <button onClick={clearAll} className="action-btn">
                                        Limpiar
                                    </button>
                                </>
                            )}
                            <button onClick={() => setIsOpen(false)} className="close-btn">×</button>
                        </div>
                    </div>

                    {!pushEnabled && (
                        <div className="push-prompt">
                            <p>🔔 Habilita las notificaciones push para recibir alertas en tiempo real</p>
                            <button onClick={enablePushNotifications} className="enable-push-btn">
                                Habilitar Notificaciones
                            </button>
                        </div>
                    )}

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📭</span>
                                <p>No hay notificaciones</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="notification-content">
                                        <div className="notification-title">{notification.title}</div>
                                        <div className="notification-message">{notification.message}</div>
                                        <div className="notification-time">
                                            {formatTime(notification.timestamp)}
                                        </div>
                                    </div>
                                    {!notification.read && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style>{`
        .notification-bell {
          position: relative;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .notification-bell:hover {
          background: #f3f4f6;
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .notification-panel {
          position: absolute;
          top: 60px;
          right: 20px;
          width: 400px;
          max-height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .notification-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notification-header h3 {
          margin: 0;
          font-size: 18px;
          color: #1f2937;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .action-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #eff6ff;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #6b7280;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 24px;
          height: 24px;
        }

        .push-prompt {
          padding: 12px;
          background: #eff6ff;
          border-bottom: 1px solid #e5e7eb;
          text-align: center;
        }

        .push-prompt p {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #1f2937;
        }

        .enable-push-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .enable-push-btn:hover {
          background: #2563eb;
        }

        .notification-list {
          flex: 1;
          overflow-y: auto;
          max-height: 500px;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #9ca3af;
        }

        .empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 12px;
        }

        .notification-item {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          display: flex;
          gap: 12px;
        }

        .notification-item:hover {
          background: #f9fafb;
        }

        .notification-item.unread {
          background: #eff6ff;
        }

        .notification-item.unread:hover {
          background: #dbeafe;
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .notification-message {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .notification-time {
          font-size: 11px;
          color: #9ca3af;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 4px;
        }

        @media (max-width: 640px) {
          .notification-panel {
            right: 10px;
            left: 10px;
            width: auto;
          }
        }
      `}</style>
        </>
    );
};

const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString();
};

export default NotificationCenter;
