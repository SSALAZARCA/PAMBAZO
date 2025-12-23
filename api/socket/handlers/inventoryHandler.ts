import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../../types/index.js';
import { RoomManager } from '../rooms/roomManager.js';
import { hasPermission } from '../middleware/auth.js';

export interface InventoryEventData {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  category?: string;
  supplier?: string;
  lastUpdated: string;
  updatedBy?: string;
  alertLevel?: 'low' | 'critical' | 'out_of_stock';
}

export interface StockMovementData {
  productId: string;
  productName: string;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string; // Order ID, supplier invoice, etc.
  timestamp: string;
  performedBy: string;
}

export class InventoryHandler {
  private io: SocketIOServer;
  private roomManager: RoomManager;

  constructor(io: SocketIOServer, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
    console.log('📦 Inventory Handler initialized');
  }

  /**
   * Setup event handlers for inventory-related events
   */
  public setupEventHandlers(socket: AuthenticatedSocket): void {
    // Stock management events
    socket.on('inventory:update_stock', (data) => this.handleStockUpdate(socket, data));
    socket.on('inventory:stock_movement', (data) => this.handleStockMovement(socket, data));
    socket.on('inventory:set_min_stock', (data) => this.handleSetMinStock(socket, data));

    // Stock alerts
    socket.on('inventory:check_low_stock', () => this.handleCheckLowStock(socket));
    socket.on('inventory:acknowledge_alert', (data) => this.handleAcknowledgeAlert(socket, data));

    // Inventory queries
    socket.on('inventory:get_current', () => this.handleGetCurrentInventory(socket));
    socket.on('inventory:get_movements', (data) => this.handleGetMovements(socket, data));
    socket.on('inventory:get_alerts', () => this.handleGetAlerts(socket));

    // Supplier management
    socket.on('inventory:reorder_request', (data) => this.handleReorderRequest(socket, data));
    socket.on('inventory:receive_shipment', (data) => this.handleReceiveShipment(socket, data));
  }

  /**
   * Handle stock update
   */
  private handleStockUpdate(socket: AuthenticatedSocket, data: Partial<InventoryEventData>): void {
    try {
      // Validate permissions
      const allowedRoles = ['owner', 'admin', 'kitchen'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('inventory:error', {
          message: 'Insufficient permissions to update inventory',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      // Validate required data
      if (!data.productId || data.currentStock === undefined) {
        socket.emit('inventory:error', {
          message: 'Product ID and current stock are required',
          code: 'INVALID_DATA'
        });
        return;
      }

      const inventoryData: InventoryEventData = {
        productId: data.productId,
        productName: data.productName || 'Unknown Product',
        currentStock: data.currentStock,
        minStock: data.minStock || 0,
        maxStock: data.maxStock,
        unit: data.unit || 'units',
        category: data.category,
        supplier: data.supplier,
        lastUpdated: new Date().toISOString(),
        updatedBy: socket.userId,
        alertLevel: this.calculateAlertLevel(data.currentStock, data.minStock || 0)
      };

      // Emit to inventory management rooms
      this.roomManager.emitToRoom('inventory', 'inventory:updated', inventoryData);
      this.roomManager.emitToRoom('kitchen', 'inventory:updated', inventoryData);

      // Send low stock alerts if necessary
      if (inventoryData.alertLevel) {
        this.emitStockAlert(inventoryData);
      }

      socket.emit('inventory:update_success', inventoryData);

      console.log(`📦 Inventory updated: ${inventoryData.productName} (${inventoryData.currentStock} ${inventoryData.unit}) by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling inventory update:', error);
      socket.emit('inventory:error', {
        message: 'Failed to update inventory',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle stock movement
   */
  private handleStockMovement(socket: AuthenticatedSocket, data: Partial<StockMovementData>): void {
    try {
      // Validate permissions
      const allowedRoles = ['owner', 'admin', 'kitchen'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('inventory:error', {
          message: 'Insufficient permissions to record stock movements',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      // Validate required data
      if (!data.productId || !data.movementType || data.quantity === undefined || !data.reason) {
        socket.emit('inventory:error', {
          message: 'Missing required movement data',
          code: 'INVALID_DATA'
        });
        return;
      }

      const movementData: StockMovementData = {
        productId: data.productId,
        productName: data.productName || 'Unknown Product',
        movementType: data.movementType,
        quantity: data.quantity,
        previousStock: data.previousStock || 0,
        newStock: data.newStock || 0,
        reason: data.reason,
        reference: data.reference,
        timestamp: new Date().toISOString(),
        performedBy: socket.userId
      };

      // Emit to inventory management rooms
      this.roomManager.emitToRoom('inventory', 'inventory:movement', movementData);
      this.roomManager.emitToRoom('admin', 'inventory:movement', movementData);

      // Check for low stock after movement
      if (movementData.movementType === 'out' || movementData.movementType === 'adjustment') {
        // This would typically check against min stock from database
        // For now, emit a check request
        this.roomManager.emitToRoom('inventory', 'inventory:check_stock_levels', {
          productId: movementData.productId,
          currentStock: movementData.newStock,
          timestamp: new Date().toISOString()
        });
      }

      socket.emit('inventory:movement_success', movementData);

      console.log(`📦 Stock movement: ${movementData.productName} ${movementData.movementType} ${movementData.quantity} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling stock movement:', error);
      socket.emit('inventory:error', {
        message: 'Failed to record stock movement',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle set minimum stock level
   */
  private handleSetMinStock(socket: AuthenticatedSocket, data: { productId: string; minStock: number; productName?: string }): void {
    try {
      // Validate permissions
      const allowedRoles = ['owner', 'admin'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('inventory:error', {
          message: 'Insufficient permissions to set minimum stock levels',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      if (!data.productId || data.minStock === undefined) {
        socket.emit('inventory:error', {
          message: 'Product ID and minimum stock are required',
          code: 'INVALID_DATA'
        });
        return;
      }

      const minStockData = {
        productId: data.productId,
        productName: data.productName || 'Unknown Product',
        minStock: data.minStock,
        timestamp: new Date().toISOString(),
        updatedBy: socket.userId
      };

      // Emit to inventory management
      this.roomManager.emitToRoom('inventory', 'inventory:min_stock_updated', minStockData);
      this.roomManager.emitToRoom('admin', 'inventory:min_stock_updated', minStockData);

      socket.emit('inventory:min_stock_success', minStockData);

      console.log(`📦 Min stock updated: ${minStockData.productName} -> ${minStockData.minStock} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling min stock update:', error);
      socket.emit('inventory:error', {
        message: 'Failed to update minimum stock',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle check low stock request
   */
  private handleCheckLowStock(socket: AuthenticatedSocket): void {
    try {
      const allowedRoles = ['owner', 'admin', 'kitchen'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('inventory:error', {
          message: 'Insufficient permissions to check stock levels',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      // Emit request for low stock check
      socket.emit('inventory:low_stock_check_requested', {
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling low stock check:', error);
      socket.emit('inventory:error', {
        message: 'Failed to check low stock',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle acknowledge alert
   */
  private handleAcknowledgeAlert(socket: AuthenticatedSocket, data: { productId: string; alertType: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'kitchen'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('inventory:error', {
          message: 'Insufficient permissions to acknowledge alerts',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const ackData = {
        productId: data.productId,
        alertType: data.alertType,
        acknowledgedBy: socket.userId,
        timestamp: new Date().toISOString()
      };

      // Emit acknowledgment to inventory management
      this.roomManager.emitToRoom('inventory', 'inventory:alert_acknowledged', ackData);
      this.roomManager.emitToRoom('admin', 'inventory:alert_acknowledged', ackData);

      socket.emit('inventory:acknowledge_success', ackData);

      console.log(`📦 Alert acknowledged: ${data.productId} (${data.alertType}) by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling alert acknowledgment:', error);
      socket.emit('inventory:error', {
        message: 'Failed to acknowledge alert',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle reorder request
   */
  private handleReorderRequest(socket: AuthenticatedSocket, data: { productId: string; quantity: number; supplier?: string; notes?: string }): void {
    try {
      const allowedRoles = ['owner', 'admin'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('inventory:error', {
          message: 'Insufficient permissions to create reorder requests',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const reorderData = {
        productId: data.productId,
        quantity: data.quantity,
        supplier: data.supplier,
        notes: data.notes,
        requestedBy: socket.userId,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      // Emit to admin for approval
      this.roomManager.emitToRoom('admin', 'inventory:reorder_requested', reorderData);

      socket.emit('inventory:reorder_success', reorderData);

      console.log(`📦 Reorder requested: ${data.productId} (${data.quantity}) by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling reorder request:', error);
      socket.emit('inventory:error', {
        message: 'Failed to create reorder request',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle receive shipment
   */
  private handleReceiveShipment(socket: AuthenticatedSocket, data: { items: Array<{ productId: string; quantity: number; }>, supplier?: string, reference?: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'kitchen'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('inventory:error', {
          message: 'Insufficient permissions to receive shipments',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const shipmentData = {
        items: data.items,
        supplier: data.supplier,
        reference: data.reference,
        receivedBy: socket.userId,
        timestamp: new Date().toISOString()
      };

      // Emit to inventory management
      this.roomManager.emitToRoom('inventory', 'inventory:shipment_received', shipmentData);
      this.roomManager.emitToRoom('admin', 'inventory:shipment_received', shipmentData);

      socket.emit('inventory:shipment_success', shipmentData);

      console.log(`📦 Shipment received: ${data.items.length} items by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling shipment receipt:', error);
      socket.emit('inventory:error', {
        message: 'Failed to receive shipment',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get current inventory request
   */
  private handleGetCurrentInventory(socket: AuthenticatedSocket): void {
    try {
      const allowedRoles = ['owner', 'admin', 'kitchen'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('inventory:error', {
          message: 'Insufficient permissions to view inventory',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      socket.emit('inventory:current_requested', {
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling get current inventory:', error);
      socket.emit('inventory:error', {
        message: 'Failed to get current inventory',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get movements request
   */
  private handleGetMovements(socket: AuthenticatedSocket, data: { productId?: string; startDate?: string; endDate?: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'kitchen'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('inventory:error', {
          message: 'Insufficient permissions to view movements',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      socket.emit('inventory:movements_requested', {
        ...data,
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling get movements:', error);
      socket.emit('inventory:error', {
        message: 'Failed to get movements',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get alerts request
   */
  private handleGetAlerts(socket: AuthenticatedSocket): void {
    try {
      const allowedRoles = ['owner', 'admin', 'kitchen'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('inventory:error', {
          message: 'Insufficient permissions to view alerts',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      socket.emit('inventory:alerts_requested', {
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling get alerts:', error);
      socket.emit('inventory:error', {
        message: 'Failed to get alerts',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Calculate alert level based on current and minimum stock
   */
  private calculateAlertLevel(currentStock: number, minStock: number): 'low' | 'critical' | 'out_of_stock' | undefined {
    if (currentStock <= 0) {
      return 'out_of_stock';
    } else if (currentStock <= minStock * 0.5) {
      return 'critical';
    } else if (currentStock <= minStock) {
      return 'low';
    }
    return undefined;
  }

  /**
   * Emit stock alert to appropriate rooms
   */
  private emitStockAlert(inventoryData: InventoryEventData): void {
    const alertData = {
      productId: inventoryData.productId,
      productName: inventoryData.productName,
      currentStock: inventoryData.currentStock,
      minStock: inventoryData.minStock,
      alertLevel: inventoryData.alertLevel,
      timestamp: new Date().toISOString()
    };

    // Emit to different rooms based on alert level
    if (inventoryData.alertLevel === 'out_of_stock' || inventoryData.alertLevel === 'critical') {
      // Critical alerts go to admin and kitchen
      this.roomManager.emitToRoles(['owner', 'admin', 'kitchen'], 'inventory:stock_alert', alertData);
    } else if (inventoryData.alertLevel === 'low') {
      // Low stock alerts go to inventory managers
      this.roomManager.emitToRoom('inventory', 'inventory:low_stock', alertData);
    }

    console.log(`📦 Stock alert: ${inventoryData.productName} (${inventoryData.alertLevel})`);
  }

  /**
   * Public method to emit inventory events from API controllers
   */
  public emitEvent(event: string, data: any, targetRoles?: string[]): void {
    if (targetRoles) {
      this.roomManager.emitToRoles(targetRoles, event, data);
    } else {
      // Default to inventory-related rooms
      this.roomManager.emitToRoom('inventory', event, data);
    }
  }
}
