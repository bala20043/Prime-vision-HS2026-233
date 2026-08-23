import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Key, Calendar } from 'lucide-react';
import VerificationSeal from '../components/VerificationSeal';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-parchment py-12 md:py-20"
    >
      <div className="page-container max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-surface rounded-card p-6 md:p-8 border border-hairline/60 shadow-card mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold text-ink font-bold font-mono text-h2 flex items-center justify-center shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-h2-mobile md:text-h2 text-ink font-bold">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-pill bg-verified-green/10 text-verified-green text-micro font-mono font-semibold">
                  ACTIVE STUDENT
                </span>
              </div>
              <p className="text-body text-muted-text font-mono mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Account Metadata Details */}
        <div className="bg-surface rounded-card p-6 md:p-8 border border-hairline/60 shadow-card space-y-6">
          <h2 className="font-display text-h3 text-ink border-b border-hairline pb-4">
            Account Credentials & Security
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-micro font-mono text-muted-text uppercase flex items-center gap-1.5">
                <User size={14} className="text-indigo" />
                Full Name
              </span>
              <p className="text-body font-medium text-ink">{user.name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-micro font-mono text-muted-text uppercase flex items-center gap-1.5">
                <Mail size={14} className="text-indigo" />
                Email Address
              </span>
              <p className="text-body font-medium text-ink font-mono">{user.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-micro font-mono text-muted-text uppercase flex items-center gap-1.5">
                <Shield size={14} className="text-gold" />
                Authentication Provider
              </span>
              <p className="text-body font-medium text-ink capitalize font-mono">
                {user.auth_provider === 'google' ? 'Google OAuth 2.0 (Verified)' : 'Email & Encrypted Password'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-micro font-mono text-muted-text uppercase flex items-center gap-1.5">
                <Key size={14} className="text-indigo" />
                Account Identifier
              </span>
              <p className="text-body font-medium text-ink font-mono">
                USER-SEC-{String(user.id).padStart(5, '0')}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-hairline">
            <div className="bg-parchment/60 p-4 rounded-card border border-hairline flex items-center gap-3">
              <VerificationSeal state="supported" size="sm" />
              <p className="text-small text-muted-text">
                Your session is authenticated via httpOnly cookie tokens with automatic expiration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
