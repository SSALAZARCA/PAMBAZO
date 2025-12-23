/**
 * Push Notification Utility for Frontend
 * Handles subscription and notification management
 */

const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBr5v-RQZZ7nSLdQJCQI';

export class PushNotificationManager {
    private registration: ServiceWorkerRegistration | null = null;

    async initialize() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications not supported');
            return false;
        }

        try {
            // Register service worker
            this.registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered');

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;

            return true;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return false;
        }
    }

    async requestPermission(): Promise<boolean> {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    async subscribe(): Promise<PushSubscription | null> {
        if (!this.registration) {
            console.error('Service Worker not registered');
            return null;
        }

        try {
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Send subscription to backend
            await this.sendSubscriptionToServer(subscription);

            return subscription;
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            return null;
        }
    }

    async unsubscribe(): Promise<boolean> {
        if (!this.registration) {
            return false;
        }

        try {
            const subscription = await this.registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                // Notify backend
                await this.removeSubscriptionFromServer(subscription);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
            return false;
        }
    }

    async getSubscription(): Promise<PushSubscription | null> {
        if (!this.registration) {
            return null;
        }

        return await this.registration.pushManager.getSubscription();
    }

    private async sendSubscriptionToServer(subscription: PushSubscription) {
        const token = localStorage.getItem('token');

        await fetch(`${import.meta.env.VITE_API_URL}/api/v1/notifications/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(subscription)
        });
    }

    private async removeSubscriptionFromServer(subscription: PushSubscription) {
        const token = localStorage.getItem('token');

        await fetch(`${import.meta.env.VITE_API_URL}/api/v1/notifications/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(subscription)
        });
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Show local notification (for testing)
    async showNotification(title: string, options?: NotificationOptions) {
        if (!this.registration) {
            return;
        }

        await this.registration.showNotification(title, {
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            ...options
        });
    }
}

export const pushNotifications = new PushNotificationManager();
