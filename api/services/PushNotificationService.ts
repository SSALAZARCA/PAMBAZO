import webpush from 'web-push';

// Configure web push
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBr5v-RQZZ7nSLdQJCQI',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'UUxI4O8-FbRouAevSmBQ6O18hgE4nSG3qwvJTfKc-ls'
};

webpush.setVapidDetails(
    'mailto:admin@pambazo.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export class PushNotificationService {
    static async sendNotification(subscription: PushSubscription, payload: any) {
        try {
            await webpush.sendNotification(subscription, JSON.stringify(payload));
            return true;
        } catch (error) {
            console.error('Error sending push notification:', error);
            return false;
        }
    }

    static async sendToUser(userId: string, payload: any) {
        // In a real implementation, you would fetch user's subscriptions from database
        // For now, this is a placeholder
        console.log(`Sending notification to user ${userId}:`, payload);
    }

    static async sendToRole(role: string, payload: any) {
        // Send to all users with specific role
        console.log(`Sending notification to role ${role}:`, payload);
    }

    static createOrderNotification(order: any) {
        return {
            title: 'Nueva Orden',
            body: `Orden #${order.id} - Mesa ${order.table_number}`,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: {
                type: 'new-order',
                orderId: order.id,
                url: `/orders/${order.id}`
            }
        };
    }

    static createOrderReadyNotification(order: any) {
        return {
            title: 'Orden Lista',
            body: `Orden #${order.id} está lista para servir`,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: {
                type: 'order-ready',
                orderId: order.id,
                url: `/orders/${order.id}`
            }
        };
    }

    static createTipNotification(tip: any) {
        return {
            title: '💰 Nueva Propina',
            body: `Recibiste $${tip.amount} de propina`,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: {
                type: 'tip-received',
                tipId: tip.id,
                amount: tip.amount
            }
        };
    }
}
