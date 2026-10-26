import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Tag, Box, ArrowUpRight, Sparkles } from 'lucide-react';

const CATEGORY_COLORS = {
  cardboard: 'bg-amber-100 text-amber-800 border-amber-200',
  wood: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  glass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  textile: 'bg-purple-100 text-purple-800 border-purple-200',
  plastic: 'bg-blue-100 text-blue-800 border-blue-200',
  metal: 'bg-slate-200 text-slate-800 border-slate-300',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function ListingCard({ listing, showScore = false }) {
  const fallbackImage = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80';
  const categoryStyle = CATEGORY_COLORS[listing.material_category] || CATEGORY_COLORS.other;

  return (
    <div className="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      
      {/* Image Thumbnail Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
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
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm backdrop-blur-md ${categoryStyle}`}>
            {listing.material_category}
          </span>

          {listing.status === 'available' ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-600/90 text-white shadow-sm backdrop-blur-sm">
              Available
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800/90 text-white shadow-sm backdrop-blur-sm capitalize">
              {listing.status}
            </span>
          )}
        </div>

        {/* Optional AI Match Score Pill */}
        {showScore && listing.score !== undefined && (
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-900/90 text-emerald-400 border border-emerald-500/30 text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Match: {Math.round(listing.score)}/100</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Location and Type header */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700 truncate">{listing.material_type}</span>
            <span className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {listing.city}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {listing.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Explainable recommendation reason if present */}
        {listing.reason && (
          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-[11px] text-emerald-900 font-medium leading-snug">
            {listing.reason}
          </div>
        )}

        {/* Card Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-slate-600">
            <span className="font-semibold text-slate-900">Qty:</span> {listing.quantity_description}
          </div>

          <Link
            to={`/listings/${listing.id}`}
            className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 group/link"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

      </div>

    </div>
  );
}
