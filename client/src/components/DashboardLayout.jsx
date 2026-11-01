import React, { useState, useEffect, createContext, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyListings } from '../api/listings.api';
import ImpactModal from './ImpactModal';
import WasteClassifierModal from './WasteClassifierModal';
import DisposalCentersModal from './DisposalCentersModal';
import {
  Home as HomeIcon,
  Scan,
  HeartHandshake,
  Store,
  Trophy,
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
  Plus,
  PlusCircle,
  Package,
  Inbox,
  CheckCircle2,
  Upload,
  Award,
  Edit3,
  Eye,
  RefreshCw,
  Check,
  Tag,
  ShieldCheck,
} from 'lucide-react';

export const DashboardContext = createContext({
  openSettings: () => {},
  openScan: () => {},
  openImpact: () => {},
  openClassifier: () => {},
  openCenters: () => {},
  openRewards: () => {},
  openMyListings: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

const ALL_CATEGORIES = [
  { id: 'cardboard', label: '📦 Cardboard & Packaging' },
  { id: 'wood', label: '🪵 Reusable Timber & Pallets' },
  { id: 'glass', label: '🫙 Sanitized Glassware' },
  { id: 'plastics', label: '🧴 High-Grade Plastics' },
  { id: 'textiles', label: '🧵 Studio Fabric Offcuts' },
  { id: 'metals', label: '🔩 Clean Scrap Metals' },
  { id: 'electronics', label: '🔌 Disassembled E-Scrap' },
  { id: 'organic', label: '🌱 Clean Compostable Prep' },
];

export default function DashboardLayout({
  children,
  activeTab = 'home',
  onPreferencesUpdated,
}) {
  const { user, logout, isAuthenticated, updatePreferences } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [showScanModal, setShowScanModal] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [showCentersModal, setShowCentersModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMyListingsModal, setShowMyListingsModal] = useState(false);
  const [showClassifierModal, setShowClassifierModal] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications popup state
  const [showNotifications, setShowNotifications] = useState(false);

  // AI Vision Scanner state
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // My Listings state
  const [myListings, setMyListings] = useState([]);
  const [loadingMyListings, setLoadingMyListings] = useState(false);

  // Settings & Preferences form state
  const [prefCity, setPrefCity] = useState(user?.city || 'Bengaluru');
  const [prefCategories, setPrefCategories] = useState(user?.preferred_categories || ['wood', 'cardboard']);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);
  const [prefError, setPrefError] = useState(null);

  // Sync state when user updates
  useEffect(() => {
    if (user?.city) setPrefCity(user.city);
    if (user?.preferred_categories) setPrefCategories(user.preferred_categories);
  }, [user]);

  // Load donor listings when modal opens
  const isDonor = user?.role === 'donor' || user?.role === 'admin';
  const isRecipient = user?.role === 'recipient' || user?.role === 'admin';

  useEffect(() => {
    if (showMyListingsModal && isDonor) {
      loadMyListings();
    }
  }, [showMyListingsModal, isDonor]);

  const loadMyListings = async () => {
    setLoadingMyListings(true);
    try {
      const data = await fetchMyListings();
      setMyListings(data.listings || []);
    } catch (err) {
      console.error('Failed to load my listings:', err);
    } finally {
      setLoadingMyListings(false);
    }
  };

  const handleSimulateScan = (name, category, recyclability, co2) => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      setScanResult({ name, category, recyclability, co2 });
    }, 1000);
  };

  const toggleCategory = (catId) => {
    setPrefCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefSuccess(false);
    setPrefError(null);
    try {
      if (updatePreferences) {
        await updatePreferences({
          city: prefCity,
          preferred_categories: prefCategories,
        });
      }
      setPrefSuccess(true);
      if (onPreferencesUpdated) {
        onPreferencesUpdated();
      }
      setTimeout(() => {
        setPrefSuccess(false);
        setShowSettingsModal(false);
      }, 1200);
    } catch (err) {
      setPrefError(err.response?.data?.error || 'Failed to update preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Determine user avatar & display
  const displayName = user?.name || (isDonor ? 'Industrial Donor' : 'Community Member');

  const displayRole = user?.role === 'donor'
    ? 'Verified Industrial Donor'
    : user?.role === 'recipient'
      ? 'Maker & Studio Upcycler'
      : user?.role === 'admin'
        ? 'System Administrator'
        : 'Circular Economy Member';

  const displayCity = user?.city || 'Bengaluru';

  const avatarSrc = user?.avatar_url || (isDonor ? '/rahul-avatar.jpg' : '/ananya-avatar.jpg');

  const contextValue = {
    openSettings: () => navigate('/settings'),
    openScan: () => setShowScanModal(true),
    openImpact: () => setShowImpactModal(true),
    openClassifier: () => setShowClassifierModal(true),
    openCenters: () => setShowCentersModal(true),
    openRewards: () => setShowRewardsModal(true),
    openMyListings: () => setShowMyListingsModal(true),
  };

  const currentPath = location.pathname;

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="min-h-screen flex bg-[#F4F6F0] font-sans text-[#1A261D]">
        
        {/* ========================================================= */}
        {/* 1. LEFT SIDEBAR (Dark Forest Green matching Home Reference) */}
        {/* ========================================================= */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-64 xl:w-72 bg-[#0B3B24] text-white flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out
            ${mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Top Brand Logo & Navigation */}
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
              
              {/* Home */}
              <Link
                to="/"
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all ${
                  currentPath === '/' && activeTab === 'home'
                    ? 'bg-white/15 text-white font-semibold shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
              </Link>

              {/* Role-Specific Actions: Donor */}
              {isDonor && (
                <>
                  <Link
                    to="/create-listing"
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all shadow-sm group ${
                      currentPath === '/create-listing' || activeTab === 'create-listing'
                        ? 'bg-white/20 text-white font-semibold'
                        : 'bg-[#165B37] hover:bg-[#1C7345] text-white font-semibold'
                    }`}
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
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all ${
                      currentPath === '/interests' || activeTab === 'interests'
                        ? 'bg-white/15 text-white font-semibold shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
                    }`}
                  >
                    <Inbox className="w-5 h-5 text-white/80" />
                    <span>Inquiries &amp; Requests</span>
                  </Link>
                </>
              )}

              {/* Role-Specific Actions: Recipient */}
              {isRecipient && (
                <Link
                  to="/interests?tab=sent"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all ${
                    currentPath === '/interests' || activeTab === 'interests'
                      ? 'bg-white/15 text-white font-semibold shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
                  }`}
                >
                  <HeartHandshake className="w-5 h-5 text-white/80" />
                  <span>My Proposals</span>
                </Link>
              )}

              {/* AI Matcher */}
              <Link
                to="/recommendations"
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all shadow-sm group ${
                  currentPath === '/recommendations' || activeTab === 'recommendations'
                    ? 'bg-white/20 text-white font-bold ring-1 ring-white/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Sparkles className="w-5 h-5 text-[#A3E5B9]" />
                  <span>AI Matcher</span>
                </div>
                <span className="text-[10px] bg-[#A3E5B9] text-[#0B3B24] px-2 py-0.5 rounded-full font-bold">
                  AI
                </span>
              </Link>

              {/* AI Waste Classifier */}
              <button
                type="button"
                onClick={() => {
                  setShowClassifierModal(true);
                  setMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <Scan className="w-5 h-5 text-[#A3E5B9]" />
                  <span>AI Classifier</span>
                </div>
                <span className="text-[10px] bg-[#3EA635] text-white px-2 py-0.5 rounded-full font-bold">
                  4-Stream
                </span>
              </button>

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
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all ${
                  currentPath === '/browse' || currentPath === '/marketplace' || activeTab === 'browse' || activeTab === 'marketplace'
                    ? 'bg-white/15 text-white font-semibold shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
                }`}
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

          {/* Bottom User Profile Section (Links directly to Full Settings Page) */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <Link
              to="/settings"
              onClick={() => setMobileSidebarOpen(false)}
              title="Account & Settings"
              className={`flex items-center gap-3 group overflow-hidden text-left flex-1 p-2 -ml-2 rounded-2xl transition-all ${
                currentPath === '/settings' || activeTab === 'settings'
                  ? 'bg-white/20 ring-1 ring-white/30 text-white shadow-sm'
                  : 'hover:bg-white/10 text-white/90'
              }`}
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
              onClick={async () => {
                if (isAuthenticated) {
                  await logout();
                }
                navigate('/login');
              }}
              title={isAuthenticated ? 'Log Out' : 'Sign In'}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors shrink-0 cursor-pointer"
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
          
          {/* Top Header Bar matching Home Reference */}
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

            {/* Right Header Actions: User Badge, Classifier Quick-Action & Bell */}
            <div className="flex items-center gap-3">
              {/* AI 4-Stream Classifier Quick Action */}
              <button
                type="button"
                onClick={() => setShowClassifierModal(true)}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-gray-200/90 hover:border-[#0B3B24] text-[#0B3B24] text-xs font-bold shadow-sm hover:shadow transition-all group"
                title="Classify waste into 4 streams (Hazardous, Non-Recyclable, Organic, Recyclable)"
              >
                <Sparkles className="w-4 h-4 text-[#3EA635] group-hover:rotate-12 transition-transform" />
                <span>AI Classifier</span>
                <span className="text-[10px] bg-[#E8F5E9] text-[#0B3B24] font-extrabold px-1.5 py-0.5 rounded-md">
                  Vision
                </span>
              </button>

              {/* If not authenticated, show Sign In button */}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-2xl bg-[#0B3B24] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#125838] transition-all"
                >
                  Sign In
                </Link>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-11 h-11 rounded-2xl bg-white border border-gray-200/90 hover:border-[#3EA635] flex items-center justify-center text-[#1A261D] shadow-sm hover:shadow transition-all"
                >
                  <Bell className="w-5 h-5 text-[#1A261D]" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#3EA635] ring-2 ring-white" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 space-y-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-[#1A261D]">Live Circular Notifications</span>
                      <span className="text-[10px] bg-[#E8F5E9] text-[#0B3B24] px-2 py-0.5 rounded-full font-bold">3 New</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-2xl bg-[#F9FAF8] border border-gray-100 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#3EA635] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[#1A261D]">New AI Match Found</div>
                          <div className="text-[11px] text-[#586A5E]">Sanitized Glass Jars matches your crafts category in Bengaluru.</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#F9FAF8] border border-gray-100 flex items-start gap-2.5">
                        <Trophy className="w-4 h-4 text-[#0B3B24] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[#1A261D]">Planet Milestone Unlocked</div>
                          <div className="text-[11px] text-[#586A5E]">You saved 28.3 kg CO2e this month!</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </header>

          {/* Page Content injected here */}
          <main className="p-4 sm:p-8 space-y-8 flex-1">
            {children}
          </main>

        </div>

        {/* ========================================================= */}
        {/* MODALS SUPPORTED ACROSS ALL PAGES                         */}
        {/* ========================================================= */}

        {/* Scan Modal */}
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
                    onClick={() => setShowScanModal(false)}
                    className="flex-1 py-3 rounded-xl bg-[#0B3B24] hover:bg-[#125838] text-white text-xs font-bold text-center uppercase tracking-wider transition-all"
                  >
                    Post This Surplus Material
                  </Link>
                  <Link
                    to="/browse"
                    onClick={() => setShowScanModal(false)}
                    className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#1A261D] transition-all"
                  >
                    Find Recipient
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Impact Modal with Animated Donut & Counting Numbers */}
        <ImpactModal
          isOpen={showImpactModal}
          onClose={() => setShowImpactModal(false)}
        />

        {/* 4-Class Waste & Material Classifier Modal */}
        <WasteClassifierModal
          isOpen={showClassifierModal}
          onClose={() => setShowClassifierModal(false)}
        />

        {/* Disposal & Material Drop Centers Interactive Map Modal */}
        <DisposalCentersModal
          isOpen={showCentersModal}
          onClose={() => setShowCentersModal(false)}
          userCity={user?.city || 'Bengaluru'}
        />

        {/* Rewards Modal */}
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
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Settings Modal (Profile Preferences & Category Selection) */}
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

        {/* My Listings Modal (for Donor) */}
        {showMyListingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
              
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

      </div>
    </DashboardContext.Provider>
  );
}
