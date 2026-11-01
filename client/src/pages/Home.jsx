import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchListings, fetchMyListings } from '../api/listings.api';
import ListingCard from '../components/ListingCard';
import InterestModal from '../components/InterestModal';
import ImpactModal from '../components/ImpactModal';
import DisposalCentersModal from '../components/DisposalCentersModal';
import DonorSalesChart from '../components/DonorSalesChart';
import {
  Home as HomeIcon,
  Scan,
  HeartHandshake,
  Store,
  Trophy,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  Trash2,
  Clock,
  ShoppingCart,
  Camera,
  MapPin,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Upload,
  ExternalLink,
  Award,
  ChevronRight,
  Layers,
  Leaf,
  Plus,
  PlusCircle,
  Package,
  Inbox,
  Sliders,
  Check,
  RefreshCw,
  Edit3,
  Eye,
  Tag,
  Shield,
  TrendingUp
} from 'lucide-react';

const ALL_CATEGORIES = [
  { id: 'cardboard', label: 'Cardboard & Paper' },
  { id: 'wood', label: 'Wood & Timber' },
  { id: 'glass', label: 'Glass Jars & Bottles' },
  { id: 'textile', label: 'Textile & Fabrics' },
  { id: 'plastic', label: 'Plastics & Containers' },
  { id: 'metal', label: 'Metals & Hardware' },
];

export default function Home() {
  const { user, isAuthenticated, isDonor, isRecipient, isAdmin, login, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  // Modals state
  const [showScanModal, setShowScanModal] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [showCentersModal, setShowCentersModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMyListingsModal, setShowMyListingsModal] = useState(false);
  const [selectedListingForInterest, setSelectedListingForInterest] = useState(null);
  const [showInterestModal, setShowInterestModal] = useState(false);

  // Donor listings state
  const [myListings, setMyListings] = useState([]);
  const [loadingMyListings, setLoadingMyListings] = useState(false);

  // Settings & Preferences state
  const [prefCity, setPrefCity] = useState(user?.city || 'Bengaluru');
  const [prefCategories, setPrefCategories] = useState(user?.preferred_categories || []);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);
  const [prefError, setPrefError] = useState(null);

  // Scan simulation state
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanFile, setScanFile] = useState(null);

  // Sync settings when user changes
  useEffect(() => {
    if (user) {
      setPrefCity(user.city || 'Bengaluru');
      setPrefCategories(user.preferred_categories || []);
    }
  }, [user]);

  // Read URL query params (?modal=settings or ?view=my-listings)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('modal') === 'settings') {
      setShowSettingsModal(true);
    }
    if (params.get('view') === 'my-listings') {
      setShowMyListingsModal(true);
    }
  }, [location.search]);

  // Load public marketplace listings
  useEffect(() => {
    const loadListings = async () => {
      try {
        const res = await fetchListings({ limit: 4, page: 1 });
        if (res.success && res.listings?.length > 0) {
          setListings(res.listings);
        }
      } catch (err) {
        console.warn('Could not load listings:', err);
      } finally {
        setLoadingListings(false);
      }
    };

    loadListings();
  }, []);

  // Load donor's own listings
  const loadMyListingsData = async () => {
    setLoadingMyListings(true);
    try {
      const res = await fetchMyListings();
      if (res.success && res.listings) {
        setMyListings(res.listings);
      }
    } catch (err) {
      console.warn('Could not load donor listings:', err);
    } finally {
      setLoadingMyListings(false);
    }
  };

  useEffect(() => {
    if (showMyListingsModal && isDonor) {
      loadMyListingsData();
    }
  }, [showMyListingsModal, isDonor]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const handleSimulateScan = (materialName, category, recyclability, co2) => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      setScanResult({
        name: materialName,
        category,
        recyclability,
        co2,
      });
    }, 1200);
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefSuccess(false);
    setPrefError(null);
    try {
      await updateProfile({
        city: prefCity,
        preferred_categories: prefCategories,
      });
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 4000);
    } catch (err) {
      setPrefError(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const toggleCategory = (catId) => {
    setPrefCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };


  const displayName = user?.name || (isAuthenticated ? 'Active User' : 'Welcome Guest');
  const displayFirstName = user?.name ? user.name.split(' ')[0] : (isAuthenticated ? 'User' : 'Guest');
  const displayRole = isDonor 
    ? 'Donor • Circular Contributor' 
    : isRecipient 
      ? 'Maker • Circular Designer' 
      : user?.role 
        ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) 
        : 'Member';
  const displayCity = user?.city || 'Bengaluru';

  const avatarSrc = user?.avatar_url || (isDonor ? '/rahul-avatar.jpg' : '/ananya-avatar.jpg');

  return (
    <div className="min-h-screen flex bg-[#F4F6F0] font-sans text-[#1A261D]">
      
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Dark Forest Green matching Reference)     */}
      {/* ========================================================= */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 xl:w-72 bg-[#0B3B24] text-white flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Top: Brand Logo & Navigation */}
        <div className="space-y-8">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo-icon.png"
                alt="GreenLoop"
                className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center leading-none">
                  Green<span className="text-[#3EA635]">Loop</span>
                </span>
                <span className="text-[9px] tracking-wider uppercase font-semibold text-[#A3E5B9] mt-1">
                  AI Waste-to-Resource Platform
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            
            {/* Home (Active) */}
            <Link
              to="/"
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-white/15 text-white font-semibold text-sm shadow-sm transition-all"
            >
              <HomeIcon className="w-5 h-5 text-white" />
              <span>Home</span>
            </Link>

            {/* Role-Specific Actions: Donor */}
            {isDonor && (
              <>
                <Link
                  to="/create-listing"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#165B37] hover:bg-[#1C7345] text-white text-sm font-semibold transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-3.5">
                    <PlusCircle className="w-5 h-5 text-[#A3E5B9]" />
                    <span>Post Material</span>
                  </div>
                  <span className="text-[10px] bg-[#A3E5B9] text-[#0B3B24] px-2 py-0.5 rounded-full font-bold">
                    + New
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setShowMyListingsModal(true);
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all text-left"
                >
                  <Package className="w-5 h-5 text-white/80" />
                  <span>My Listings</span>
                </button>

                <Link
                  to="/interests?tab=received"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all"
                >
                  <Inbox className="w-5 h-5 text-white/80" />
                  <span>Inquiries &amp; Requests</span>
                </Link>

                <a
                  href="#sales-analytics"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileSidebarOpen(false);
                    const el = document.getElementById('sales-analytics');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <TrendingUp className="w-5 h-5 text-[#A3E5B9]" />
                    <span>Sales Analytics</span>
                  </div>
                  <span className="text-[10px] bg-[#EA580C]/20 text-[#FF9E66] border border-[#EA580C]/30 px-2 py-0.5 rounded-full font-bold">
                    ₹ Sales
                  </span>
                </a>
              </>
            )}

            {/* Role-Specific Actions: Recipient */}
            {isRecipient && (
              <Link
                to="/interests?tab=sent"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all"
              >
                <HeartHandshake className="w-5 h-5 text-white/80" />
                <span>My Proposals</span>
              </Link>
            )}

            {/* AI Matcher - Visible to all users */}
            <Link
              to="/recommendations"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <Sparkles className="w-5 h-5 text-[#A3E5B9]" />
                <span>AI Matcher</span>
              </div>
              <span className="text-[10px] bg-[#A3E5B9] text-[#0B3B24] px-2 py-0.5 rounded-full font-bold">
                AI
              </span>
            </Link>

            {/* My Impact */}
            <button
              type="button"
              onClick={() => {
                setShowImpactModal(true);
                setMobileSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all text-left"
            >
              <HeartHandshake className="w-5 h-5 text-white/80" />
              <span>My Impact</span>
            </button>

            {/* Marketplace */}
            <Link
              to="/browse"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all"
            >
              <Store className="w-5 h-5 text-white/80" />
              <span>Marketplace</span>
            </Link>

            {/* Rewards */}
            <button
              type="button"
              onClick={() => {
                setShowRewardsModal(true);
                setMobileSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all text-left"
            >
              <Trophy className="w-5 h-5 text-white/80" />
              <span>Rewards</span>
            </button>

          </nav>

        </div>

        {/* Bottom User Profile Section with Direct Settings Page Trigger */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <Link
            to="/settings"
            onClick={() => setMobileSidebarOpen(false)}
            title="Account & Settings"
            className="flex items-center gap-3 group overflow-hidden text-left flex-1 p-2 -ml-2 rounded-2xl hover:bg-white/10 transition-all text-white/90"
          >
            <img
              src={avatarSrc}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#3EA635]/50 group-hover:border-[#3EA635] group-hover:scale-105 transition-all shrink-0"
            />
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-bold text-white truncate group-hover:text-[#A3E5B9] transition-colors flex items-center justify-between">
                <span className="truncate">{displayName}</span>
                <Settings className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors shrink-0 ml-1" />
              </div>
              <div className="text-[11px] text-white/60 truncate">
                {displayRole}
              </div>
              <div className="text-[10px] text-[#A3E5B9] flex items-center gap-0.5 mt-0.5">
                <MapPin className="w-2.5 h-2.5 inline" />
                <span>{displayCity}</span>
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (isAuthenticated) {
                logout();
              } else {
                navigate('/login');
              }
            }}
            title={isAuthenticated ? 'Log Out' : 'Sign In'}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* ========================================================= */}
      {/* 2. MAIN DASHBOARD CONTENT AREA                            */}
      {/* ========================================================= */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-h-screen">
        
        {/* Top Header Bar matching Reference */}
        <header className="sticky top-0 z-20 bg-[#F4F6F0]/90 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden w-11 h-11 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#1A261D] shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar matching Reference (Expanded Horizontally) */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search here..."
                className="w-full pl-5 pr-12 py-3 bg-[#EAECE4]/70 hover:bg-white focus:bg-white border border-transparent focus:border-gray-300 rounded-2xl text-xs sm:text-sm text-[#1A261D] placeholder-[#6D7A70] focus:outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#6D7A70] hover:text-[#0B3B24] transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Header Actions: User Badge & Notification Bell */}
          <div className="flex items-center gap-3">
            {/* If not authenticated, show Sign In button */}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="px-4 py-2 rounded-2xl bg-[#0B3B24] hover:bg-[#125838] text-white text-xs font-bold shadow-sm transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-11 h-11 rounded-2xl bg-white border border-gray-200/90 flex items-center justify-center text-[#1A261D] shadow-sm hover:bg-gray-50 transition-all relative"
              >
                <Bell className="w-4 h-4 text-[#1A261D]" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#3EA635] ring-2 ring-white" />
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="font-bold text-xs text-[#1A261D]">Notifications</span>
                    <span className="text-[10px] text-[#0B3B24] font-semibold bg-[#E8F5E9] px-2 py-0.5 rounded-full">2 New</span>
                  </div>
                  <div className="mt-2 space-y-2 text-xs">
                    {isDonor ? (
                      <>
                        <div 
                          onClick={() => {
                            setShowNotifications(false);
                            navigate('/interests?tab=received');
                          }}
                          className="p-2.5 rounded-xl bg-[#F9FAF8] hover:bg-[#F0F4EE] transition-colors cursor-pointer"
                        >
                          <div className="font-semibold text-[#0B3B24] flex items-center justify-between">
                            <span>New Reuse Proposal!</span>
                            <span className="text-[10px] text-[#3EA635] font-bold">Just now</span>
                          </div>
                          <div className="text-[11px] text-[#586A5E] mt-0.5">
                            Ananya Iyer submitted a proposal for 15 kg corrugated boxes in Bengaluru.
                          </div>
                        </div>
                        <div 
                          onClick={() => {
                            setShowNotifications(false);
                            setShowMyListingsModal(true);
                          }}
                          className="p-2.5 rounded-xl bg-[#F9FAF8] hover:bg-[#F0F4EE] transition-colors cursor-pointer"
                        >
                          <div className="font-semibold text-[#0B3B24]">Listing Verified</div>
                          <div className="text-[11px] text-[#586A5E] mt-0.5">
                            Eco Logistics untreated pine offcuts listing verified by circular vision model.
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div 
                          onClick={() => {
                            setShowNotifications(false);
                            navigate('/recommendations');
                          }}
                          className="p-2.5 rounded-xl bg-[#F9FAF8] hover:bg-[#F0F4EE] transition-colors cursor-pointer"
                        >
                          <div className="font-semibold text-[#0B3B24] flex items-center justify-between">
                            <span>New Surplus Match!</span>
                            <span className="text-[10px] text-[#3EA635] font-bold">10m ago</span>
                          </div>
                          <div className="text-[11px] text-[#586A5E] mt-0.5">
                            Rahul Sharma posted 15 kg corrugated boxes in Bengaluru matching your preferences.
                          </div>
                        </div>
                        <div 
                          onClick={() => {
                            setShowNotifications(false);
                            navigate('/interests?tab=sent');
                          }}
                          className="p-2.5 rounded-xl bg-[#F9FAF8] hover:bg-[#F0F4EE] transition-colors cursor-pointer"
                        >
                          <div className="font-semibold text-[#0B3B24]">Proposal Accepted!</div>
                          <div className="text-[11px] text-[#586A5E] mt-0.5">
                            Your reuse request for untreated pine offcuts was approved by Eco Logistics.
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Dashboard Main Scroll Area */}
        <main className="p-4 sm:p-8 space-y-8 flex-1">
          
          {/* ========================================================= */}
          {/* TOP SECTION: Welcome Banner + "Your Impact" Card           */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Welcome Banner Card (Span 2) matching Reference */}
            <div className="lg:col-span-2 bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col">
              
              {/* Top Row: Greeting & Cute Plants Illustration */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
                <div className="space-y-2 max-w-sm sm:max-w-md pt-0.5">
                  <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A261D] tracking-tight leading-tight flex items-center gap-2">
                    <span>Hello, {displayFirstName}!</span>
                    <span className="text-3xl sm:text-4xl inline-block -mt-1 select-none">👋</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-[#2C3A30] font-normal leading-relaxed">
                    {isDonor 
                      ? 'Manage industrial surplus streams & coordinate with verified local makers.' 
                      : isRecipient 
                        ? 'Discover surplus reclaimed materials for circular design & sustainable projects.' 
                        : 'Small actions make a big impact!'}
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

              {/* Bottom Metrics Row (3 rounded cards) matching Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                
                {/* Metric 1: Materials Posted / Total Waste Recycled */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F9FAF8] border border-gray-100 flex items-center gap-3.5 hover:bg-white hover:shadow-sm transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-[#0B3B24]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#586A5E] font-medium leading-tight">
                      {isDonor ? (
                        <>Materials<br />Posted</>
                      ) : (
                        <>Total Waste<br />Recycled</>
                      )}
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-[#1A261D] mt-1 tracking-tight">
                      {isDonor ? '45.0 kg' : isRecipient ? '18.5 kg' : '12.5 kg'}
                    </div>
                  </div>
                </div>

                {/* Metric 2: CO2 Saved */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F9FAF8] border border-gray-100 flex items-center gap-3.5 hover:bg-white hover:shadow-sm transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#0B3B24]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#586A5E] font-medium leading-tight">
                      CO2 Saved
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-[#1A261D] mt-1 tracking-tight">
                      {isDonor ? '72.4 kg' : isRecipient ? '34.2 kg' : '28.3 kg'}
                    </div>
                  </div>
                </div>

                {/* Metric 3: Inquiries Received / Points Earned */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F9FAF8] border border-gray-100 flex items-center gap-3.5 hover:bg-white hover:shadow-sm transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0">
                    {isDonor ? (
                      <Inbox className="w-5 h-5 text-[#0B3B24]" />
                    ) : isRecipient ? (
                      <Sparkles className="w-5 h-5 text-[#0B3B24]" />
                    ) : (
                      <ShoppingCart className="w-5 h-5 text-[#0B3B24]" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] text-[#586A5E] font-medium leading-tight">
                      {isDonor ? (
                        <>Inquiries<br />Received</>
                      ) : isRecipient ? (
                        <>AI Matches<br />Found</>
                      ) : (
                        <>Points<br />Earned</>
                      )}
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-[#1A261D] mt-1 tracking-tight">
                      {isDonor ? '3 Active' : isRecipient ? '12 Active' : '1,250'}
                    </div>
                  </div>
                </div>

              </div>

              {/* Quick Actions inside Container matching Reference */}
              <div className="mt-6 space-y-3 sm:space-y-3.5">
                <h2 className="text-base sm:text-lg font-bold text-[#1A261D] tracking-tight">
                  Quick Actions
                </h2>

                {/* 2x2 Grid of Actions matching Reference */}
                {isDonor ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    
                    {/* Action 1: Post Material */}
                    <Link
                      to="/create-listing"
                      className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 hover:border-[#0B3B24]/40 flex items-center gap-3.5 sm:gap-4 transition-all group shadow-sm hover:shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <PlusCircle className="w-5 h-5 text-[#0B3B24]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-tight">
                          Post Material
                        </div>
                        <div className="text-xs text-[#586A5E] mt-1 leading-tight">
                          List surplus stream
                        </div>
                      </div>
                    </Link>

                    {/* Action 2: My Surplus Listings */}
                    <div
                      onClick={() => setShowMyListingsModal(true)}
                      className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 hover:border-[#0B3B24]/40 flex items-center gap-3.5 sm:gap-4 transition-all group cursor-pointer shadow-sm hover:shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Package className="w-5 h-5 text-[#0B3B24]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-tight">
                          My Surplus Listings
                        </div>
                        <div className="text-xs text-[#586A5E] mt-1 leading-tight">
                          Track &amp; edit active items
                        </div>
                      </div>
                    </div>

                    {/* Action 3: Review Inquiries */}
                    <Link
                      to="/interests?tab=received"
                      className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 hover:border-[#0B3B24]/40 flex items-center gap-3.5 sm:gap-4 transition-all group shadow-sm hover:shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Inbox className="w-5 h-5 text-[#0B3B24]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-tight">
                          Review Inquiries
                        </div>
                        <div className="text-xs text-[#586A5E] mt-1 leading-tight">
                          Maker requests &amp; pickup
                        </div>
                      </div>
                    </Link>

                    {/* Action 4: Marketplace */}
                    <Link
                      to="/browse"
                      className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 hover:border-[#0B3B24]/40 flex items-center gap-3.5 sm:gap-4 transition-all group shadow-sm hover:shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Store className="w-5 h-5 text-[#0B3B24]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-tight">
                          Marketplace
                        </div>
                        <div className="text-xs text-[#586A5E] mt-1 leading-tight">
                          Live regional bank
                        </div>
                      </div>
                    </Link>

                  </div>
                ) : isRecipient ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    
                    {/* Recipient Action 1: Scan Waste */}
                    <div
                      onClick={() => setShowScanModal(true)}
                      className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 hover:border-[#0B3B24]/40 flex items-center gap-3.5 sm:gap-4 transition-all group cursor-pointer shadow-sm hover:shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Camera className="w-5 h-5 text-[#0B3B24]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-tight">
                          Scan Waste
                        </div>
                        <div className="text-xs text-[#586A5E] mt-1 leading-tight">
                          Identify &amp; sort vision AI
                        </div>
                      </div>
                    </div>

                    {/* Recipient Action 2: AI Recommendations */}
                    <Link
                      to="/recommendations"
                      className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 hover:border-[#0B3B24]/40 flex items-center gap-3.5 sm:gap-4 transition-all group shadow-sm hover:shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5 text-[#0B3B24]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-tight">
                          AI Recommendations
                        </div>
                        <div className="text-xs text-[#586A5E] mt-1 leading-tight">
                          Smart matching engine
                        </div>
                      </div>
                    </Link>

                    {/* Recipient Action 3: My Proposals */}
                    <Link
                      to="/interests?tab=sent"
                      className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 hover:border-[#0B3B24]/40 flex items-center gap-3.5 sm:gap-4 transition-all group shadow-sm hover:shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <HeartHandshake className="w-5 h-5 text-[#0B3B24]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-tight">
                          My Proposals
                        </div>
                        <div className="text-xs text-[#586A5E] mt-1 leading-tight">
                          Track status &amp; contact
                        </div>
                      </div>
                    </Link>

                    {/* Recipient Action 4: Disposal Centers */}
                    <div
                      onClick={() => setShowCentersModal(true)}
                      className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 hover:border-[#0B3B24]/40 flex items-center gap-3.5 sm:gap-4 transition-all group cursor-pointer shadow-sm hover:shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <MapPin className="w-5 h-5 text-[#0B3B24]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-tight">
                          Disposal Centers
                        </div>
                        <div className="text-xs text-[#586A5E] mt-1 leading-tight">
                          Map &amp; verified drop-off
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    
                    {/* Default Action 1: Scan Waste */}
                    <div
                      onClick={() => setShowScanModal(true)}
                      className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 hover:border-[#0B3B24]/40 flex items-center gap-3.5 sm:gap-4 transition-all group cursor-pointer shadow-sm hover:shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Camera className="w-5 h-5 text-[#0B3B24]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-tight">
                          Scan Waste
                        </div>
                        <div className="text-xs text-[#586A5E] mt-1 leading-tight">
                          Identify &amp; Sort
                        </div>
                      </div>
                    </div>

                    {/* Default Action 2: Find Disposal Centers */}
                    <div
                      onClick={() => setShowCentersModal(true)}
                      className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 hover:border-[#0B3B24]/40 flex items-center gap-3.5 sm:gap-4 transition-all group cursor-pointer shadow-sm hover:shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <MapPin className="w-5 h-5 text-[#0B3B24]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-tight">
                          Find Disposal Centers
                        </div>
                        <div className="text-xs text-[#586A5E] mt-1 leading-tight">
                          Map &amp; locations
                        </div>
                      </div>
                    </div>

                    {/* Default Action 3: Explore Marketplace */}
                    <Link
                      to="/browse"
                      className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 hover:border-[#0B3B24]/40 flex items-center gap-3.5 sm:gap-4 transition-all group shadow-sm hover:shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <ShoppingCart className="w-5 h-5 text-[#0B3B24]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-tight">
                          Explore Marketplace
                        </div>
                        <div className="text-xs text-[#586A5E] mt-1 leading-tight">
                          Buy/Sell Recycled
                        </div>
                      </div>
                    </Link>

                    {/* Default Action 4: AI Recommendations */}
                    <Link
                      to="/recommendations"
                      className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 hover:border-[#0B3B24]/40 flex items-center gap-3.5 sm:gap-4 transition-all group shadow-sm hover:shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5 text-[#0B3B24]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-[#1A261D] group-hover:text-[#0B3B24] transition-colors leading-tight">
                          AI Recommendations
                        </div>
                        <div className="text-xs text-[#586A5E] mt-1 leading-tight">
                          Smart matching engine
                        </div>
                      </div>
                    </Link>

                  </div>
                )}
              </div>

            </div>

            {/* Eco Impact Report with Data Science Visualization matching Reference */}
            <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between space-y-5">
              
              {/* Top Header */}
              <div className="text-center">
                <h2 className="text-base sm:text-lg font-bold text-[#1A261D] flex items-center justify-center gap-1.5 font-sans">
                  <span>Eco Impact Report</span>
                  <span className="text-lg">🏆</span>
                </h2>
              </div>

              {/* Main Total Metric inside Donut Shape */}
              <div 
                onClick={() => setShowImpactModal(true)}
                className="flex flex-col items-center justify-center py-1 cursor-pointer group/donut"
                title="Click to view full animated breakdown"
              >
                <div className="relative flex items-center justify-center w-[140px] h-[140px]">
                  <svg
                    width="140"
                    height="140"
                    viewBox="0 0 140 140"
                    className="transform -rotate-90 drop-shadow-sm group-hover/donut:scale-105 transition-transform duration-300"
                  >
                    <circle
                      cx="70"
                      cy="70"
                      r="56"
                      fill="transparent"
                      stroke="#F1EADF"
                      strokeWidth="12"
                      className="opacity-70"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r="56"
                      fill="transparent"
                      stroke="#0B3B24"
                      strokeWidth="12"
                      strokeDasharray={`${351.86 * 0.544 - 3} 351.86`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r="56"
                      fill="transparent"
                      stroke="#3EA635"
                      strokeWidth="12"
                      strokeDasharray={`${351.86 * 0.28 - 3} 351.86`}
                      strokeDashoffset={`${-(351.86 * 0.544)}`}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r="56"
                      fill="transparent"
                      stroke="#A3E5B9"
                      strokeWidth="12"
                      strokeDasharray={`${351.86 * 0.176 - 3} 351.86`}
                      strokeDashoffset={`${-(351.86 * (0.544 + 0.28))}`}
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <div className="text-2xl font-extrabold text-[#0B3B24] tracking-tight flex items-baseline gap-0.5 font-sans">
                      <span>{isDonor ? '45.0' : '12.5'}</span>
                      <span className="text-xs font-bold text-[#3EA635]">kg</span>
                    </div>
                    <div className="text-[9px] font-bold text-[#586A5E] uppercase tracking-wider">
                      Diverted
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#586A5E] font-medium mt-1.5 group-hover/donut:text-[#0B3B24] transition-colors flex items-center gap-1">
                  <span>Verified Diversion from Landfill</span>
                  <span className="text-[10px] text-[#3EA635]">↗</span>
                </div>
              </div>

              {/* Data Science Diversion Breakdown Chart */}
              <div className="space-y-2.5">
                <div className="font-bold text-xs sm:text-sm text-[#1A261D]">
                  Diversion Breakdown
                </div>

                <div className="relative pt-1 pb-1">
                  
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-y-0 left-20 right-0 flex justify-between pointer-events-none pb-5">
                    <div className="w-px h-full bg-gray-200/80" />
                    <div className="w-px h-full bg-gray-200/80" />
                    <div className="w-px h-full bg-gray-200/80" />
                    <div className="w-px h-full bg-gray-200/80" />
                    <div className="w-px h-full bg-gray-200/80" />
                  </div>

                  {/* Horizontal Bars */}
                  <div className="space-y-3 relative z-10">
                    
                    {/* Bar 1: Corrugated Cardboard */}
                    <div className="flex items-center">
                      <div className="w-20 text-[10.5px] font-medium text-[#1A261D] leading-tight text-right pr-2.5 shrink-0">
                        Corrugated<br />Cardboard
                      </div>
                      <div className="flex-1 relative flex items-center h-7">
                        <div 
                          className="h-full bg-[#8D5A36] rounded-r-md flex items-center justify-end pr-2 transition-all duration-700 shadow-sm"
                          style={{ width: '85%' }}
                        >
                          <span className="text-[10px] font-bold text-white whitespace-nowrap drop-shadow-sm">
                            {isDonor ? '24.5 kg (54.4%)' : '6.8 kg (54.4%)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bar 2: Reusable Pine Pallets */}
                    <div className="flex items-center">
                      <div className="w-20 text-[10.5px] font-medium text-[#1A261D] leading-tight text-right pr-2.5 shrink-0">
                        Reusable<br />Pine Pallets
                      </div>
                      <div className="flex-1 relative flex items-center h-7">
                        <div 
                          className="h-full bg-[#D98E4B] rounded-r-md transition-all duration-700 shadow-sm"
                          style={{ width: '43.75%' }}
                        />
                        <span className="text-[10px] font-semibold text-[#1A261D] pl-2 whitespace-nowrap">
                          {isDonor ? '12.6 kg (28.0%)' : '3.5 kg (28.0%)'}
                        </span>
                      </div>
                    </div>

                    {/* Bar 3: Sanitized Glass Jars */}
                    <div className="flex items-center">
                      <div className="w-20 text-[10.5px] font-medium text-[#1A261D] leading-tight text-right pr-2.5 shrink-0">
                        Sanitized<br />Glass Jars
                      </div>
                      <div className="flex-1 relative flex items-center h-7">
                        <div 
                          className="h-full bg-[#62778D] rounded-r-md transition-all duration-700 shadow-sm"
                          style={{ width: '27.5%' }}
                        />
                        <span className="text-[10px] font-semibold text-[#1A261D] pl-2 whitespace-nowrap">
                          {isDonor ? '7.9 kg (17.6%)' : '2.2 kg (17.6%)'}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* X-Axis Ticks */}
                  <div className="flex justify-between text-[10px] text-gray-500 font-medium pl-20 pt-2">
                    <span>{isDonor ? '0 kg' : '0 kg'}</span>
                    <span>{isDonor ? '8 kg' : '2 kg'}</span>
                    <span>{isDonor ? '15 kg' : '4 kg'}</span>
                    <span>{isDonor ? '22 kg' : '6 kg'}</span>
                    <span>{isDonor ? '30 kg' : '8 kg'}</span>
                  </div>

                </div>
              </div>

              {/* Planet Milestone Callout Box */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#EAF6ED] border border-[#D5EEDB] text-left space-y-1">
                <div className="text-xs sm:text-sm font-bold text-[#14532D]">
                  Planet Milestone
                </div>
                <div className="text-[11px] sm:text-xs text-[#2E6B47] leading-relaxed">
                  Milestone: You saved <strong className="font-bold">{isDonor ? '72.4 kg' : '28.3 kg'} CO2e</strong> &amp; protected <strong className="font-bold">{isDonor ? '5 mature trees' : '2 mature trees'}</strong>!
                </div>
              </div>

              {/* View Details Button */}
              <button
                type="button"
                onClick={() => setShowImpactModal(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0B3B24] hover:bg-[#125838] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_14px_rgba(11,59,36,0.22)] hover:scale-[1.01] active:scale-[0.99]"
              >
                View Details
              </button>

            </div>

          </div>

          {/* ========================================================= */}
          {/* DONOR ONLY: ANNUAL SALES PERFORMANCE GRAPH                 */}
          {/* Represents month-wise sales revenue and batches monetized  */}
          {/* ========================================================= */}
          {isDonor && (
            <div id="sales-analytics" className="scroll-mt-6">
              <DonorSalesChart />
            </div>
          )}

          {/* ========================================================= */}
          {/* LIVE MARKETPLACE SURPLUS FEED (Connected to PostgreSQL)   */}
          {/* ========================================================= */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#1A261D]">
                  Live Reclaimed Surplus Streams
                </h2>
                <p className="text-xs text-[#586A5E]">
                  Verified listings available for immediate pickup in Bengaluru, Mumbai, and Pune.
                </p>
              </div>
              <Link
                to="/browse"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0B3B24] hover:underline"
              >
                <span>View Marketplace</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loadingListings ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 bg-white rounded-3xl border border-gray-200/80" />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {listings.map((item) => (
                  <ListingCard
                    key={item.id}
                    listing={item}
                    onRequest={(selected) => {
                      setSelectedListingForInterest(selected);
                      setShowInterestModal(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-gray-200">
                <p className="text-xs text-gray-500">No active surplus listings right now.</p>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE MODAL: SCAN WASTE (AI Material Vision)      */}
      {/* ========================================================= */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] flex items-center justify-center text-[#0B3B24]">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1A261D]">AI Material Scanner</h3>
                  <p className="text-xs text-[#586A5E]">Identify surplus waste, calculate circular value &amp; sort</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowScanModal(false);
                  setScanResult(null);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Chips */}
            <div>
              <span className="text-[11px] font-bold text-gray-600 block mb-2">Test with sample material:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSimulateScan('Clean Corrugated Cardboard', 'cardboard', '98% Recyclable', '1.6 kg CO2e')}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-[#E8F5E9] text-[#1A261D] font-medium transition-colors"
                >
                  📦 Cardboard Box
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateScan('Untreated Pine Timber Offcut', 'wood', '92% Reusable', '3.4 kg CO2e')}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-[#E8F5E9] text-[#1A261D] font-medium transition-colors"
                >
                  🪵 Timber Pallet
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateScan('Sanitized Clear Glass Jars', 'glass', '100% Circular', '0.9 kg CO2e')}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-[#E8F5E9] text-[#1A261D] font-medium transition-colors"
                >
                  🫙 Glass Jars
                </button>
              </div>
            </div>

            {/* Scan Display Box */}
            <div className="p-6 rounded-2xl bg-[#F9FAF8] border-2 border-dashed border-gray-300 text-center">
              {scanning ? (
                <div className="py-8 space-y-3">
                  <div className="w-10 h-10 border-4 border-[#0B3B24] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-[#0B3B24]">Analyzing material visual texture &amp; density...</p>
                </div>
              ) : scanResult ? (
                <div className="text-left space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-[#0B3B24] font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#3EA635]" />
                    <span>Material Identified!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-gray-200">
                      <div className="text-[10px] text-gray-500 uppercase">Category</div>
                      <div className="font-bold text-[#1A261D]">{scanResult.name}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-gray-200">
                      <div className="text-[10px] text-gray-500 uppercase">Circular Rating</div>
                      <div className="font-bold text-[#0B3B24]">{scanResult.recyclability}</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#E8F5E9] text-xs font-medium text-[#0B3B24] flex items-center justify-between">
                    <span>Carbon Avoidance Potential:</span>
                    <strong>{scanResult.co2}</strong>
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs font-medium text-[#1A261D]">Drag &amp; drop material photo here</p>
                  <p className="text-[11px] text-gray-500">Supports JPG, PNG, WEBP up to 5MB</p>
                </div>
              )}
            </div>

            {scanResult && (
              <div className="pt-1 flex gap-2">
                <Link
                  to="/create-listing"
                  className="flex-1 py-3 rounded-xl bg-[#0B3B24] hover:bg-[#125838] text-white text-xs font-bold text-center uppercase tracking-wider transition-all"
                >
                  Post This Surplus Material
                </Link>
                <Link
                  to="/browse"
                  className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#1A261D] transition-all"
                >
                  Find Recipient
                </Link>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. INTERACTIVE MODAL: YOUR IMPACT BREAKDOWN (Animated)    */}
      {/* ========================================================= */}
      <ImpactModal
        isOpen={showImpactModal}
        onClose={() => setShowImpactModal(false)}
      />

      {/* ========================================================= */}
      {/* 5. INTERACTIVE MODAL: FIND DISPOSAL CENTERS (LEAFLET MAP) */}
      {/* ========================================================= */}
      <DisposalCentersModal
        isOpen={showCentersModal}
        onClose={() => setShowCentersModal(false)}
        userCity={user?.city || 'Bengaluru'}
      />

      {/* ========================================================= */}
      {/* 6. INTERACTIVE MODAL: REWARDS & POINTS                   */}
      {/* ========================================================= */}
      {showRewardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#3EA635]" />
                <h3 className="font-bold text-base text-[#1A261D]">Eco Rewards</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRewardsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#E8F5E9] flex items-center justify-between">
              <div>
                <div className="text-xs text-[#0B3B24] font-medium">Your GreenLoop Balance</div>
                <div className="text-2xl font-extrabold text-[#0B3B24]">1,250 Points</div>
              </div>
              <Award className="w-10 h-10 text-[#3EA635]" />
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-gray-700 block">Available Rewards:</span>
              <div className="p-3 rounded-xl bg-[#F9FAF8] border border-gray-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1A261D]">₹200 Upcycling Store Voucher</div>
                  <div className="text-[10px] text-gray-500">Redeem with 800 pts</div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Voucher code GREEN200 unlocked!')}
                  className="px-3 py-1.5 rounded-lg bg-[#0B3B24] text-white text-[11px] font-bold"
                >
                  Redeem
                </button>
              </div>
              <div className="p-3 rounded-xl bg-[#F9FAF8] border border-gray-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1A261D]">Tree Planting Certificate</div>
                  <div className="text-[10px] text-gray-500">Redeem with 1,200 pts</div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Tree planted in Cauvery Basin!')}
                  className="px-3 py-1.5 rounded-lg bg-[#0B3B24] text-white text-[11px] font-bold"
                >
                  Plant Tree
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRewardsModal(false)}
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1A261D] font-bold text-xs"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. INTERACTIVE MODAL: ACCOUNT SETTINGS & PREFERENCES       */}
      {/* ========================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#3EA635] shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-lg text-[#1A261D] flex items-center gap-2">
                    {displayName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#0B3B24]">
                      {displayRole}
                    </span>
                    <span className="text-xs text-[#586A5E]">{user?.email || ''}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form: City & Category Preferences */}
            <form onSubmit={handleSavePreferences} className="space-y-5">
              
              {/* City Selection */}
              <div>
                <label className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0B3B24]" />
                  Operating Hub / City
                </label>
                <select
                  value={prefCity}
                  onChange={(e) => setPrefCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F9FAF8] border border-gray-200 text-xs font-semibold text-[#1A261D] focus:outline-none focus:border-[#0B3B24] transition-all"
                >
                  <option value="Bengaluru">Bengaluru (Karnataka)</option>
                  <option value="Mumbai">Mumbai (Maharashtra)</option>
                  <option value="Pune">Pune (Maharashtra)</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Hyderabad">Hyderabad (Telangana)</option>
                  <option value="Chennai">Chennai (Tamil Nadu)</option>
                </select>
                <p className="text-[10.5px] text-[#586A5E] mt-1">
                  Local surplus streams and disposal centers are prioritized by this location.
                </p>
              </div>

              {/* Material Categories */}
              <div>
                <label className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#0B3B24]" />
                  Preferred Material Streams
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {ALL_CATEGORIES.map((cat) => {
                    const selected = prefCategories.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          selected
                            ? 'bg-[#E8F5E9] border-[#3EA635] text-[#0B3B24] font-bold shadow-sm'
                            : 'bg-[#F9FAF8] border-gray-200 text-[#586A5E] hover:bg-white'
                        }`}
                      >
                        <span className="truncate">{cat.label}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-[#0B3B24] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback messages */}
              {prefSuccess && (
                <div className="p-3 rounded-xl bg-[#E8F5E9] text-[#0B3B24] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3EA635]" />
                  <span>Preferences saved successfully! AI matches updated.</span>
                </div>
              )}
              {prefError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                  {prefError}
                </div>
              )}

              {/* Save Preferences Button */}
              <button
                type="submit"
                disabled={savingPrefs}
                className="w-full py-3 rounded-2xl bg-[#0B3B24] hover:bg-[#125838] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {savingPrefs ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Preferences</span>
                )}
              </button>
            </form>



            {/* Log Out CTA */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[#586A5E]">Need to sign out completely?</span>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  logout();
                  navigate('/login');
                }}
                className="text-red-600 font-bold hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. INTERACTIVE MODAL: MY SURPLUS LISTINGS (For Donors)     */}
      {/* ========================================================= */}
      {showMyListingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E8F5E9] text-[#0B3B24] flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1A261D]">
                    My Surplus Stream Listings
                  </h3>
                  <p className="text-xs text-[#586A5E]">
                    {displayName} • Active materials available for local makers &amp; recyclers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMyListingsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Bar: Post New Material */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F9FAF8] border border-gray-200">
              <div className="text-xs">
                <div className="font-bold text-[#1A261D]">Have new surplus materials to divert?</div>
                <div className="text-[#586A5E]">Upload specs, weights, and photos in 60 seconds.</div>
              </div>
              <Link
                to="/create-listing"
                onClick={() => setShowMyListingsModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#0B3B24] hover:bg-[#125838] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Post Material</span>
              </Link>
            </div>

            {/* Listings Grid */}
            <div className="space-y-3">
              {loadingMyListings ? (
                <div className="space-y-3 py-6 text-center animate-pulse">
                  <div className="h-16 bg-gray-100 rounded-2xl" />
                  <div className="h-16 bg-gray-100 rounded-2xl" />
                </div>
              ) : myListings.length > 0 ? (
                myListings.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-gray-200 hover:border-[#0B3B24]/40 bg-white hover:bg-[#FAFBF9] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1A261D] line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-xs text-[#586A5E] flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-[#0B3B24]">{item.quantity} {item.unit}</span>
                          <span>•</span>
                          <span className="capitalize">{item.category}</span>
                          <span>•</span>
                          <span>{item.city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'reserved'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status}
                      </span>
                      <Link
                        to={`/listings/${item.id}`}
                        onClick={() => setShowMyListingsModal(false)}
                        className="p-2 rounded-xl text-gray-500 hover:text-[#0B3B24] hover:bg-gray-100 transition-colors"
                        title="View Live Listing"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/edit-listing/${item.id}`}
                        onClick={() => setShowMyListingsModal(false)}
                        className="p-2 rounded-xl text-gray-500 hover:text-[#0B3B24] hover:bg-gray-100 transition-colors"
                        title="Edit Listing"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-[#F9FAF8] rounded-2xl border border-dashed border-gray-300 space-y-3">
                  <Package className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="text-xs font-semibold text-[#1A261D]">No surplus listings posted yet.</p>
                  <p className="text-[11px] text-[#586A5E]">
                    List your warehouse cardboard, pallets, or clean industrial scrap to divert it from landfills.
                  </p>
                  <Link
                    to="/create-listing"
                    onClick={() => setShowMyListingsModal(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3B24] text-white text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post First Material</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowMyListingsModal(false)}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1A261D] font-bold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Express Interest / Proposal Modal */}
      {selectedListingForInterest && (
        <InterestModal
          listing={selectedListingForInterest}
          isOpen={showInterestModal}
          onClose={() => {
            setShowInterestModal(false);
            setSelectedListingForInterest(null);
          }}
          onSuccess={() => {
            setShowInterestModal(false);
            setSelectedListingForInterest(null);
          }}
        />
      )}

    </div>
  );
}
