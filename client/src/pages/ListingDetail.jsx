import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchListingById } from '../api/listings.api';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Tag, 
  Box, 
  Calendar, 
  User, 
  Mail, 
  Edit3, 
  ArrowLeft, 
  Heart, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Share2
} from 'lucide-react';

const CATEGORY_COLORS = {
  cardboard: 'bg-amber-100 text-amber-800 border-amber-200',
  wood: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  glass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  textile: 'bg-purple-100 text-purple-800 border-purple-200',
  plastic: 'bg-blue-100 text-blue-800 border-blue-200',
  metal: 'bg-slate-200 text-slate-800 border-slate-300',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function ListingDetail({ onExpressInterest }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchListingById(id);
        if (res.success && res.listing) {
          setListing(res.listing);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Listing not found or could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-medium">Loading material details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-rose-200 rounded-2xl shadow-sm text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">Item Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">{error || 'This listing does not exist.'}</p>
        <Link to="/browse" className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 text-white">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === listing.owner_id;
  const fallbackImage = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80';
  const categoryStyle = CATEGORY_COLORS[listing.material_category] || CATEGORY_COLORS.other;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      
      {/* Top Breadcrumb & Share Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          {copied ? 'Link Copied!' : 'Share'}
        </button>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Showcase */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="aspect-[4/3] w-full bg-slate-100 relative">
            <img
              src={listing.image_url || fallbackImage}
              alt={listing.title}
              onError={(e) => { e.currentTarget.src = fallbackImage; }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-md backdrop-blur-md ${categoryStyle}`}>
                {listing.material_category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/80 text-white shadow-md backdrop-blur-md">
                {listing.status}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {listing.material_type}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {listing.city}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 leading-snug">
                {listing.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium">
                  <strong>Condition:</strong> {listing.condition}
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium">
                  <strong>Quantity:</strong> {listing.quantity_description}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Description &amp; Collection Guidelines:
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Actions for Owner vs Recipient */}
            <div className="pt-4 border-t border-slate-100">
              {isOwner ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 font-medium">
                    You posted this listing.
                  </div>
                  <Link
                    to={`/edit-listing/${listing.id}`}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit or Update Status
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <button
                      onClick={() => onExpressInterest ? onExpressInterest(listing) : alert(`Interest expression modal active in Phase 5!`)}
                      disabled={listing.status !== 'available'}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                      <Heart className="w-4 h-4" />
                      {listing.status === 'available' ? 'Express Interest in Material' : `Item is ${listing.status}`}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    >
                      Sign In to Express Interest
                    </Link>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Donor Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Offered By (Donor Profile)
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                {listing.donor_name?.charAt(0) || 'D'}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{listing.donor_name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {listing.donor_city || listing.city} &bull; Verified Donor
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
