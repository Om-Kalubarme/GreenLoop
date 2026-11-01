import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Lock, Mail, User, MapPin, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import bgRegister from '../assets/register-bg.png';

const CATEGORY_OPTIONS = [
  { id: 'cardboard', label: 'Cardboard' },
  { id: 'wood', label: 'Timber / Wood' },
  { id: 'glass', label: 'Glass Jars' },
  { id: 'textile', label: 'Textiles' },
  { id: 'plastic', label: 'Clean Plastic' },
  { id: 'metal', label: 'Metal Offcuts' },
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: 'Bengaluru',
    role: 'recipient',
    preferred_categories: ['cardboard'],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleCategoryToggle = (catId) => {
    setFormData((prev) => {
      const exists = prev.preferred_categories.includes(catId);
      const updated = exists
        ? prev.preferred_categories.filter((c) => c !== catId)
        : [...prev.preferred_categories, catId];
      return { ...prev, preferred_categories: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the terms & conditions to create an account.');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        city: formData.city,
        role: formData.role,
        preferred_categories: formData.preferred_categories,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please verify your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      
      {/* 1. Botanical Sunlit Bokeh Background matching Reference */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all"
        style={{ backgroundImage: `url(${bgRegister})` }}
      />

      {/* 2. Soft Ambient Sunlight Overlay */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] pointer-events-none" />

      {/* 2. Registration Card matching Reference Design */}
      <div className="relative z-20 w-full max-w-[440px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(15,40,25,0.08)] border border-gray-100 p-6 sm:p-9 transition-all">
        
        {/* Top Header with Back Button */}
        <div className="relative mb-5">
          <Link
            to="/login"
            className="absolute left-0 top-0 w-9 h-9 rounded-full bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center text-[#1A261D] transition-colors"
            title="Back to Login"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </Link>

          {/* Centered Brand Header */}
          <div className="text-center pt-1">
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
            <p className="mt-1 text-xs text-[#586A5E] font-medium tracking-wide">
              Join for a Greener Tomorrow
            </p>
          </div>
        </div>

        {/* Error Feedback Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#FCEBE6] border border-[#F8D0C7] flex items-start gap-2.5 text-[#B72B15] text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D9381E]" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form className="space-y-3.5" onSubmit={handleSubmit}>
          
          {/* Full Name Input */}
          <div className="relative rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5A6D61]">
              <User className="w-4 h-4" />
            </div>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full Name"
              className="block w-full pl-11 pr-4 py-3 bg-[#F9FAF8] hover:bg-white focus:bg-white border border-gray-200/90 rounded-2xl text-xs sm:text-sm text-[#1A261D] placeholder-[#5A6D61]/70 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all"
            />
          </div>

          {/* Email Input */}
          <div className="relative rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5A6D61]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="reg-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              className="block w-full pl-11 pr-4 py-3 bg-[#F9FAF8] hover:bg-white focus:bg-white border border-gray-200/90 rounded-2xl text-xs sm:text-sm text-[#1A261D] placeholder-[#5A6D61]/70 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="relative rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5A6D61]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
              className="block w-full pl-11 pr-11 py-3 bg-[#F9FAF8] hover:bg-white focus:bg-white border border-gray-200/90 rounded-2xl text-xs sm:text-sm text-[#1A261D] placeholder-[#5A6D61]/70 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#5A6D61] hover:text-[#1A261D] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="relative rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5A6D61]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm Password"
              className="block w-full pl-11 pr-11 py-3 bg-[#F9FAF8] hover:bg-white focus:bg-white border border-gray-200/90 rounded-2xl text-xs sm:text-sm text-[#1A261D] placeholder-[#5A6D61]/70 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#5A6D61] hover:text-[#1A261D] transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Account Role Selector: Donor vs Recipient */}
          <div className="pt-1">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'donor' })}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                  formData.role === 'donor'
                    ? 'border-[#0D5C3A] bg-[#E1F2E8] text-[#0D5C3A] font-bold shadow-sm'
                    : 'border-gray-200 bg-[#F9FAF8] text-[#586A5E] hover:bg-white'
                }`}
              >
                Donor (Offer Material)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'recipient' })}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                  formData.role === 'recipient'
                    ? 'border-[#0D5C3A] bg-[#E1F2E8] text-[#0D5C3A] font-bold shadow-sm'
                    : 'border-gray-200 bg-[#F9FAF8] text-[#586A5E] hover:bg-white'
                }`}
              >
                Recipient (Find Material)
              </button>
            </div>
          </div>

          {/* City Selection */}
          <div className="relative rounded-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5A6D61]">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="block w-full pl-11 pr-4 py-2.5 bg-[#F9FAF8] hover:bg-white focus:bg-white border border-gray-200/90 rounded-2xl text-xs text-[#1A261D] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all"
            >
              <option value="Bengaluru">Bengaluru, KA</option>
              <option value="Mumbai">Mumbai, MH</option>
              <option value="Pune">Pune, MH</option>
              <option value="Delhi">Delhi, NCR</option>
              <option value="Hyderabad">Hyderabad, TS</option>
              <option value="Chennai">Chennai, TN</option>
            </select>
          </div>

          {/* Terms & Conditions Checkbox matching Reference Design */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded text-[#0D5C3A] focus:ring-[#0D5C3A] border-gray-300 accent-[#0D5C3A] cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-[#586A5E] cursor-pointer select-none">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="font-bold text-[#0D5C3A] hover:underline"
              >
                terms &amp; conditions
              </button>
            </label>
          </div>

          {/* Primary Sign Up Button matching Reference Design */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-white tracking-wide bg-gradient-to-r from-[#0C512B] via-[#146637] to-[#0C512B] hover:from-[#0E5D32] hover:to-[#17733F] focus:outline-none focus:ring-2 focus:ring-[#0D5C3A] shadow-[0_8px_20px_rgba(12,81,43,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Switch to Login matching Reference Design */}
        <div className="mt-5 text-center text-xs text-[#586A5E]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#0D5C3A] hover:underline">
            Login
          </Link>
        </div>

      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-lg text-[#1A261D]">Terms &amp; Community Guidelines</h3>
            <div className="text-xs text-[#586A5E] space-y-2 max-h-60 overflow-y-auto pr-2">
              <p>• GreenLoop facilitates the diversion of clean surplus materials to prevent landfill dumping.</p>
              <p>• All listed materials must be non-hazardous, sanitary, and correctly described.</p>
              <p>• Recipients and donors coordinate pickup in local, safe community locations.</p>
              <p>• User data is safeguarded and used solely for localization and recommendation matching.</p>
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2 rounded-xl bg-[#0D5C3A] text-white text-xs font-bold hover:bg-[#126436] transition-all"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
