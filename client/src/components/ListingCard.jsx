import React from 'react';
import { Link } from 'react-router-dom';
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

export default function ListingCard({ listing, showScore = false }) {
  const fallbackImage = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80';
  const categoryConfig = CATEGORY_STYLES[listing.material_category] || CATEGORY_STYLES.other;

  return (
    <div className="group rounded-3xl bg-[#FDFBF7] border border-[#EAE3D2] overflow-hidden hover:shadow-luxury transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between p-3.5 sm:p-4">
      
      {/* Top Image Frame with Soft Inset */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F3ECE0]">
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

          <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#0A5C36]/90 text-white shadow-sm backdrop-blur-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CEEAD8]" />
            {listing.status === 'available' ? 'Available' : listing.status}
          </span>
        </div>

        {/* Optional AI Match Score Pill */}
        {showScore && listing.score !== undefined && (
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-[#0A5C36]/95 text-[#CEEAD8] border border-[#0D7A47] text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D9381E]" />
            <span>{Math.round(listing.score)}% Match</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="pt-4 px-1 flex-1 flex flex-col justify-between space-y-3">
        
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

          <h3 className="text-base font-serif font-bold text-[#1A261D] line-clamp-1 group-hover:text-[#0A5C36] transition-colors">
            {listing.title}
          </h3>

          <p className="text-xs text-[#586A5E] line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Recommendation Reason Pill */}
        {listing.reason && (
          <div className="p-2.5 rounded-xl bg-[#E1F2E8]/70 border border-[#C5E5D1] text-[11px] text-[#0A5C36] font-medium leading-snug">
            {listing.reason}
          </div>
        )}

        {/* Card Footer: Metadata & Action Button */}
        <div className="pt-3 border-t border-[#EAE3D2] flex items-center justify-between gap-2">
          <div className="text-[11px] text-[#586A5E] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#0A5C36]" />
            <span className="truncate max-w-[100px]">{listing.city}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/listings/${listing.id}`}
              className="text-xs font-semibold text-[#1A261D] hover:text-[#0A5C36] px-2 py-1 transition-colors"
            >
              Details
            </Link>

            <Link
              to={`/listings/${listing.id}`}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0A5C36] text-white hover:bg-[#0D7A47] shadow-emerald-glow transition-all hover:scale-105 active:scale-95"
            >
              <span>+ Request</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
