import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, fetchCurrentUser, updateUserProfile, changeUserPassword, oauthLoginUser } from '../api/auth.api.js';
import { supabase, isSupabaseConfigured, signInWithGoogle, signInWithMicrosoft } from '../api/supabase.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'greenloop_token';
const USER_KEY = 'greenloop_user';
const OAUTH_KEY = 'greenloop_oauth_in_progress';

const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem('resource_ai_token');
const setStoredSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // also keep legacy key for backward safety
  localStorage.setItem('resource_ai_token', token);
  localStorage.setItem('resource_ai_user', JSON.stringify(user));
};
const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('resource_ai_token');
  localStorage.removeItem('resource_ai_user');
  sessionStorage.removeItem(OAUTH_KEY);
  sessionStorage.removeItem('resource_ai_oauth_in_progress');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  // Sync Supabase OAuth user with GreenLoop backend
  const syncOAuthUser = useCallback(async (supabaseUser) => {
    try {
      const email = supabaseUser.email;
      const name = 
        supabaseUser.user_metadata?.full_name || 
        supabaseUser.user_metadata?.name || 
        supabaseUser.email?.split('@')[0];
      const provider = supabaseUser.app_metadata?.provider || 'oauth';

      const res = await oauthLoginUser({ email, name, provider });
      if (res.success && res.token) {
        setStoredSession(res.token, res.user);
        setToken(res.token);
        setUser(res.user);
        sessionStorage.removeItem(OAUTH_KEY);
        sessionStorage.removeItem('resource_ai_oauth_in_progress');
        return res.user;
      }
    } catch (err) {
      console.error('[AuthContext] OAuth backend sync failed:', err);
      sessionStorage.removeItem(OAUTH_KEY);
      sessionStorage.removeItem('resource_ai_oauth_in_progress');
    }
    return null;
  }, []);

  // Hydrate user session on mount
  useEffect(() => {
    const hydrateUser = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const res = await fetchCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
            setStoredSession(storedToken, res.user);
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

  // Listen for Supabase OAuth callback ONLY when OAuth flow was initiated
  useEffect(() => {
    if (!supabase) return;

    const isOAuthReturn = 
      window.location.hash.includes('access_token') || 
      window.location.search.includes('code=') ||
      sessionStorage.getItem(OAUTH_KEY) === 'true' ||
      sessionStorage.getItem('resource_ai_oauth_in_progress') === 'true';

    if (isOAuthReturn) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          syncOAuthUser(session.user);
        }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const activeOAuth = 
        sessionStorage.getItem(OAUTH_KEY) === 'true' ||
        sessionStorage.getItem('resource_ai_oauth_in_progress') === 'true' ||
        window.location.hash.includes('access_token') ||
        window.location.search.includes('code=');

      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user?.email && activeOAuth) {
        await syncOAuthUser(session.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [syncOAuthUser]);

  const login = async (email, password) => {
    sessionStorage.removeItem(OAUTH_KEY);
    sessionStorage.removeItem('resource_ai_oauth_in_progress');
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // ignore
      }
    }
    const res = await loginUser({ email, password });
    if (res.success && res.token) {
      setStoredSession(res.token, res.user);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    sessionStorage.removeItem(OAUTH_KEY);
    sessionStorage.removeItem('resource_ai_oauth_in_progress');
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // ignore
      }
    }
    const res = await registerUser(userData);
    if (res.success && res.token) {
      setStoredSession(res.token, res.user);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // ignore
      }
    }
    clearStoredSession();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await updateUserProfile(profileData);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      localStorage.setItem('resource_ai_user', JSON.stringify(res.user));
    }
    return res;
  };

  const updatePreferences = async (prefs) => {
    return await updateProfile(prefs);
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await changeUserPassword({ currentPassword, newPassword });
  };

  const loginWithGoogle = async () => {
    sessionStorage.setItem(OAUTH_KEY, 'true');
    sessionStorage.setItem('resource_ai_oauth_in_progress', 'true');
    return await signInWithGoogle();
  };

  const loginWithMicrosoft = async () => {
    sessionStorage.setItem(OAUTH_KEY, 'true');
    sessionStorage.setItem('resource_ai_oauth_in_progress', 'true');
    return await signInWithMicrosoft();
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
        isSupabaseConfigured,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
        changePassword,
        loginWithGoogle,
        loginWithMicrosoft,
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
