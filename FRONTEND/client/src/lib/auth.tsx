import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authAPI } from './api';

export interface User {
  nip: string;
  nama: string;
  role: 'admin' | 'guru' | 'kepsek';
  jurusan?: string;
  kelas?: string[];
  mapel?: string[];
}

interface AuthContextType {
  currentUser: User | null;
  login: (nip: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (nip: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authAPI.login({ nip, password });
      
      if (response.success && response.user) {
        setCurrentUser(response.user);
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        
        // Save token if provided
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login gagal' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat login' 
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
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
