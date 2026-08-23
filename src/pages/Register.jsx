import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, ShieldCheck } from 'lucide-react';

import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function Register() {
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
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Column — Institutional Context / Illustration */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-hairline rounded-button text-micro font-mono text-indigo shadow-sm">
              <GraduationCap size={16} className="text-gold" />
              <span>COLLEGE KNOWLEDGE ASSISTANT</span>
            </div>

            <h1 className="font-display text-hero-mobile md:text-hero text-ink leading-tight">
              Instant Access to Institutional Policies.
            </h1>

            <p className="text-body text-muted-text max-w-md leading-relaxed">
              Create your account to ask questions, explore official handbooks, and view verified course regulations.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-verified-green" />
                <span className="text-small text-ink font-medium">Zero-Hallucination Policy Guarantee</span>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-indigo" />
                <span className="text-small text-muted-text">Full Handbook & Regulations Repository Access</span>
              </div>
            </div>
          </div>

          {/* Right Column — Form */}
          <div className="lg:col-span-6 max-w-md mx-auto lg:max-w-none w-full">
            <RegisterForm />
          </div>
        </div>
      </div>
    </motion.main>
  );
}
