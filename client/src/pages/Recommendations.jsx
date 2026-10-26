import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRecommendations } from '../api/recommendations.api';
import InterestModal from '../components/InterestModal';
import { 
  Sparkles, 
  MapPin, 
  Tag, 
  Box, 
  ArrowRight, 
  Heart, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  Sliders, 
  ExternalLink,
  ShieldCheck,
  Package
} from 'lucide-react';

export default function Recommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [engine, setEngine] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);

  const fetchRecs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecommendations(12);
      if (data.success) {
        setRecommendations(data.recommendations || []);
        setEngine(data.engine || 'Rule-Based Fallback');
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError(err.response?.data?.error || 'Unable to compute recommendations. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleOpenInterest = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleInterestSuccess = () => {
    setSuccessNotice('Proposal dispatched successfully! The donor has been notified.');
    setTimeout(() => setSuccessNotice(null), 4000);
    // Optionally refresh recommendations to reflect status
    fetchRecs();
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-emerald-500 text-white shadow-emerald-500/20';
    if (score >= 50) return 'bg-teal-600 text-white shadow-teal-600/20';
    if (score >= 30) return 'bg-amber-500 text-white shadow-amber-500/20';
    return 'bg-slate-600 text-white shadow-slate-600/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Content-Based AI & Rule Matching
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Personalized Recommendations
            </h1>
            <p className="mt-2 text-base text-slate-600 max-w-3xl">
              Clean waste materials curated specifically for your reuse preferences, workshop city, and creative material categories.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={fetchRecs}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-sm transition-all"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              Tune Preferences
            </Link>
          </div>
        </div>

        {/* Preferences & Engine Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* User Preferences Card */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                Active Matching Profile
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  City: <strong className="font-semibold text-slate-900">{user?.city || 'All Cities'}</strong>
                </span>

                {user?.preferred_categories && user.preferred_categories.length > 0 ? (
                  user.preferred_categories.map((cat, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-medium capitalize"
                    >
                      <Tag className="w-3 h-3 text-emerald-600" />
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    No preferred categories set. Set preferences in your dashboard to boost accuracy.
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Matching based on category similarity, local proximity, and posting recency.</span>
              <Link to="/dashboard" className="text-emerald-600 font-semibold hover:underline">
                Edit
              </Link>
            </div>
          </div>

          {/* Engine Status Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Active Model Engine
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-medium border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  Circuit Protected
                </span>
              </div>
              <div className="mt-3">
                <div className="text-base font-bold text-white">
                  {engine}
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {engine.includes('scikit-learn') 
                    ? 'Python TF-IDF vectorization with Cosine Similarity comparing listing feature vectors against recipient query profiles.' 
                    : '100-Point Explainable Rule-Based baseline (40pt category, 25pt city, 20pt keyword, 15pt recency).'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400">
              Zero black-box obscurity • 100% explainable reasons
            </div>
          </div>

        </div>

        {/* Success Notice */}
        {successNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm animate-pulse space-y-4">
                <div className="h-44 bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Matching Listings Right Now</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              No active listings currently match your preferred categories or city. Browse all materials or update your preferred categories in the dashboard.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/browse"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all"
              >
                Browse All Materials
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-xs font-semibold text-slate-500">
              Showing top {recommendations.length} recommended materials ordered by algorithmic compatibility:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col overflow-hidden group"
                >
                  {/* Top Image & Badge */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Algorithmic Match Score Pill */}
                    <div className="absolute top-3 right-3 flex items-center shadow-lg rounded-full overflow-hidden">
                      <span className={`px-3 py-1 text-xs font-extrabold tracking-wide uppercase ${getScoreBadgeColor(item.score)}`}>
                        {Math.round(item.score)}% Match
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium capitalize">
                        {item.material_category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {item.city}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Box className="w-3.5 h-3.5 text-slate-400" />
                          {item.quantity_description}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Explainable Recommendation Reason Pill */}
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 text-[11px] text-emerald-900 leading-snug flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block text-emerald-950 mb-0.5">Why Recommended:</strong>
                        <span>{item.reason}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/listings/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
                      >
                        Details
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => handleOpenInterest(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white" />
                        Express Interest
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Express Interest Modal */}
      {selectedListing && (
        <InterestModal
          listing={selectedListing}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleInterestSuccess}
        />
      )}
    </div>
  );
}
