import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const CATEGORY_STYLES = {
  cardboard: {
    bg: 'bg-[#F2ECE1] text-[#7A5B35] border-[#E2D5C3]',
    dots: ['#B8860B', '#DEB887', '#D2B48C'],
  },
  wood: {
    bg: 'bg-[#EBF1E6] text-[#2D5A3E] border-[#D5E3CD]',
    dots: ['#2D5A3E', '#587461', '#A3B899'],
  },
  glass: {
    bg: 'bg-[#E6EEF2] text-[#2E5868] border-[#CCE0E8]',
    dots: ['#2E5868', '#5E8898', '#99BAC7'],
  },
  textile: {
    bg: 'bg-[#EFE8F2] text-[#5C3D66] border-[#DCCFE0]',
    dots: ['#5C3D66', '#886794', '#BFADC7'],
  },
  plastic: {
    bg: 'bg-[#E7EFF5] text-[#294B6E] border-[#C8DBEB]',
    dots: ['#294B6E', '#53769D', '#9BB4D0'],
  },
  metal: {
    bg: 'bg-[#EAEAEA] text-[#3D474D] border-[#D0D4D6]',
    dots: ['#3D474D', '#68737A', '#A3ABAF'],
  },
  other: {
    bg: 'bg-[#EFEAE1] text-[#554C41] border-[#DDD5C9]',
    dots: ['#76937F', '#C86D51', '#D5CABE'],
  },
};

export default function ListingCard({ listing, showScore = false, onExpressInterest }) {
  const fallbackImage = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80';
  const categoryConfig = CATEGORY_STYLES[listing.material_category] || CATEGORY_STYLES.other;

  return (
    <div className="group rounded-3xl bg-[#FAF7F2] border border-[#E8E2D6] overflow-hidden hover:shadow-luxury transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between p-3.5 sm:p-4">
      
      {/* Top Image Frame with Soft Inset */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#EFE9DF]">
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
          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border shadow-sm backdrop-blur-md ${categoryConfig.bg}`}>
            {listing.material_category}
          </span>

          <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#1B3B2B]/90 text-white shadow-sm backdrop-blur-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2EBD8]" />
            {listing.status === 'available' ? 'Available' : listing.status}
          </span>
        </div>

        {/* Optional AI Match Score Pill */}
        {showScore && listing.score !== undefined && (
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-[#1B3B2B]/90 text-[#E2EBD8] border border-[#76937F]/40 text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E2EBD8]" />
            <span>{Math.round(listing.score)}% Match</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="pt-4 px-1 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-1.5">
          {/* Dot Swatches (Inspired by the products section in the reference design) */}
          <div className="flex items-center gap-1.5 py-0.5">
            {categoryConfig.dots.map((color, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-[11px] font-medium text-[#76937F] ml-1.5 capitalize">
              {listing.material_type || listing.material_category}
            </span>
          </div>

          <h3 className="text-base font-serif font-bold text-[#1C241E] line-clamp-1 group-hover:text-[#1B3B2B] transition-colors">
            {listing.title}
          </h3>

          <p className="text-xs text-[#5D6E62] line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Recommendation Reason Pill */}
        {listing.reason && (
          <div className="p-2.5 rounded-xl bg-[#E2EBD8]/60 border border-[#D5E4C8] text-[11px] text-[#1B3B2B] font-medium leading-snug">
            {listing.reason}
          </div>
        )}

        {/* Card Footer: Metadata & Action Button */}
        <div className="pt-3 border-t border-[#E8E2D6] flex items-center justify-between gap-2">
          <div className="text-[11px] text-[#5D6E62] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#76937F]" />
            <span className="truncate max-w-[100px]">{listing.city}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/listings/${listing.id}`}
              className="text-xs font-semibold text-[#1C241E] hover:text-[#1B3B2B] px-2 py-1 transition-colors"
            >
              Details
            </Link>

            <Link
              to={`/listings/${listing.id}`}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1B3B2B] text-white hover:bg-[#28533E] shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <span>+ Request</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
