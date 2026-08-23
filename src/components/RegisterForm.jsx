import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleButton from './GoogleButton';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      navigate('/assistant', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Unable to connect to the authentication service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-card shadow-card p-6 md:p-8 border border-hairline/60">
      <div className="mb-6 text-center md:text-left">
        <h2 className="font-display text-h2-mobile md:text-h2 text-ink mb-1">
          Create your account
        </h2>
        <p className="text-body text-muted-text">
          Sign up to access the AI College Knowledge Assistant.
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-3 rounded bg-error-rust/10 border border-error-rust/30 text-error-rust text-small">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-small font-medium text-ink mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            className={`w-full px-4 py-2.5 bg-parchment/60 border rounded-button
                        text-body text-ink font-body placeholder:text-muted-text/50
                        focus:outline-none focus:border-indigo transition-colors ${
                          errors.name ? 'border-error-rust' : 'border-hairline'
                        }`}
          />
          {errors.name && (
            <p className="text-error-rust text-micro mt-1">{errors.name}</p>
          )}
        </div>

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
          <label className="block text-small font-medium text-ink mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
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

        {/* Confirm Password */}
        <div>
          <label className="block text-small font-medium text-ink mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            className={`w-full px-4 py-2.5 bg-parchment/60 border rounded-button
                        text-body text-ink font-body placeholder:text-muted-text/50
                        focus:outline-none focus:border-indigo transition-colors ${
                          errors.confirmPassword ? 'border-error-rust' : 'border-hairline'
                        }`}
          />
          {errors.confirmPassword && (
            <p className="text-error-rust text-micro mt-1">{errors.confirmPassword}</p>
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
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {/* Login link */}
      <div className="mt-5 text-center text-small text-muted-text">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo font-medium hover:underline">
          Login
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
    </div>
  );
}
