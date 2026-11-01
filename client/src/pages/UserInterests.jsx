import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchUserInterests, updateInterestStatus, cancelInterest } from '../api/interests.api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout, { useDashboard } from '../components/DashboardLayout';
import { 
  HeartHandshake, 
  Inbox, 
  Send, 
  Check, 
  X, 
  MapPin, 
  Mail, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Package,
  Layers,
  Award,
  Filter,
  ChevronDown,
  CheckCircle2,
  Copy,
  Calendar,
  MessageSquare,
  Trash2
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

function UserInterestsContent() {
  const { user, isDonor, isRecipient } = useAuth();
  const { openSettings } = useDashboard();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialTabParam = queryParams.get('tab');

  const [activeTab, setActiveTab] = useState(
    initialTabParam === 'sent' || initialTabParam === 'received'
      ? initialTabParam
      : (isDonor ? 'received' : 'sent')
  );
  const [sentList, setSentList] = useState([]);
  const [receivedList, setReceivedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'accepted', 'declined'
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [proposalToCancel, setProposalToCancel] = useState(null);
  const [successNotification, setSuccessNotification] = useState(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  // Synchronize activeTab whenever location.search, isDonor, or user changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'sent' || tabParam === 'received') {
      setActiveTab(tabParam);
    } else {
      const defTab = isDonor ? 'received' : 'sent';
      setActiveTab(defTab);
      navigate(`/interests?tab=${defTab}`, { replace: true });
    }
  }, [location.search, isDonor, user?.id]);

  const switchTab = (newTab) => {
    setActiveTab(newTab);
    navigate(`/interests?tab=${newTab}`, { replace: true });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const loadInterests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUserInterests();
      if (res.success) {
        const sent = res.sent || [];
        const received = res.received || [];
        setSentList(sent);
        setReceivedList(received);

        // If donor has no sent proposals and URL is currently on tab=sent, automatically direct to received inquiries
        const params = new URLSearchParams(location.search);
        if (isDonor && params.get('tab') === 'sent' && sent.length === 0) {
          switchTab('received');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load interest requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterests();
  }, [user?.id, location.key]);

  const handleStatusChange = async (interestId, newStatus) => {
    setUpdatingId(interestId);
    setError(null);
    try {
      const res = await updateInterestStatus(interestId, newStatus);
      if (res.success) {
        setReceivedList((prev) =>
          prev.map((i) => (i.id === interestId ? { ...i, status: newStatus } : i))
        );
        setSentList((prev) =>
          prev.map((i) => (i.id === interestId ? { ...i, status: newStatus } : i))
        );
        setSuccessNotification(`Proposal marked as ${newStatus === 'accepted' ? 'accepted' : 'declined'} successfully.`);
        setTimeout(() => setSuccessNotification(null), 4000);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update request status';
      setError(errMsg);
      alert(errMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmCancel = async (interestId) => {
    setCancellingId(interestId);
    try {
      const res = await cancelInterest(interestId);
      if (res.success) {
        setSentList((prev) => prev.filter((i) => i.id !== interestId));
        setReceivedList((prev) => prev.filter((i) => i.id !== interestId));
        setProposalToCancel(null);
        setSuccessNotification(
          activeTab === 'received'
            ? 'Inquiry successfully removed from your inquiries list.'
            : 'Proposal request successfully cancelled.'
        );
        setTimeout(() => setSuccessNotification(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove inquiry');
    } finally {
      setCancellingId(null);
    }
  };

  const handleClearAllDeclined = async () => {
    const declinedItems = receivedList.filter((i) => i.status === 'declined');
    if (declinedItems.length === 0) return;
    if (!window.confirm(`Are you sure you want to remove all ${declinedItems.length} declined inquiries from your inquiries list?`)) {
      return;
    }
    setCancellingId('all-declined');
    try {
      await Promise.all(declinedItems.map((item) => cancelInterest(item.id)));
      const declinedIds = new Set(declinedItems.map((item) => item.id));
      setReceivedList((prev) => prev.filter((i) => !declinedIds.has(i.id)));
      setSuccessNotification(`Successfully removed ${declinedItems.length} declined inquiries from your list.`);
      setTimeout(() => setSuccessNotification(null), 4000);
    } catch (err) {
      alert('Failed to remove some declined inquiries.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleCopyEmail = (email, id) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const currentList = activeTab === 'received' ? receivedList : sentList;

  const filteredList = useMemo(() => {
    return currentList.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });
  }, [currentList, statusFilter]);

  const acceptedCount = useMemo(() => {
    return currentList.filter((i) => i.status === 'accepted').length;
  }, [currentList]);

  const pendingCount = useMemo(() => {
    return currentList.filter((i) => i.status === 'pending').length;
  }, [currentList]);

  return (
    <div className="space-y-8">
      
      {/* ========================================================= */}
      {/* 1. TOP HERO SECTION: Welcome Banner matching Home & Recs  */}
      {/* ========================================================= */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col">
        
        {/* Top Row: Title, Pill & Banner Graphic */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
          <div className="space-y-2 max-w-xl pt-0.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5ED] text-[#0B3B24] text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#0B3B24]" />
              <span>Circular Reuse Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A261D] tracking-tight leading-tight flex items-center gap-2">
              <span>My Proposals &amp; Requests</span>
              <span className="text-3xl sm:text-4xl inline-block -mt-1 select-none">🤝</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#2C3A30] font-normal leading-relaxed">
              Coordinate material pickups, review direct reuse proposals from local makers, and track real-time fulfillment status in <strong className="font-semibold text-[#0B3B24]">{user?.city || 'Pune'}</strong>.
            </p>
          </div>

          <div className="w-48 sm:w-56 lg:w-64 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 self-start sm:self-auto shadow-sm">
            <img
              src="/plants-banner.jpg"
              alt="Eco plants & recycling illustration"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Horizontal Divider Line matching Reference */}
        <div className="border-t border-gray-100/90 my-5 sm:my-6" />

        {/* Bottom Metrics Row (3 rounded cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          
          {/* Metric 1: Total Proposals */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F9FAF8] border border-gray-100 flex items-center gap-3.5 hover:bg-white hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-[#0B3B24]" />
            </div>
            <div>
              <div className="text-[11px] text-[#586A5E] font-medium leading-tight">
                {activeTab === 'sent' ? 'Sent' : 'Received'}<br />Proposals
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1A261D] mt-1 tracking-tight">
                {currentList.length} Active
              </div>
            </div>
          </div>

          {/* Metric 2: Approved for Pickup */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F9FAF8] border border-gray-100 flex items-center gap-3.5 hover:bg-white hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-[#0B3B24]" />
            </div>
            <div>
              <div className="text-[11px] text-[#586A5E] font-medium leading-tight">
                Approved<br />For Pickup
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1A261D] mt-1 tracking-tight">
                {acceptedCount} Batch{acceptedCount === 1 ? '' : 'es'}
              </div>
            </div>
          </div>

          {/* Metric 3: Pending Review */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F9FAF8] border border-gray-100 flex items-center gap-3.5 hover:bg-white hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#0B3B24]" />
            </div>
            <div>
              <div className="text-[11px] text-[#586A5E] font-medium leading-tight">
                Awaiting<br />Response
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1A261D] mt-1 tracking-tight">
                {pendingCount} Pending
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. ERROR NOTICE BANNER                                    */}
      {/* ========================================================= */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TABS SWITCHER & FILTER CONTROLS                        */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tab Selection Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#1A261D] flex items-center gap-1.5 mr-1">
              <Layers className="w-3.5 h-3.5 text-[#0B3B24]" />
              Stream View:
            </span>

            {/* If Donor: show Received Inquiries FIRST, then My Sent Proposals */}
            {isDonor ? (
              <>
                <button
                  type="button"
                  onClick={() => switchTab('received')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'received'
                      ? 'bg-[#0B3B24] text-white shadow-sm'
                      : 'bg-[#F9FAF8] text-[#586A5E] hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Received Inquiries</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'received' ? 'bg-[#A3E5B9] text-[#0B3B24]' : 'bg-gray-200 text-[#1A261D]'
                  }`}>
                    {receivedList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => switchTab('sent')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'sent'
                      ? 'bg-[#0B3B24] text-white shadow-sm'
                      : 'bg-[#F9FAF8] text-[#586A5E] hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>My Sent Proposals</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'sent' ? 'bg-[#A3E5B9] text-[#0B3B24]' : 'bg-gray-200 text-[#1A261D]'
                  }`}>
                    {sentList.length}
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => switchTab('sent')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'sent'
                      ? 'bg-[#0B3B24] text-white shadow-sm'
                      : 'bg-[#F9FAF8] text-[#586A5E] hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>My Sent Proposals</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'sent' ? 'bg-[#A3E5B9] text-[#0B3B24]' : 'bg-gray-200 text-[#1A261D]'
                  }`}>
                    {sentList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => switchTab('received')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'received'
                      ? 'bg-[#0B3B24] text-white shadow-sm'
                      : 'bg-[#F9FAF8] text-[#586A5E] hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Received Inquiries</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'received' ? 'bg-[#A3E5B9] text-[#0B3B24]' : 'bg-gray-200 text-[#1A261D]'
                  }`}>
                    {receivedList.length}
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Action and Filter Controls */}
          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
            {/* If there are declined inquiries on received tab, show quick Clear Declined button */}
            {activeTab === 'received' && receivedList.some((i) => i.status === 'declined') && (
              <button
                type="button"
                onClick={handleClearAllDeclined}
                disabled={cancellingId !== null}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                title="Remove all declined product inquiries from your list"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Clear Declined ({receivedList.filter((i) => i.status === 'declined').length})</span>
              </button>
            )}

            {/* Filter Dropdown Option matching AI Matches */}
            <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 shadow-sm ${
                isFilterOpen || statusFilter !== 'all'
                  ? 'bg-[#0B3B24] text-white border-[#0B3B24]'
                  : 'bg-white text-[#1A261D] border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 ${isFilterOpen || statusFilter !== 'all' ? 'text-[#A3E5B9]' : 'text-[#0B3B24]'}`} />
              <span>Status Filter: {statusFilter === 'all' ? 'All' : statusFilter}</span>
              {statusFilter !== 'all' && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                  isFilterOpen || statusFilter !== 'all' ? 'bg-[#A3E5B9] text-[#0B3B24]' : 'bg-[#0B3B24] text-white'
                }`}>
                  1
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 z-40 w-72 sm:w-80 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                
                {/* Header with Title and Reset */}
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#1A261D]">
                    <Filter className="w-3.5 h-3.5 text-[#0B3B24]" />
                    <span>Filter Proposals</span>
                  </div>
                  {statusFilter !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className="text-[11px] font-bold text-[#0B3B24] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Status Options */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#586A5E] uppercase tracking-wider block">
                    Fulfillment Status
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'all', label: 'All Proposals & Inquiries' },
                      { id: 'pending', label: '🟡 Pending Review' },
                      { id: 'accepted', label: '🟢 Approved for Pickup' },
                      { id: 'declined', label: '⚪ Declined / Closed' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setStatusFilter(st.id);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs text-left transition-all border flex items-center justify-between ${
                          statusFilter === st.id
                            ? 'bg-[#EAF5ED] text-[#0B3B24] border-[#0B3B24]/30 font-bold'
                            : 'bg-[#F9FAF8] text-[#586A5E] border-transparent hover:bg-gray-100 font-medium'
                        }`}
                      >
                        <span>{st.label}</span>
                        {statusFilter === st.id && (
                          <Check className="w-3.5 h-3.5 text-[#0B3B24]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Refresh Action */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-[#586A5E]">Sync status changes?</span>
                  <button
                    type="button"
                    onClick={() => {
                      loadInterests();
                      setIsFilterOpen(false);
                    }}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-[#0B3B24] text-white hover:bg-[#125838] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

    </div>

      {/* ========================================================= */}
      {/* 4. PROPOSALS STREAM FEED                                  */}
      {/* ========================================================= */}
      <div>
        
        {/* Feed Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 border border-[#D5EEDB] shadow-sm">
              {activeTab === 'sent' ? (
                <Send className="w-6 h-6 text-[#0B3B24]" />
              ) : (
                <Inbox className="w-6 h-6 text-[#0B3B24]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1A261D] font-serif tracking-tight">
                  {activeTab === 'sent' ? 'Submitted Reuse Proposals' : 'Incoming Maker Inquiries'}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF5ED] text-[#0B3B24] border border-[#D5EEDB]">
                  {filteredList.length} Item{filteredList.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-xs text-[#586A5E] mt-0.5">
                {activeTab === 'sent'
                  ? 'Track response status from material donors and coordinate pickup schedules'
                  : 'Review requests submitted by verified students, makers, and recycling workshops'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadInterests}
            disabled={loading}
            className="text-xs font-bold text-[#0B3B24] hover:underline flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#0B3B24] transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Success Notification Alert Banner */}
        {successNotification && (
          <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-[#E8F5E9] border border-[#3EA635]/30 text-[#0B3B24] text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#3EA635] shrink-0" />
              <span>{successNotification}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setSuccessNotification(null)}
              className="p-1 hover:bg-[#D5EEDB] rounded-lg transition-colors text-[#0B3B24]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm animate-pulse flex flex-col md:flex-row gap-6"
              >
                <div className="w-full md:w-44 h-36 bg-gray-100 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                  <div className="h-14 bg-[#EAF5ED]/50 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          /* Empty State with Visual Thumbnail */
          <div className="text-center py-16 bg-white rounded-[32px] border border-gray-100 p-8 space-y-4 shadow-sm max-w-md mx-auto">
            <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto shadow-sm border border-[#D5EEDB]">
              <img
                src="/thumb-cardboard.jpg"
                alt="No proposals illustration"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1A261D]">
              {statusFilter !== 'all' ? 'No Matching Proposals' : activeTab === 'sent' ? 'No Sent Proposals Yet' : 'No Received Inquiries'}
            </h3>
            <p className="text-xs text-[#586A5E] leading-relaxed">
              {statusFilter !== 'all'
                ? `No proposals currently match the "${statusFilter}" status filter. Clear the filter to see all active proposals.`
                : activeTab === 'sent'
                  ? 'Discover clean surplus material streams matching your workshop craft disciplines and submit reuse proposals to local donors.'
                  : 'When makers and recycling workshops submit proposals for your surplus listings, they will appear right here for approval.'}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              {statusFilter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#1A261D] transition-colors"
                >
                  Reset Status Filter
                </button>
              ) : activeTab === 'sent' ? (
                <>
                  <Link
                    to="/recommendations"
                    className="px-4 py-2.5 rounded-xl bg-[#0B3B24] hover:bg-[#125838] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Discover AI Matches
                  </Link>
                  {receivedList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('received')}
                      className="px-4 py-2.5 rounded-xl bg-[#EAF5ED] hover:bg-[#D5EEDB] text-[#0B3B24] text-xs font-bold transition-all border border-[#0B3B24]/20 flex items-center gap-1.5"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>View {receivedList.length} Received Inquiries</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/create-listing"
                    className="px-4 py-2.5 rounded-xl bg-[#0B3B24] hover:bg-[#125838] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Post a Surplus Stream
                  </Link>
                  {sentList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('sent')}
                      className="px-4 py-2.5 rounded-xl bg-[#EAF5ED] hover:bg-[#D5EEDB] text-[#0B3B24] text-xs font-bold transition-all border border-[#0B3B24]/20 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>View {sentList.length} Sent Proposal{sentList.length === 1 ? '' : 's'}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* Real Proposals Feed */
          <div className="space-y-4">
            {filteredList.map((item) => {
              const catKey = (item.material_category || 'cardboard').toLowerCase();
              const categoryThumb = CATEGORY_THUMBNAILS[catKey] || CATEGORY_THUMBNAILS.other;
              const cardImage = item.listing_image || categoryThumb;
              const isAccepted = item.status === 'accepted';
              const isPending = item.status === 'pending';
              const isDeclined = item.status === 'declined';

              // Strictly determine role context by the active stream tab:
              // - In 'received' inquiries: User is viewing incoming requests on their surplus listings (Listing Owner / Donor)
              // - In 'sent' proposals: User is viewing requests they submitted to other donors (Requester / Recipient)
              const isOwner = activeTab === 'received';
              const isRequester = activeTab === 'sent';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 p-5 sm:p-6 flex flex-col md:flex-row items-start gap-5 sm:gap-6 group"
                >
                  {/* Left: Thumbnail Image */}
                  <div className="relative w-full md:w-48 h-36 md:h-40 rounded-2xl overflow-hidden shrink-0 bg-[#EAF5ED]/40 shadow-inner">
                    <img
                      src={cardImage}
                      alt={item.listing_title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = categoryThumb;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Category Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold capitalize shadow-sm">
                        {item.material_category}
                      </span>
                    </div>

                    {/* Status Pill on Image */}
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md border ${
                        isAccepted
                          ? 'bg-[#E8F5E9]/95 text-[#0B3B24] border-[#3EA635]'
                          : isPending
                            ? 'bg-amber-50/95 text-amber-800 border-amber-300'
                            : 'bg-gray-100/95 text-gray-700 border-gray-300'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Middle / Right: Content Details */}
                  <div className="flex-1 space-y-3 w-full">
                    
                    {/* Top Row: Listing Title & Date */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-4">
                      <div>
                        <div className="text-[11px] font-bold text-[#586A5E] uppercase tracking-wider">
                          {isOwner ? 'Proposed For Your Surplus Listing' : 'Requested Material Stream'}
                        </div>
                        <Link
                          to={`/listings/${item.listing_id}`}
                          className="text-base sm:text-lg font-serif font-bold text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-snug line-clamp-1 inline-flex items-center gap-1.5"
                        >
                          <span>{item.listing_title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#586A5E] shrink-0" />
                        </Link>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-[#586A5E] shrink-0 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* City & Quantity Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#586A5E]">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#0B3B24]" />
                        <span>{item.listing_city || item.recipient_city || user?.city || 'Pune'}</span>
                      </span>
                      {item.quantity_description && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-[#0B3B24]">
                            {item.quantity_description}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Proposal Message Speech Bubble */}
                    <div className="p-3.5 rounded-2xl bg-[#F9FAF8] border border-gray-100 text-xs text-[#1A261D] space-y-1">
                      <div className="text-[10px] font-bold text-[#586A5E] uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-[#0B3B24]" />
                        <span>{isOwner ? 'Maker Proposal & Pickup Notes:' : 'Your Stated Reuse Plan:'}</span>
                      </div>
                      <p className="italic text-[#2C3A30] leading-relaxed">
                        "{item.message}"
                      </p>
                    </div>

                    {/* Coordination Strip & Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100">
                      
                      {/* Counterparty Contact Details */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#586A5E]">
                          {isOwner ? 'Maker:' : 'Donor:'}
                        </span>
                        <span className="font-bold text-[#1A261D]">
                          {isOwner ? (item.recipient_name || 'Maker') : (item.donor_name || 'Donor')}
                        </span>

                        {/* If accepted, show contact email with quick copy */}
                        {isAccepted && (
                          <div className="flex items-center gap-1.5 ml-2">
                            <a
                              href={`mailto:${isOwner ? item.recipient_email : item.donor_email}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAF5ED] text-[#0B3B24] text-[11px] font-bold hover:bg-[#D5EEDB] transition-colors"
                            >
                              <Mail className="w-3 h-3 text-[#0B3B24]" />
                              <span>{isOwner ? item.recipient_email : item.donor_email}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(isOwner ? item.recipient_email : item.donor_email, item.id)}
                              title="Copy Email"
                              className="p-1 rounded-lg hover:bg-gray-100 text-[#586A5E] transition-colors cursor-pointer"
                            >
                              {copyFeedback === item.id ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#3EA635]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Actions & Status Pill Strip */}
                      <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
                        
                        {/* Donor Action Buttons for Pending Inquiries (ONLY on received tab) */}
                        {isOwner && isPending && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(item.id, 'accepted')}
                              disabled={updatingId === item.id}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0B3B24] hover:bg-[#125838] text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                            >
                              {updatingId === item.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Accept</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setProposalToCancel(item)}
                              disabled={updatingId === item.id || cancellingId === item.id}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </div>
                        )}

                        {/* Recipient Status Badge when Pending (ONLY on sent tab) */}
                        {isRequester && isPending && (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Pending Donor Review</span>
                          </div>
                        )}

                        {/* Accepted Status Badge */}
                        {isAccepted && (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0B3B24] bg-[#E8F5E9] px-3 py-1.5 rounded-xl border border-[#C5E5D1]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#3EA635]" />
                            <span>Ready for Pickup Coordination</span>
                          </div>
                        )}

                        {/* Declined Status Badge */}
                        {isDeclined && (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                            <X className="w-3.5 h-3.5 text-red-600" />
                            <span>Proposal Declined</span>
                          </div>
                        )}

                        {/* If Owner has already accepted, allow declining & removing */}
                        {isOwner && isAccepted && (
                          <button
                            type="button"
                            onClick={() => setProposalToCancel(item)}
                            disabled={updatingId === item.id || cancellingId === item.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer active:scale-95"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline &amp; Remove</span>
                          </button>
                        )}

                        {/* If Owner has declined, allow Re-accepting OR Removing from List */}
                        {isOwner && isDeclined && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(item.id, 'accepted')}
                              disabled={updatingId === item.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#0B3B24] hover:bg-[#EAF5ED] border border-[#0B3B24]/30 transition-colors cursor-pointer active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setProposalToCancel(item)}
                              disabled={cancellingId === item.id}
                              title="Remove this declined product from your inquiries list"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Remove from List</span>
                            </button>
                          </div>
                        )}

                        {/* Cancel Request Button (available for recipient on their proposal) */}
                        {isRequester && (
                          <button
                            type="button"
                            onClick={() => setProposalToCancel(item)}
                            disabled={cancellingId === item.id}
                            title="Cancel this proposal request"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50/80 hover:bg-red-100 border border-red-200 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>{item.status === 'declined' ? 'Remove from List' : 'Cancel Request'}</span>
                          </button>
                        )}

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Confirmation Modal to Cancel Proposal Request */}
      {proposalToCancel && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FDFBF7] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#EAE3D2] relative animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => !cancellingId && setProposalToCancel(null)}
              disabled={!!cancellingId}
              className="absolute top-5 right-5 p-2 rounded-full text-[#586A5E] hover:text-[#1A261D] hover:bg-[#FAF6EE] transition-all disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1A261D]">
                  {proposalToCancel.owner_id === user?.id || activeTab === 'received'
                    ? (proposalToCancel.status === 'declined' ? 'Remove Declined Inquiry?' : 'Decline & Remove Inquiry?')
                    : (proposalToCancel.status === 'declined' ? 'Remove Declined Proposal?' : 'Cancel Proposal Request?')}
                </h3>
                <p className="text-xs text-[#586A5E] mt-1 leading-relaxed">
                  {proposalToCancel.owner_id === user?.id || activeTab === 'received'
                    ? (proposalToCancel.status === 'declined'
                        ? 'This declined product inquiry will be permanently removed from your inquiries list.'
                        : 'This inquiry will be declined and permanently removed from your inquiries section.')
                    : (proposalToCancel.status === 'accepted' 
                        ? 'This accepted proposal will be cancelled, and the material listing will be released back to available status.'
                        : proposalToCancel.status === 'declined'
                        ? 'This declined proposal will be permanently removed from your proposals stream.'
                        : 'Your pending proposal will be withdrawn. The donor will no longer see it, and you can submit a new proposal if needed.')}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F4EFE6] border border-[#EAE3D2] mb-5 text-xs text-[#1A261D] space-y-1.5">
              <div className="font-bold text-[#0B3B24] truncate">
                {proposalToCancel.listing_title}
              </div>
              <div className="text-[11px] text-[#586A5E] flex items-center gap-2 flex-wrap">
                <span className="capitalize">Status: <strong className="uppercase font-bold text-[#1A261D]">{proposalToCancel.status}</strong></span>
                <span>•</span>
                <span>
                  {proposalToCancel.owner_id === user?.id || activeTab === 'received' ? 'Maker: ' : 'Donor: '}
                  <strong>
                    {proposalToCancel.owner_id === user?.id || activeTab === 'received'
                      ? (proposalToCancel.recipient_name || 'Maker')
                      : (proposalToCancel.donor_name || 'Donor')}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setProposalToCancel(null)}
                disabled={!!cancellingId}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#586A5E] hover:bg-[#EAE3D2]/60 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {proposalToCancel.owner_id === user?.id || activeTab === 'received' ? 'Keep in List' : 'Keep Request'}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCancel(proposalToCancel.id)}
                disabled={!!cancellingId}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {cancellingId === proposalToCancel.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {proposalToCancel.owner_id === user?.id || activeTab === 'received'
                        ? (proposalToCancel.status === 'declined' ? 'Yes, Remove from List' : 'Yes, Decline & Remove')
                        : 'Yes, Cancel Request'}
                    </span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function UserInterests() {
  return (
    <DashboardLayout activeTab="interests">
      <UserInterestsContent />
    </DashboardLayout>
  );
}
