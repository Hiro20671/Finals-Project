import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('acadex_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and load authenticated user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('acadex_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me/');
          setUser(res.data);
          localStorage.setItem('acadex_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Failed to authenticate token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('acadex_token', receivedToken);
    localStorage.setItem('acadex_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (registrationData) => {
    const res = await api.post('/auth/register/', registrationData);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('acadex_token', receivedToken);
    localStorage.setItem('acadex_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout/');
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('acadex_token');
      localStorage.removeItem('acadex_user');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me/');
      setUser(res.data);
      localStorage.setItem('acadex_user', JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.error('Error refreshing user profile:', err);
    }
  };

  const isAdmin = user?.is_staff || user?.student_profile?.role === 'ADMIN';
  const isStudent = !isAdmin;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin,
        isStudent,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

