import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const CATEGORY_STYLES = {
  cardboard: {
    bg: 'bg-[#FCEBE6] text-[#D9381E] border-[#F8D0C7]', // Vermillion tint
    dots: ['#D9381E', '#E64A19', '#EAE3D2'],
  },
  wood: {
    bg: 'bg-[#E1F2E8] text-[#0A5C36] border-[#C5E5D1]', // Emerald tint
    dots: ['#0A5C36', '#0D7A47', '#9DD2B1'],
  },
  glass: {
    bg: 'bg-[#EBF5FB] text-[#1B4F72] border-[#D4E6F1]',
    dots: ['#1B4F72', '#2980B9', '#A9CCE3'],
  },
  textile: {
    bg: 'bg-[#FAF3EB] text-[#873600] border-[#EDBB99]',
    dots: ['#D9381E', '#0A5C36', '#EAE3D2'],
  },
  plastic: {
    bg: 'bg-[#E8F8F5] text-[#117A65] border-[#A3E4D7]',
    dots: ['#0A5C36', '#16A085', '#76D7C4'],
  },
  metal: {
    bg: 'bg-[#F2F3F4] text-[#2C3E50] border-[#D5D8DC]',
    dots: ['#2C3E50', '#7F8C8D', '#BDC3C7'],
  },
  other: {
    bg: 'bg-[#F3ECE0] text-[#0A5C36] border-[#EAE3D2]',
    dots: ['#0A5C36', '#D9381E', '#EAE3D2'],
  },
};

export default function ListingCard({ listing, showScore = false, onRequest }) {
  const navigate = useNavigate();
  const catKey = (listing.material_category || 'cardboard').toLowerCase();
  const fallbackImage = `/thumb-${catKey}.jpg`;
  const categoryConfig = CATEGORY_STYLES[listing.material_category] || CATEGORY_STYLES.other;

  return (
    <div className="group rounded-3xl bg-[#FDFBF7] border border-[#EAE3D2] overflow-hidden hover:shadow-luxury transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between p-3.5 sm:p-4">
      
      {/* Top Image Frame - Clickable to Details */}
      <Link
        to={`/listings/${listing.id}`}
        className="block relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F3ECE0] cursor-pointer"
        aria-label={`View details for ${listing.title}`}
      >
        <img
          src={listing.image_url || fallbackImage}
          alt={listing.title}
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border shadow-sm backdrop-blur-md ${categoryConfig.bg}`}>
            {listing.material_category}
          </span>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#0A5C36]/90 text-white shadow-sm backdrop-blur-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CEEAD8]" />
            {listing.status === 'available' ? 'Available' : listing.status}
          </span>
        </div>

        {/* Optional AI Match Score Pill */}
        {showScore && listing.score !== undefined && (
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-[#0A5C36]/95 text-[#CEEAD8] border border-[#0D7A47] text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-[#D9381E]" />
            <span>{Math.round(listing.score)}% Match</span>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="pt-3.5 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-1.5">
          {/* Dot Swatches (Emerald, Vermillion & Warm Ivory) */}
          <div className="flex items-center gap-1.5 py-0.5">
            {categoryConfig.dots.map((color, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-[11px] font-medium text-[#586A5E] ml-1.5 capitalize">
              {listing.material_type || listing.material_category}
            </span>
          </div>

          {/* Product Name - Clickable to Details */}
          <Link
            to={`/listings/${listing.id}`}
            className="block group/title cursor-pointer"
          >
            <h3 className="text-base font-serif font-bold text-[#1A261D] line-clamp-1 group-hover/title:text-[#0A5C36] hover:underline transition-colors">
              {listing.title}
            </h3>
          </Link>

          <p className="text-xs text-[#586A5E] line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>


        {/* Card Footer: Metadata & Action Button */}
        <div className="pt-3 border-t border-[#EAE3D2] flex items-center justify-between gap-1.5 min-w-0">
          <div className="text-[11px] text-[#586A5E] flex items-center gap-1 min-w-0 flex-1 mr-1">
            <MapPin className="w-3.5 h-3.5 text-[#0A5C36] shrink-0" />
            <span className="truncate">{listing.city}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to={`/listings/${listing.id}`}
              className="text-xs font-semibold text-[#1A261D] hover:text-[#0A5C36] px-1.5 py-1 rounded-lg hover:bg-[#EAE3D2]/40 transition-colors shrink-0 whitespace-nowrap"
            >
              Details
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onRequest) {
                  onRequest(listing);
                } else {
                  navigate(`/listings/${listing.id}?request=1`);
                }
              }}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#0A5C36] text-white hover:bg-[#0D7A47] shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <span>+ Request</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
