import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getApiUrl } from '../config';

interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    const apiUrl = getApiUrl();
    const redirectUrl = encodeURIComponent(
      `${window.location.pathname}${window.location.search}${window.location.hash}` || '/',
    );

    window.location.href = `${apiUrl}/auth/login?redirect_url=${redirectUrl}`;
  };

  const logout = () => {
    const apiUrl = getApiUrl();
    // Call backend to clear HttpOnly cookie
    fetch(`${apiUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      setUser(null);
      // Optional: Redirect to home or login
      window.location.href = '/';
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
