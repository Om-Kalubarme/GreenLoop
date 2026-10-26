import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Icon */}
        <div className="flex justify-center">
          <Link to="/" className="w-12 h-12 rounded-full bg-[#1B3B2B] flex items-center justify-center text-white shadow-md hover:scale-105 transition-all">
            <Leaf className="w-6 h-6 text-[#E2EBD8]" />
          </Link>
        </div>

        <h2 className="mt-4 text-center text-3xl font-serif font-bold text-[#1C241E] tracking-tight">
          Welcome back <span className="font-serif italic font-normal text-[#76937F]">◇ Sign In</span>
        </h2>
        <p className="mt-2 text-center text-xs text-[#5D6E62]">
          Sign in to your ReSource AI account, or{' '}
          <Link to="/register" className="font-semibold text-[#1B3B2B] hover:underline">
            create a new account
          </Link>
        </p>

      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-luxury border border-[#E8E2D6] rounded-3xl sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#1C241E] uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1 relative rounded-full shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#76937F]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="donor1@resourceai.org"
                  className="block w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] rounded-full text-[#1C241E] placeholder-[#76937F]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B] text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#1C241E] uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1 relative rounded-full shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#76937F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] rounded-full text-[#1C241E] placeholder-[#76937F]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B] text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#1B3B2B] hover:bg-[#28533E] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Demo User Fast-Autofill */}
          <div className="mt-8 pt-6 border-t border-[#E8E2D6]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C241E] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#2D5A3E]" />
              Quick Demo Accounts (1-Click Fill):
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('donor1@resourceai.org')}
                className="px-3 py-2 rounded-2xl bg-[#E2EBD8]/50 hover:bg-[#E2EBD8] border border-[#D5E4C8] text-[#1C241E] font-medium text-left transition-all"
              >
                <div className="font-bold text-[#1B3B2B]">Donor (Rahul)</div>
                <div className="text-[10px] text-[#5D6E62]">Logistics Warehouse</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('recipient1@resourceai.org')}
                className="px-3 py-2 rounded-2xl bg-[#E2EBD8]/50 hover:bg-[#E2EBD8] border border-[#D5E4C8] text-[#1C241E] font-medium text-left transition-all"
              >
                <div className="font-bold text-[#2D5A3E]">Recipient (Ananya)</div>
                <div className="text-[10px] text-[#5D6E62]">Architecture Student</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
