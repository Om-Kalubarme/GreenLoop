import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Recycle, 
  Sparkles, 
  User, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard,
  Layers,
  Heart
} from 'lucide-react';

export default function Navbar({ connectionStatus }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold group-hover:scale-105 transition-all">
              <Recycle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-700 bg-clip-text text-transparent">
                ReSource <span className="text-emerald-600">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] tracking-wider uppercase font-semibold text-emerald-600/90 -mt-1">
                Waste-to-Resource Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <Link to="/browse" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5 font-semibold text-slate-900">
              <Layers className="w-4 h-4 text-emerald-600" />
              Browse Materials
            </Link>
            {isAuthenticated && (
              <Link to="/interests" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                Interests
              </Link>
            )}
            <a href="/#categories" className="hover:text-emerald-600 transition-colors">Categories</a>
            <a href="/#connection-test" className="hover:text-emerald-600 transition-colors">System Probe</a>
          </nav>

          {/* Right Action & Auth States */}
          <div className="hidden sm:flex items-center gap-4">
            
            {/* Live Backend Connection Indicator */}
            {connectionStatus && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium">
                <span className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-500' :
                  connectionStatus === 'error' ? 'bg-rose-500' : 'bg-amber-400 animate-ping'
                }`} />
                <span className="text-slate-600 text-[11px] capitalize">
                  API: {connectionStatus}
                </span>
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                >
                  Register
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-emerald-50"
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-emerald-700 bg-emerald-50/50"
          >
            Browse Materials
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/interests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-emerald-50"
              >
                Interest Proposals
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-emerald-700 bg-emerald-50"
              >
                Dashboard ({user?.name})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-emerald-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
