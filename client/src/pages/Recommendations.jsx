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
  Package,
  Leaf
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
    fetchRecs();
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-[#1B3B2B] text-[#E2EBD8] border border-[#76937F]/40';
    if (score >= 50) return 'bg-[#2D5A3E] text-white border border-[#A3B899]/30';
    if (score >= 30) return 'bg-[#C86D51] text-white border border-[#E8E2D6]/20';
    return 'bg-[#4A584E] text-white';
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E8E2D6]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E2EBD8] border border-[#D5E4C8] text-[#1B3B2B] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#2D5A3E]" />
              Explainable AI Match Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C241E]">
              Personalized <span className="font-serif italic font-normal text-[#76937F]">◇ Recommendations</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#5D6E62] max-w-2xl">
              Clean waste materials curated specifically for your reuse preferences, workshop location, and creative project disciplines.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={fetchRecs}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E8E2D6] bg-white text-[#1C241E] text-xs font-semibold hover:bg-[#FAF7F2] shadow-sm transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#28533E] shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 text-[#E2EBD8]" />
              Tune Profile
            </Link>
          </div>
        </div>

        {/* Preferences & Engine Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* User Preferences Card */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-[#E8E2D6] shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#76937F] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#1B3B2B]" />
                Active Matching Profile
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D6] text-[#1C241E] text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#76937F]" />
                  City: <strong className="font-semibold text-[#1B3B2B]">{user?.city || 'All Cities'}</strong>
                </span>

                {user?.preferred_categories && user.preferred_categories.length > 0 ? (
                  user.preferred_categories.map((cat, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E2EBD8]/60 text-[#1B3B2B] border border-[#D5E4C8] text-xs font-medium capitalize"
                    >
                      <Tag className="w-3 h-3 text-[#2D5A3E]" />
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    No preferred categories set. Adjust in dashboard to focus recommendations.
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8E2D6] flex items-center justify-between text-xs text-[#5D6E62]">
              <span>Ranking based on category relevance, local proximity, and recency.</span>
              <Link to="/dashboard" className="text-[#1B3B2B] font-semibold hover:underline">
                Edit
              </Link>
            </div>
          </div>

          {/* Engine Status Card */}
          <div className="p-6 rounded-3xl bg-[#1B3B2B] text-white shadow-luxury flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#E2EBD8] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Active Model
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-[#E2EBD8] text-[10px] font-medium border border-white/20">
                  <ShieldCheck className="w-3 h-3" />
                  Fault-Tolerant
                </span>
              </div>
              <div className="mt-3">
                <div className="text-base font-serif font-bold text-white">
                  {engine}
                </div>
                <p className="mt-1 text-xs text-[#E2EBD8]/80 leading-relaxed font-normal">
                  {engine.includes('scikit-learn') 
                    ? 'Python TF-IDF vectorization with Cosine Similarity evaluating listing text against recipient query profiles.' 
                    : '100-Point Explainable Rule-Based baseline (40pt category, 25pt city, 20pt keyword, 15pt recency).'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/20 text-[11px] text-[#A3B899]">
              Transparent attribution • Zero black-box obscurity
            </div>
          </div>

        </div>

        {/* Notices */}
        {successNotice && (
          <div className="p-4 rounded-2xl bg-[#E2EBD8] border border-[#D5E4C8] text-[#1B3B2B] text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D5A3E] flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Recommendations Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-[#E8E2D6] p-5 shadow-sm animate-pulse space-y-4">
                <div className="h-44 bg-[#F4EFEA] rounded-2xl" />
                <div className="h-4 bg-[#E8E2D6] rounded w-2/3" />
                <div className="h-3 bg-[#F4EFEA] rounded w-1/2" />
                <div className="h-8 bg-[#F4EFEA] rounded-full" />
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E2D6] p-8 space-y-4 shadow-sm max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#FAF7F2] text-[#76937F] flex items-center justify-center mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1C241E]">No Matching Listings Found</h3>
            <p className="text-xs text-[#5D6E62]">
              No active listings currently match your preferred categories or city. Update your preferences or browse all materials.
            </p>
            <div className="pt-2">
              <Link
                to="/browse"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#28533E] transition-all"
              >
                Browse All Materials
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-xs font-semibold text-[#76937F]">
              Showing top {recommendations.length} recommended materials ordered by algorithmic compatibility:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-[#E8E2D6] shadow-sm hover:shadow-luxury transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden group p-4"
                >
                  {/* Top Image Frame */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#EFE9DF]">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Algorithmic Match Score Pill */}
                    <div className="absolute top-3 right-3 shadow-md rounded-full overflow-hidden">
                      <span className={`px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-full ${getScoreBadgeColor(item.score)}`}>
                        {Math.round(item.score)}% Match
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium capitalize">
                        {item.material_category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="pt-4 px-1 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-serif font-bold text-[#1C241E] group-hover:text-[#1B3B2B] transition-colors line-clamp-1">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-[#5D6E62]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#76937F]" />
                          {item.city}
                        </span>
                        <span>•</span>
                        <span>{item.quantity_description}</span>
                      </div>

                      <p className="text-xs text-[#5D6E62] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Explainable Recommendation Reason Pill */}
                    <div className="p-3 rounded-2xl bg-[#E2EBD8]/60 border border-[#D5E4C8] text-[11px] text-[#1B3B2B] leading-snug flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#2D5A3E] flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block text-[#1B3B2B] mb-0.5">Why Recommended:</strong>
                        <span>{item.reason}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#E8E2D6] flex items-center justify-between gap-2">
                      <Link
                        to={`/listings/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C241E] hover:text-[#1B3B2B] transition-colors px-2 py-1"
                      >
                        Details
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => handleOpenInterest(item)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B3B2B] hover:bg-[#28533E] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95"
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
