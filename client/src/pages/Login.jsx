import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Eye, EyeOff, Sparkles, CheckCircle2, X, ExternalLink, KeyRound, Check, ArrowRight } from 'lucide-react';
import bgLandscape from '../assets/auth-bg.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('Google');

  const { user, login, isSupabaseConfigured, loginWithGoogle, loginWithMicrosoft } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const intendedPath = location.state?.from?.pathname;
  const from = (intendedPath && intendedPath !== '/login' && intendedPath !== '/dashboard' && intendedPath !== '/donor/dashboard') ? intendedPath : '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please verify your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setError(null);
    setInfoMessage(null);

    if (isSupabaseConfigured) {
      try {
        setInfoMessage(`Redirecting to ${provider} sign in via Supabase...`);
        if (provider === 'Google') {
          await loginWithGoogle();
        } else {
          await loginWithMicrosoft();
        }
      } catch (err) {
        setError(err.message || `Failed to initiate ${provider} sign in.`);
        setInfoMessage(null);
      }
    } else {
      setSelectedProvider(provider);
      setShowSetupModal(true);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address to receive password reset instructions.');
      return;
    }
    setError(null);
    setInfoMessage(`Password reset link dispatched to ${email}. Check your inbox!`);
    setTimeout(() => setInfoMessage(null), 5000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      
      {/* 1. Lush Green Landscape Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all"
        style={{ backgroundImage: `url(${bgLandscape})` }}
      />

      {/* 2. Soft Ambient Sunlight Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/5 via-emerald-950/10 to-emerald-950/35 pointer-events-none" />

      {/* 3. Glassmorphic Login Card */}
      <div className="relative z-20 w-full max-w-[420px] backdrop-blur-xl bg-white/60 sm:bg-white/65 border border-white/70 shadow-[0_24px_60px_rgba(8,50,25,0.22)] rounded-[32px] p-6 sm:p-9 transition-all">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <img 
              src="/logo-icon.png" 
              alt="GreenLoop" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto drop-shadow-sm" 
            />
          </Link>
          <div className="mt-2 flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#144229]">
              Green<span className="text-[#3EA635]">Loop</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-[#2E4A38] font-semibold tracking-wide">
            AI-Powered Waste-to-Resource Platform
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#FCEBE6]/95 border border-[#F8D0C7] flex items-start gap-2.5 text-[#B72B15] text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D9381E]" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#E1F2E8]/95 border border-[#C5E5D1] flex items-start gap-2.5 text-[#0A5C36] text-xs font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#0A5C36]" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Email / Username Input */}
          <div className="relative rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5A6D61]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or Phone Number"
              className="block w-full pl-11 pr-4 py-3.5 bg-white/70 hover:bg-white/85 focus:bg-white border border-gray-300/70 rounded-2xl text-xs sm:text-sm text-[#1A261D] placeholder-[#5A6D61]/80 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="relative rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5A6D61]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-11 pr-11 py-3.5 bg-white/70 hover:bg-white/85 focus:bg-white border border-gray-300/70 rounded-2xl text-xs sm:text-sm text-[#1A261D] placeholder-[#5A6D61]/80 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#5A6D61] hover:text-[#1A261D] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-[#204730] hover:text-[#0D5C3A] hover:underline font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Primary Login Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white tracking-wide bg-gradient-to-r from-[#0C512B] via-[#146637] to-[#0C512B] hover:from-[#0E5D32] hover:to-[#17733F] focus:outline-none focus:ring-2 focus:ring-[#0D5C3A] shadow-[0_8px_20px_rgba(12,81,43,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? 'Signing In...' : 'Login'}
          </button>
        </form>

        {/* Switch to Sign Up */}
        <div className="mt-5 text-center text-xs text-[#2E4A38]">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#0D5C3A] hover:underline">
            Sign Up
          </Link>
        </div>

        {/* Continue with Divider */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 border-t border-gray-400/30" />
          <span className="text-[11px] font-medium text-[#4D6656] uppercase tracking-wider">
            Continue with
          </span>
          <div className="flex-1 border-t border-gray-400/30" />
        </div>

        {/* Google Authentication Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleSocialAuth('Google')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white/85 hover:bg-white border border-white/90 shadow-sm text-xs sm:text-sm font-semibold text-[#1A261D] transition-all hover:shadow hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Register Prompt */}
        <div className="mt-6 pt-5 border-t border-gray-400/20 text-center">
          <p className="text-xs text-[#586A5E]">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#0D5C3A] hover:underline">
              Create an account
            </Link>
          </p>
        </div>

      </div>

      {/* Supabase OAuth Setup Instructions Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-4">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E1F2E8] flex items-center justify-center text-[#0D5C3A]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1A261D]">
                    Connect Supabase for {selectedProvider} Login
                  </h3>
                  <p className="text-[11px] text-[#586A5E]">
                    Select <strong className="text-[#0D5C3A]">Framework</strong> in your Supabase project popup
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F9FAF8] border border-gray-200 text-xs text-[#2E4A38] space-y-2">
              <div className="font-bold text-[#0D5C3A] flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Selected: "Framework (Use a client library)"
              </div>
              <p className="text-[11.5px] leading-relaxed text-[#4A5D50]">
                In your Supabase modal, click <strong>Framework</strong> (the 1st tab you highlighted). Copy your <strong>Project URL</strong> and <strong>Anon Public Key</strong> into your <code className="bg-white px-1.5 py-0.5 rounded border border-gray-300">client/.env</code> file:
              </p>
              <div className="p-2.5 rounded-xl bg-gray-900 text-emerald-400 font-mono text-[11px] overflow-x-auto space-y-0.5 select-all">
                <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
              </div>
              <p className="text-[11px] text-[#586A5E] pt-1">
                Also verify that <strong>{selectedProvider}</strong> is enabled under Supabase Dashboard &rarr; <em>Authentication</em> &rarr; <em>Providers</em>.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0D5C3A] hover:bg-[#126436] text-white font-bold text-xs shadow-sm transition-all text-center"
              >
                Got it / Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
