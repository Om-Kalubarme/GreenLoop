import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, Lock, Mail, User, MapPin, ArrowRight, AlertCircle, Sparkles, Check } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { id: 'cardboard', label: 'Cardboard & Paper' },
  { id: 'wood', label: 'Wood & Timber' },
  { id: 'glass', label: 'Glass Jars & Bottles' },
  { id: 'textile', label: 'Textile & Fabrics' },
  { id: 'plastic', label: 'Plastics & Containers' },
  { id: 'metal', label: 'Metals & Hardware' },
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
    <div className="min-h-[90vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Icon */}
        <div className="flex justify-center">
          <Link to="/" className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/25">
            <Recycle className="w-7 h-7" />
          </Link>
        </div>

        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Join the Circular Movement
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Sign in here
          </Link>
        </p>

      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'donor' })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    formData.role === 'donor'
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">Offer Materials</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">I am a Donor (Household, Workshop, Business)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'recipient' })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    formData.role === 'recipient'
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">Find Materials</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">I am a Recipient (Student, Artist, NGO)</div>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Full Name / Organization
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kulkarni / Green Art Studio"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password (min. 6 characters)
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Primary City (Used for Local Match Distance)
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
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

            {/* Preferred Categories (Used for Recommendations) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
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
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
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
