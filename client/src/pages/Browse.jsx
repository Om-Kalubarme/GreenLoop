import React, { useState, useEffect } from 'react';
import { fetchListings } from '../api/listings.api';
import ListingCard from '../components/ListingCard';
import { 
  Search, 
  MapPin, 
  X, 
  RefreshCw, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Inbox,
  Sparkles,
  Sliders
} from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All Materials' },
  { id: 'cardboard', label: 'Cardboard & Paper' },
  { id: 'wood', label: 'Wood & Timber' },
  { id: 'glass', label: 'Glass Jars & Bottles' },
  { id: 'textile', label: 'Textiles & Denim' },
  { id: 'plastic', label: 'Clean Plastics' },
  { id: 'metal', label: 'Surplus Metals' },
];

const CITIES = ['', 'Bengaluru', 'Mumbai', 'Pune', 'Delhi', 'Hyderabad', 'Chennai'];
const CONDITIONS = ['', 'Brand New', 'Like New', 'Good', 'Fair', 'Salvage'];

export default function Browse() {
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
        setListings(res.listings);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load materials catalog');
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

  const hasActiveFilters = Boolean(search || selectedCategory || selectedCity || selectedCondition);

  return (
    <div className="bg-[#FAF6EE] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2">
          <div className="text-xs uppercase font-semibold tracking-widest text-[#D9381E]">
            Sustainable Discards Marketplace
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A261D]">
            Browse Materials <span className="font-serif italic font-normal text-[#D9381E]">◇ For Creative Reuse</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#586A5E] max-w-2xl">
            Explore clean cardboard shipping boxes, untreated timber planks, glass containers, and fabric remnants offered by local donors.
          </p>
        </div>

        {/* Filter & Search Bar Container */}
        <div className="bg-white rounded-3xl border border-[#EAE3D2] p-4 sm:p-6 shadow-sm space-y-5">
          
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#586A5E]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by keywords (e.g. shipping boxes, pine pallets, glass jars, denim)..."
                className="w-full pl-11 pr-4 py-3 bg-[#FAF6EE] border border-[#EAE3D2] rounded-full text-xs sm:text-sm text-[#1A261D] placeholder-[#586A5E]/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36] transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider bg-[#0A5C36] text-white hover:bg-[#0D7A47] shadow-emerald-glow transition-all shrink-0 hover:scale-105 active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Facet Selectors */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#0A5C36] text-white border-[#0A5C36] shadow-sm'
                      : 'bg-[#FAF6EE] hover:bg-[#F3ECE0] text-[#1A261D] border-[#EAE3D2]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:block h-5 w-px bg-[#EAE3D2]" />

            {/* City dropdown */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0A5C36]" />
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[#1A261D] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
              >
                <option value="">All Cities</option>
                {CITIES.filter(Boolean).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Condition dropdown */}
            <select
              value={selectedCondition}
              onChange={(e) => {
                setSelectedCondition(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[#1A261D] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
            >
              <option value="">All Conditions</option>
              {CONDITIONS.filter(Boolean).map((cond) => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-[#D9381E] hover:text-[#B72B15] font-semibold px-2 py-1 ml-auto transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}

          </div>

        </div>

        {/* Catalog Results Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-[#586A5E]">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0A5C36] mb-3" />
            <p className="text-xs font-medium">Filtering available materials...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-[#FCEBE6] border border-[#F8D0C7] rounded-3xl text-center text-[#D9381E] text-sm">
            {error}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EAE3D2] p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF6EE] text-[#586A5E] flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#1A261D]">No Materials Matched</h3>
            <p className="text-xs text-[#586A5E]">
              Try adjusting your search keywords, clearing your city filter, or selecting a broader material category.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0A5C36] text-white hover:bg-[#0D7A47] transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-xs text-[#0A5C36] font-semibold">
              Showing {listings.length} of {pagination.total} active material lots available for immediate pickup:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="pt-6 border-t border-[#EAE3D2] flex items-center justify-between">
                <div className="text-xs text-[#586A5E]">
                  Page <span className="font-semibold text-[#1A261D]">{page}</span> of{' '}
                  <span className="font-semibold text-[#1A261D]">{pagination.totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-full border border-[#EAE3D2] bg-white text-[#1A261D] hover:bg-[#FAF6EE] disabled:opacity-40 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="p-2 rounded-full border border-[#EAE3D2] bg-white text-[#1A261D] hover:bg-[#FAF6EE] disabled:opacity-40 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
