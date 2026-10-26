import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchListingById } from '../api/listings.api';
import { useAuth } from '../context/AuthContext';
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
  Share2
} from 'lucide-react';

const CATEGORY_COLORS = {
  cardboard: 'bg-[#FCEBE6] text-[#D9381E] border-[#F8D0C7]',
  wood: 'bg-[#E1F2E8] text-[#0A5C36] border-[#C5E5D1]',
  glass: 'bg-[#EBF5FB] text-[#1B4F72] border-[#D4E6F1]',
  textile: 'bg-[#FAF3EB] text-[#873600] border-[#EDBB99]',
  plastic: 'bg-[#E8F8F5] text-[#117A65] border-[#A3E4D7]',
  metal: 'bg-[#F2F3F4] text-[#2C3E50] border-[#D5D8DC]',
  other: 'bg-[#F3ECE0] text-[#0A5C36] border-[#EAE3D2]',
};

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [interestSubmitted, setInterestSubmitted] = useState(false);

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#586A5E] bg-[#FAF6EE]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0A5C36] mb-3" />
        <p className="text-xs font-medium">Loading material details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] py-16 px-4">
        <div className="max-w-md mx-auto p-8 bg-[#FDFBF7] border border-[#F8D0C7] rounded-3xl shadow-sm text-center">
          <AlertCircle className="w-10 h-10 text-[#D9381E] mx-auto mb-3" />
          <h2 className="text-lg font-serif font-bold text-[#1A261D] mb-2">Item Unavailable</h2>
          <p className="text-xs text-[#586A5E] mb-6">{error || 'This material listing does not exist or has been removed.'}</p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0A5C36] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0D7A47] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = isAuthenticated && user && user.id === listing.owner_id;
  const fallbackImage = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80';
  const categoryStyle = CATEGORY_COLORS[listing.material_category] || CATEGORY_COLORS.other;

  return (
    <div className="min-h-screen bg-[#FAF6EE] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#586A5E] hover:text-[#0A5C36] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Materials Marketplace
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDFBF7] border border-[#EAE3D2] text-xs font-semibold text-[#1A261D] hover:bg-[#F3ECE0] transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-[#0A5C36]" />
            <span>{copied ? 'Link Copied!' : 'Share Listing'}</span>
          </button>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Image Showcase */}
          <div className="lg:col-span-7 bg-[#FDFBF7] rounded-3xl border border-[#EAE3D2] overflow-hidden shadow-luxury p-3">
            <div className="aspect-[4/3] w-full bg-[#F3ECE0] rounded-2xl relative overflow-hidden">
              <img
                src={listing.image_url || fallbackImage}
                alt={listing.title}
                onError={(e) => { e.currentTarget.src = fallbackImage; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-md backdrop-blur-md ${categoryStyle}`}>
                  {listing.material_category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#0A5C36]/90 text-white shadow-md backdrop-blur-md capitalize">
                  {listing.status}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#FDFBF7] rounded-3xl border border-[#EAE3D2] p-6 sm:p-8 shadow-luxury space-y-5">
              
              {/* Header info */}
              <div>
                <div className="flex items-center justify-between text-xs text-[#586A5E] mb-2">
                  <span className="font-semibold text-[#0A5C36] bg-[#E1F2E8] px-3 py-0.5 rounded-full">
                    {listing.material_type}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-[#0A5C36]" />
                    {listing.city}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A261D] leading-snug">
                  {listing.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <div className="px-3 py-1.5 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[#1A261D] font-medium">
                    <strong>Condition:</strong> {listing.condition}
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[#1A261D] font-medium">
                    <strong>Quantity:</strong> {listing.quantity_description}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-[#EAE3D2]">
                <h2 className="text-xs font-bold text-[#0A5C36] uppercase tracking-wider mb-2">
                  Description &amp; Collection Guidelines:
                </h2>
                <p className="text-xs text-[#1A261D] leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Actions for Owner vs Recipient */}
              <div className="pt-4 border-t border-[#EAE3D2]">
                {isOwner ? (
                  <div className="space-y-3">
                    <div className="text-xs text-[#586A5E] font-medium">
                      You posted this material listing.
                    </div>
                    <Link
                      to={`/edit-listing/${listing.id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full font-bold text-xs uppercase tracking-wider bg-[#0A5C36] text-white hover:bg-[#0D7A47] shadow-emerald-glow transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit or Update Status
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {interestSubmitted && (
                      <div className="p-3.5 rounded-2xl bg-[#E1F2E8] border border-[#C5E5D1] text-[#0A5C36] text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#0A5C36]" />
                        Interest request submitted! The donor will review your proposal.
                      </div>
                    )}

                    {isAuthenticated ? (
                      <button
                        onClick={() => setInterestModalOpen(true)}
                        disabled={listing.status !== 'available'}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider bg-[#D9381E] text-white hover:bg-[#B72B15] shadow-vermillion-glow transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        <Heart className="w-4 h-4 fill-white" />
                        {listing.status === 'available' ? 'Express Interest in Material' : `Item is ${listing.status}`}
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider bg-[#0A5C36] text-white hover:bg-[#0D7A47] shadow-emerald-glow transition-all"
                      >
                        Sign In to Express Interest
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Donor Contact Information */}
              <div className="pt-4 border-t border-[#EAE3D2] space-y-2">
                <h3 className="text-xs font-bold text-[#586A5E] uppercase tracking-wider">
                  Material Donor Details:
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E1F2E8] text-[#0A5C36] font-serif font-bold text-sm flex items-center justify-center">
                    {listing.donor_name ? listing.donor_name.charAt(0) : 'D'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1A261D]">{listing.donor_name}</div>
                    <div className="text-[11px] text-[#586A5E]">{listing.donor_city} • Community Verified</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Interest Proposal Modal */}
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
