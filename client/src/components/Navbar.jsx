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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF7F2]/90 border-b border-[#E8E2D6] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - Inspired by editorial serif Homedine brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-[#1B3B2B] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
              <Leaf className="w-5 h-5 text-[#E2EBD8]" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold tracking-tight text-[#1C241E]">
                ReSource <span className="text-[#76937F] font-serif italic">◇ AI</span>
              </span>
              <span className="hidden sm:block text-[10px] tracking-widest uppercase font-semibold text-[#76937F] -mt-1">
                Waste to Resource
              </span>
            </div>
          </Link>

          {/* Center Search Pill - Like the inspiration header search bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center w-80 relative"
          >
            <Search className="w-4 h-4 text-[#76937F] absolute left-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search materials, cardboard, timber..."
              className="w-full pl-10 pr-4 py-2 bg-white/70 border border-[#E8E2D6] rounded-full text-xs text-[#1C241E] placeholder-[#76937F]/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B] transition-all"
            />
          </form>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-[#4A584E]">
            <Link to="/browse" className="hover:text-[#1B3B2B] transition-colors flex items-center gap-1.5">
              Materials
            </Link>
            <Link to="/recommendations" className="hover:text-[#1B3B2B] transition-colors flex items-center gap-1.5 text-[#1B3B2B] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#76937F]" />
              AI Matches
            </Link>
            <a href="/#categories" className="hover:text-[#1B3B2B] transition-colors">
              Categories
            </a>
            <a href="/#gallery" className="hover:text-[#1B3B2B] transition-colors">
              Inspiration
            </a>
            {isAuthenticated && (
              <Link to="/interests" className="hover:text-[#1B3B2B] transition-colors flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-[#C86D51]" />
                Interests
              </Link>
            )}
          </nav>

          {/* Right Action & Auth States */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Live Backend Connection Indicator */}
            {connectionStatus && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFEAE1] border border-[#E8E2D6] text-[11px] font-medium text-[#4A584E]">
                <span className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-[#4E7158]' :
                  connectionStatus === 'error' ? 'bg-rose-500' : 'bg-amber-400 animate-ping'
                }`} />
                <span className="capitalize">{connectionStatus}</span>
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isDonor && (
                  <Link
                    to="/create-listing"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#E2EBD8] text-[#1B3B2B] hover:bg-[#D5E4C8] transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#1B3B2B]" />
                    Post Material
                  </Link>
                )}

                <Link
                  to={isDonor ? "/donor/dashboard" : "/dashboard"}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white border border-[#E8E2D6] text-[#1C241E] hover:bg-[#FAF7F2] shadow-sm transition-all"
                >
                  <User className="w-3.5 h-3.5 text-[#76937F]" />
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-[#76937F] hover:text-[#C86D51] hover:bg-rose-50 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-semibold text-[#1C241E] hover:text-[#1B3B2B] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-[#1B3B2B] text-white hover:bg-[#28533E] shadow-sm transition-all hover:scale-[1.02]"
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
              className="p-2 rounded-full text-[#1C241E] hover:bg-[#EFEAE1]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8E2D6] bg-[#FAF7F2] px-6 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <Search className="w-4 h-4 text-[#76937F] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search materials..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E2D6] rounded-full text-xs text-[#1C241E]"
            />
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-[#1C241E] hover:bg-[#EFEAE1]"
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-[#1B3B2B] bg-[#E2EBD8]/50"
          >
            Browse Materials
          </Link>
          <Link
            to="/recommendations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-[#1B3B2B]"
          >
            AI Matches & Recommendations
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/interests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-[#1C241E] hover:bg-[#EFEAE1]"
              >
                Interest Proposals
              </Link>
              <Link
                to={isDonor ? "/donor/dashboard" : "/dashboard"}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-[#1B3B2B] bg-[#E2EBD8]"
              >
                Dashboard ({user?.name})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-[#C86D51] hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-full border border-[#E8E2D6] text-xs font-semibold text-[#1C241E]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-semibold"
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
