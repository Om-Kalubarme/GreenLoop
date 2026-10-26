import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserInterests, updateInterestStatus } from '../api/interests.api';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  Inbox, 
  Send, 
  Check, 
  X, 
  MapPin, 
  Mail, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight,
  Clock
} from 'lucide-react';

export default function UserInterests() {
  const { user, isDonor } = useAuth();
  const [activeTab, setActiveTab] = useState(isDonor ? 'received' : 'sent');
  const [sentList, setSentList] = useState([]);
  const [receivedList, setReceivedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const loadInterests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUserInterests();
      if (res.success) {
        setSentList(res.sent || []);
        setReceivedList(res.received || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load interest requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterests();
  }, []);

  const handleStatusChange = async (interestId, newStatus) => {
    setUpdatingId(interestId);
    try {
      const res = await updateInterestStatus(interestId, newStatus);
      if (res.success) {
        // Update local state
        setReceivedList((prev) =>
          prev.map((i) => (i.id === interestId ? { ...i, status: newStatus } : i))
        );
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update request status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1F2E8] border border-[#CEEAD8] text-[#0A5C36] text-xs font-semibold mb-2">
          <Heart className="w-3.5 h-3.5 text-[#D9381E] fill-[#D9381E]" />
          <span>Reuse Coordination</span>
          <span className="text-[#D9381E]">◇</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#1A261D] tracking-tight">
          Material Interest Requests
        </h1>
        <p className="text-sm text-[#5A524C] mt-1">
          Review community reuse proposals and coordinate material collection dates.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EAE3D2]">
        <button
          onClick={() => setActiveTab('received')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'received'
              ? 'border-[#0A5C36] text-[#0A5C36] bg-[#E1F2E8]/40'
              : 'border-transparent text-[#5A524C] hover:text-[#1A261D]'
          }`}
        >
          <Inbox className="w-4 h-4 text-[#0A5C36]" />
          Received Proposals
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-[#EAE3D2] text-[#1A261D]">
            {receivedList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sent'
              ? 'border-[#0A5C36] text-[#0A5C36] bg-[#E1F2E8]/40'
              : 'border-transparent text-[#5A524C] hover:text-[#1A261D]'
          }`}
        >
          <Send className="w-4 h-4 text-[#0A5C36]" />
          My Sent Requests
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-[#EAE3D2] text-[#1A261D]">
            {sentList.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-[#5A524C]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0A5C36] mb-3" />
          <p className="text-sm font-medium">Loading requests...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-[#FCEBE6] border border-[#F8D0C7] rounded-2xl text-[#B72B15] text-sm">
          {error}
        </div>
      ) : activeTab === 'received' ? (
        /* Received List */
        receivedList.length === 0 ? (
          <div className="bg-[#FDFBF7] rounded-2xl border border-[#EAE3D2] p-12 text-center max-w-md mx-auto shadow-sm">
            <Inbox className="w-12 h-12 text-[#8C827A] mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-[#1A261D] mb-1">No Received Proposals</h3>
            <p className="text-xs text-[#5A524C]">
              When recipients request your materials, their proposals will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {receivedList.map((item) => (
              <div
                key={item.id}
                className="bg-[#FDFBF7] rounded-2xl border border-[#EAE3D2] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#CEEAD8] transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-[#5A524C]">Listing:</span>
                    <Link to={`/listings/${item.listing_id}`} className="font-serif font-bold text-[#0A5C36] hover:underline">
                      {item.listing_title}
                    </Link>
                    <span className="text-[#8C827A]">&bull;</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      item.status === 'accepted' ? 'bg-[#E1F2E8] text-[#0A5C36] border-[#CEEAD8]' :
                      item.status === 'declined' ? 'bg-[#FCEBE6] text-[#B72B15] border-[#F8D0C7]' :
                      'bg-[#FAF6EE] text-[#5A524C] border-[#EAE3D2]'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#EAE3D2] text-xs text-[#1A261D] font-medium leading-relaxed">
                    "{item.message}"
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#5A524C] pt-1">
                    <span className="font-semibold text-[#1A261D]">From: {item.recipient_name}</span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#8C827A]" />
                      {item.recipient_email}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0A5C36]" />
                      {item.recipient_city}
                    </span>
                  </div>
                </div>

                {/* Status action buttons */}
                {item.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => handleStatusChange(item.id, 'accepted')}
                      disabled={updatingId === item.id}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0A5C36] text-white hover:bg-[#0D7A47] shadow-sm shadow-[#0A5C36]/20 transition-all disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept Proposal
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'declined')}
                      disabled={updatingId === item.id}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FAF6EE] text-[#5A524C] hover:bg-[#FCEBE6] hover:text-[#B72B15] border border-[#EAE3D2] transition-all disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* Sent List */
        sentList.length === 0 ? (
          <div className="bg-[#FDFBF7] rounded-2xl border border-[#EAE3D2] p-12 text-center max-w-md mx-auto shadow-sm">
            <Send className="w-12 h-12 text-[#8C827A] mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-[#1A261D] mb-1">No Sent Requests Yet</h3>
            <p className="text-xs text-[#5A524C] mb-4">
              Browse available listings and express interest in materials for your projects.
            </p>
            <Link to="/browse" className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0A5C36] text-white hover:bg-[#0D7A47] shadow-sm">
              Browse Materials
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sentList.map((item) => (
              <div
                key={item.id}
                className="bg-[#FDFBF7] rounded-2xl border border-[#EAE3D2] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#CEEAD8] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-[#5A524C]">Material Requested:</span>
                    <Link to={`/listings/${item.listing_id}`} className="font-serif font-bold text-[#0A5C36] hover:underline">
                      {item.listing_title}
                    </Link>
                    <span className="text-[#8C827A]">&bull;</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      item.status === 'accepted' ? 'bg-[#E1F2E8] text-[#0A5C36] border-[#CEEAD8]' :
                      item.status === 'declined' ? 'bg-[#FCEBE6] text-[#B72B15] border-[#F8D0C7]' :
                      'bg-[#FAF6EE] text-[#5A524C] border-[#EAE3D2]'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#5A524C] italic">"{item.message}"</p>

                  <div className="flex items-center gap-4 text-xs text-[#5A524C]">
                    <span>Donor: <strong className="text-[#1A261D]">{item.donor_name}</strong></span>
                    {item.status === 'accepted' && (
                      <span className="text-[#0A5C36] font-semibold flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#0A5C36]" />
                        Donor Email: {item.donor_email}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/listings/${item.listing_id}`}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FAF6EE] hover:bg-[#F3ECE0] text-[#1A261D] border border-[#EAE3D2] transition-colors"
                >
                  View Listing
                </Link>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}
