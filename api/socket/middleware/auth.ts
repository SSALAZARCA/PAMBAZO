import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { AuthenticatedSocket } from '../../types/index.js';

interface JWTPayload {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'waiter' | 'kitchen' | 'customer';
  iat: number;
  exp: number;
}

export const authMiddleware = (socket: Socket, next: (err?: ExtendedError) => void) => {
  try {
    // Get token from handshake auth or query
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      console.warn('🔒 WebSocket connection rejected: No token provided');
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET not configured');
      return next(new Error('Server configuration error'));
    }

    const decoded = jwt.verify(token, jwtSecret as string) as JWTPayload;

    // Validate token payload
    if (!decoded.id || !decoded.email || !decoded.role) {
      console.warn('🔒 WebSocket connection rejected: Invalid token payload');
      return next(new Error('Invalid token payload'));
    }

    // Validate role
    const validRoles = ['owner', 'admin', 'waiter', 'kitchen', 'customer'];
    if (!validRoles.includes(decoded.role)) {
      console.warn(`🔒 WebSocket connection rejected: Invalid role ${decoded.role}`);
      return next(new Error('Invalid user role'));
    }

    // Attach user information to socket
    const authenticatedSocket = socket as AuthenticatedSocket;
    authenticatedSocket.userId = decoded.id;
    authenticatedSocket.userEmail = decoded.email;
    authenticatedSocket.userRole = decoded.role;

    console.log(`🔓 WebSocket authenticated: ${decoded.email} (${decoded.role})`);
    next();

  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.warn('🔒 WebSocket connection rejected: Invalid token');
      return next(new Error('Invalid authentication token'));
    }

    if (error instanceof jwt.TokenExpiredError) {
      console.warn('🔒 WebSocket connection rejected: Token expired');
      return next(new Error('Authentication token expired'));
    }

    console.error('❌ WebSocket authentication error:', error);
    return next(new Error('Authentication failed'));
  }
};

// Helper function to validate token without socket context
export const validateToken = (token: string): JWTPayload | null => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret as string) as JWTPayload;

    // Validate required fields
    if (!decoded.id || !decoded.email || !decoded.role) {
      return null;
    }

    // Validate role
    const validRoles = ['owner', 'admin', 'waiter', 'kitchen', 'customer'];
    if (!validRoles.includes(decoded.role)) {
      return null;
    }

    return decoded;
  } catch (error: any) {
    return null;
  }
};

// Helper function to check if user has permission for specific action
export const hasPermission = (
  userRole: string,
  requiredRoles: string[]
): boolean => {
  return requiredRoles.includes(userRole);
};

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  owner: ['owner', 'admin', 'waiter', 'kitchen', 'customer'],
  admin: ['admin', 'waiter', 'kitchen', 'customer'],
  waiter: ['waiter'],
  kitchen: ['kitchen'],
  customer: ['customer']
};

// Check if user role has access to target roles
export const canAccessRole = (userRole: string, targetRole: string): boolean => {
  const allowedRoles = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY];
  return allowedRoles ? allowedRoles.includes(targetRole) : false;
};
