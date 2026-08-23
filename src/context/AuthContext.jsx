import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser, syncGoogleUser } from '../services/authApi';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('college_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem('college_user');
    } catch (e) {
      return false;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const saveUserSession = useCallback((userData) => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('college_user', JSON.stringify(userData));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }
  }, []);

  const clearUserSession = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('college_user');
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }
  }, []);

  const handleGoogleSession = useCallback(async (sessionUser) => {
    if (!sessionUser) return;
    const name = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || 'Google User';
    const email = sessionUser.email;
    const googleId = sessionUser.id;

    const formattedUser = {
      id: googleId,
      name: name,
      email: email,
      auth_provider: 'google'
    };

    saveUserSession(formattedUser);

    // Sync to backend and Supabase Table Editor
    await syncGoogleUser({
      id: googleId,
      name: name,
      email: email,
      google_id: googleId
    });
  }, [saveUserSession]);

  // Check initial session & listen for Google OAuth return
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        // 1. Check Supabase OAuth Session
        if (supabase && supabase.auth) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            await handleGoogleSession(session.user);
            setIsLoading(false);
            return;
          }
        }

        // 2. Check Backend Session Cookie
        const currentUser = await getCurrentUser();
        if (isMounted) {
          if (currentUser) {
            saveUserSession(currentUser);
          } else {
            // Keep local stored session if offline, or sync if logged out
            const saved = localStorage.getItem('college_user');
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                setUser(parsed);
                setIsAuthenticated(true);
              } catch (e) {}
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          const saved = localStorage.getItem('college_user');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setUser(parsed);
              setIsAuthenticated(true);
            } catch (e) {}
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    // Listen for Supabase OAuth sign-in events
    let subscription = null;
    if (supabase && supabase.auth) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user && isMounted) {
          await handleGoogleSession(session.user);
        }
      });
      subscription = listener?.subscription;
    }

    return () => {
      isMounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [handleGoogleSession, saveUserSession]);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    if (response.success && response.user) {
      saveUserSession(response.user);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await registerUser(userData);
    if (response.success && response.user) {
      saveUserSession(response.user);
      showToast(response.message || 'Account created successfully. Welcome!');
    }
    return response;
  };

  const logout = async () => {
    if (supabase && supabase.auth) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut notice:', e);
      }
    }
    await logoutUser();
    clearUserSession();
    showToast('You have been logged out.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
