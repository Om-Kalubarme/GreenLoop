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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
          <Heart className="w-3.5 h-3.5 text-emerald-600" />
          Reuse Coordination
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Material Interest Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review community reuse proposals and coordinate material collection dates.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('received')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'received'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Received Proposals
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700">
            {receivedList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sent'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          My Sent Requests
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700">
            {sentList.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-sm font-medium">Loading requests...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm">
          {error}
        </div>
      ) : activeTab === 'received' ? (
        /* Received List */
        receivedList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
            <Inbox className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No Received Proposals</h3>
            <p className="text-xs text-slate-500">
              When recipients request your materials, their proposals will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {receivedList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-500">Listing:</span>
                    <Link to={`/listings/${item.listing_id}`} className="font-bold text-emerald-700 hover:underline">
                      {item.listing_title}
                    </Link>
                    <span className="text-slate-300">&bull;</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'declined' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-800 font-medium leading-relaxed">
                    "{item.message}"
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="font-semibold text-slate-700">From: {item.recipient_name}</span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {item.recipient_email}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
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
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept Proposal
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'declined')}
                      disabled={updatingId === item.id}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 transition-all disabled:opacity-50"
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
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
            <Send className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No Sent Requests Yet</h3>
            <p className="text-xs text-slate-500 mb-4">
              Browse available listings and express interest in materials for your projects.
            </p>
            <Link to="/browse" className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white">
              Browse Materials
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sentList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-500">Material Requested:</span>
                    <Link to={`/listings/${item.listing_id}`} className="font-bold text-emerald-700 hover:underline">
                      {item.listing_title}
                    </Link>
                    <span className="text-slate-300">&bull;</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'declined' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 italic">"{item.message}"</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Donor: {item.donor_name}</span>
                    {item.status === 'accepted' && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        Donor Email: {item.donor_email}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/listings/${item.listing_id}`}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
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
