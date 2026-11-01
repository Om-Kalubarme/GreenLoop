import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyListings } from '../api/listings.api';
import { useAuth } from '../context/AuthContext';
import DonorSalesChart from '../components/DonorSalesChart';
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D2]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1F2E8] border border-[#CEEAD8] text-[#0A5C36] text-xs font-semibold mb-2">
            <Package className="w-3.5 h-3.5 text-[#0A5C36]" />
            <span>Donor Control Hub</span>
            <span className="text-[#D9381E]">◇</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A261D] tracking-tight">
            My Material Listings
          </h1>
          <p className="text-xs sm:text-sm text-[#5A524C] mt-1">
            Track and manage your posted surplus materials and monitor interest from community reusers.
          </p>
        </div>

        <Link
          to="/create-listing"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#0A5C36] text-white hover:bg-[#0D7A47] shadow-sm shadow-[#0A5C36]/20 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          Offer New Material
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#EAE3D2] shadow-sm">
          <div className="text-xs font-semibold text-[#5A524C]">Total Posted</div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1A261D] mt-1">{totalCount}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#EAE3D2] shadow-sm">
          <div className="text-xs font-semibold text-[#0A5C36]">Available</div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#0A5C36] mt-1">{availableCount}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#EAE3D2] shadow-sm">
          <div className="text-xs font-semibold text-[#5A524C]">Reserved</div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1A261D] mt-1">{reservedCount}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#EAE3D2] shadow-sm">
          <div className="text-xs font-semibold text-[#8C827A]">Archived</div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#5A524C] mt-1">{archivedCount}</div>
        </div>
      </div>

      {/* Annual Sales & Monetization Performance Graph */}
      <DonorSalesChart />

      {/* Listing Cards / Table */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-[#5A524C]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0A5C36] mb-3" />
          <p className="text-sm font-medium">Loading your listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-[#FDFBF7] rounded-2xl border border-[#EAE3D2] p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#E1F2E8] border border-[#CEEAD8] text-[#0A5C36] flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#1A261D] mb-1">No Material Listings Yet</h3>
          <p className="text-xs text-[#5A524C] mb-6">
            Help local creators, students, and recyclers by posting your first reusable discard.
          </p>
          <Link
            to="/create-listing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#0A5C36] text-white hover:bg-[#0D7A47] shadow-sm shadow-[#0A5C36]/20"
          >
            <Plus className="w-4 h-4" />
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="bg-[#FDFBF7] rounded-2xl border border-[#EAE3D2] overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#CEEAD8] transition-all">
              
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    item.status === 'available' ? 'bg-[#E1F2E8] text-[#0A5C36] border-[#CEEAD8]' :
                    item.status === 'reserved' ? 'bg-[#FAF6EE] text-[#5A524C] border-[#EAE3D2]' :
                    'bg-[#F3ECE0] text-[#8C827A] border-[#EAE3D2]'
                  }`}>
                    {item.status}
                  </span>
                  <Link
                    to="/interests?tab=received"
                    className="text-xs font-semibold text-[#0A5C36] hover:underline flex items-center gap-1"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>{item.interest_count || item.interests_count || 0} Inquir{item.interest_count === 1 ? 'y' : 'ies'}</span>
                  </Link>
                </div>

                <h3 className="text-base font-serif font-bold text-[#1A261D] line-clamp-1">{item.title}</h3>

                <p className="text-xs text-[#5A524C] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-xs text-[#5A524C] pt-2 border-t border-[#EAE3D2]">
                  <span><strong className="text-[#1A261D]">Qty:</strong> {item.quantity_description}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0A5C36]" />
                    {item.city}
                  </span>
                </div>
              </div>

              <div className="px-5 py-3 bg-[#FAF6EE] border-t border-[#EAE3D2] flex items-center justify-between text-xs font-semibold">
                <Link
                  to={`/listings/${item.id}`}
                  className="text-[#5A524C] hover:text-[#1A261D] flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#0A5C36]" />
                  View
                </Link>

                <Link
                  to={`/edit-listing/${item.id}`}
                  className="text-[#0A5C36] hover:text-[#0D7A47] flex items-center gap-1 transition-colors"
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
