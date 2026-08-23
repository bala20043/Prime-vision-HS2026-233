import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import VerificationSeal from './VerificationSeal';
import { useLanguage } from '../App';

import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function Hero() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const headlineWords = t('heroTitle').split(' ');

  return (
    <section className="relative overflow-hidden bg-parchment">
      <div className="page-container py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div className="w-full">
            {/* Headline — word-by-word stagger */}
            <h1 className="font-display text-hero-mobile md:text-hero text-ink mb-6 leading-tight font-bold">
              {headlineWords.map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.3em]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.1 }
                      : { duration: 0.4, delay: 0.2 + i * 0.06, ease: 'easeOut' }
                  }
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Supporting text */}
            <motion.p
              className="text-muted-text mb-12 max-w-2xl leading-relaxed text-2xl md:text-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.1 }
                  : { duration: 0.4, delay: 0.2 + headlineWords.length * 0.06 + 0.15 }
              }
            >
              {t('heroSubtitle')}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-wrap gap-5 items-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.1 }
                  : { duration: 0.4, delay: 0.2 + headlineWords.length * 0.06 + 0.3 }
              }
            >
              <Link
                to="/assistant"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-indigo text-parchment
                           font-body font-bold text-2xl rounded-card min-h-[64px]
                           hover:bg-indigo-deep transition-all duration-fast
                           active:scale-[1.02] shadow-elevated no-underline hover:text-parchment"
              >
                {t('heroStart')}
                <ArrowRight size={26} />
              </Link>

              {!isAuthenticated && (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-3 px-9 py-5 bg-gold text-ink
                               font-body font-bold text-2xl rounded-card min-h-[64px]
                               hover:bg-gold/90 transition-all duration-fast
                               active:scale-[1.02] shadow-card no-underline"
                  >
                    <UserPlus size={24} />
                    Sign Up
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-surface text-ink
                               font-body font-bold text-2xl rounded-card min-h-[64px]
                               border-2 border-hairline hover:border-indigo
                               transition-all duration-fast no-underline shadow-sm"
                  >
                    <LogIn size={24} className="text-indigo" />
                    Login
                  </Link>
                </>
              )}

              <Link
                to="/knowledge"
                className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-transparent text-indigo
                           font-body font-bold text-2xl rounded-card min-h-[64px]
                           border-2 border-hairline hover:border-indigo
                           transition-all duration-fast no-underline"
              >
                <BookOpen size={24} />
                {t('heroExplore')}
              </Link>
            </motion.div>
          </div>

          {/* Right — Floating Chatbot Preview Card */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.1 }
                : { duration: 0.4, delay: 0.5, ease: 'easeOut' }
            }
          >
            <div className="bg-surface rounded-card shadow-card p-7 max-w-xl ml-auto border border-hairline/50">
              {/* Mock conversation */}
              <div className="space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-indigo text-parchment px-4 py-2.5 rounded-card rounded-br-sm text-small max-w-xs">
                    What is the minimum attendance requirement?
                  </div>
                </div>

                <hr className="hairline" />

                {/* Assistant response */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-body text-ink font-medium">
                        Students must maintain a minimum attendance of <strong>75%</strong> in each course.
                      </p>
                    </div>
                  </div>

                  <hr className="hairline" />

                  {/* Source */}
                  <div className="flex items-center gap-2 text-small text-muted-text">
                    <BookOpen size={14} className="text-indigo" />
                    <span>Attendance Policy</span>
                  </div>

                  {/* Verification Badge */}
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.1 }
                        : { delay: 0.9 }
                    }
                  >
                    <VerificationSeal state="supported" size="sm" />
                    <span className="text-micro font-medium text-verified-green">
                      ✓ Supported by knowledge base
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom hairline */}
      <div className="hairline" />
    </section>
  );
}
