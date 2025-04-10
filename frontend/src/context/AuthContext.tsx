import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  login: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const userStr = localStorage.getItem('user');
      console.log('AuthContext: initializing with user from localStorage:', userStr);
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          console.log('AuthContext: parsed user data:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing initial user data:', error);
          setUser(null);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const login = (userData: User) => {
    console.log('AuthContext: login called with user:', userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log('AuthContext: user state updated to:', userData);
    return Promise.resolve();
  };

  const logout = () => {
    console.log('AuthContext: logout called');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    console.log('AuthContext: user state cleared');
  };

  // Добавляем эффект для логирования изменений состояния
  useEffect(() => {
    console.log('AuthContext: user state changed to:', user);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 