import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { syncGoogleUser, getCurrentUser } from '../services/authApi';

export default function AuthCallback() {
  const [statusText, setStatusText] = useState('Verifying Google Identity...');
  const [errorMessage, setErrorMessage] = useState('');
  const { saveUserSession, showToast } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    let authSubscription = null;

    async function processCallback() {
      try {
        setStatusText('Verifying Google authorization...');

        // 1. Check if Supabase OAuth created a session
        if (supabase && supabase.auth) {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.warn('Supabase getSession notice:', error.message);
          }

          if (session?.user && isMounted) {
            const googleId = session.user.id;
            const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Google Student';
            const email = session.user.email;

            setStatusText(`Establishing session for ${email}...`);

            const syncRes = await syncGoogleUser({
              id: googleId,
              name: name,
              email: email,
              google_id: googleId
            });

            const userObj = syncRes?.user || {
              id: googleId,
              name: name,
              email: email,
              auth_provider: 'google',
              role: 'student'
            };

            saveUserSession(userObj);

            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }

            showToast(`Welcome, ${name.split(' ')[0]} 👋`);
            navigate('/assistant', { replace: true });
            return;
          }

          // 2. Subscribe to auth state change to capture incoming OAuth session
          const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user && isMounted) {
              const googleId = session.user.id;
              const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Google Student';
              const email = session.user.email;

              setStatusText(`Establishing session for ${email}...`);

              const syncRes = await syncGoogleUser({
                id: googleId,
                name: name,
                email: email,
                google_id: googleId
              });

              const userObj = syncRes?.user || {
                id: googleId,
                name: name,
                email: email,
                auth_provider: 'google',
                role: 'student'
              };

              saveUserSession(userObj);

              if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname);
              }

              showToast(`Welcome, ${name.split(' ')[0]} 👋`);
              navigate('/assistant', { replace: true });
            }
          });
          authSubscription = listener?.subscription;
        }

        // 3. Check if Backend session cookie exists
        const currentUser = await getCurrentUser();
        if (currentUser && isMounted) {
          saveUserSession(currentUser);
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          showToast(`Welcome back, ${currentUser.name.split(' ')[0]} 👋`);
          navigate('/assistant', { replace: true });
          return;
        }

        // 4. Check from localStorage if already saved
        const saved = localStorage.getItem('college_user');
        if (saved && isMounted) {
          try {
            const parsed = JSON.parse(saved);
            saveUserSession(parsed);
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }
            showToast(`Welcome, ${parsed.name.split(' ')[0]} 👋`);
            navigate('/assistant', { replace: true });
            return;
          } catch (e) {}
        }

      } catch (err) {
        console.error('Auth callback processing error:', err);
        if (isMounted) {
          setErrorMessage('Google authentication could not be completed. Please try again.');
        }
      }
    }

    processCallback();

    return () => {
      isMounted = false;
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, [navigate, saveUserSession, showToast]);

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface rounded-card p-8 max-w-md w-full border border-hairline shadow-elevated text-center"
      >
        <div className="w-16 h-16 rounded-full bg-indigo/10 text-indigo mx-auto mb-4 flex items-center justify-center">
          {errorMessage ? (
            <AlertCircle size={32} className="text-error-rust" />
          ) : (
            <GraduationCap size={32} className="text-gold" />
          )}
        </div>

        {errorMessage ? (
          <>
            <h2 className="font-display text-h3 text-ink mb-2">Authentication Error</h2>
            <p className="text-small text-muted-text mb-6">{errorMessage}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full py-3 px-4 bg-indigo text-parchment rounded-button font-medium hover:bg-indigo-deep transition-all"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <h2 className="font-display text-h3 text-ink mb-2">Signing you in...</h2>
            <p className="text-small text-muted-text mb-6">{statusText}</p>
            <div className="flex justify-center">
              <RefreshCw size={24} className="animate-spin text-indigo" />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
