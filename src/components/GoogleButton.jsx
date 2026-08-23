import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Mail, User, ShieldCheck } from 'lucide-react';

export default function GoogleButton({ label = "Continue with Google" }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginGoogle, showToast } = useAuth();
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setError('');
    setEmail('');
    setName('');
    setModalOpen(true);
  };

  const handlePresetSelect = (presetEmail, presetName) => {
    setEmail(presetEmail);
    setName(presetName);
    setError('');
  };

  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }

    const displayName = name.trim() || targetEmail.split('@')[0].replace('.', ' ');
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    setIsSubmitting(true);
    try {
      const googleUser = {
        id: `usr_g_${targetEmail.replace(/[^a-z0-9]/gi, '_')}`,
        name: formattedName,
        email: targetEmail,
        auth_provider: 'google',
        role: 'student'
      };

      await loginGoogle(googleUser);
      showToast(`Signed in as ${targetEmail}`);
      setModalOpen(false);
      navigate('/assistant', { replace: true });
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface
                   border border-hairline rounded-button text-body text-ink font-medium
                   hover:bg-parchment/80 hover:border-gold/50 cursor-pointer transition-all duration-fast shadow-sm
                   active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-gold"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{label}</span>
      </button>

      {/* Google Account Email Selector Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-card p-6 max-w-md w-full border border-hairline shadow-elevated relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-muted-text hover:text-ink p-1 rounded-full hover:bg-parchment transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-parchment mx-auto mb-3 flex items-center justify-center border border-hairline">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <h3 className="font-display text-h3 text-ink">Sign in with Google</h3>
              <p className="text-small text-muted-text mt-1">
                Enter your Google Account email ID to continue to CollegeAI
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded bg-error-rust/10 border border-error-rust/30 text-error-rust text-small text-center">
                {error}
              </div>
            )}

            {/* Quick Account Selector Chips */}
            <div className="mb-4">
              <label className="block text-micro font-mono uppercase text-muted-text mb-2">
                Quick Select Account
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('student.balamurugan@gmail.com', 'Balamurugan M')}
                  className="w-full flex items-center justify-between p-2.5 rounded-button border border-hairline bg-parchment/50 hover:bg-parchment hover:border-gold/50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo/10 text-indigo flex items-center justify-center font-bold text-small">
                      B
                    </div>
                    <div>
                      <p className="text-small font-medium text-ink">Balamurugan M</p>
                      <p className="text-micro text-muted-text">student.balamurugan@gmail.com</p>
                    </div>
                  </div>
                  <ShieldCheck size={16} className="text-indigo opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('student@college.edu', 'Student User')}
                  className="w-full flex items-center justify-between p-2.5 rounded-button border border-hairline bg-parchment/50 hover:bg-parchment hover:border-gold/50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/20 text-gold-muted flex items-center justify-center font-bold text-small">
                      S
                    </div>
                    <div>
                      <p className="text-small font-medium text-ink">Student User</p>
                      <p className="text-micro text-muted-text">student@college.edu</p>
                    </div>
                  </div>
                  <ShieldCheck size={16} className="text-indigo opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-hairline" />
              <span className="text-micro font-mono text-muted-text uppercase">Or Enter Email</span>
              <div className="flex-1 h-px bg-hairline" />
            </div>

            {/* Form */}
            <form onSubmit={handleGoogleSubmit} className="space-y-4">
              <div>
                <label className="block text-small font-medium text-ink mb-1">
                  Google Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-muted-text/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-parchment/60 border border-hairline rounded-button text-body text-ink placeholder:text-muted-text/50 focus:outline-none focus:border-indigo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-small font-medium text-ink mb-1">
                  Full Name <span className="text-muted-text/60 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-muted-text/60" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Balamurugan M"
                    className="w-full pl-9 pr-4 py-2.5 bg-parchment/60 border border-hairline rounded-button text-body text-ink placeholder:text-muted-text/50 focus:outline-none focus:border-indigo"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-indigo text-parchment rounded-button font-medium text-body hover:bg-indigo-deep transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? 'Signing in with Google...' : 'Continue to Chatbot'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
