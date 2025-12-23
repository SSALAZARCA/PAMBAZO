import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../../types/index.js';
import { RoomManager } from '../rooms/roomManager.js';
import { hasPermission } from '../middleware/auth.js';

export interface UserEventData {
  userId: string;
  email: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastSeen: string;
  location?: string;
  currentShift?: {
    shiftId: string;
    startTime: string;
    endTime?: string;
    position: string;
  };
  permissions?: string[];
  metadata?: Record<string, any>;
}

export interface UserActivityData {
  userId: string;
  activity: 'login' | 'logout' | 'shift_start' | 'shift_end' | 'break_start' | 'break_end' | 'location_change';
  timestamp: string;
  details?: Record<string, any>;
  location?: string;
  deviceInfo?: {
    type: 'mobile' | 'desktop' | 'tablet';
    browser?: string;
    os?: string;
  };
}

export interface UserNotificationData {
  notificationId: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'order' | 'inventory' | 'table' | 'system' | 'announcement';
  data?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
  read: boolean;
  actionRequired?: boolean;
  actions?: Array<{
    id: string;
    label: string;
    type: 'button' | 'link';
    action: string;
  }>;
}

export class UserHandler {
  private io: SocketIOServer;
  private roomManager: RoomManager;

  constructor(io: SocketIOServer, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
    console.log('👤 User Handler initialized');
  }

  /**
   * Setup event handlers for user-related events
   */
  public setupEventHandlers(socket: AuthenticatedSocket): void {
    // User status management
    socket.on('user:update_status', (data) => this.handleUpdateStatus(socket, data));
    socket.on('user:update_location', (data) => this.handleUpdateLocation(socket, data));
    socket.on('user:start_shift', (data) => this.handleStartShift(socket, data));
    socket.on('user:end_shift', (data) => this.handleEndShift(socket, data));
    socket.on('user:start_break', (data) => this.handleStartBreak(socket, data));
    socket.on('user:end_break', (data) => this.handleEndBreak(socket));

    // User notifications
    socket.on('user:send_notification', (data) => this.handleSendNotification(socket, data));
    socket.on('user:mark_notification_read', (data) => this.handleMarkNotificationRead(socket, data));
    socket.on('user:dismiss_notification', (data) => this.handleDismissNotification(socket, data));
    socket.on('user:get_notifications', (data) => this.handleGetNotifications(socket, data));

    // User queries
    socket.on('user:get_online_users', () => this.handleGetOnlineUsers(socket));
    socket.on('user:get_user_status', (data) => this.handleGetUserStatus(socket, data));
    socket.on('user:get_shift_info', (data) => this.handleGetShiftInfo(socket, data));

    // User communication
    socket.on('user:send_message', (data) => this.handleSendMessage(socket, data));
    socket.on('user:broadcast_announcement', (data) => this.handleBroadcastAnnouncement(socket, data));

    // Handle disconnection
    socket.on('disconnect', () => this.handleDisconnection(socket));
  }

  /**
   * Handle user status update
   */
  private handleUpdateStatus(socket: AuthenticatedSocket, data: { status: 'online' | 'offline' | 'busy' | 'away'; location?: string }): void {
    try {
      const statusData: UserEventData = {
        userId: socket.userId,
        email: socket.userEmail,
        name: socket.userName || socket.userEmail,
        role: socket.userRole,
        status: data.status,
        lastSeen: new Date().toISOString(),
        location: data.location
      };

      // Update user in room manager
      this.roomManager.updateUserStatus(socket.userId, data.status);

      // Emit to all staff
      this.roomManager.emitToRoom('all_staff', 'user:status_changed', statusData);

      // Emit to admin for monitoring
      this.roomManager.emitToRoles(['admin'], 'user:status_changed', statusData);

      socket.emit('user:status_update_success', statusData);

      console.log(`👤 User status updated: ${socket.userEmail} -> ${data.status}`);

    } catch (error: any) {
      console.error('❌ Error handling user status update:', error);
      socket.emit('user:error', {
        message: 'Failed to update status',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle user location update
   */
  private handleUpdateLocation(socket: AuthenticatedSocket, data: { location: string }): void {
    try {
      const locationData = {
        userId: socket.userId,
        email: socket.userEmail,
        location: data.location,
        timestamp: new Date().toISOString()
      };

      // Emit to admin and managers
      this.roomManager.emitToRoles(['admin', 'owner'], 'user:location_changed', locationData);

      socket.emit('user:location_update_success', locationData);

      console.log(`👤 User location updated: ${socket.userEmail} -> ${data.location}`);

    } catch (error: any) {
      console.error('❌ Error handling user location update:', error);
      socket.emit('user:error', {
        message: 'Failed to update location',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle start shift
   */
  private handleStartShift(socket: AuthenticatedSocket, data: { position?: string; location?: string }): void {
    try {
      const shiftData = {
        userId: socket.userId,
        email: socket.userEmail,
        name: socket.userName || socket.userEmail,
        role: socket.userRole,
        activity: 'shift_start' as const,
        timestamp: new Date().toISOString(),
        details: {
          position: data.position || socket.userRole,
          location: data.location
        }
      };

      // Update user status to online
      this.roomManager.updateUserStatus(socket.userId, 'online');

      // Emit to all staff and admin
      this.roomManager.emitToRoom('all_staff', 'user:shift_started', shiftData);
      this.roomManager.emitToRoles(['admin'], 'user:shift_started', shiftData);

      socket.emit('user:shift_start_success', shiftData);

      console.log(`👤 Shift started: ${socket.userEmail} as ${data.position || socket.userRole}`);

    } catch (error: any) {
      console.error('❌ Error handling start shift:', error);
      socket.emit('user:error', {
        message: 'Failed to start shift',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle end shift
   */
  private handleEndShift(socket: AuthenticatedSocket, data: { notes?: string }): void {
    try {
      const shiftData = {
        userId: socket.userId,
        email: socket.userEmail,
        name: socket.userName || socket.userEmail,
        role: socket.userRole,
        activity: 'shift_end' as const,
        timestamp: new Date().toISOString(),
        details: {
          notes: data.notes
        }
      };

      // Update user status to offline
      this.roomManager.updateUserStatus(socket.userId, 'offline');

      // Emit to all staff and admin
      this.roomManager.emitToRoom('all_staff', 'user:shift_ended', shiftData);
      this.roomManager.emitToRoles(['admin'], 'user:shift_ended', shiftData);

      socket.emit('user:shift_end_success', shiftData);

      console.log(`👤 Shift ended: ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling end shift:', error);
      socket.emit('user:error', {
        message: 'Failed to end shift',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle start break
   */
  private handleStartBreak(socket: AuthenticatedSocket, data: { type?: 'lunch' | 'coffee' | 'personal'; duration?: number }): void {
    try {
      const breakData = {
        userId: socket.userId,
        email: socket.userEmail,
        activity: 'break_start' as const,
        timestamp: new Date().toISOString(),
        details: {
          type: data.type || 'personal',
          estimatedDuration: data.duration || 15 // minutes
        }
      };

      // Update user status to away
      this.roomManager.updateUserStatus(socket.userId, 'away');

      // Emit to admin and team leads
      this.roomManager.emitToRoles(['admin', 'owner'], 'user:break_started', breakData);

      socket.emit('user:break_start_success', breakData);

      console.log(`👤 Break started: ${socket.userEmail} - ${data.type || 'personal'}`);

    } catch (error: any) {
      console.error('❌ Error handling start break:', error);
      socket.emit('user:error', {
        message: 'Failed to start break',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle end break
   */
  private handleEndBreak(socket: AuthenticatedSocket): void {
    try {
      const breakData = {
        userId: socket.userId,
        email: socket.userEmail,
        activity: 'break_end' as const,
        timestamp: new Date().toISOString()
      };

      // Update user status to online
      this.roomManager.updateUserStatus(socket.userId, 'online');

      // Emit to admin and team leads
      this.roomManager.emitToRoles(['admin', 'owner'], 'user:break_ended', breakData);

      socket.emit('user:break_end_success', breakData);

      console.log(`👤 Break ended: ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling end break:', error);
      socket.emit('user:error', {
        message: 'Failed to end break',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle send notification
   */
  private handleSendNotification(socket: AuthenticatedSocket, data: Partial<UserNotificationData>): void {
    try {
      // Validate permissions
      const allowedRoles = ['owner', 'admin'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('user:error', {
          message: 'Insufficient permissions to send notifications',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      // Validate required data
      if (!data.userId || !data.title || !data.message) {
        socket.emit('user:error', {
          message: 'User ID, title, and message are required',
          code: 'INVALID_DATA'
        });
        return;
      }

      const notificationData: UserNotificationData = {
        notificationId: data.notificationId || `notif_${Date.now()}`,
        userId: data.userId,
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        priority: data.priority || 'medium',
        category: data.category || 'system',
        data: data.data,
        createdAt: new Date().toISOString(),
        expiresAt: data.expiresAt,
        read: false,
        actionRequired: data.actionRequired || false,
        actions: data.actions
      };

      // Send notification to specific user
      this.roomManager.emitToUser(data.userId, 'user:notification_received', notificationData);

      // Log to admin
      this.roomManager.emitToRoles(['admin'], 'user:notification_sent', {
        ...notificationData,
        sentBy: socket.userId
      });

      socket.emit('user:notification_send_success', notificationData);

      console.log(`👤 Notification sent: ${notificationData.title} to user ${data.userId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling send notification:', error);
      socket.emit('user:error', {
        message: 'Failed to send notification',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle mark notification as read
   */
  private handleMarkNotificationRead(socket: AuthenticatedSocket, data: { notificationId: string }): void {
    try {
      const readData = {
        notificationId: data.notificationId,
        userId: socket.userId,
        readAt: new Date().toISOString()
      };

      socket.emit('user:notification_read_success', readData);

      console.log(`👤 Notification marked as read: ${data.notificationId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling mark notification read:', error);
      socket.emit('user:error', {
        message: 'Failed to mark notification as read',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle dismiss notification
   */
  private handleDismissNotification(socket: AuthenticatedSocket, data: { notificationId: string }): void {
    try {
      const dismissData = {
        notificationId: data.notificationId,
        userId: socket.userId,
        dismissedAt: new Date().toISOString()
      };

      socket.emit('user:notification_dismiss_success', dismissData);

      console.log(`👤 Notification dismissed: ${data.notificationId} by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling dismiss notification:', error);
      socket.emit('user:error', {
        message: 'Failed to dismiss notification',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get notifications
   */
  private handleGetNotifications(socket: AuthenticatedSocket, data: { limit?: number; offset?: number; unreadOnly?: boolean }): void {
    try {
      const queryData = {
        userId: socket.userId,
        limit: data.limit || 50,
        offset: data.offset || 0,
        unreadOnly: data.unreadOnly || false,
        requestedAt: new Date().toISOString()
      };

      socket.emit('user:notifications_requested', queryData);

      console.log(`👤 Notifications requested by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling get notifications:', error);
      socket.emit('user:error', {
        message: 'Failed to get notifications',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get online users
   */
  private handleGetOnlineUsers(socket: AuthenticatedSocket): void {
    try {
      const allowedRoles = ['owner', 'admin', 'waiter'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('user:error', {
          message: 'Insufficient permissions to view online users',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const onlineUsers = this.roomManager.getOnlineUsers();
      socket.emit('user:online_users', {
        users: onlineUsers,
        count: onlineUsers.length,
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

      console.log(`👤 Online users requested by ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling get online users:', error);
      socket.emit('user:error', {
        message: 'Failed to get online users',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get user status
   */
  private handleGetUserStatus(socket: AuthenticatedSocket, data: { userId: string }): void {
    try {
      const allowedRoles = ['owner', 'admin'];
      const isOwnStatus = data.userId === socket.userId;

      if (!hasPermission(socket.userRole, allowedRoles) && !isOwnStatus) {
        socket.emit('user:error', {
          message: 'Insufficient permissions to view user status',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      socket.emit('user:status_requested', {
        userId: data.userId,
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling get user status:', error);
      socket.emit('user:error', {
        message: 'Failed to get user status',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle get shift info
   */
  private handleGetShiftInfo(socket: AuthenticatedSocket, data: { userId?: string; date?: string }): void {
    try {
      const allowedRoles = ['owner', 'admin'];
      const isOwnShift = !data.userId || data.userId === socket.userId;

      if (!hasPermission(socket.userRole, allowedRoles) && !isOwnShift) {
        socket.emit('user:error', {
          message: 'Insufficient permissions to view shift info',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      socket.emit('user:shift_info_requested', {
        userId: data.userId || socket.userId,
        date: data.date || new Date().toISOString().split('T')[0],
        requestedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error handling get shift info:', error);
      socket.emit('user:error', {
        message: 'Failed to get shift info',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle send message
   */
  private handleSendMessage(socket: AuthenticatedSocket, data: { targetUserId?: string; targetRole?: string; message: string; type?: 'private' | 'broadcast' }): void {
    try {
      const messageData = {
        messageId: `msg_${Date.now()}`,
        fromUserId: socket.userId,
        fromUserEmail: socket.userEmail,
        fromUserName: socket.userName || socket.userEmail,
        message: data.message,
        type: data.type || 'private',
        timestamp: new Date().toISOString()
      };

      if (data.targetUserId) {
        // Send to specific user
        this.roomManager.emitToUser(data.targetUserId, 'user:message_received', {
          ...messageData,
          targetUserId: data.targetUserId
        });
      } else if (data.targetRole) {
        // Send to all users with specific role
        this.roomManager.emitToRoles([data.targetRole], 'user:message_received', {
          ...messageData,
          targetRole: data.targetRole
        });
      } else {
        // Send to all staff
        this.roomManager.emitToRoom('all_staff', 'user:message_received', messageData);
      }

      socket.emit('user:message_send_success', messageData);

      console.log(`👤 Message sent by ${socket.userEmail} to ${data.targetUserId || data.targetRole || 'all staff'}`);

    } catch (error: any) {
      console.error('❌ Error handling send message:', error);
      socket.emit('user:error', {
        message: 'Failed to send message',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle broadcast announcement
   */
  private handleBroadcastAnnouncement(socket: AuthenticatedSocket, data: { title: string; message: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; targetRoles?: string[] }): void {
    try {
      const allowedRoles = ['owner', 'admin'];
      if (!hasPermission(socket.userRole, allowedRoles)) {
        socket.emit('user:error', {
          message: 'Insufficient permissions to broadcast announcements',
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      const announcementData = {
        announcementId: `announce_${Date.now()}`,
        title: data.title,
        message: data.message,
        priority: data.priority || 'medium',
        fromUserId: socket.userId,
        fromUserEmail: socket.userEmail,
        fromUserName: socket.userName || socket.userEmail,
        targetRoles: data.targetRoles,
        timestamp: new Date().toISOString()
      };

      if (data.targetRoles && data.targetRoles.length > 0) {
        // Send to specific roles
        this.roomManager.emitToRoles(data.targetRoles, 'user:announcement_received', announcementData);
      } else {
        // Send to all staff
        this.roomManager.emitToRoom('all_staff', 'user:announcement_received', announcementData);
      }

      socket.emit('user:announcement_broadcast_success', announcementData);

      console.log(`👤 Announcement broadcast by ${socket.userEmail}: ${data.title}`);

    } catch (error: any) {
      console.error('❌ Error handling broadcast announcement:', error);
      socket.emit('user:error', {
        message: 'Failed to broadcast announcement',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Handle user disconnect
   */
  public handleDisconnection(socket: AuthenticatedSocket): void {
    try {
      const disconnectData = {
        userId: socket.userId,
        email: socket.userEmail,
        name: socket.userName || socket.userEmail,
        role: socket.userRole,
        activity: 'logout' as const,
        timestamp: new Date().toISOString(),
        details: {
          reason: 'disconnect'
        }
      };

      // Update user status to offline
      this.roomManager.updateUserStatus(socket.userId, 'offline');

      // Emit to all staff and admin
      this.roomManager.emitToRoom('all_staff', 'user:disconnected', disconnectData);
      this.roomManager.emitToRoles(['admin'], 'user:disconnected', disconnectData);

      console.log(`👤 User disconnected: ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling user disconnect:', error);
    }
  }

  /**
   * Handle user connect (called from main socket handler)
   */
  public handleUserConnect(socket: AuthenticatedSocket): void {
    try {
      const connectData = {
        userId: socket.userId,
        email: socket.userEmail,
        name: socket.userName || socket.userEmail,
        role: socket.userRole,
        activity: 'login' as const,
        timestamp: new Date().toISOString(),
        details: {
          socketId: socket.id
        }
      };

      // Update user status to online
      this.roomManager.updateUserStatus(socket.userId, 'online');

      // Emit to all staff and admin
      this.roomManager.emitToRoom('all_staff', 'user:connected', connectData);
      this.roomManager.emitToRoles(['admin'], 'user:connected', connectData);

      console.log(`👤 User connected: ${socket.userEmail}`);

    } catch (error: any) {
      console.error('❌ Error handling user connect:', error);
    }
  }

  /**
   * Public method to emit user events from API controllers
   */
  public emitEvent(event: string, data: any, targetUsers?: string[], targetRoles?: string[]): void {
    if (targetUsers) {
      targetUsers.forEach(userId => {
        this.roomManager.emitToUser(userId, event, data);
      });
    } else if (targetRoles) {
      this.roomManager.emitToRoles(targetRoles, event, data);
    } else {
      // Default to all staff
      this.roomManager.emitToRoom('all_staff', event, data);
    }
  }
}
