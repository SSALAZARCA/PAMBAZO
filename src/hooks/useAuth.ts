/**
 * Authentication Hook
 * Manages user authentication state and operations
 */
import { useState, useEffect, useCallback } from 'react';
import { authAPI, setAuthToken, getAuthToken, type User } from '../services/api';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadUsers = useStore(state => state.loadUsers);

  // Helper function to load users if user has permissions
  const loadUsersIfAuthorized = useCallback(async (user: User) => {
    if (user.role === 'admin' || user.role === 'owner') {
      try {
        await loadUsers();
      } catch (error) {
        console.error('Error loading users:', error);
      }
    }
  }, [loadUsers]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();

      if (!token) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      try {
        const response = await authAPI.getProfile();

        if (response.success && response.data) {
          setAuthState({
            user: response.data,
            isLoading: false,
            isAuthenticated: true,
          });

          // Load users if user has permissions
          await loadUsersIfAuthorized(response.data);
        } else {
          // Invalid token, clear it
          setAuthToken(null);
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthToken(null);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);


  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await authAPI.login(email, password);

      if (response.success && response.data?.tokens?.accessToken && response.data?.user) {
        setAuthToken(response.data.tokens.accessToken);

        // Map API user to Shared user (dates)
        const mappedUser: User = {
          ...response.data.user,
          ...(response.data.user.createdAt && { createdAt: new Date(response.data.user.createdAt) }),
          ...(response.data.user.lastLogin && { lastLogin: new Date(response.data.user.lastLogin) }),
          role: response.data.user.role as any // Ensure role matches
        };

        setAuthState({
          user: mappedUser,
          isLoading: false,
          isAuthenticated: true,
        });

        // Load users if user has permissions
        await loadUsersIfAuthorized(mappedUser);

        toast.success(`¡Bienvenido, ${mappedUser.name}!`);
        return true;
      } else {
        toast.error(response.error || 'Error al iniciar sesión');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error de conexión. Intenta nuevamente.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [loadUsersIfAuthorized]);

  const register = useCallback(async (name: string, email: string, password: string, role?: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await authAPI.register(name, email, password, role);

      if (response.success && response.data?.tokens?.accessToken && response.data?.user) {
        setAuthToken(response.data.tokens.accessToken);

        const mappedUser: User = {
          ...response.data.user,
          ...(response.data.user.createdAt && { createdAt: new Date(response.data.user.createdAt) }),
          ...(response.data.user.lastLogin && { lastLogin: new Date(response.data.user.lastLogin) }),
          role: response.data.user.role as any
        };

        setAuthState({
          user: mappedUser,
          isLoading: false,
          isAuthenticated: true,
        });

        // Load users if user has permissions
        await loadUsersIfAuthorized(mappedUser);

        toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${mappedUser.name}!`);
        return true;
      } else {
        toast.error(response.error || 'Error al crear la cuenta');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Error de conexión. Intenta nuevamente.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [loadUsersIfAuthorized]);

  const logout = useCallback(() => {
    // Call logout endpoint (fire and forget)
    authAPI.logout().catch(console.error);

    // Clear local state
    setAuthToken(null);
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    toast.success('Sesión cerrada exitosamente');
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await authAPI.updateProfile(data);

      if (response.success && response.data?.user) {
        const mappedUser: User = {
          ...response.data.user,
          ...(response.data.user.createdAt && { createdAt: new Date(response.data.user.createdAt) }),
          ...(response.data.user.lastLogin && { lastLogin: new Date(response.data.user.lastLogin) }),
          role: response.data.user.role as any
        };

        setAuthState(prev => ({
          ...prev,
          user: mappedUser,
        }));

        toast.success('Perfil actualizado exitosamente');
        return true;
      } else {
        toast.error(response.error || 'Error al actualizar el perfil');
        return false;
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Error de conexión. Intenta nuevamente.');
      return false;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);

      if (response.success) {
        toast.success('Contraseña cambiada exitosamente');
        return true;
      } else {
        toast.error(response.error || 'Error al cambiar la contraseña');
        return false;
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Error de conexión. Intenta nuevamente.');
      return false;
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      const response = await authAPI.getProfile();

      if (response.success && response.data) {
        const mappedUser: User = {
          ...response.data,
          ...(response.data.createdAt && { createdAt: new Date(response.data.createdAt) }),
          ...(response.data.lastLogin && { lastLogin: new Date(response.data.lastLogin) }),
          role: response.data.role as any
        };

        setAuthState(prev => ({
          ...prev,
          user: mappedUser,
        }));
      }
    } catch (error) {
      console.error('Refresh profile error:', error);
    }
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshProfile,
  };
};


export default useAuth;