import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  User, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard,
  Layers,
  Heart,
  Search,
  PlusCircle,
  Leaf
} from 'lucide-react';

export default function Navbar({ connectionStatus }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, isDonor, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF6EE]/90 border-b border-[#EAE3D2] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - GreenLoop */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo-icon.png"
              alt="GreenLoop Emblem"
              className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-[#1A261D] flex items-center leading-tight">
                <span className="text-[#0D5C3A]">Green</span><span className="text-[#4E9F3D]">Loop</span>
              </span>
              <span className="hidden sm:block text-[9.5px] tracking-wider uppercase font-semibold text-[#0D5C3A] -mt-0.5">
                AI Waste-to-Resource Platform
              </span>
            </div>
          </Link>

          {/* Center Search Pill */}
          <form 
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center w-80 relative"
          >
            <Search className="w-4 h-4 text-[#586A5E] absolute left-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search materials, boxes, timber..."
              className="w-full pl-10 pr-4 py-2 bg-white/80 border border-[#EAE3D2] rounded-full text-xs text-[#1A261D] placeholder-[#586A5E]/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36] transition-all"
            />
          </form>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-[#3A483E]">
            <Link to="/browse" className="hover:text-[#0A5C36] transition-colors flex items-center gap-1.5">
              Materials
            </Link>
            <Link to="/recommendations" className="hover:text-[#0A5C36] transition-colors flex items-center gap-1.5 text-[#0A5C36] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#D9381E]" />
              AI Matches
            </Link>
            <a href="/#categories" className="hover:text-[#0A5C36] transition-colors">
              Categories
            </a>
            <a href="/#gallery" className="hover:text-[#0A5C36] transition-colors">
              Inspiration
            </a>
            {isAuthenticated && (
              <Link to={user?.role === 'donor' ? '/interests?tab=received' : '/interests?tab=sent'} className="hover:text-[#0A5C36] transition-colors flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-[#D9381E]" />
                Interests
              </Link>
            )}
          </nav>

          {/* Right Action & Auth States */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Live Backend Connection Indicator */}
            {connectionStatus && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3ECE0] border border-[#EAE3D2] text-[11px] font-medium text-[#3A483E]">
                <span className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-[#0A5C36]' :
                  connectionStatus === 'error' ? 'bg-[#D9381E]' : 'bg-amber-400 animate-ping'
                }`} />
                <span className="capitalize">{connectionStatus}</span>
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isDonor && (
                  <Link
                    to="/create-listing"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#E1F2E8] text-[#0A5C36] hover:bg-[#C5E5D1] transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#0A5C36]" />
                    Post Material
                  </Link>
                )}

                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white border border-[#EAE3D2] text-[#1A261D] hover:bg-[#FAF6EE] shadow-sm transition-all"
                  title="Go to GreenLoop Dashboard"
                >
                  <User className="w-3.5 h-3.5 text-[#0A5C36]" />
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-[#586A5E] hover:text-[#D9381E] hover:bg-[#FCEBE6] transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-semibold text-[#1A261D] hover:text-[#0A5C36] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-[#0A5C36] text-white hover:bg-[#0D7A47] shadow-emerald-glow transition-all hover:scale-[1.02]"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-[#1A261D] hover:bg-[#F3ECE0]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#EAE3D2] bg-[#FAF6EE] px-6 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <Search className="w-4 h-4 text-[#586A5E] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search materials..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#EAE3D2] rounded-full text-xs text-[#1A261D]"
            />
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-[#1A261D] hover:bg-[#F3ECE0]"
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-[#0A5C36] bg-[#E1F2E8]/60"
          >
            Browse Materials
          </Link>
          <Link
            to="/recommendations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-[#0A5C36]"
          >
            AI Matches & Recommendations
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={user?.role === 'donor' ? '/interests?tab=received' : '/interests?tab=sent'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-[#1A261D] hover:bg-[#F3ECE0]"
              >
                Interest Proposals
              </Link>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-[#0A5C36] bg-[#E1F2E8]"
              >
                GreenLoop Dashboard ({user?.name})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-[#D9381E] hover:bg-[#FCEBE6]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-full border border-[#EAE3D2] text-xs font-semibold text-[#1A261D]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-full bg-[#0A5C36] text-white text-xs font-semibold shadow-emerald-glow"
              >
                Join Platform
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
