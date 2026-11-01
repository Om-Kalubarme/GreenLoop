import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchListings } from '../api/listings.api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import InterestModal from '../components/InterestModal';
import {
  Store,
  Search,
  MapPin,
  X,
  RefreshCw,
  Layers,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Filter,
  Check,
  ChevronDown,
  ExternalLink,
  Heart,
  CheckCircle2,
  AlertCircle,
  Tag,
  ShieldCheck,
  Package,
} from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All Materials' },
  { id: 'cardboard', label: 'Cardboard & Paper' },
  { id: 'wood', label: 'Wood & Timber' },
  { id: 'glass', label: 'Glass Containers' },
  { id: 'textile', label: 'Textiles & Fabrics' },
  { id: 'plastic', label: 'Plastics & Polymers' },
  { id: 'metal', label: 'Metals & Hardware' },
];

const CITIES = ['', 'Bengaluru', 'Mumbai', 'Pune', 'Delhi', 'Hyderabad', 'Chennai'];
const CONDITIONS = ['', 'Brand New', 'Like New', 'Good', 'Fair', 'Salvage'];

const CATEGORY_THUMBNAILS = {
  cardboard: '/thumb-cardboard.jpg',
  wood: '/thumb-wood.jpg',
  glass: '/thumb-glass.jpg',
  textile: '/thumb-textile.jpg',
  plastic: '/thumb-plastic.jpg',
  metal: '/thumb-metal.jpg',
  other: '/thumb-cardboard.jpg',
};

function BrowseContent() {
  const { user, isAuthenticated } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 12 });

  // Filter dropdown state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  // Interest Modal state
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 12,
        status: 'available',
        ...(search.trim() && { search: search.trim() }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedCity && { city: selectedCity }),
        ...(selectedCondition && { condition: selectedCondition }),
      };

      const res = await fetchListings(params);
      if (res.success) {
        setListings(res.listings || []);
        setPagination(res.pagination || { total: res.listings?.length || 0, totalPages: 1, limit: 12 });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load marketplace materials catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [selectedCategory, selectedCity, selectedCondition, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadListings();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedCity('');
    setSelectedCondition('');
    setPage(1);
  };

  const handleOpenInterest = (item) => {
    setSelectedListing(item);
    setIsModalOpen(true);
  };

  const handleInterestSuccess = () => {
    setSuccessNotice('Interest proposal submitted successfully! The donor has been notified.');
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const activeFilterCount = [
    Boolean(selectedCategory),
    Boolean(selectedCity),
    Boolean(selectedCondition),
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0B3B24] flex items-center justify-between text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. HERO HEADER BANNER (Consistent Forest Green System) */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B3B24] via-[#0D4A2D] to-[#125838] p-6 sm:p-8 text-white shadow-lg space-y-6">
        
        {/* Subtle decorative background circles */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#A3E5B9] text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20">
              <Store className="w-3.5 h-3.5" />
              <span>Circular Marketplace</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Surplus Materials Marketplace
            </h1>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Explore and request clean commercial discards, shipping packaging, untreated timber, glass containers, and fabric remnants available for creative reuse.
            </p>
          </div>

          {/* Quick Metrics Strip inside Hero */}
          <div className="grid grid-cols-2 gap-3 md:w-auto w-full">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[100px]">
              <div className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Active Lots</div>
              <div className="text-lg font-bold text-white mt-0.5">{pagination.total || listings.length}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[100px]">
              <div className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Streams</div>
              <div className="text-lg font-bold text-[#A3E5B9] mt-0.5">6 Verified</div>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. SEARCH BAR & SINGLE "FILTER" DROPDOWN */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-4 sm:p-5 shadow-sm space-y-3">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Keyword Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, grade, or material (e.g. shipping boxes, timber, pallets, denim)..."
              className="w-full pl-11 pr-10 py-3 bg-[#F8FAFC] border border-gray-200 rounded-2xl text-xs sm:text-sm text-[#1A261D] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                  loadListings();
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-[#0B3B24] text-white hover:bg-[#165B37] shadow-sm transition-all"
          >
            Search
          </button>

          {/* Single "Filter" Button with Dropdown Container */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2.5 px-4 py-3 rounded-2xl border text-xs font-bold transition-all shadow-sm ${
                isFilterOpen || activeFilterCount > 0
                  ? 'bg-emerald-50 border-[#0B3B24] text-[#0B3B24]'
                  : 'bg-white border-gray-200 text-[#1A261D] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#0B3B24]" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#0B3B24] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-gray-200 shadow-2xl p-5 z-50 space-y-4 animate-in fade-in zoom-in-95">
                
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="text-xs font-bold text-[#1A261D] uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[#0B3B24]" />
                    <span>Filter Surplus Options</span>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Material Category */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                    Material Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0B3B24]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location / City */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                    Hub Location
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0B3B24]"
                  >
                    <option value="">All Cities</option>
                    {CITIES.filter(Boolean).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                    Batch Condition
                  </label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => {
                      setSelectedCondition(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0B3B24]"
                  >
                    <option value="">All Conditions</option>
                    {CONDITIONS.filter(Boolean).map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Footer action in dropdown */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    {pagination.total} matching lots
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#0B3B24] text-white text-xs font-bold hover:bg-[#165B37] transition-all"
                  >
                    Apply Filters
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Active Filters Tag Strip */}
        {(selectedCategory || selectedCity || selectedCondition || search) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 text-xs">
            <span className="text-gray-400 text-[11px] font-medium">Active Filters:</span>

            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                <span>Keyword: "{search}"</span>
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                    loadListings();
                  }}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3B24] text-xs font-semibold capitalize">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory('')} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCity && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3B24] text-xs font-semibold">
                <span>City: {selectedCity}</span>
                <button onClick={() => setSelectedCity('')} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCondition && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3B24] text-xs font-semibold">
                <span>Condition: {selectedCondition}</span>
                <button onClick={() => setSelectedCondition('')} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearFilters}
              className="text-xs text-red-600 hover:underline font-semibold ml-auto"
            >
              Clear All
            </button>
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* 3. SURPLUS MATERIALS GRID (Clean Cards, Zero Clutter) */}
      {/* ============================================================ */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
          <div>
            Showing <strong className="text-[#0B3B24]">{listings.length}</strong> of{' '}
            <strong className="text-[#0B3B24]">{pagination.total}</strong> active surplus batches
          </div>
          <div className="text-gray-400">
            Page {page} of {pagination.totalPages}
          </div>
        </div>

        {loading ? (
          <div className="min-h-[45vh] flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-200 text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0B3B24] mb-3" />
            <p className="text-xs font-semibold text-[#1A261D]">Loading marketplace surplus streams...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center text-red-700 text-xs font-semibold space-y-2">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
            <p>{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
              <Inbox className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#1A261D]">No Matching Surplus Batches</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No active material streams match your chosen filters. Try adjusting your keyword, expanding city boundaries, or resetting filters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0B3B24] text-white hover:bg-[#165B37] transition-all shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => {
              const catKey = (item.material_category || 'other').toLowerCase();
              const thumbnailSrc = CATEGORY_THUMBNAILS[catKey] || '/thumb-cardboard.jpg';
              const displayImage = item.image_url || thumbnailSrc;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-200/90 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Image Frame - Clickable */}
                  <Link
                    to={`/listings/${item.id}`}
                    className="block aspect-[16/10] relative overflow-hidden bg-gray-100 cursor-pointer"
                    aria-label={`View details for ${item.title}`}
                  >
                    <img
                      src={displayImage}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.src = thumbnailSrc;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Floating Category Badge */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold capitalize shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A3E5B9]" />
                        <span>{item.material_category}</span>
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-[#0B3B24]/90 backdrop-blur-md text-white text-[11px] font-medium shadow-sm flex items-center gap-1 capitalize">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{item.status === 'available' ? 'Available' : item.status}</span>
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

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Showing page <span className="font-bold text-[#1A261D]">{page}</span> of{' '}
              <span className="font-bold text-[#1A261D]">{pagination.totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all shadow-sm"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
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

export default function Browse() {
  return (
    <DashboardLayout activeTab="browse">
      <BrowseContent />
    </DashboardLayout>
  );
}
