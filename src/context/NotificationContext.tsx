import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { wsClient } from '../utils/websocket';
import { authService } from '../services/authService';

export interface Notification {
    id: string;
    type: 'order_ready' | 'table_request' | 'urgent_order' | 'tip_received' | 'shift_reminder' | 'system' | 'reservation' | 'table' | 'order';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
    tableNumber?: number | undefined;
    orderId?: string | undefined;
    amount?: number | undefined;
    data?: any;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    dismissNotification: (id: string) => void;
    generateOrderReadyNotification: (orderId: string, tableNumber?: number) => void;
    generateUrgentOrderNotification: (orderId: string, minutes: number, tableNumber?: number) => void;
    generateTipNotification: (amount: number, tableNumber?: number) => void;
    generateTableRequestNotification: (tableNumber: number, request: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // WebSocket Integration
    useEffect(() => {
        const user = authService.getUser();
        if (!user) return;

        // Connect WebSocket if not connected
        const token = authService.getAccessToken();
        if (token) {
            wsClient.connect(token);

            // Listeners based on Role
            if (user.role === 'waiter') {
                wsClient.onOrderReady((order) => {
                    addNotification({
                        type: 'order_ready',
                        title: '🍽️ Orden Lista',
                        message: `Orden #${order.id} está lista para servir`,
                        priority: 'high',
                        orderId: order.id,
                        data: order
                    });
                });

                wsClient.onTipReceived((tip) => {
                    addNotification({
                        type: 'tip_received',
                        title: '💰 Nueva Propina',
                        message: `Recibiste $${tip.amount} de propina`,
                        priority: 'medium',
                        amount: tip.amount,
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
                        priority: 'high',
                        tableNumber: order.table_number,
                        orderId: order.id,
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
                        priority: 'medium',
                        data: reservation
                    });
                });

                wsClient.onTableStatusChanged((data) => {
                    addNotification({
                        type: 'table',
                        title: '🪑 Estado de Mesa',
                        message: `Mesa ${data.table_number} ahora está ${data.status}`,
                        priority: 'low',
                        tableNumber: data.table_number,
                        data: data
                    });
                });
            }
        }

        return () => {
            // Cleanup listeners if possible via wsClient.off
            // wsClient.off('order:created'); 
            // Note: wsClient typing might not expose off, or we need to be careful.
            // Assuming implicit cleanup or persistent connection for now.
        };
    }, []);


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
            playNotificationSound();
        } else if (notification.priority === 'medium') {
            toast.warning(notification.title, {
                description: notification.message
            });
            playNotificationSound();
        }
    };

    const playNotificationSound = () => {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => { });
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

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            markAsRead,
            markAllAsRead,
            dismissNotification,
            generateOrderReadyNotification,
            generateUrgentOrderNotification,
            generateTipNotification,
            generateTableRequestNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
