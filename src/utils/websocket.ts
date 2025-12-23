/**
 * WebSocket Client for Real-Time Updates
 */

import { io, Socket } from 'socket.io-client';

export class WebSocketClient {
    private socket: Socket | null = null;
    private token: string | null = null;

    connect(token: string) {
        this.token = token;

        this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001', {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Order events
    onOrderCreated(callback: (order: any) => void) {
        this.socket?.on('order:created', callback);
    }

    onOrderStatusUpdated(callback: (data: any) => void) {
        this.socket?.on('order:status-updated', callback);
    }

    onOrderReady(callback: (order: any) => void) {
        this.socket?.on('order:ready', callback);
    }

    // Table events
    onTableStatusChanged(callback: (data: any) => void) {
        this.socket?.on('table:status-changed', callback);
    }

    // Tip events
    onTipReceived(callback: (tip: any) => void) {
        this.socket?.on('tip:received', callback);
    }

    // Reservation events
    onReservationCreated(callback: (reservation: any) => void) {
        this.socket?.on('reservation:created', callback);
    }

    onReservationUpdated(callback: (data: any) => void) {
        this.socket?.on('reservation:updated', callback);
    }

    // Remove listeners
    off(event: string, callback?: (...args: any[]) => void) {
        this.socket?.off(event, callback);
    }

    // Emit events
    emit(event: string, data: any) {
        this.socket?.emit(event, data);
    }

    getSocket() {
        return this.socket;
    }
}

export const wsClient = new WebSocketClient();
