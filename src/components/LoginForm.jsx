import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleButton from './GoogleButton';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/assistant';

  const validate = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Please enter your password.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      if (res && res.user && (res.user.role === 'admin' || res.user.email === 'collegeofcom@gmail.com')) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setServerError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-card shadow-card p-6 md:p-8 border border-hairline/60">
      <div className="mb-6 text-center md:text-left">
        <h2 className="font-display text-h2-mobile md:text-h2 text-ink mb-1">
          Welcome back
        </h2>
        <p className="text-body text-muted-text">
          Sign in to continue to your College Knowledge Assistant.
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-3 rounded bg-error-rust/10 border border-error-rust/30 text-error-rust text-small">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Address */}
        <div>
          <label className="block text-small font-medium text-ink mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@college.edu"
            className={`w-full px-4 py-2.5 bg-parchment/60 border rounded-button
                        text-body text-ink font-body placeholder:text-muted-text/50
                        focus:outline-none focus:border-indigo transition-colors ${
                          errors.email ? 'border-error-rust' : 'border-hairline'
                        }`}
          />
          {errors.email && (
            <p className="text-error-rust text-micro mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-small font-medium text-ink">
              Password
            </label>
            <button
              type="button"
              onClick={() => setForgotModalOpen(true)}
              className="text-small text-indigo hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={`w-full px-4 py-2.5 bg-parchment/60 border rounded-button
                        text-body text-ink font-body placeholder:text-muted-text/50
                        focus:outline-none focus:border-indigo transition-colors ${
                          errors.password ? 'border-error-rust' : 'border-hairline'
                        }`}
          />
          {errors.password && (
            <p className="text-error-rust text-micro mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-indigo text-parchment rounded-button
                     font-medium text-body hover:bg-indigo-deep transition-all duration-fast
                     active:scale-[1.01] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Register link */}
      <div className="mt-5 text-center text-small text-muted-text">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo font-medium hover:underline">
          Create account
        </Link>
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-hairline" />
        <span className="text-micro font-mono text-muted-text uppercase">OR</span>
        <div className="flex-1 h-px bg-hairline" />
      </div>

      {/* Google Auth */}
      <GoogleButton label="Continue with Google" />

      {/* Forgot Password Modal Stub */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4">
          <div className="bg-surface rounded-card p-6 max-w-sm w-full border border-hairline shadow-elevated text-center">
            <h3 className="font-display text-h3 text-ink mb-2">Password Reset</h3>
            <p className="text-small text-muted-text mb-6">
              Password reset links are issued via the Student Administration desk or College IT Helpdesk.
            </p>
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="px-5 py-2.5 bg-indigo text-parchment rounded-button text-small font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
