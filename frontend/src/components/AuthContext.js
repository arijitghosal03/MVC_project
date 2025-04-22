import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
          const { user, token } = JSON.parse(storedAuth);
          setUser(user);
          setToken(token);
        }
      } catch (error) {
        console.error('Failed to load auth from storage:', error);
        localStorage.removeItem('auth');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const isAuthenticated = !!token;

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        
      });

      if (!response.ok) {
         console.log('User logged in:', user, token);
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      const { user, token } = data;

      // Save to localStorage
      localStorage.setItem('auth', JSON.stringify({ user, token }));
      console.log('User logged in:', user, token);
      // Update state
      setUser(user);
      setToken(token);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
