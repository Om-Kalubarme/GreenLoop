import React, { useState, useEffect } from 'react';
import { fetchListings } from '../api/listings.api';
import ListingCard from '../components/ListingCard';
import { 
  Search, 
  Filter, 
  MapPin, 
  X, 
  RefreshCw, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Inbox
} from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'cardboard', label: 'Cardboard & Paper' },
  { id: 'wood', label: 'Wood & Timber' },
  { id: 'glass', label: 'Glass Containers' },
  { id: 'textile', label: 'Textiles & Scraps' },
  { id: 'plastic', label: 'Plastics & Tins' },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Reusable Material Marketplace
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse Discarded Materials for Reuse
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search verified surplus listings from workshops, households, and companies in your city.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by material keywords (e.g. shipping boxes, pallet planks, glass jars)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-all shrink-0"
            >
              Search
            </button>
          </form>

          {/* Facet Selectors */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            
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
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:block h-5 w-px bg-slate-200" />

            {/* City dropdown */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-semibold px-2 py-1 ml-auto"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Catalog Results Grid */}
      {loading ? (
        <div className="min-h-[45vh] flex flex-col items-center justify-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-sm font-medium">Filtering available materials...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-800 text-sm">
          {error}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Materials Matched</h3>
          <p className="text-xs text-slate-500 mb-6">
            Try adjusting your search keywords, clearing your city filter, or selecting a broader material category.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing <strong>{listings.length}</strong> of <strong>{pagination.total}</strong> active listings</span>
            <span>Page {page} of {pagination.totalPages}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-600">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
