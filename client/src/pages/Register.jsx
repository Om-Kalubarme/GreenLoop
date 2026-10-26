import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Lock, Mail, User, MapPin, ArrowRight, AlertCircle, Check } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { id: 'cardboard', label: 'Cardboard & Paper' },
  { id: 'wood', label: 'Wood & Timber' },
  { id: 'glass', label: 'Glass Jars & Bottles' },
  { id: 'textile', label: 'Textiles & Denim' },
  { id: 'plastic', label: 'Clean Plastics' },
  { id: 'metal', label: 'Surplus Metals' },
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: 'Bengaluru',
    role: 'recipient',
    preferred_categories: ['cardboard'],
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Icon */}
        <div className="flex justify-center">
          <Link to="/" className="w-12 h-12 rounded-full bg-[#0A5C36] flex items-center justify-center text-white shadow-emerald-glow hover:scale-105 transition-all">
            <Leaf className="w-6 h-6 text-[#FAF6EE]" />
          </Link>
        </div>

        <h2 className="mt-4 text-center text-3xl font-serif font-bold text-[#1A261D] tracking-tight">
          Join the Movement <span className="font-serif italic font-normal text-[#D9381E]">◇ ReSource AI</span>
        </h2>
        <p className="mt-2 text-center text-xs text-[#586A5E]">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#D9381E] hover:underline">
            Sign in here
          </Link>
        </p>

      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-[#FDFBF7] py-8 px-6 shadow-luxury border border-[#EAE3D2] rounded-3xl sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-[#FCEBE6] border border-[#F8D0C7] flex items-start gap-3 text-[#D9381E] text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D9381E]" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider mb-2">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'donor' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    formData.role === 'donor'
                      ? 'border-[#0A5C36] bg-[#E1F2E8]/60 ring-2 ring-[#0A5C36]/20'
                      : 'border-[#EAE3D2] hover:border-[#DFD5BE] bg-[#FAF6EE]'
                  }`}
                >
                  <div className="font-serif font-bold text-sm text-[#1A261D]">Offer Materials</div>
                  <div className="text-[11px] text-[#586A5E] mt-0.5">I am a Donor (Household, Studio, Business)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'recipient' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    formData.role === 'recipient'
                      ? 'border-[#0A5C36] bg-[#E1F2E8]/60 ring-2 ring-[#0A5C36]/20'
                      : 'border-[#EAE3D2] hover:border-[#DFD5BE] bg-[#FAF6EE]'
                  }`}
                >
                  <div className="font-serif font-bold text-sm text-[#1A261D]">Find Materials</div>
                  <div className="text-[11px] text-[#586A5E] mt-0.5">I am a Recipient (Student, Artist, NGO)</div>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider">
                Full Name / Organization
              </label>
              <div className="mt-1 relative rounded-full shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#586A5E]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kulkarni / Green Art Studio"
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAE3D2] rounded-full text-[#1A261D] placeholder-[#586A5E]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36] text-xs transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1 relative rounded-full shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#586A5E]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAE3D2] rounded-full text-[#1A261D] placeholder-[#586A5E]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36] text-xs transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider">
                Password (min. 6 characters)
              </label>
              <div className="mt-1 relative rounded-full shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#586A5E]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAE3D2] rounded-full text-[#1A261D] placeholder-[#586A5E]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36] text-xs transition-all"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider">
                Primary City (Used for Local Match Proximity)
              </label>
              <div className="mt-1 relative rounded-full shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#586A5E]">
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAE3D2] rounded-full text-[#1A261D] text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36] transition-all"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>
            </div>

            {/* Preferred Categories */}
            <div>
              <label className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider mb-2">
                Material Interests (Powers AI Recommendations):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = formData.preferred_categories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-[#0A5C36] bg-[#E1F2E8] text-[#0A5C36]'
                          : 'border-[#EAE3D2] bg-[#FAF6EE] text-[#586A5E] hover:bg-[#F3ECE0]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0A5C36]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#0A5C36] hover:bg-[#0D7A47] focus:outline-none focus:ring-2 focus:ring-[#0A5C36] shadow-emerald-glow transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? 'Creating Account...' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
