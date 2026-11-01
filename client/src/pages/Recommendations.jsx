import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRecommendations } from '../api/recommendations.api';
import DashboardLayout, { useDashboard } from '../components/DashboardLayout';
import InterestModal from '../components/InterestModal';
import {
  Sparkles,
  MapPin,
  Tag,
  ArrowRight,
  Heart,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Cpu,
  ExternalLink,
  ShieldCheck,
  Package,
  Layers,
  Award,
  ChevronRight,
  ChevronDown,
  Filter,
  Check,
  Store,
  Camera,
  HeartHandshake,
} from 'lucide-react';

const CATEGORY_THUMBNAILS = {
  cardboard: '/thumb-cardboard.jpg',
  wood: '/thumb-wood.jpg',
  glass: '/thumb-glass.jpg',
  textile: '/thumb-textile.jpg',
  plastic: '/thumb-plastic.jpg',
  metal: '/thumb-metal.jpg',
  other: '/thumb-cardboard.jpg',
};

function RecommendationsContent() {
  const { user } = useAuth();
  const { openSettings, openScan, openCenters } = useDashboard();

  const [recommendations, setRecommendations] = useState([]);
  const [engine, setEngine] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);

  // Filters & sorting
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [sortBy, setSortBy] = useState('score'); // 'score', 'newest'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (minMatchScore > 0) count++;
    if (sortBy !== 'score') count++;
    return count;
  }, [minMatchScore, sortBy]);

  const fetchRecs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecommendations(24);
      if (data.success) {
        setRecommendations(data.recommendations || []);
        setEngine(data.engine || 'Explainable Rule-Based Engine');
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
    setSuccessNotice('Proposal dispatched successfully! The donor has been notified for pickup coordination.');
    setTimeout(() => setSuccessNotice(null), 4000);
    fetchRecs();
  };

  // Filter and sort items
  const filteredRecs = useMemo(() => {
    return recommendations
      .filter((item) => {
        if (selectedCategory !== 'all') {
          const cat = (item.material_category || '').toLowerCase();
          if (cat !== selectedCategory.toLowerCase()) return false;
        }
        if (minMatchScore > 0 && (item.score || 0) < minMatchScore) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          return (b.score || 0) - (a.score || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        return 0;
      });
  }, [recommendations, selectedCategory, minMatchScore, sortBy]);

  const topScore = useMemo(() => {
    if (recommendations.length === 0) return 96;
    return Math.round(Math.max(...recommendations.map((r) => r.score || 0)));
  }, [recommendations]);

  const displayFirstName = user?.name ? user.name.split(' ')[0] : 'Maker';

  // Extract unique categories present in recommendations
  const availableCategories = useMemo(() => {
    const set = new Set();
    recommendations.forEach((r) => {
      if (r.material_category) set.add(r.material_category.toLowerCase());
    });
    return Array.from(set);
  }, [recommendations]);

  return (
    <div className="space-y-8">
      
      {/* ========================================================= */}
      {/* 1. TOP HERO SECTION: Welcome Banner                       */}
      {/* ========================================================= */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col">
        
        {/* Top Row: Title, Pill & Banner Graphic */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
          <div className="space-y-2 max-w-xl pt-0.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5ED] text-[#0B3B24] text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#0B3B24]" />
              <span>Explainable AI Match Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A261D] tracking-tight leading-tight flex items-center gap-2">
              <span>AI Material Matches</span>
              <span className="text-3xl sm:text-4xl inline-block -mt-1 select-none">✨</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#2C3A30] font-normal leading-relaxed">
              Clean industrial surplus streams algorithmically ranked for your creative craft disciplines, reuse workshop profile, and local proximity in <strong className="font-semibold text-[#0B3B24]">{user?.city || 'Bengaluru'}</strong>.
            </p>
          </div>

          <div className="w-48 sm:w-56 lg:w-64 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 self-start sm:self-auto shadow-sm">
            <img
              src="/plants-banner.jpg"
              alt="Eco plants & recycling illustration"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Horizontal Divider Line matching Reference */}
        <div className="border-t border-gray-100/90 my-5 sm:my-6" />

        {/* Bottom Metrics Row (3 rounded cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          
          {/* Metric 1: Available Matches */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F9FAF8] border border-gray-100 flex items-center gap-3.5 hover:bg-white hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-[#0B3B24]" />
            </div>
            <div>
              <div className="text-[11px] text-[#586A5E] font-medium leading-tight">
                Available<br />Matches
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1A261D] mt-1 tracking-tight">
                {recommendations.length} Active
              </div>
            </div>
          </div>

          {/* Metric 2: Top Compatibility */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F9FAF8] border border-gray-100 flex items-center gap-3.5 hover:bg-white hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-[#0B3B24]" />
            </div>
            <div>
              <div className="text-[11px] text-[#586A5E] font-medium leading-tight">
                Top Match<br />Score
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1A261D] mt-1 tracking-tight">
                {topScore}% Match
              </div>
            </div>
          </div>

          {/* Metric 3: Active Hub */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F9FAF8] border border-gray-100 flex items-center gap-3.5 hover:bg-white hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-[#0B3B24]" />
            </div>
            <div>
              <div className="text-[11px] text-[#586A5E] font-medium leading-tight">
                Workshop<br />Location
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1A261D] mt-1 tracking-tight truncate max-w-[120px]">
                {user?.city || 'Bengaluru'}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. SUCCESS NOTICE OR ERROR BANNER                         */}
      {/* ========================================================= */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C5E5D1] text-[#0B3B24] text-xs font-bold flex items-center gap-3 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-[#3EA635] shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. FILTER, SORT & QUICK TUNING CONTROLS                   */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#1A261D] flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#0B3B24]" />
              Discipline:
            </span>

            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#0B3B24] text-white shadow-sm'
                  : 'bg-[#F9FAF8] text-[#586A5E] hover:bg-gray-100'
              }`}
            >
              All Streams ({recommendations.length})
            </button>

            {availableCategories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#0B3B24] text-white shadow-sm'
                    : 'bg-[#F9FAF8] text-[#586A5E] hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Single Filter Dropdown Control */}
          <div className="relative self-start md:self-auto shrink-0" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 shadow-sm ${
                isFilterOpen || activeFilterCount > 0
                  ? 'bg-[#0B3B24] text-white border-[#0B3B24]'
                  : 'bg-white text-[#1A261D] border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 ${isFilterOpen || activeFilterCount > 0 ? 'text-[#A3E5B9]' : 'text-[#0B3B24]'}`} />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                  isFilterOpen || activeFilterCount > 0
                    ? 'bg-[#A3E5B9] text-[#0B3B24]'
                    : 'bg-[#0B3B24] text-white'
                }`}>
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 z-40 w-72 sm:w-80 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                
                {/* Header with Title and Reset */}
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#1A261D]">
                    <Filter className="w-3.5 h-3.5 text-[#0B3B24]" />
                    <span>Filter &amp; Sort</span>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setMinMatchScore(0);
                        setSortBy('score');
                      }}
                      className="text-[11px] font-bold text-[#0B3B24] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Option 1: Sort By */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#586A5E] uppercase tracking-wider block">
                    Sort Results
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSortBy('score')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left flex items-center justify-between border ${
                        sortBy === 'score'
                          ? 'bg-[#EAF5ED] text-[#0B3B24] border-[#0B3B24]/30 font-bold'
                          : 'bg-[#F9FAF8] text-[#586A5E] border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span>Highest Match</span>
                      {sortBy === 'score' && <Check className="w-3.5 h-3.5 text-[#0B3B24]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSortBy('newest')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left flex items-center justify-between border ${
                        sortBy === 'newest'
                          ? 'bg-[#EAF5ED] text-[#0B3B24] border-[#0B3B24]/30 font-bold'
                          : 'bg-[#F9FAF8] text-[#586A5E] border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span>Newest First</span>
                      {sortBy === 'newest' && <Check className="w-3.5 h-3.5 text-[#0B3B24]" />}
                    </button>
                  </div>
                </div>

                {/* Option 2: Match Score Threshold */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#586A5E] uppercase tracking-wider block">
                    Match Compatibility
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { label: 'All Compatible Streams (0%+)', score: 0 },
                      { label: '⭐ 80%+ High Match Only', score: 80 },
                      { label: '🌟 60%+ Moderate Match', score: 60 },
                    ].map((tier) => (
                      <button
                        key={tier.score}
                        type="button"
                        onClick={() => setMinMatchScore(tier.score)}
                        className={`w-full px-3 py-2 rounded-xl text-xs text-left transition-all border flex items-center justify-between ${
                          minMatchScore === tier.score
                            ? 'bg-[#EAF5ED] text-[#0B3B24] border-[#0B3B24]/30 font-bold'
                            : 'bg-[#F9FAF8] text-[#586A5E] border-transparent hover:bg-gray-100 font-medium'
                        }`}
                      >
                        <span>{tier.label}</span>
                        {minMatchScore === tier.score && (
                          <Check className="w-3.5 h-3.5 text-[#0B3B24]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option 3: Refresh Stream Action */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-[#586A5E]">Need fresh updates?</span>
                  <button
                    type="button"
                    onClick={() => {
                      fetchRecs();
                      setIsFilterOpen(false);
                    }}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-[#0B3B24] text-white hover:bg-[#125838] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh Streams</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 4. RECOMMENDED SURPLUS STREAM CARDS                       */}
      {/* ========================================================= */}
      <div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 border border-[#D5EEDB] shadow-sm">
              <Layers className="w-6 h-6 text-[#0B3B24]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1A261D] font-serif tracking-tight">
                  Ranked Surplus Stream Feed
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF5ED] text-[#0B3B24] border border-[#D5EEDB]">
                  {filteredRecs.length} Active Materials
                </span>
              </div>
              <p className="text-xs text-[#586A5E] mt-0.5">
                Surplus batches algorithmically ranked with photo verification and workshop compatibility
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openSettings}
            className="text-xs font-bold text-[#0B3B24] hover:underline flex items-center gap-1 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#0B3B24] transition-all shadow-sm"
          >
            <span>Edit Categories &amp; Hub</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[26px] border border-gray-100 p-5 shadow-sm animate-pulse space-y-4"
              >
                <div className="h-44 bg-gray-100 rounded-2xl" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-14 bg-[#EAF5ED]/50 rounded-2xl" />
                <div className="h-9 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredRecs.length === 0 ? (
          /* Empty State with Visual Thumbnail */
          <div className="text-center py-12 bg-white rounded-[32px] border border-gray-100 p-8 space-y-4 shadow-sm max-w-md mx-auto">
            <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto shadow-sm border border-[#D5EEDB]">
              <img
                src="/thumb-cardboard.jpg"
                alt="No surplus matches"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1A261D]">
              No Matching Streams Found
            </h3>
            <p className="text-xs text-[#586A5E] leading-relaxed">
              No active listings currently match the active filters or your craft categories. Try clearing the filter, expanding your preferred disciplines, or browsing the open marketplace.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setMinMatchScore(0);
                }}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#1A261D] transition-colors"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={openSettings}
                className="px-4 py-2 rounded-xl bg-[#0B3B24] hover:bg-[#125838] text-white text-xs font-bold transition-colors"
              >
                Edit Craft Profile
              </button>
            </div>
          </div>
        ) : (
          /* Real Cards Grid with Guaranteed Image Thumbnails */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecs.map((item) => {
              const score = Math.round(item.score || 0);

              // Distinct score badge styling
              const isHighScore = score >= 80;
              const isMediumScore = score >= 50;

              const catKey = (item.material_category || 'other').toLowerCase();
              const categoryThumb = CATEGORY_THUMBNAILS[catKey] || CATEGORY_THUMBNAILS.other;
              const cardThumbnail = item.image_url || categoryThumb;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-[26px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-[#0B3B24]/40 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Top Image Frame with Guaranteed Thumbnail - Clickable */}
                  <Link
                    to={`/listings/${item.id}`}
                    className="block relative aspect-[16/10] w-full overflow-hidden rounded-t-[26px] bg-[#EAF5ED]/40 cursor-pointer"
                    aria-label={`View details for ${item.title}`}
                  >
                    <img
                      src={cardThumbnail}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = categoryThumb;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Top-Right: Match Compatibility Score Pill */}
                    <div className="absolute top-3 right-3 shadow-md pointer-events-none">
                      <span
                        className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1 ${
                          isHighScore
                            ? 'bg-[#0B3B24] text-[#A3E5B9] border border-[#165B37]'
                            : isMediumScore
                              ? 'bg-[#165B37] text-white'
                              : 'bg-gray-800 text-white'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-[#A3E5B9]" />
                        <span>{score}% Match</span>
                      </span>
                    </div>

                    {/* Top-Left: Verified Donor Badge */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#0B3B24] text-[10.5px] font-bold shadow-sm flex items-center gap-1 border border-white/40">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#3EA635]" />
                        <span>Verified Batch</span>
                      </span>
                    </div>

                    {/* Bottom-Left: Category Badge */}
                    <div className="absolute bottom-3 left-3 pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold capitalize shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A3E5B9]" />
                        <span>{item.material_category}</span>
                      </span>
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-1.5">
                      <Link
                        to={`/listings/${item.id}`}
                        className="block group/title cursor-pointer"
                      >
                        <h3 className="text-base font-serif font-bold text-[#1A261D] group-hover/title:text-[#0B3B24] hover:underline transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 text-xs text-[#586A5E]">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#0B3B24]" />
                          {item.city}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-[#0B3B24]">
                          {item.quantity_description || `${item.quantity || ''} ${item.quantity_unit || ''}`}
                        </span>
                      </div>

                      <p className="text-xs text-[#586A5E] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/listings/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1A261D] hover:text-[#0B3B24] transition-colors px-2 py-1"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#586A5E]" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenInterest(item)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3B24] hover:bg-[#125838] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>Request Surplus</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
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

export default function Recommendations() {
  return (
    <DashboardLayout activeTab="recommendations">
      <RecommendationsContent />
    </DashboardLayout>
  );
}
