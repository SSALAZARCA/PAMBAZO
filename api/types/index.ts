/**
 * Backend type definitions
 * These types are used specifically for backend operations and database models
 */
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  userRole: 'owner' | 'admin' | 'waiter' | 'kitchen' | 'customer';
  userEmail: string;
  userName?: string;
}

// Backend User interface (different from frontend User)
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  password: string; // For backend operations
  role: 'owner' | 'admin' | 'waiter' | 'baker' | 'employee' | 'customer';
  phone?: string;
  address?: string;
  avatar?: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Backend Category interface
export interface BackendCategory {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Backend Product interface
export interface BackendProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Backend Order interface
export interface BackendOrder {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Backend OrderItem interface
export interface BackendOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// Backend InventoryItem interface
export interface BackendInventoryItem {
  id: number;
  product_id: number;
  quantity: number;
  min_stock: number;
  max_stock: number;
  last_updated: string;
}

// Backend Table interface
export interface BackendTable {
  id: number;
  table_number: number;
  capacity: number;
  location?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Type conversion utilities
export const convertToFrontendUser = (backendUser: BackendUser) => {
  return {
    id: backendUser.id.toString(),
    name: backendUser.name,
    email: backendUser.email,
    role: backendUser.role,
    avatar: backendUser.avatar,
    phone: backendUser.phone,
    loyaltyPoints: backendUser.loyaltyPoints || 0,
    loyaltyTier: backendUser.loyaltyTier || 'bronze',
    createdAt: backendUser.created_at
  };
};
