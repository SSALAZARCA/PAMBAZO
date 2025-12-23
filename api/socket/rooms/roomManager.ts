import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../../types/index.js';

export interface RoomConfig {
  name: string;
  allowedRoles: string[];
  description: string;
}

export class RoomManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();
  private userStatuses: Map<string, string> = new Map();

  // Define room configurations
  private readonly ROOMS: RoomConfig[] = [
    {
      name: 'admin',
      allowedRoles: ['owner', 'admin'],
      description: 'Administrative operations and system management'
    },
    {
      name: 'orders',
      allowedRoles: ['owner', 'admin', 'waiter', 'kitchen'],
      description: 'Order management and updates'
    },
    {
      name: 'kitchen',
      allowedRoles: ['owner', 'admin', 'kitchen'],
      description: 'Kitchen operations and inventory'
    },
    {
      name: 'tables',
      allowedRoles: ['owner', 'admin', 'waiter'],
      description: 'Table management and reservations'
    },
    {
      name: 'inventory',
      allowedRoles: ['owner', 'admin', 'kitchen'],
      description: 'Inventory management and stock alerts'
    },
    {
      name: 'customers',
      allowedRoles: ['customer'],
      description: 'Customer-specific notifications'
    },
    {
      name: 'all_staff',
      allowedRoles: ['owner', 'admin', 'waiter', 'kitchen'],
      description: 'General staff communications'
    }
  ];

  constructor(io: SocketIOServer) {
    this.io = io;
    console.log('🏠 Room Manager initialized');
  }

  /**
   * Join user to appropriate rooms based on their role
   */
  public joinUserToRooms(socket: AuthenticatedSocket): void {
    const userRole = socket.userRole;
    const userId = socket.userId;

    // Store connected user
    this.connectedUsers.set(socket.id, socket);

    // Join user to role-specific room
    socket.join(`role:${userRole}`);
    console.log(`🏠 User ${socket.userEmail} joined role room: role:${userRole}`);

    // Join user to their personal room
    socket.join(`user:${userId}`);
    console.log(`🏠 User ${socket.userEmail} joined personal room: user:${userId}`);

    // Join user to appropriate functional rooms
    this.ROOMS.forEach(room => {
      if (room.allowedRoles.includes(userRole)) {
        socket.join(room.name);
        console.log(`🏠 User ${socket.userEmail} joined room: ${room.name}`);
      }
    });

    // Emit user connection event to admin room
    this.emitToRoom('admin', 'user:connected', {
      userId: socket.userId,
      email: socket.userEmail,
      role: socket.userRole,
      timestamp: new Date().toISOString()
    });

    // Send welcome message to user
    socket.emit('connection:welcome', {
      message: 'Connected to PAMBAZO real-time system',
      rooms: this.getUserRooms(socket),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle user disconnection
   */
  public handleUserDisconnection(socket: AuthenticatedSocket): void {
    // Remove from connected users
    this.connectedUsers.delete(socket.id);

    // Emit user disconnection event to admin room
    this.emitToRoom('admin', 'user:disconnected', {
      userId: socket.userId,
      email: socket.userEmail,
      role: socket.userRole,
      timestamp: new Date().toISOString()
    });

    console.log(`🏠 User ${socket.userEmail} left all rooms`);
  }

  /**
   * Get list of rooms a user has access to
   */
  public getUserRooms(socket: AuthenticatedSocket): string[] {
    const userRole = socket.userRole;
    const rooms = [`role:${userRole}`, `user:${socket.userId}`];

    this.ROOMS.forEach(room => {
      if (room.allowedRoles.includes(userRole)) {
        rooms.push(room.name);
      }
    });

    return rooms;
  }

  /**
   * Emit event to specific room
   */
  public emitToRoom(roomName: string, event: string, data: any): void {
    this.io.to(roomName).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
      room: roomName
    });
  }

  /**
   * Emit event to multiple rooms
   */
  public emitToRooms(roomNames: string[], event: string, data: any): void {
    roomNames.forEach(roomName => {
      this.emitToRoom(roomName, event, data);
    });
  }

  /**
   * Emit event to users with specific roles
   */
  public emitToRoles(roles: string[], event: string, data: any): void {
    roles.forEach(role => {
      this.emitToRoom(`role:${role}`, event, data);
    });
  }

  /**
   * Emit event to specific user
   */
  public emitToUser(userId: string, event: string, data: any): void {
    this.emitToRoom(`user:${userId}`, event, {
      ...data,
      timestamp: new Date().toISOString(),
      targetUser: userId
    });
  }

  /**
   * Get connected users count by role
   */
  public getConnectedUsersByRole(): Record<string, number> {
    const roleCount: Record<string, number> = {
      owner: 0,
      admin: 0,
      waiter: 0,
      kitchen: 0,
      customer: 0
    };

    this.connectedUsers.forEach(socket => {
      const role = socket.userRole || 'customer';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });

    return roleCount;
  }

  /**
   * Get all connected users
   */
  public getConnectedUsers(): Array<{
    id: string;
    email: string;
    role: string;
    socketId: string;
  }> {
    return Array.from(this.connectedUsers.values()).map(socket => ({
      id: socket.userId,
      email: socket.userEmail,
      role: socket.userRole,
      socketId: socket.id
    }));
  }

  /**
   * Check if user is connected
   */
  public isUserConnected(userId: string): boolean {
    return Array.from(this.connectedUsers.values()).some(socket => socket.userId === userId);
  }

  /**
   * Get socket by user ID
   */
  public getSocketByUserId(userId: string): AuthenticatedSocket | undefined {
    return Array.from(this.connectedUsers.values()).find(socket => socket.userId === userId);
  }

  /**
   * Broadcast system message to all connected users
   */
  public broadcastSystemMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    this.io.emit('system:message', {
      message,
      level,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get room statistics
   */
  public getRoomStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    this.ROOMS.forEach(room => {
      const sockets = this.io.sockets.adapter.rooms.get(room.name);
      stats[room.name] = sockets ? sockets.size : 0;
    });

    return stats;
  }

  /**
   * Validate if user has access to room
   */
  public hasRoomAccess(userRole: string, roomName: string): boolean {
    const room = this.ROOMS.find(r => r.name === roomName);
    return room ? room.allowedRoles.includes(userRole) : false;
  }

  /**
   * Update user status
   */
  public updateUserStatus(userId: string, status: string): void {
    this.userStatuses.set(userId, status);
    console.log(`👤 User ${userId} status updated to: ${status}`);
  }

  /**
   * Get online users
   */
  public getOnlineUsers(): any[] {
    return this.getConnectedUsers().map(user => ({
      ...user,
      status: this.userStatuses.get(user.id) || 'online'
    }));
  }
}
