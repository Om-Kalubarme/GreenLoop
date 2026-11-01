import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import {
  User,
  Mail,
  MapPin,
  Tag,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  ShieldCheck,
  Bell,
  Save,
  Sparkles,
  ArrowRight,
  LogOut,
  Download,
  Building2,
  Briefcase,
  Sliders,
  Settings as SettingsIcon,
  ChevronRight,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

const ALL_MATERIAL_STREAMS = [
  { id: 'cardboard', label: 'Cardboard & Packaging', icon: '📦' },
  { id: 'wood', label: 'Reusable Timber & Pallets', icon: '🪵' },
  { id: 'glass', label: 'Sanitized Glassware', icon: '🫙' },
  { id: 'plastic', label: 'High-Grade Plastics', icon: '🧴' },
  { id: 'textile', label: 'Studio Fabric Offcuts', icon: '🧵' },
  { id: 'metal', label: 'Clean Scrap Metals', icon: '🔩' },
  { id: 'other', label: 'Disassembled E-Scrap', icon: '🔌' },
  { id: 'organic', label: 'Clean Compostable Prep', icon: '🌱' },
];

const CITIES = [
  { value: 'Pune', label: 'Pune (Maharashtra)' },
  { value: 'Bengaluru', label: 'Bengaluru (Karnataka)' },
  { value: 'Mumbai', label: 'Mumbai (Maharashtra)' },
  { value: 'Delhi', label: 'Delhi NCR' },
  { value: 'Hyderabad', label: 'Hyderabad (Telangana)' },
  { value: 'Chennai', label: 'Chennai (Tamil Nadu)' },
  { value: 'Kolkata', label: 'Kolkata (West Bengal)' },
  { value: 'Ahmedabad', label: 'Ahmedabad (Gujarat)' },
];

function SettingsContent() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'materials', 'notifications', 'security'

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || 'Pune');
  const [role, setRole] = useState(user?.role || 'recipient');
  const [organization, setOrganization] = useState(
    user?.organization || (user?.role === 'donor' ? 'Eco Logistics Solutions' : 'Studio Upcycle Lab')
  );
  const [bio, setBio] = useState(
    user?.bio ||
      (user?.role === 'donor'
        ? 'Industrial manufacturer providing clean secondary offcuts and reusable packaging lots for local circular re-entry.'
        : 'Creative design studio transforming discarded packaging, scrap timber, and textile remnants into functional products.')
  );

  // Material Streams State
  const [preferredCategories, setPreferredCategories] = useState(
    user?.preferred_categories && user.preferred_categories.length > 0
      ? user.preferred_categories
      : ['cardboard', 'wood']
  );

  // Notifications State
  const [notifMatches, setNotifMatches] = useState(true);
  const [notifProposals, setNotifProposals] = useState(true);
  const [notifReceipts, setNotifReceipts] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // General Loading & Feedback State
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [savingStreams, setSavingStreams] = useState(false);
  const [streamsSuccess, setStreamsSuccess] = useState(false);
  const [streamsError, setStreamsError] = useState(null);

  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifsSuccess, setNotifsSuccess] = useState(false);


  // Sync state when user prop updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCity(user.city || 'Pune');
      setRole(user.role || 'recipient');
      if (user.preferred_categories && user.preferred_categories.length > 0) {
        setPreferredCategories(user.preferred_categories);
      }
    }
  }, [user]);

  const avatarSrc = user?.avatar_url || (role === 'donor' ? '/rahul-avatar.jpg' : '/ananya-avatar.jpg');

  const roleBadgeTitle =
    role === 'donor'
      ? 'VERIFIED INDUSTRIAL DONOR'
      : 'MAKER & STUDIO UPCYCLER';

  // Toggle preferred material stream
  const handleToggleCategory = (catId) => {
    setPreferredCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    setProfileError(null);

    try {
      if (updateProfile) {
        await updateProfile({
          name: name.trim(),
          city,
          role,
        });
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.error || err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Save Material Stream Preferences
  const handleSaveStreams = async (e) => {
    e.preventDefault();
    setSavingStreams(true);
    setStreamsSuccess(false);
    setStreamsError(null);

    try {
      if (updateProfile) {
        await updateProfile({
          city,
          preferred_categories: preferredCategories,
        });
      }
      setStreamsSuccess(true);
      setTimeout(() => setStreamsSuccess(false), 3000);
    } catch (err) {
      setStreamsError(err.response?.data?.error || err.message || 'Failed to save material preferences.');
    } finally {
      setSavingStreams(false);
    }
  };

  // Save Notification Preferences
  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setSavingNotifs(true);
    setTimeout(() => {
      setSavingNotifs(false);
      setNotifsSuccess(true);
      setTimeout(() => setNotifsSuccess(false), 3000);
    }, 400);
  };

  // Handle Password Update
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      if (changePassword) {
        await changePassword(currentPassword, newPassword);
      }
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.error || err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };


  // Export User Circular Data
  const handleExportData = () => {
    const data = {
      profile: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        city: user?.city,
        preferred_categories: preferredCategories,
        memberSince: user?.created_at,
      },
      settings: {
        notifications: {
          notifMatches,
          notifProposals,
          notifReceipts,
          notifDigest,
        },
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GreenLoop-Profile-${user?.name?.replace(/\s+/g, '_') || 'User'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* ============================================================ */}
      {/* 1. TOP BREADCRUMB / ACTION BAR */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#586A5E]">
          <Link
            to="/"
            className="text-[#0B3B24] hover:underline"
          >
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">Accounts &amp; Settings</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3B24] text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Session</span>
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. HERO PROFILE HEADER CARD */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B3B24] via-[#0D4A2D] to-[#125838] p-6 sm:p-8 text-white shadow-lg space-y-6">
        
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          
          {/* User info preview matching the screenshot */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#3EA635] shrink-0 bg-white shadow-md">
              <img
                src={avatarSrc}
                alt={user?.name || 'User'}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {user?.name || name || 'GreenLoop Member'}
              </h1>

              <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-[#EAF6ED] text-[#0B3B24] shadow-sm uppercase">
                  {roleBadgeTitle}
                </span>

                <span className="text-xs text-white/80 font-mono">
                  {user?.email || ''}
                </span>
              </div>

              <div className="text-xs text-white/70 flex items-center gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#A3E5B9]" />
                <span>Primary Hub: <strong className="text-white font-medium">{city}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5">
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all shadow-sm"
              title="Download circular ledger data"
            >
              <Download className="w-3.5 h-3.5 text-[#A3E5B9]" />
              <span>Export Ledger</span>
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold backdrop-blur-md border border-red-500/30 transition-all shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. SETTINGS NAVIGATION TABS */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#0B3B24] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile &amp; Operating Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'materials'
              ? 'bg-[#0B3B24] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Preferred Material Streams</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'notifications'
              ? 'bg-[#0B3B24] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications &amp; Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'security'
              ? 'bg-[#0B3B24] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security &amp; Password</span>
        </button>


      </div>

      {/* ============================================================ */}
      {/* 4. TAB PANELS */}
      {/* ============================================================ */}

      {/* TAB 1: PROFILE & OPERATING HUB */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-[#1A261D]">
              Personal &amp; Studio Identity
            </h2>
            <p className="text-xs text-[#586A5E]">
              Update your full name, organization discipline, role on GreenLoop, and regional operating location.
            </p>
          </div>

          {profileSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0B3B24] text-xs font-semibold flex items-center gap-2.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {profileError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A261D] uppercase tracking-wider block">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your legal or display name"
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-2xl text-xs sm:text-sm text-[#1A261D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24] transition-all"
                  />
                </div>
              </div>

              {/* Email Address (Read Only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A261D] uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

            </div>

            {/* Role Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1A261D] uppercase tracking-wider block">
                Primary Account Function
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setRole('recipient')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    role === 'recipient'
                      ? 'bg-emerald-50/60 border-[#0B3B24] ring-1 ring-[#0B3B24]'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="accountRole"
                    checked={role === 'recipient'}
                    onChange={() => setRole('recipient')}
                    className="mt-1 accent-[#0B3B24]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#1A261D] flex items-center gap-1.5">
                      <span>Creative Maker &amp; Studio Upcycler</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      Requesting surplus offcuts, scrap batches, and circular raw materials for studio projects or student installations.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setRole('donor')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    role === 'donor'
                      ? 'bg-emerald-50/60 border-[#0B3B24] ring-1 ring-[#0B3B24]'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="accountRole"
                    checked={role === 'donor'}
                    onChange={() => setRole('donor')}
                    className="mt-1 accent-[#0B3B24]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#1A261D] flex items-center gap-1.5">
                      <span>Verified Industrial &amp; Scrap Donor</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      Posting surplus shipping packaging, manufacturing scrap, and pallets for verified circular handoff and CO2 diversion.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Operating Hub / City dropdown (Matching exact screenshot pattern) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A261D] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0B3B24]" />
                <span>Operating Hub / City</span>
              </label>

              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-[#F8FAFC] border border-gray-200 text-xs sm:text-sm text-[#1A261D] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24] transition-all"
              >
                {CITIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500">
                Local surplus streams and disposal centers are prioritized by this location.
              </p>
            </div>

            {/* Organization / Studio Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A261D] uppercase tracking-wider block">
                Studio / Organization Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Eco Logistics India or Studio Upcycle Lab"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-2xl text-xs sm:text-sm text-[#1A261D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24] transition-all"
                />
              </div>
            </div>

            {/* Bio / Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A261D] uppercase tracking-wider block">
                Upcycling Practice &amp; Sourcing Statement
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your reuse practice, intended material uses, or scrap generation stream..."
                className="w-full p-3.5 bg-[#F8FAFC] border border-gray-200 rounded-2xl text-xs sm:text-sm text-[#1A261D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24] transition-all"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider bg-[#0B3B24] text-white hover:bg-[#165B37] shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      )}

      {/* TAB 2: PREFERRED MATERIAL STREAMS (Exact Match to User Screenshot) */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B3B24] uppercase tracking-wider">
              <Tag className="w-4 h-4 text-[#0B3B24]" />
              <span>Preferred Material Streams</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#1A261D]">
              Tune Your Circular Matching Engine
            </h2>
            <p className="text-xs text-[#586A5E]">
              Select the material categories you actively collect. Recommended surplus streams in your feed are prioritized according to these selections.
            </p>
          </div>

          {streamsSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0B3B24] text-xs font-semibold flex items-center gap-2.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Material stream preferences saved! AI match feed refreshed.</span>
            </div>
          )}

          {streamsError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{streamsError}</span>
            </div>
          )}

          <form onSubmit={handleSaveStreams} className="space-y-6">
            
            {/* 8 Material Stream Pills matching user screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ALL_MATERIAL_STREAMS.map((item) => {
                const isSelected = preferredCategories.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleCategory(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#EAF6ED] border-[#0B3B24] text-[#0B3B24] font-semibold shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#0B3B24] text-white'
                          : 'border border-gray-300 text-transparent group-hover:border-gray-400'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Operating Hub Reminder */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-gray-200 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0B3B24]" />
                <span>Operating Hub: <strong className="text-[#1A261D]">{city}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="text-[#0B3B24] font-bold hover:underline"
              >
                Change Hub
              </button>
            </div>

            {/* SAVE PREFERENCES BUTTON (Matching User Screenshot) */}
            <button
              type="submit"
              disabled={savingStreams}
              className="w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-wider bg-[#0B3B24] text-white hover:bg-[#165B37] shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingStreams ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Preferences...</span>
                </>
              ) : (
                <span>SAVE PREFERENCES</span>
              )}
            </button>

          </form>

        </div>
      )}

      {/* TAB 3: NOTIFICATIONS & ALERTS */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-[#1A261D]">
              Notification &amp; Communication Preferences
            </h2>
            <p className="text-xs text-[#586A5E]">
              Choose which automated alerts you receive for new scrap batches, proposal reviews, and digital handoff receipts.
            </p>
          </div>

          {notifsSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0B3B24] text-xs font-semibold flex items-center gap-2.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Notification preferences saved!</span>
            </div>
          )}

          <form onSubmit={handleSaveNotifications} className="space-y-4">
            
            <div className="divide-y divide-gray-100">
              
              {/* Alert 1 */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#1A261D]">
                    Real-time AI Match Alerts
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Receive high-priority notifications when an industrial donor posts surplus matching your saved categories within your city.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifMatches(!notifMatches)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    notifMatches ? 'bg-[#0B3B24]' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifMatches ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Alert 2 */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#1A261D]">
                    Proposal &amp; Inquiry Updates
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Get instantly notified when donors review, accept, or reply to your intended reuse proposals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifProposals(!notifProposals)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    notifProposals ? 'bg-[#0B3B24]' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifProposals ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Alert 3 */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#1A261D]">
                    Digital Transfer &amp; Diversion Certificates
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Automatically receive signed circular transfer receipts with diversion metrics upon successful material collection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifReceipts(!notifReceipts)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    notifReceipts ? 'bg-[#0B3B24]' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifReceipts ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Alert 4 */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#1A261D]">
                    Weekly Circular Impact Digest
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Summary of community scrap diverted, total carbon avoided, and new drop-off collection centers in your region.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifDigest(!notifDigest)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    notifDigest ? 'bg-[#0B3B24]' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifDigest ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={savingNotifs}
                className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-[#0B3B24] text-white hover:bg-[#165B37] transition-all shadow-sm"
              >
                Save Notification Settings
              </button>
            </div>

          </form>

        </div>
      )}

      {/* TAB 4: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-[#1A261D]">
              Security &amp; Password Management
            </h2>
            <p className="text-xs text-[#586A5E]">
              Keep your GreenLoop account secure by updating your master password regularly.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0B3B24] text-xs font-semibold flex items-center gap-2.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          {passwordError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
            
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A261D] uppercase tracking-wider block">
                Current Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border border-gray-200 rounded-2xl text-xs sm:text-sm text-[#1A261D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A261D] uppercase tracking-wider block">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border border-gray-200 rounded-2xl text-xs sm:text-sm text-[#1A261D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24] transition-all"
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A261D] uppercase tracking-wider block">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border border-gray-200 rounded-2xl text-xs sm:text-sm text-[#1A261D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider bg-[#0B3B24] text-white hover:bg-[#165B37] shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {passwordLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>

          </form>

        </div>
      )}



      {/* ============================================================ */}
      {/* 5. BOTTOM SIGN OUT CALLOUT (Exact copy from screenshot) */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div className="text-xs text-[#586A5E] font-medium">
          Need to sign out completely from this browser?
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all border border-red-200"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          <span>Log Out</span>
        </button>
      </div>

    </div>
  );
}

export default function Settings() {
  return (
    <DashboardLayout activeTab="settings">
      <SettingsContent />
    </DashboardLayout>
  );
}
