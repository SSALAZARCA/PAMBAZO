import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: {
            id: string;
            email: string;
            username: string;
            role: string;
            first_name: string;
            last_name: string;
        };
        accessToken: string;
        refreshToken: string;
    };
}

class AuthService {
    private refreshTokenPromise: Promise<string> | null = null;

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await axios.post<AuthResponse>(`${API_URL}/api/v1/auth/login`, credentials);

        if (response.data.success) {
            this.setTokens(response.data.data.accessToken, response.data.data.refreshToken);
            this.setUser(response.data.data.user);
        }

        return response.data;
    }

    async register(userData: any): Promise<AuthResponse> {
        const response = await axios.post<AuthResponse>(`${API_URL}/api/v1/auth/register`, userData);

        if (response.data.success) {
            this.setTokens(response.data.data.accessToken, response.data.data.refreshToken);
            this.setUser(response.data.data.user);
        }

        return response.data;
    }

    async refreshAccessToken(): Promise<string> {
        // Prevent multiple simultaneous refresh requests
        if (this.refreshTokenPromise) {
            return this.refreshTokenPromise;
        }

        this.refreshTokenPromise = this._performRefresh();

        try {
            const newToken = await this.refreshTokenPromise;
            return newToken;
        } finally {
            this.refreshTokenPromise = null;
        }
    }

    private async _performRefresh(): Promise<string> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/api/v1/auth/refresh`, {
                refreshToken
            });

            if (response.data.success) {
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                this.setTokens(accessToken, newRefreshToken);
                return accessToken;
            }

            throw new Error('Failed to refresh token');
        } catch (error) {
            // If refresh fails, logout user
            this.logout();
            throw error;
        }
    }

    async logout(): Promise<void> {
        const refreshToken = this.getRefreshToken();

        try {
            if (refreshToken) {
                await axios.post(`${API_URL}/api/v1/auth/logout`, { refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearTokens();
            this.clearUser();
        }
    }

    getAccessToken(): string | null {
        return localStorage.getItem('token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    getUser(): any {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }

    private setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    private setUser(user: any): void {
        localStorage.setItem('user', JSON.stringify(user));
    }

    private clearTokens(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    }

    private clearUser(): void {
        localStorage.removeItem('user');
    }
}

export const authService = new AuthService();
