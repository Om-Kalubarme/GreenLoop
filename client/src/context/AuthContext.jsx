import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchCurrentUser, updateUserProfile } from '../api/auth.api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('resource_ai_token'));
  const [loading, setLoading] = useState(true);

  // Hydrate user session on mount
  useEffect(() => {
    const hydrateUser = async () => {
      const storedToken = localStorage.getItem('resource_ai_token');
      if (storedToken) {
        try {
          const res = await fetchCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[AuthContext] Session invalid or expired:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    hydrateUser();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('resource_ai_token', res.token);
      localStorage.setItem('resource_ai_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    if (res.success && res.token) {
      localStorage.setItem('resource_ai_token', res.token);
      localStorage.setItem('resource_ai_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('resource_ai_token');
    localStorage.removeItem('resource_ai_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await updateUserProfile(profileData);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('resource_ai_user', JSON.stringify(res.user));
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isDonor: user?.role === 'donor' || user?.role === 'admin',
        isRecipient: user?.role === 'recipient' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout,
        updateProfile,
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

export default AuthContext;
