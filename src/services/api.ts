/**
 * API Service
 * Centralized service for all HTTP requests to the backend
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api/v1';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[] | {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

import { User, UserRole } from '../../shared/types';
export type { User, UserRole };

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  preparation_time?: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
  ingredients?: ProductIngredient[];
}

export interface ProductIngredient {
  id: string;
  product_id: string;
  ingredient_name: string;
  quantity?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface Order {
  id: string;
  user_id?: string;
  table_id?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  table_number?: number;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  product_name?: string;
}

export interface RestaurantTable {
  id: string;
  table_number: number;
  capacity: number;
  location?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  current_order?: Order;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  product_id?: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  unit: string;
  cost_per_unit?: number;
  supplier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  product_name?: string;
}

export interface InventoryMovement {
  id: string;
  inventory_id: string;
  movement_type: 'in' | 'out';
  quantity: number;
  reason: string;
  user_id: string;
  cost_per_unit?: number;
  created_at: string;
  item_name?: string;
  user_name?: string;
}

// Auth token management
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => authToken;

// HTTP client with auth headers
const apiClient = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - clear token and redirect to login
  if (response.status === 401) {
    setAuthToken(null);
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response;
};

// Generic API methods
const get = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  const response = await apiClient(endpoint);
  return response.json();
};

const post = async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
  const response = await apiClient(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : null,
  });
  return response.json();
};

const put = async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
  const response = await apiClient(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : null,
  });
  return response.json();
};

const patch = async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
  const response = await apiClient(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : null,
  });
  return response.json();
};

const del = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  const response = await apiClient(endpoint, {
    method: 'DELETE',
  });
  return response.json();
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    post<{ user: User; tokens: { accessToken: string; refreshToken: string; expiresIn: number } }>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string, role?: string) =>
    post<{ user: User; tokens: { accessToken: string; refreshToken: string; expiresIn: number } }>('/auth/register', { name, email, password, role }),

  getProfile: () =>
    get<User>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    put<{ user: User }>('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    put('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),

  logout: () =>
    post('/auth/logout'),
};

// Products API
export const productsAPI = {
  getAll: (params?: { category?: string; available?: boolean; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.available !== undefined) searchParams.append('available', params.available.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    return get<PaginatedResponse<Product>>(`/products${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    get<{ product: Product }>(`/products/${id}`),

  create: (data: Partial<Product> & { ingredients?: string[] }) =>
    post<{ product: Product }>('/products', data),

  update: (id: string, data: Partial<Product> & { ingredients?: string[] }) =>
    put<{ product: Product }>(`/products/${id}`, data),

  delete: (id: string) =>
    del(`/products/${id}`),

  toggleAvailability: (id: string) =>
    patch<{ product: Product }>(`/products/${id}/availability`),
};

// Categories API
export const categoriesAPI = {
  getAll: (params?: { active?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.active !== undefined) searchParams.append('active', params.active.toString());

    const query = searchParams.toString();
    return get<{ categories: Category[] }>(`/categories${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    get<{ category: Category }>(`/categories/${id}`),

  create: (data: Partial<Category>) =>
    post<{ category: Category }>('/categories', data),

  update: (id: string, data: Partial<Category>) =>
    put<{ category: Category }>(`/categories/${id}`, data),

  delete: (id: string) =>
    del(`/categories/${id}`),

  toggleStatus: (id: string) =>
    patch<{ category: Category }>(`/categories/${id}/status`),
};

// Orders API
export const ordersAPI = {
  getAll: (params?: { status?: string; table?: string; user?: string; start_date?: string; end_date?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.table) searchParams.append('table', params.table);
    if (params?.user) searchParams.append('user', params.user);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    return get<PaginatedResponse<Order>>(`/orders${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    get<{ order: Order }>(`/orders/${id}`),

  create: (data: { items: { product_id: string; quantity: number; notes?: string }[]; table_id?: string; order_type: string; customer_name?: string; notes?: string }) =>
    post<{ order: Order }>('/orders', data),

  updateStatus: (id: string, status: string) =>
    patch<{ order: Order }>(`/orders/${id}/status`, { status }),

  cancel: (id: string) =>
    del(`/orders/${id}`),

  getStats: (params?: { start_date?: string; end_date?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);

    const query = searchParams.toString();
    return get(`/orders/stats/overview${query ? `?${query}` : ''}`);
  },
};

// Tables API
export const tablesAPI = {
  getAll: (params?: { available_only?: boolean; capacity_min?: number; capacity_max?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.available_only !== undefined) searchParams.append('available_only', params.available_only.toString());
    if (params?.capacity_min) searchParams.append('capacity_min', params.capacity_min.toString());
    if (params?.capacity_max) searchParams.append('capacity_max', params.capacity_max.toString());

    const query = searchParams.toString();
    return get<{ tables: RestaurantTable[] }>(`/tables${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    get<{ table: RestaurantTable }>(`/tables/${id}`),

  create: (data: Partial<RestaurantTable>) =>
    post<{ table: RestaurantTable }>('/tables', data),

  update: (id: string, data: Partial<RestaurantTable>) =>
    put<{ table: RestaurantTable }>(`/tables/${id}`, data),

  delete: (id: string) =>
    del(`/tables/${id}`),

  toggleAvailability: (id: string, is_available: boolean) =>
    patch<{ table: RestaurantTable }>(`/tables/${id}/availability`, { is_available }),

  getStats: () =>
    get('/tables/stats/overview'),
};

// Inventory API
export const inventoryAPI = {
  getAll: (params?: { low_stock?: boolean; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.low_stock !== undefined) searchParams.append('low_stock', params.low_stock.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    return get<PaginatedResponse<InventoryItem>>(`/inventory${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    get<{ item: InventoryItem }>(`/inventory/${id}`),

  create: (data: Partial<InventoryItem>) =>
    post<{ item: InventoryItem }>('/inventory', data),

  update: (id: string, data: Partial<InventoryItem>) =>
    put<{ item: InventoryItem }>(`/inventory/${id}`, data),

  delete: (id: string) =>
    del(`/inventory/${id}`),

  updateStock: (id: string, quantity: number, movement_type: 'in' | 'out', reason: string, cost_per_unit?: number) =>
    patch(`/inventory/${id}/stock`, { quantity, movement_type, reason, cost_per_unit }),

  getMovements: (params?: { inventory_id?: string; movement_type?: string; start_date?: string; end_date?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.inventory_id) searchParams.append('inventory_id', params.inventory_id);
    if (params?.movement_type) searchParams.append('movement_type', params.movement_type);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    return get<PaginatedResponse<InventoryMovement>>(`/inventory/movements${query ? `?${query}` : ''}`);
  },

  getLowStockAlerts: () =>
    get<{ low_stock_items: InventoryItem[]; count: number }>('/inventory/alerts/low-stock'),
};

// Users API
export const usersAPI = {
  getAll: (params?: { search?: string; role?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    return get<PaginatedResponse<User>>(`/users${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    get<{ user: User }>(`/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    put<{ user: User }>(`/users/${id}`, data),

  delete: (id: string) =>
    del(`/users/${id}`),
};

export default {
  auth: authAPI,
  products: productsAPI,
  categories: categoriesAPI,
  orders: ordersAPI,
  tables: tablesAPI,
  inventory: inventoryAPI,
  users: usersAPI,
};