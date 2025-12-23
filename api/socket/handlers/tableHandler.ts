import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../../types/index.js';
import { RoomManager } from '../rooms/roomManager.js';
import { hasPermission } from '../middleware/auth.js';

export interface TableEventData {
  tableId: string;
  tableNumber: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_service';
  capacity: number;
  currentOccupancy?: number;
  reservationId?: string;
  customerId?: string;
  customerName?: string;
  reservationTime?: string;
  estimatedDuration?: number; // in minutes
  notes?: string;
  lastUpdated: string;
  updatedBy?: string;
}

export interface ReservationEventData {
  reservationId: string;
  tableId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  partySize: number;
  reservationTime: string;
  estimatedDuration: number;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  specialRequests?: string;
  createdAt: string;
  createdBy?: string;
}

export class TableHandler {
  private io: SocketIOServer;
  private roomManager: RoomManager;

  constructor(io: SocketIOServer, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
    console.log('🪑 Table Handler initialized');
  }

  /**
   * Setup event handlers for table-related events
   */
  public setupEventHandlers(socket: AuthenticatedSocket): void {
    // Table status management
    socket.on('table:update_status', (data) => this.handleTableStatusUpdate(socket, data));
    socket.on('table:occupy', (data) => this.handleTableOccupy(socket, data));
    socket.on('table:free', (data) => this.handleTableFree(socket, data));
    socket.on('table:start_cleaning', (data) => this.handleStartCleaning(socket, data));
    socket.on('table:finish_cleaning', (data) => this.handleFinishCleaning(socket, data));

    // Reservation management
    socket.on('table:create_reservation', (data) => this.handleCreateReservation(socket, data));
    socket.on('table:update_reservation', (data) => this.handleUpdateReservation(socket, data));
    socket.on('table:cancel_reservation', (data) => this.handleCancelReservation(socket, data));
    socket.on('table:confirm_reservation', (data) => this.handleConfirmReservation(socket, data));
    socket.on('table:seat_reservation', (data) => this.handleSeatReservation(socket, data));
    socket.on('table:mark_no_show', (data) => this.handleMarkNoShow(socket, data));

    // Table queries
    socket.on('table:get_all', () => this.handleGetAllTables(socket));
    socket.on('table:get_available', (data) => this.handleGetAvailableTables(socket, data));
    socket.on('table:get_reservations', (data) => this.handleGetReservations(socket, data));
    socket.on('table:get_status', (data) => this.handleGetTableStatus(socket, data));
  }

  /**
   * Handle table status update
   */
  private handleTableStatusUpdate(socket: AuthenticatedSocket, data: Partial<TableEventData>): void {
    try {
      // Validate permissions
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to update table status',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      // Validate required data
      if (!data.tableId || !data.status) {
        socket.emit('table:error', {
          message: 'Table ID and status are required',
          code: 'INVALID_DATA'
        });
        return;
      }

      const tableData: TableEventData = {
        tableId: data.tableId,
        tableNumber: data.tableNumber || 0,
        status: data.status,
        capacity: data.capacity || 4,
        currentOccupancy: data.currentOccupancy,
        reservationId: data.reservationId,
        customerId: data.customerId,
        customerName: data.customerName,
        reservationTime: data.reservationTime,
        estimatedDuration: data.estimatedDuration,
        notes: data.notes,
        lastUpdated: new Date().toISOString(),
        updatedBy: socket.userId
      };

      // Emit to table management rooms
      this.roomManager.emitToRoom('tables', 'table:status_changed', tableData);
      this.roomManager.emitToRoom('all_staff', 'table:status_changed', tableData);

      // Notify customer if applicable
      if (tableData.customerId) {
        this.roomManager.emitToUser(tableData.customerId, 'table:status_changed', tableData);
      }

      socket.emit('table:status_update_success', tableData);

      console.log(`🪑 Table status updated: Table ${tableData.tableNumber} -> ${tableData.status} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling table status update:', error);
      socket.emit('table:error', {
        message: 'Failed to update table status',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle table occupy
   */
  private handleTableOccupy(socket: AuthenticatedSocket, data: { tableId: string; customerId?: string; customerName?: string; partySize?: number }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to occupy table',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const occupyData = {
        tableId: data.tableId,
        status: 'occupied' as const,
        customerId: data.customerId,
        customerName: data.customerName,
        currentOccupancy: data.partySize,
        lastUpdated: new Date().toISOString(),
        updatedBy: socket.userId
      };

      // Emit to table management
      this.roomManager.emitToRoom('tables', 'table:occupied', occupyData);
      this.roomManager.emitToRoom('all_staff', 'table:occupied', occupyData);

      // Notify customer if applicable
      if (data.customerId) {
        this.roomManager.emitToUser(data.customerId, 'table:occupied', occupyData);
      }

      socket.emit('table:occupy_success', occupyData);

      console.log(`🪑 Table occupied: ${data.tableId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling table occupy:', error);
      socket.emit('table:error', {
        message: 'Failed to occupy table',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle table free
   */
  private handleTableFree(socket: AuthenticatedSocket, data: { tableId: string; customerId?: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to free table',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const freeData = {
        tableId: data.tableId,
        status: 'cleaning' as const, // Table needs cleaning before becoming available
        customerId: data.customerId,
        lastUpdated: new Date().toISOString(),
        updatedBy: socket.userId
      };

      // Emit to table management
      this.roomManager.emitToRoom('tables', 'table:freed', freeData);
      this.roomManager.emitToRoom('all_staff', 'table:freed', freeData);

      // Notify customer if applicable
      if (data.customerId) {
        this.roomManager.emitToUser(data.customerId, 'table:freed', freeData);
      }

      socket.emit('table:free_success', freeData);

      console.log(`🪑 Table freed: ${data.tableId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling table free:', error);
      socket.emit('table:error', {
        message: 'Failed to free table',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle start cleaning
   */
  private handleStartCleaning(socket: AuthenticatedSocket, data: { tableId: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to start cleaning',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const cleaningData = {
        tableId: data.tableId,
        status: 'cleaning' as const,
        lastUpdated: new Date().toISOString(),
        updatedBy: socket.userId
      };

      // Emit to table management
      this.roomManager.emitToRoom('tables', 'table:cleaning_started', cleaningData);
      this.roomManager.emitToRoom('all_staff', 'table:cleaning_started', cleaningData);

      socket.emit('table:cleaning_start_success', cleaningData);

      console.log(`🪑 Table cleaning started: ${data.tableId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling start cleaning:', error);
      socket.emit('table:error', {
        message: 'Failed to start cleaning',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle finish cleaning
   */
  private handleFinishCleaning(socket: AuthenticatedSocket, data: { tableId: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to finish cleaning',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const cleanedData = {
        tableId: data.tableId,
        status: 'available' as const,
        lastUpdated: new Date().toISOString(),
        updatedBy: socket.userId
      };

      // Emit to table management
      this.roomManager.emitToRoom('tables', 'table:cleaning_finished', cleanedData);
      this.roomManager.emitToRoom('all_staff', 'table:cleaning_finished', cleanedData);

      socket.emit('table:cleaning_finish_success', cleanedData);

      console.log(`🪑 Table cleaning finished: ${data.tableId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling finish cleaning:', error);
      socket.emit('table:error', {
        message: 'Failed to finish cleaning',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle create reservation
   */
  private handleCreateReservation(socket: AuthenticatedSocket, data: Partial<ReservationEventData>): void {
    try {
      // Validate permissions - customers can make their own reservations
      const allowedRoles = ['owner', 'admin', 'waiter', 'customer'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to create reservations',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      // Validate required data
      if (!data.tableId || !data.customerName || !data.partySize || !data.reservationTime) {
        socket.emit('table:error', {
          message: 'Missing required reservation data',
          code: 'INVALID_DATA'
        });
        return;
      }

      const reservationData: ReservationEventData = {
        reservationId: data.reservationId || `res_${Date.now()}`,
        tableId: data.tableId,
        customerId: data.customerId || socket.userId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        partySize: data.partySize,
        reservationTime: data.reservationTime,
        estimatedDuration: data.estimatedDuration || 120, // Default 2 hours
        status: socket.userRole === 'customer' ? 'pending' : 'confirmed',
        specialRequests: data.specialRequests,
        createdAt: new Date().toISOString(),
        createdBy: socket.userId
      };

      // Emit to table management
      this.roomManager.emitToRoom('tables', 'table:reservation_created', reservationData);
      this.roomManager.emitToRoom('all_staff', 'table:reservation_created', reservationData);

      // Notify customer
      if (reservationData.customerId) {
        this.roomManager.emitToUser(reservationData.customerId, 'table:reservation_created', reservationData);
      }

      socket.emit('table:reservation_create_success', reservationData);

      console.log(`🪑 Reservation created: ${reservationData.reservationId} for table ${reservationData.tableId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling create reservation:', error);
      socket.emit('table:error', {
        message: 'Failed to create reservation',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle update reservation
   */
  private handleUpdateReservation(socket: AuthenticatedSocket, data: Partial<ReservationEventData>): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      const isOwnReservation = data.customerId === socket.userId;

      if (!hasPermission(socket.userRole, allowedRoles) && !isOwnReservation) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to update this reservation',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      if (!data.reservationId) {
        socket.emit('table:error', {
          message: 'Reservation ID is required',
          code: 'INVALID_DATA'
        });
        return;
      }

      const updateData = {
        ...data,
        lastUpdated: new Date().toISOString(),
        updatedBy: socket.userId
      };

      // Emit to table management
      this.roomManager.emitToRoom('tables', 'table:reservation_updated', updateData);
      this.roomManager.emitToRoom('all_staff', 'table:reservation_updated', updateData);

      // Notify customer
      if (data.customerId) {
        this.roomManager.emitToUser(data.customerId, 'table:reservation_updated', updateData);
      }

      socket.emit('table:reservation_update_success', updateData);

      console.log(`🪑 Reservation updated: ${data.reservationId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling update reservation:', error);
      socket.emit('table:error', {
        message: 'Failed to update reservation',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle cancel reservation
   */
  private handleCancelReservation(socket: AuthenticatedSocket, data: { reservationId: string; customerId?: string; reason?: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      const isOwnReservation = data.customerId === socket.userId;

      if (!hasPermission(socket.userRole, allowedRoles) && !isOwnReservation) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to cancel this reservation',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const cancelData = {
        reservationId: data.reservationId,
        status: 'cancelled' as const,
        reason: data.reason || 'No reason provided',
        cancelledBy: socket.userId,
        cancelledAt: new Date().toISOString(),
        customerId: data.customerId
      };

      // Emit to table management
      this.roomManager.emitToRoom('tables', 'table:reservation_cancelled', cancelData);
      this.roomManager.emitToRoom('all_staff', 'table:reservation_cancelled', cancelData);

      // Notify customer
      if (data.customerId) {
        this.roomManager.emitToUser(data.customerId, 'table:reservation_cancelled', cancelData);
      }

      socket.emit('table:reservation_cancel_success', cancelData);

      console.log(`🪑 Reservation cancelled: ${data.reservationId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling cancel reservation:', error);
      socket.emit('table:error', {
        message: 'Failed to cancel reservation',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle confirm reservation
   */
  private handleConfirmReservation(socket: AuthenticatedSocket, data: { reservationId: string; customerId?: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to confirm reservations',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const confirmData = {
        reservationId: data.reservationId,
        status: 'confirmed' as const,
        confirmedBy: socket.userId,
        confirmedAt: new Date().toISOString(),
        customerId: data.customerId
      };

      // Emit to table management
      this.roomManager.emitToRoom('tables', 'table:reservation_confirmed', confirmData);

      // Notify customer
      if (data.customerId) {
        this.roomManager.emitToUser(data.customerId, 'table:reservation_confirmed', confirmData);
      }

      socket.emit('table:reservation_confirm_success', confirmData);

      console.log(`🪑 Reservation confirmed: ${data.reservationId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling confirm reservation:', error);
      socket.emit('table:error', {
        message: 'Failed to confirm reservation',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle seat reservation
   */
  private handleSeatReservation(socket: AuthenticatedSocket, data: { reservationId: string; tableId: string; customerId?: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to seat reservations',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const seatData = {
        reservationId: data.reservationId,
        tableId: data.tableId,
        status: 'seated' as const,
        seatedBy: socket.userId,
        seatedAt: new Date().toISOString(),
        customerId: data.customerId
      };

      // Emit to table management
      this.roomManager.emitToRoom('tables', 'table:reservation_seated', seatData);
      this.roomManager.emitToRoom('all_staff', 'table:reservation_seated', seatData);

      // Notify customer
      if (data.customerId) {
        this.roomManager.emitToUser(data.customerId, 'table:reservation_seated', seatData);
      }

      socket.emit('table:reservation_seat_success', seatData);

      console.log(`🪑 Reservation seated: ${data.reservationId} at table ${data.tableId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling seat reservation:', error);
      socket.emit('table:error', {
        message: 'Failed to seat reservation',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle mark no show
   */
  private handleMarkNoShow(socket: AuthenticatedSocket, data: { reservationId: string; customerId?: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to mark no-show',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const noShowData = {
        reservationId: data.reservationId,
        status: 'no_show' as const,
        markedBy: socket.userId,
        markedAt: new Date().toISOString(),
        customerId: data.customerId
      };

      // Emit to table management
      this.roomManager.emitToRoom('tables', 'table:reservation_no_show', noShowData);
      this.roomManager.emitToRoom('admin', 'table:reservation_no_show', noShowData);

      socket.emit('table:reservation_no_show_success', noShowData);

      console.log(`🪑 Reservation marked no-show: ${data.reservationId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling mark no-show:', error);
      socket.emit('table:error', {
        message: 'Failed to mark no-show',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get all tables request
   */
  private handleGetAllTables(socket: AuthenticatedSocket): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to view all tables',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      socket.emit('table:all_tables_requested', {
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling get all tables:', error);
      socket.emit('table:error', {
        message: 'Failed to get all tables',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get available tables request
   */
  private handleGetAvailableTables(socket: AuthenticatedSocket, data: { partySize?: number; timeSlot?: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter', 'customer'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to view available tables',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      socket.emit('table:available_tables_requested', {
        ...data,
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling get available tables:', error);
      socket.emit('table:error', {
        message: 'Failed to get available tables',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get reservations request
   */
  private handleGetReservations(socket: AuthenticatedSocket, data: { date?: string; status?: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to view reservations',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      socket.emit('table:reservations_requested', {
        ...data,
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling get reservations:', error);
      socket.emit('table:error', {
        message: 'Failed to get reservations',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get table status request
   */
  private handleGetTableStatus(socket: AuthenticatedSocket, data: { tableId: string }): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('table:error', {
          message: 'Insufficient permissions to view table status',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      socket.emit('table:status_requested', {
        ...data,
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling get table status:', error);
      socket.emit('table:error', {
        message: 'Failed to get table status',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Public method to emit table events from API controllers
   */
  public emitEvent(event: string, data: any, targetRoles?: string[]): void {
    if (targetRoles) {
      this.roomManager.emitToRoles(targetRoles, event, data);
    } else {
      // Default to table-related rooms
      this.roomManager.emitToRoom('tables', event, data);
    }
  }
}
