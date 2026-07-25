import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { User, ApiResponse, AuthResponseData } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
        setUser(response.data.data.user);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login', { email, password });
    const { user: loggedInUser, token: authToken } = response.data.data;
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(loggedInUser);
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/register', { name, email, password });
    const { user: registeredUser, token: authToken } = response.data.data;
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(registeredUser);
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
