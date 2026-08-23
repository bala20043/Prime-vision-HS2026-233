import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, GraduationCap } from 'lucide-react';
import { useLanguage } from '../App';

import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

const navLinks = [
  { key: 'navHome', path: '/' },
  { key: 'navAssistant', path: '/assistant' },
  { key: 'navKnowledge', path: '/knowledge' },
  { key: 'navEvaluation', path: '/evaluation' },
  { key: 'navAbout', path: '/about' },
];

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (isAuthenticated && (user?.email === 'collegeofcom@gmail.com' || user?.role === 'admin')) {
      navigate('/admin');
    } else {
      navigate('/login?admin=true');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-ink text-parchment border-b border-parchment/10">
      <div className="page-container flex items-center justify-between h-24 py-3">
        {/* Logo — Click/Double-click opens Admin Page for collegeofcom@gmail.com */}
        <button
          onClick={handleLogoClick}
          onDoubleClick={handleLogoClick}
          className="flex items-center gap-3.5 text-parchment cursor-pointer bg-transparent border-0 p-0 text-left focus:outline-none"
          title="Click to open Admin Page"
        >
          <GraduationCap size={36} className="text-gold" />
          <span className="font-display text-2xl font-bold tracking-tight">
            {t('brand')}
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3" aria-label="Main navigation">
          {navLinks.map(({ key, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={key}
                to={path}
                className={`relative px-5 py-3 text-xl font-bold transition-colors duration-200 rounded-card
                  ${isActive ? 'text-gold' : 'text-parchment/80 hover:text-parchment'}`}
              >
                {t(key)}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-5 right-5 h-1 bg-gold rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Language + User controls */}
        <div className="hidden md:flex items-center gap-6">
          {/* Language Selector */}
          <div className="flex items-center gap-2 text-lg font-bold">
            {languages.map((lang, i) => (
              <span key={lang.code} className="flex items-center">
                <button
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-button transition-colors duration-fast
                    ${language === lang.code
                      ? 'text-gold font-bold bg-parchment/10'
                      : 'text-parchment/60 hover:text-parchment'
                    }`}
                  aria-label={`Switch to ${lang.label}`}
                >
                  {lang.label}
                </button>
                {i < languages.length - 1 && (
                  <span className="text-parchment/30 mx-0.5">|</span>
                )}
              </span>
            ))}
          </div>

          {/* User Menu or Login/SignUp */}
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-5 py-3 text-parchment/90 hover:text-parchment text-xl font-bold no-underline"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 bg-gold text-ink text-xl font-bold
                           rounded-card hover:bg-gold/90 transition-all duration-fast
                           active:scale-[1.02] no-underline shadow-md"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-parchment"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-indigo-deep border-t border-parchment/10 overflow-hidden"
          >
            <nav className="page-container py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map(({ key, path }) => (
                <Link
                  key={key}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-button text-small font-medium transition-colors
                    ${location.pathname === path
                      ? 'text-gold bg-parchment/5'
                      : 'text-parchment/80 hover:text-parchment hover:bg-parchment/5'
                    }`}
                >
                  {t(key)}
                </Link>
              ))}

              {/* Mobile Language Selector */}
              <div className="flex items-center gap-2 px-3 py-2 mt-2 border-t border-parchment/10">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-1 rounded text-micro transition-colors
                      ${language === lang.code
                        ? 'text-gold font-medium bg-parchment/10'
                        : 'text-parchment/60 hover:text-parchment'
                      }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <Link
                to="/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="mx-3 mt-2 text-center px-4 py-2.5 bg-indigo text-parchment text-small font-medium
                           rounded-button hover:bg-indigo-deep transition-colors no-underline"
              >
                {t('askQuestion')}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
