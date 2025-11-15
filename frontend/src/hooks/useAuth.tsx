import { createContext, useContext, useState, ReactNode } from 'react';
import { apiClient } from '../api/client';

interface User {
  id: string;
  email: string;
  role: string;
  orgId: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('auth_token')
  );
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const data = response.data;
      
      if (!data.token || !data.user) {
        throw new Error('Invalid response from server');
      }
      
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('auth_token', data.token);
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check if the server is running.');
      }
      if (error.response) {
        const errorMessage = error.response?.data?.error?.message || 'Login failed';
        throw new Error(errorMessage);
      }
      if (error.request) {
        throw new Error('Unable to connect to server. Please check if the API gateway is running.');
      }
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

