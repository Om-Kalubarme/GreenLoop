import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  MapPin, 
  Tag, 
  Sparkles, 
  Package, 
  Check, 
  LogOut, 
  Save, 
  RefreshCw, 
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ALL_CATEGORIES = [
  { id: 'cardboard', label: 'Cardboard & Paper' },
  { id: 'wood', label: 'Wood & Timber' },
  { id: 'glass', label: 'Glass Jars & Bottles' },
  { id: 'textile', label: 'Textile & Fabrics' },
  { id: 'plastic', label: 'Plastics & Containers' },
  { id: 'metal', label: 'Metals & Hardware' },
];

export default function Dashboard() {
  const { user, isDonor, isRecipient, isAdmin, logout, updateProfile } = useAuth();
  
  const [city, setCity] = useState(user?.city || 'Bengaluru');
  const [selectedCategories, setSelectedCategories] = useState(user?.preferred_categories || []);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) => 
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await updateProfile({
        city,
        preferred_categories: selectedCategories,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      
      {/* Header Profile Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-emerald-600/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{user?.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                user?.role === 'donor' ? 'bg-amber-100 text-amber-800' :
                user?.role === 'recipient' ? 'bg-emerald-100 text-emerald-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>{user?.email}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {user?.city}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isDonor && (
            <Link
              to="/create-listing"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
            >
              <Package className="w-4 h-4" />
              Post Material
            </Link>
          )}

          <Link
            to="/browse"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
          >
            <Layers className="w-4 h-4" />
            Browse Catalog
          </Link>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Preferences & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Preference Settings Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Recommendation &amp; Location Preferences
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Used by the Explainable Rule Scorer &amp; Python TF-IDF Matcher to rank listings.
              </p>
            </div>
          </div>

          {saveSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              Preferences saved successfully! Real-time recommendations updated.
            </div>
          )}

          {saveError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSavePreferences} className="space-y-6">
            <div>
              <label htmlFor="pref-city" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Your Primary City:
              </label>
              <select
                id="pref-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="block w-full max-w-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Delhi">Delhi</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Target Material Categories:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALL_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Nav & Phase Roadmap Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Verified Phase Capabilities
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Phase 1:</strong> Health probe and client-server connectivity verified.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Phase 2:</strong> PostgreSQL DDL schema &amp; 10 demo listings seeded.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Phase 3:</strong> JWT &amp; bcrypt authentication, protected routes.</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                <span><strong>Phase 4:</strong> Donor listing creation &amp; Cloudinary media uploads.</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">5</span>
                <span><strong>Phase 5:</strong> Browse marketplace &amp; express-interest proposals.</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">6</span>
                <span><strong>Phase 6:</strong> Explainable recommendations (100pt + TF-IDF).</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
