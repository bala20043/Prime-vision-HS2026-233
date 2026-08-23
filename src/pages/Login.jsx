import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Lock } from 'lucide-react';

import LoginForm from '../components/LoginForm';
import VerificationSeal from '../components/VerificationSeal';
import { useAuth } from '../context/AuthContext';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/assistant', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-parchment py-12 md:py-20 flex items-center justify-center"
    >
      <div className="page-container w-full max-w-5xl">
        {oauthError && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-error-rust/10 border border-error-rust/30 rounded-card text-error-rust text-small text-center">
            {oauthError}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Column — Institutional Context / Illustration */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-hairline rounded-button text-micro font-mono text-indigo shadow-sm">
              <GraduationCap size={16} className="text-gold" />
              <span>COLLEGE KNOWLEDGE ASSISTANT</span>
            </div>

            <h1 className="font-display text-hero-mobile md:text-hero text-ink leading-tight">
              Verified Knowledge at Your Fingertips.
            </h1>

            <p className="text-body text-muted-text max-w-md leading-relaxed">
              Log in to your student account to inquire about attendance rules, exam policies, library resources, and administrative procedures.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <VerificationSeal state="supported" size="sm" />
                <span className="text-small text-ink font-medium">100% Verified Document Citations</span>
              </div>
              <div className="flex items-center gap-3 text-small text-muted-text">
                <Lock size={16} className="text-indigo" />
                <span>Secure Session Cookie Authentication</span>
              </div>
            </div>
          </div>

          {/* Right Column — Form */}
          <div className="lg:col-span-6 max-w-md mx-auto lg:max-w-none w-full">
            <LoginForm />
          </div>
        </div>
      </div>
    </motion.main>
  );
}
