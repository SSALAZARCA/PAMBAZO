import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../../types/index.js';
import { RoomManager } from '../rooms/roomManager.js';
import { hasPermission } from '../middleware/auth.js';

export interface OrderEventData {
  orderId: string;
  tableId?: string;
  customerId?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  total: number;
  timestamp: string;
  updatedBy?: string;
}

export class OrderHandler {
  private io: SocketIOServer;
  private roomManager: RoomManager;

  constructor(io: SocketIOServer, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
    console.log('📋 Order Handler initialized');
  }

  /**
   * Setup event handlers for order-related events
   */
  public setupEventHandlers(socket: AuthenticatedSocket): void {
    // Order creation events
    socket.on('order:create', (data) => this.handleOrderCreate(socket, data));
    socket.on('order:update', (data) => this.handleOrderUpdate(socket, data));
    socket.on('order:status_change', (data) => this.handleOrderStatusChange(socket, data));
    socket.on('order:cancel', (data) => this.handleOrderCancel(socket, data));

    // Order queries
    socket.on('order:get_active', () => this.handleGetActiveOrders(socket));
    socket.on('order:get_by_table', (data) => this.handleGetOrdersByTable(socket, data));
    socket.on('order:get_kitchen_queue', () => this.handleGetKitchenQueue(socket));

    // Order notifications
    socket.on('order:mark_ready', (data) => this.handleMarkOrderReady(socket, data));
    socket.on('order:mark_delivered', (data) => this.handleMarkOrderDelivered(socket, data));
  }

  /**
   * Handle order creation
   */
  private handleOrderCreate(socket: AuthenticatedSocket, data: Partial<OrderEventData>): void {
    try {
      // Validate permissions
      const allowedRoles = ['owner', 'admin', 'waiter', 'customer'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('order:error', {
          message: 'Insufficient permissions to create orders',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      // Validate required data
      if (!data.items || !data.total) {
        socket.emit('order:error', {
          message: 'Missing required order data',
          code: 'INVALID_DATA'
        });
        return;
      }

      const orderData: OrderEventData = {
        orderId: data.orderId || `order_${Date.now()}`,
        tableId: data.tableId,
        customerId: data.customerId || socket.userId,
        status: 'pending',
        items: data.items,
        total: data.total,
        timestamp: new Date().toISOString(),
        updatedBy: socket.userId
      };

      // Emit to different rooms based on order type
      if (socket.userRole === 'customer') {
        // Customer order - notify staff
        this.roomManager.emitToRooms(['orders', 'kitchen'], 'order:created', orderData);
        this.roomManager.emitToUser(socket.userId, 'order:created', orderData);
      } else {
        // Staff order - notify all relevant parties
        this.roomManager.emitToRoom('orders', 'order:created', orderData);
        if (orderData.customerId) {
          this.roomManager.emitToUser(orderData.customerId, 'order:created', orderData);
        }
      }

      // Confirm to sender
      socket.emit('order:create_success', orderData);

      console.log(`📋 Order created: ${orderData.orderId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling order creation:', error);
      socket.emit('order:error', {
        message: 'Failed to create order',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle order updates
   */
  private handleOrderUpdate(socket: AuthenticatedSocket, data: Partial<OrderEventData>): void {
    try {
      // Validate permissions
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('order:error', {
          message: 'Insufficient permissions to update orders',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      if (!data.orderId) {
        socket.emit('order:error', {
          message: 'Order ID is required',
          code: 'INVALID_DATA'
        });
        return;
      }

      const updateData = {
        ...data,
        timestamp: new Date().toISOString(),
        updatedBy: socket.userId
      };

      // Notify all relevant parties
      this.roomManager.emitToRoom('orders', 'order:updated', updateData);
      if (data.customerId) {
        this.roomManager.emitToUser(data.customerId, 'order:updated', updateData);
      }

      socket.emit('order:update_success', updateData);

      console.log(`📋 Order updated: ${data.orderId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling order update:', error);
      socket.emit('order:error', {
        message: 'Failed to update order',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle order status changes
   */
  private handleOrderStatusChange(socket: AuthenticatedSocket, data: { orderId: string; status: string; customerId?: string }): void {
    try {
      // Validate permissions based on status change
      let allowedRoles: string[] = [];

      switch (data.status) {
        case 'confirmed':
          allowedRoles = ['owner', 'admin', 'waiter'];
          break;
        case 'preparing':
          allowedRoles = ['owner', 'admin', 'kitchen'];
          break;
        case 'ready':
          allowedRoles = ['owner', 'admin', 'kitchen'];
          break;
        case 'delivered':
          allowedRoles = ['owner', 'admin', 'waiter'];
          break;
        case 'cancelled':
          allowedRoles = ['owner', 'admin', 'waiter'];
          break;
        default:
          allowedRoles = ['owner', 'admin'];
      }

      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('order:error', {
          message: 'Insufficient permissions for this status change',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const statusData = {
        orderId: data.orderId,
        status: data.status,
        timestamp: new Date().toISOString(),
        updatedBy: socket.userId,
        customerId: data.customerId
      };

      // Emit to appropriate rooms based on status
      if (data.status === 'ready') {
        // Notify waiters when order is ready
        this.roomManager.emitToRoles(['owner', 'admin', 'waiter'], 'order:status_changed', statusData);
      } else if (data.status === 'preparing') {
        // Notify kitchen and management
        this.roomManager.emitToRoles(['owner', 'admin', 'kitchen'], 'order:status_changed', statusData);
      } else {
        // General status change - notify all order handlers
        this.roomManager.emitToRoom('orders', 'order:status_changed', statusData);
      }

      // Always notify the customer
      if (data.customerId) {
        this.roomManager.emitToUser(data.customerId, 'order:status_changed', statusData);
      }

      socket.emit('order:status_change_success', statusData);

      console.log(`📋 Order status changed: ${data.orderId} -> ${data.status} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling order status change:', error);
      socket.emit('order:error', {
        message: 'Failed to change order status',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle order cancellation
   */
  private handleOrderCancel(socket: AuthenticatedSocket, data: { orderId: string; reason?: string; customerId?: string }): void {
    try {
      // Customers can cancel their own orders, staff can cancel any order
      const allowedRoles = ['owner', 'admin', 'waiter'];
      const isOwnOrder = data.customerId === socket.userId;

      if (!hasPermission(socket.userRole, allowedRoles) && !isOwnOrder) {
        socket.emit('order:error', {
          message: 'Insufficient permissions to cancel this order',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const cancelData = {
        orderId: data.orderId,
        status: 'cancelled',
        reason: data.reason || 'No reason provided',
        timestamp: new Date().toISOString(),
        cancelledBy: socket.userId,
        customerId: data.customerId
      };

      // Notify all relevant parties
      this.roomManager.emitToRoom('orders', 'order:cancelled', cancelData);
      this.roomManager.emitToRoom('kitchen', 'order:cancelled', cancelData);

      if (data.customerId) {
        this.roomManager.emitToUser(data.customerId, 'order:cancelled', cancelData);
      }

      socket.emit('order:cancel_success', cancelData);

      console.log(`📋 Order cancelled: ${data.orderId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling order cancellation:', error);
      socket.emit('order:error', {
        message: 'Failed to cancel order',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get active orders request
   */
  private handleGetActiveOrders(socket: AuthenticatedSocket): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter', 'kitchen'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('order:error', {
          message: 'Insufficient permissions to view active orders',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      // This would typically fetch from database
      // For now, emit a request for active orders
      socket.emit('order:active_orders_requested', {
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling get active orders:', error);
      socket.emit('order:error', {
        message: 'Failed to get active orders',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get orders by table request
   */
  private handleGetOrdersByTable(socket: AuthenticatedSocket, data: { tableId: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('order:error', {
          message: 'Insufficient permissions to view table orders',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      socket.emit('order:table_orders_requested', {
        tableId: data.tableId,
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling get orders by table:', error);
      socket.emit('order:error', {
        message: 'Failed to get table orders',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get kitchen queue request
   */
  private handleGetKitchenQueue(socket: AuthenticatedSocket): void {
    try {
      const allowedRoles = ['owner', 'admin', 'kitchen'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('order:error', {
          message: 'Insufficient permissions to view kitchen queue',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      socket.emit('order:kitchen_queue_requested', {
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling get kitchen queue:', error);
      socket.emit('order:error', {
        message: 'Failed to get kitchen queue',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle mark order ready
   */
  private handleMarkOrderReady(socket: AuthenticatedSocket, data: { orderId: string; customerId?: string }): void {
    this.handleOrderStatusChange(socket, { ...data, status: 'ready' });
  }

  /**
   * Handle mark order delivered
   */
  private handleMarkOrderDelivered(socket: AuthenticatedSocket, data: { orderId: string; customerId?: string }): void {
    this.handleOrderStatusChange(socket, { ...data, status: 'delivered' });
  }

  /**
   * Public method to emit order events from API controllers
   */
  public emitEvent(event: string, data: any, targetRoles?: string[]): void {
    if (targetRoles) {
      this.roomManager.emitToRoles(targetRoles, event, data);
    } else {
      // Default to order-related rooms
      this.roomManager.emitToRoom('orders', event, data);
    }
  }
}
