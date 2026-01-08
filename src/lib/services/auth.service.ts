import { User } from '../features/auth/authSlice';
import { api } from '../api';

class AuthService {
  private tokenKey = 'token';
  private userKey = 'user';

  async login(credentials: { email: string; password: string }) {
    try {
      console.log('Attempting login:', credentials.email);
      
      const response = await api.post('/auth/login', credentials);
      
      if (!response.data.access_token || !response.data.user) {
        throw new Error('Invalid response from server');
      }
      
      console.log('Login successful:', response.data.user.email);
      this.setToken(response.data.access_token);
      this.setUser(response.data.user);
      return response.data;
    } catch (error: any) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      this.clearAuth();
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }

  async register(userData: { name: string; email: string; password: string }) {
    try {
      console.log('Attempting registration:', userData.email);
      
      const response = await api.post('/auth/register', userData);
      
      if (!response.data) {
        throw new Error('Invalid response from server');
      }
      
      console.log('Registration successful:', userData.email);
      return response.data;
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/users/me');
      if (response.data) {
        this.setUser(response.data);
      }
      return response.data;
    } catch (error: any) {
      console.warn('Profile refresh failed, using cached data');
      const cachedUser = this.getUser();
      if (cachedUser) {
        return cachedUser;
      }
      throw new Error('No user data available');
    }
  }

  logout(): void {
    this.clearAuth();
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        this.clearAuth();
        return null;
      }
    }
    return null;
  }

  setUser(user: User): void {
    if (typeof window !== 'undefined' && user) {
      try {
        localStorage.setItem(this.userKey, JSON.stringify(user));
      } catch (error) {
        console.error('Failed to save user to localStorage:', error);
      }
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN') || this.hasRole('SUPER_ADMIN');
  }

  isSuperAdmin(): boolean {
    return this.hasRole('SUPER_ADMIN');
  }
}

export const authService = new AuthService();