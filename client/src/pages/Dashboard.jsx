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
      <div className="bg-[#FDFBF7] rounded-2xl border border-[#EAE3D2] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#063D23] to-[#0A5C36] flex items-center justify-center text-white text-2xl font-serif font-bold shadow-md shadow-[#0A5C36]/20 border border-[#CEEAD8]">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-serif font-bold text-[#1A261D] tracking-tight">{user?.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                user?.role === 'donor' ? 'bg-[#E1F2E8] text-[#0A5C36] border-[#CEEAD8]' :
                user?.role === 'recipient' ? 'bg-[#FAF6EE] text-[#0A5C36] border-[#CEEAD8]' :
                'bg-[#FCEBE6] text-[#B72B15] border-[#F8D0C7]'
              }`}>
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-[#5A524C] mt-1 flex items-center gap-2">
              <span>{user?.email}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0A5C36]" />
                {user?.city}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isDonor && (
            <Link
              to="/create-listing"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#0A5C36] text-white hover:bg-[#0D7A47] shadow-sm shadow-[#0A5C36]/20 transition-all"
            >
              <Package className="w-4 h-4" />
              Post Material
            </Link>
          )}

          <Link
            to="/browse"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#FAF6EE] text-[#1A261D] hover:bg-[#F3ECE0] border border-[#EAE3D2] transition-all"
          >
            <Layers className="w-4 h-4 text-[#0A5C36]" />
            Browse Catalog
          </Link>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#B72B15] hover:bg-[#FCEBE6] border border-[#F8D0C7] transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4 text-[#D9381E]" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Preferences & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Preference Settings Card */}
        <div className="lg:col-span-2 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D2] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-[#EAE3D2] mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E1F2E8] border border-[#CEEAD8] text-[#0A5C36] text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#0A5C36]" />
                <span>Smart Match Scoring Engine</span>
                <span className="text-[#D9381E]">◇</span>
              </div>
              <h2 className="text-xl font-serif font-bold text-[#1A261D] flex items-center gap-2">
                Recommendation &amp; Location Preferences
              </h2>
              <p className="text-xs text-[#5A524C] mt-1">
                Used by the Explainable Rule Scorer &amp; Python TF-IDF Matcher to rank listings tailored to your circular reuse needs.
              </p>
            </div>
          </div>

          {saveSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-[#E1F2E8] border border-[#CEEAD8] text-[#0A5C36] text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              Preferences saved successfully! Real-time recommendations updated.
            </div>
          )}

          {saveError && (
            <div className="mb-6 p-4 rounded-xl bg-[#FCEBE6] border border-[#F8D0C7] text-[#B72B15] text-xs font-semibold">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSavePreferences} className="space-y-6">
            <div>
              <label htmlFor="pref-city" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-2">
                Your Primary City:
              </label>
              <select
                id="pref-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="block w-full max-w-sm px-3.5 py-2.5 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-sm font-medium text-[#1A261D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] transition-all"
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
              <label className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-2">
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
                          ? 'border-[#0A5C36] bg-[#E1F2E8] text-[#0A5C36] shadow-sm'
                          : 'border-[#EAE3D2] bg-[#FAF6EE] text-[#5A524C] hover:bg-[#F3ECE0]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#0A5C36]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#0A5C36] hover:bg-[#0D7A47] shadow-sm shadow-[#0A5C36]/20 transition-all disabled:opacity-50"
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
          <div className="bg-[#FDFBF7] rounded-2xl border border-[#EAE3D2] p-6 shadow-sm">
            <h3 className="text-base font-serif font-bold text-[#1A261D] mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0A5C36]" />
              Verified Phase Capabilities
            </h3>
            <ul className="space-y-3 text-xs text-[#5A524C]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#0A5C36] shrink-0 mt-0.5" />
                <span><strong className="text-[#1A261D]">Phase 1:</strong> Health probe and client-server connectivity verified.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#0A5C36] shrink-0 mt-0.5" />
                <span><strong className="text-[#1A261D]">Phase 2:</strong> PostgreSQL DDL schema &amp; marketplace catalog initialized.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#0A5C36] shrink-0 mt-0.5" />
                <span><strong className="text-[#1A261D]">Phase 3:</strong> JWT &amp; bcrypt authentication, protected routes.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#0A5C36] shrink-0 mt-0.5" />
                <span><strong className="text-[#1A261D]">Phase 4:</strong> Donor listing creation &amp; Cloudinary media uploads.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#0A5C36] shrink-0 mt-0.5" />
                <span><strong className="text-[#1A261D]">Phase 5:</strong> Browse marketplace &amp; express-interest proposals.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#0A5C36] shrink-0 mt-0.5" />
                <span><strong className="text-[#1A261D]">Phase 6:</strong> Explainable recommendations (100pt + TF-IDF).</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
