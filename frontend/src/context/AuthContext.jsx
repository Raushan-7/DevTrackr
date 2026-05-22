import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('devtrackr_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to load user session:', err);
      localStorage.removeItem('devtrackr_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('devtrackr_token', token);
      setUser(userData);
      // Immediately reload detailed info to fetch github connection status
      await fetchCurrentUser();
      return userData;
    } catch (err) {
      throw err.response?.data?.message || 'Login failed. Please try again.';
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('devtrackr_token', token);
      setUser(userData);
      await fetchCurrentUser();
      return userData;
    } catch (err) {
      throw err.response?.data?.message || 'Signup failed. Please try again.';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('devtrackr_token');
    setUser(null);
  };

  const updateGithubToken = async (token) => {
    try {
      const response = await api.post('/auth/github-token', { token });
      await fetchCurrentUser();
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to update GitHub token.';
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateGithubToken,
    refreshUser: fetchCurrentUser,
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
