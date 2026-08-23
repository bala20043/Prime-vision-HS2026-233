import { createContext, useContext, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import translations from './data/translations';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Home from './pages/Home';
import Assistant from './pages/Assistant';
import Knowledge from './pages/Knowledge';
import Evaluation from './pages/Evaluation';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// ── Language Context ──
const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const t = useCallback((key) => {
    return translations[language]?.[key] || translations.en?.[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Toast Banner ──
function ToastNotification() {
  const { toastMessage } = useAuth();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="px-5 py-3.5 bg-ink text-parchment border border-gold/40 rounded-card shadow-elevated
                   font-body text-small flex items-center gap-3"
      >
        <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        <span>{toastMessage}</span>
      </motion.div>
    </div>
  );
}

// ── Animated Routes ──
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />

        {/* Protected Routes */}
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <Assistant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/knowledge"
          element={
            <ProtectedRoute>
              <Knowledge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluation"
          element={
            <ProtectedRoute>
              <Evaluation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

// ── App ──
export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-parchment">
            <Header />
            <AnimatedRoutes />
            <ToastNotification />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
