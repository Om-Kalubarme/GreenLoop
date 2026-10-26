import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyListings } from '../api/listings.api';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  MapPin, 
  Edit3, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Archive, 
  ArrowRight,
  Inbox
} from 'lucide-react';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMyListings();
      if (res.success) {
        setListings(res.listings);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const totalCount = listings.length;
  const availableCount = listings.filter((l) => l.status === 'available').length;
  const reservedCount = listings.filter((l) => l.status === 'reserved').length;
  const archivedCount = listings.filter((l) => l.status === 'archived').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            Donor Control Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Material Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and manage your posted surplus materials and monitor interest from community reusers.
          </p>
        </div>

        <Link
          to="/create-listing"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Offer New Material
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Total Posted</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600">Available</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">{availableCount}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-amber-600">Reserved</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1">{reservedCount}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Archived</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-600 mt-1">{archivedCount}</div>
        </div>
      </div>

      {/* Listing Cards / Table */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-sm font-medium">Loading your listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Material Listings Yet</h3>
          <p className="text-xs text-slate-500 mb-6">
            Help local creators, students, and recyclers by posting your first reusable discard.
          </p>
          <Link
            to="/create-listing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    item.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                    item.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.interests_count || 0} Interest Requests
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{item.title}</h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span><strong>Qty:</strong> {item.quantity_description}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {item.city}
                  </span>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <Link
                  to={`/listings/${item.id}`}
                  className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Link>

                <Link
                  to={`/edit-listing/${item.id}`}
                  className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit / Update
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
