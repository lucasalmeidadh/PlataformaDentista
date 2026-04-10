import api from './api';
import type { LoginRequest, LoginResponse, RefreshTokenResponse, User } from '../core/domain/auth';

const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/Auth/Login', credentials);
    return response.data;
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/api/Auth/refresh-token');
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/api/Auth/Me');
    return response.data;
  },

  logout() {
    // Usually the server clears the cookie, but we must redirect to /login
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    // Since we use cookies, JS cannot easily check this.
    // For now, let's assume true if we got past the login, 
    // or the server will 401 us if not.
    return true; 
  },
};

export default authService;
