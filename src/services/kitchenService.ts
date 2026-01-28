import axios from 'axios';
import { setAuthToken, getAuthToken } from './api';

const API_URL = (import.meta.env['VITE_API_URL'] || 'http://localhost:3001/api/v1') + '/kitchen';

export interface KitchenOrder {
    id: string;
    tableNumber: number;
    items: OrderItem[];
    status: 'pending' | 'preparing' | 'ready';
    priority: 'high' | 'medium' | 'low';
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
    prepTime: number | null;
    estimatedTime: number;
}

export interface OrderItem {
    id: string;
    productId: number;
    productName: string;
    quantity: number;
    notes: string;
}

export interface KitchenStats {
    date: string;
    pendingOrders: number;
    inPreparation: number;
    completedToday: number;
    avgPrepTime: number;
    totalOrders?: number;
    readyToServe?: number;
}

class KitchenService {
    private getAuthHeader() {
        const token = getAuthToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private handleAuthError(error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            console.warn('Sesion expirada en KitchenService - Forzando logout');
            setAuthToken(null);
            // Usar window.location.href para forzar recarga completa y limpiar estado de React
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        throw error;
    }

    // Obtener estadísticas del día
    async getStats(): Promise<KitchenStats> {
        try {
            const response = await axios.get(`${API_URL}/stats`, {
                headers: this.getAuthHeader()
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching kitchen stats:', error);
            this.handleAuthError(error);
            throw error;
        }
    }

    // Obtener órdenes activas
    async getOrders(status?: 'pending' | 'preparing' | 'ready'): Promise<KitchenOrder[]> {
        try {
            const params = status ? { status } : {};
            const response = await axios.get(`${API_URL}/orders`, {
                headers: this.getAuthHeader(),
                params
            });
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching kitchen orders:', error);
            this.handleAuthError(error);
            throw error;
        }
    }

    // Iniciar preparación de una orden
    async startOrder(orderId: string): Promise<KitchenOrder> {
        try {
            const response = await axios.put(
                `${API_URL}/orders/${orderId}/start`,
                {},
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error starting order:', error);
            this.handleAuthError(error);
            throw error;
        }
    }

    // Marcar orden como lista
    async completeOrder(orderId: string): Promise<KitchenOrder> {
        try {
            const response = await axios.put(
                `${API_URL}/orders/${orderId}/complete`,
                {},
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error completing order:', error);
            this.handleAuthError(error);
            throw error;
        }
    }

    // Obtener historial del día
    async getHistory(): Promise<KitchenOrder[]> {
        try {
            const response = await axios.get(`${API_URL}/history`, {
                headers: this.getAuthHeader()
            });
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching kitchen history:', error);
            this.handleAuthError(error);
            throw error;
        }
    }
}

export const kitchenService = new KitchenService();
