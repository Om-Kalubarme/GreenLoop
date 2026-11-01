import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { fetchListingById, fetchListings } from '../api/listings.api';
import { fetchInterestsForListing, updateInterestStatus } from '../api/interests.api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import InterestModal from '../components/InterestModal';
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
  Share2,
  ShieldCheck,
  Layers,
  ExternalLink,
  Sparkles,
  Clock,
  ChevronRight,
  Info,
  Check,
  X,
  Package,
  Award,
  Inbox,
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

const CATEGORY_STYLES = {
  cardboard: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: 'Cardboard & Paper' },
  wood: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Wood & Timber' },
  glass: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', label: 'Glass Containers' },
  textile: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', label: 'Textile & Fabrics' },
  plastic: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', label: 'Plastics & Polymers' },
  metal: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', label: 'Metals & Hardware' },
  other: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200', label: 'Mixed Materials' },
};

const CO2_SAVINGS_ESTIMATE = {
  cardboard: '48 kg CO₂e',
  wood: '115 kg CO₂e',
  glass: '62 kg CO₂e',
  textile: '74 kg CO₂e',
  plastic: '88 kg CO₂e',
  metal: '142 kg CO₂e',
  other: '50 kg CO₂e',
};

function ListingDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [relatedListings, setRelatedListings] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [listingInterests, setListingInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [updatingInterestId, setUpdatingInterestId] = useState(null);

  const handleUpdateInterestStatus = async (interestId, newStatus) => {
    setUpdatingInterestId(interestId);
    try {
      const res = await updateInterestStatus(interestId, newStatus);
      if (res.success) {
        setListingInterests((prev) =>
          prev.map((i) => (i.id === interestId ? { ...i, status: newStatus } : i))
        );
        // Sync local listing status
        if (newStatus === 'accepted') {
          setListing((prev) => (prev ? { ...prev, status: 'reserved' } : prev));
        } else if (newStatus === 'declined') {
          setListing((prev) => (prev ? { ...prev, status: 'available' } : prev));
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update request status');
    } finally {
      setUpdatingInterestId(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('request') === '1' || params.get('action') === 'request') {
      setInterestModalOpen(true);
    }
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;

    const loadListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchListingById(id);
        if (res.success && res.listing && isMounted) {
          setListing(res.listing);

          // If current logged-in user is the owner, load reuser inquiries
          if (user && user.id === res.listing.owner_id) {
            setLoadingInterests(true);
            try {
              const intRes = await fetchInterestsForListing(id);
              if (intRes.success && isMounted) {
                setListingInterests(intRes.interests || []);
              }
            } catch (intErr) {
              console.warn('Notice: Failed to load inquiries for listing:', intErr);
            } finally {
              if (isMounted) setLoadingInterests(false);
            }
          }

          // Fetch similar/related streams in parallel
          setLoadingRelated(true);
          try {
            const relRes = await fetchListings({
              city: res.listing.city,
              limit: 4,
            });
            if (relRes.success && isMounted) {
              // Exclude current listing
              const filtered = (relRes.listings || []).filter((item) => item.id !== id).slice(0, 3);
              setRelatedListings(filtered);
            }
          } catch (e) {
            console.warn('Notice: Failed to load related listings:', e);
          } finally {
            if (isMounted) setLoadingRelated(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Listing not found or could not be loaded');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadListing();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [id, user?.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-[#586A5E]">
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0B3B24]" />
        </div>
        <h3 className="text-base font-bold text-[#1A261D]">Loading Material Details</h3>
        <p className="text-xs text-[#586A5E] mt-1">Retrieving verified surplus stream specifications...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 text-center shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#1A261D]">Material Stream Unavailable</h2>
            <p className="text-sm text-[#586A5E] mt-2 max-w-md mx-auto">
              {error || 'This material listing does not exist, has already been matched, or has been removed.'}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/recommendations')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B3B24] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#165B37] transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to AI Matches
            </button>
            <button
              onClick={() => navigate('/browse')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-[#1A261D] text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-all"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = isAuthenticated && user && user.id === listing.owner_id;
  const categoryKey = listing.material_category?.toLowerCase() || 'other';
  const categoryMeta = CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES.other;
  const localThumbnail = CATEGORY_THUMBNAILS[categoryKey] || '/thumb-cardboard.jpg';
  const displayImage = listing.image_url || localThumbnail;
  const co2Savings = CO2_SAVINGS_ESTIMATE[categoryKey] || '55 kg CO₂e';

  // Format posted date
  const dateFormatted = listing.created_at
    ? new Date(listing.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* ============================================================ */}
      {/* 1. TOP BREADCRUMB / ACTION BAR (Clean Navigation) */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#586A5E]">
          <button
            onClick={() => navigate('/recommendations')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#0B3B24] hover:bg-emerald-50 hover:border-emerald-200 transition-all font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AI Matches
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">Surplus Stream Feed</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400 font-normal truncate max-w-[200px] sm:max-w-xs">{listing.title}</span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-[#1A261D] hover:bg-gray-50 transition-all shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#0B3B24]" />
                <span>Share Stream</span>
              </>
            )}
          </button>
          <Link
            to="/recommendations"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0B3B24] hover:bg-emerald-50 transition-colors"
          >
            <span>All Matches</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN SURPLUS STREAM PROFILE (Executive Card Structure) */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden p-6 sm:p-8 space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* -------------------------------------------------------- */}
          {/* Left Column: Photo Showcase & Verification & Circular Metrics */}
          {/* -------------------------------------------------------- */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Image Container with guaranteed fallback and badges */}
            <div className="aspect-[4/3] w-full rounded-2xl relative overflow-hidden bg-gray-100 border border-gray-200/80 shadow-inner group">
              <img
                src={displayImage}
                alt={listing.title}
                onError={(e) => {
                  e.currentTarget.src = localThumbnail;
                }}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />

              {/* Floating Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A3E5B9]" />
                  <span>{categoryMeta.label}</span>
                </span>
              </div>

              {/* Floating Status Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3.5 py-1.5 rounded-full bg-[#0B3B24]/90 backdrop-blur-md text-white text-xs font-semibold shadow-md flex items-center gap-1.5 capitalize">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{listing.status === 'available' ? 'Available for Match' : listing.status}</span>
                </span>
              </div>

              {/* Bottom Gradient overlay with City & Location tag */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 flex items-center justify-between text-white text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-[#A3E5B9]" />
                  {listing.city} Verified Hub
                </span>
                <span className="text-white/80 text-[11px] font-mono">
                  ID: #{listing.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Environmental & Circular Impact Matrix */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  CO₂e Avoided
                </div>
                <div className="text-base font-bold text-[#0B3B24] mt-0.5">
                  {co2Savings}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 text-center">
                <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                  Landfill Diverted
                </div>
                <div className="text-base font-bold text-teal-900 mt-0.5">
                  100%
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                  Circular Match
                </div>
                <div className="text-base font-bold text-blue-900 mt-0.5">
                  Direct Reuse
                </div>
              </div>
            </div>

            {/* Verified Donor Details Card */}
            <div className="bg-[#F8FAFC] border border-gray-200/90 rounded-2xl p-5 space-y-3">
              <div className="text-[11px] font-bold text-[#586A5E] uppercase tracking-wider flex items-center justify-between">
                <span>Material Donor &amp; Source</span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold lowercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E1F2E8] border-2 border-emerald-500/40 shrink-0 flex items-center justify-center shadow-sm">
                  {listing.donor_name?.toLowerCase().includes('rahul') ? (
                    <img
                      src="/rahul-avatar.jpg"
                      alt={listing.donor_name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-serif font-bold text-base text-[#0B3B24]">
                      {listing.donor_name ? listing.donor_name.charAt(0) : 'D'}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#1A261D] truncate">
                    {listing.donor_name || 'Industrial Logistics Donor'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#586A5E] mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0B3B24]" />
                      {listing.donor_city || listing.city}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">Fast 2-4h Response</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200/70 flex items-center justify-between text-[11px] text-[#586A5E]">
                <span>Registered Community Donor</span>
                <span>Direct Local Pickup</span>
              </div>
            </div>

          </div>

          {/* -------------------------------------------------------- */}
          {/* Right Column: Key Material Specs, Guidelines & Action */}
          {/* -------------------------------------------------------- */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF6ED] text-[#0B3B24] border border-[#D5EEDB]">
                  {listing.material_type || categoryMeta.label}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0B3B24]" />
                  {listing.city}
                </span>
                <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Listed {dateFormatted}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A261D] leading-tight">
                {listing.title}
              </h1>
            </div>

            {/* Specifications Matrix Grid (4 Key Attributes) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Material Category
                </div>
                <div className="text-sm font-bold text-[#1A261D] mt-1 capitalize">
                  {listing.material_category}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Condition Grade
                </div>
                <div className="text-sm font-bold text-[#1A261D] mt-1">
                  {listing.condition || 'Clean & Sorted'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Available Quantity
                </div>
                <div className="text-sm font-bold text-[#0B3B24] mt-1">
                  {listing.quantity_description}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Handoff Location
                </div>
                <div className="text-sm font-bold text-[#1A261D] mt-1">
                  {listing.city} (Direct Hub)
                </div>
              </div>
            </div>

            {/* Description & Handling Notes */}
            <div className="p-5 rounded-2xl bg-[#F9FAF8] border border-gray-200/80 space-y-2">
              <div className="text-xs font-bold text-[#0B3B24] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#3EA635]" />
                <span>Stream Description &amp; Collection Guidelines</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line font-normal">
                {listing.description}
              </p>
              <div className="pt-2 text-[11px] text-gray-500 flex items-center gap-1.5 border-t border-gray-200/60 mt-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pickup coordination arranged directly between verified sender and recipient.</span>
              </div>
            </div>

            {/* Primary Action Button / Proposal Flow */}
            <div className="pt-2 space-y-3">
              {interestSubmitted && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">Proposal Submitted Successfully!</div>
                    <div className="text-xs font-normal text-emerald-800">
                      The donor has received your intended reuse plan and collection timeline.
                    </div>
                  </div>
                </div>
              )}

              {isOwner ? (
                <div className="space-y-4">
                  <div className="space-y-3 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="text-xs text-gray-600 font-medium">
                      You posted this surplus stream. You can edit specs or update available status anytime.
                    </div>
                    <Link
                      to={`/edit-listing/${listing.id}`}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#0B3B24] text-white hover:bg-[#165B37] shadow-sm transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit or Update Stream Status
                    </Link>
                  </div>

                  {/* Reuser Inquiries Feed on This Listing */}
                  <div className="p-4 rounded-2xl bg-[#F9FAF8] border border-gray-200/90 shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200/70">
                      <span className="text-xs font-bold text-[#1A261D] flex items-center gap-1.5">
                        <Inbox className="w-4 h-4 text-[#0B3B24]" />
                        Incoming Reuser Requests ({listingInterests.length})
                      </span>
                      <Link
                        to="/interests?tab=received"
                        className="text-[11px] font-bold text-[#0B3B24] hover:underline"
                      >
                        All Inquiries &rarr;
                      </Link>
                    </div>

                    {loadingInterests ? (
                      <div className="text-xs text-gray-400 py-3 flex items-center justify-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0B3B24]" />
                        <span>Checking inquiries...</span>
                      </div>
                    ) : listingInterests.length === 0 ? (
                      <p className="text-xs text-[#586A5E] py-2 text-center">
                        No reuse proposals submitted on this material yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {listingInterests.map((reqItem) => (
                          <div key={reqItem.id} className="p-3.5 rounded-xl bg-white border border-gray-200 text-xs space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#1A261D] text-sm">{reqItem.recipient_name}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                reqItem.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                                reqItem.status === 'declined' ? 'bg-gray-200 text-gray-600' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {reqItem.status}
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs italic">"{reqItem.message}"</p>
                            <div className="text-[11px] text-gray-500 flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2">
                              <span>{reqItem.recipient_email} • {reqItem.recipient_city || 'Local'}</span>
                              
                              {/* Direct Accept / Decline Buttons on ListingDetail */}
                              {reqItem.status === 'pending' ? (
                                <div className="flex items-center gap-1.5 ml-auto">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateInterestStatus(reqItem.id, 'accepted')}
                                    disabled={updatingInterestId === reqItem.id}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0B3B24] hover:bg-[#125838] text-white flex items-center gap-1 shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateInterestStatus(reqItem.id, 'declined')}
                                    disabled={updatingInterestId === reqItem.id}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                                  >
                                    <X className="w-3 h-3" />
                                    <span>Decline</span>
                                  </button>
                                </div>
                              ) : (
                                <Link to="/interests?tab=received" className="text-[#0B3B24] font-bold hover:underline ml-auto">
                                  View in Proposals &rarr;
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => setInterestModalOpen(true)}
                      disabled={listing.status !== 'available'}
                      className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-sm bg-[#0B3B24] hover:bg-[#165B37] text-white transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>
                        {listing.status === 'available'
                          ? 'Request Surplus / Submit Reuse Proposal'
                          : `Stream is ${listing.status}`}
                      </span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-sm bg-[#0B3B24] hover:bg-[#165B37] text-white transition-all shadow-md"
                    >
                      Sign In to Request This Surplus Stream
                    </Link>
                  )}
                  <p className="text-[11px] text-center text-gray-400">
                    Zero scrap fees for verified creative makers, architects &amp; circular upcyclers.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. SIMILAR SURPLUS STREAMS IN CITY (No Dead-Ends) */}
      {/* ============================================================ */}
      {relatedListings.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1A261D]">
                More Surplus Streams in {listing.city}
              </h2>
              <p className="text-xs text-[#586A5E]">
                Nearby verified industrial &amp; commercial scrap batches ready for local match.
              </p>
            </div>
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0B3B24] hover:underline"
            >
              <span>View All AI Matches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedListings.map((relItem) => {
              const relCat = relItem.material_category?.toLowerCase() || 'other';
              const relThumb = CATEGORY_THUMBNAILS[relCat] || '/thumb-cardboard.jpg';
              return (
                <div
                  key={relItem.id}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col hover:border-emerald-300 transition-all hover:shadow-md group"
                >
                  <Link
                    to={`/listings/${relItem.id}`}
                    className="block aspect-[16/10] relative overflow-hidden bg-gray-100 cursor-pointer"
                    aria-label={`View details for ${relItem.title}`}
                  >
                    <img
                      src={relItem.image_url || relThumb}
                      alt={relItem.title}
                      onError={(e) => {
                        e.currentTarget.src = relThumb;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 pointer-events-none">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase">
                        {relItem.material_category}
                      </span>
                    </div>
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <Link
                        to={`/listings/${relItem.id}`}
                        className="block group/title cursor-pointer"
                      >
                        <h4 className="text-sm font-bold text-[#1A261D] line-clamp-1 group-hover/title:text-[#0B3B24] hover:underline transition-colors">
                          {relItem.title}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-[#586A5E] mt-1">
                        <MapPin className="w-3 h-3 text-[#0B3B24]" />
                        <span>{relItem.city}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#0B3B24]">{relItem.quantity_description}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 capitalize">{relItem.condition || 'Good'}</span>
                      <Link
                        to={`/listings/${relItem.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0B3B24] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Proposal Request Modal */}
      <InterestModal
        listing={listing}
        isOpen={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        onSuccess={() => {
          setInterestSubmitted(true);
        }}
      />
    </div>
  );
}

export default function ListingDetail() {
  return (
    <DashboardLayout activeTab="recommendations">
      <ListingDetailContent />
    </DashboardLayout>
  );
}
