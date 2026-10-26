import React, { useState } from 'react';
import { Recycle, Sparkles, User, LogIn, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar({ connectionStatus }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
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
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a>
            <a href="#categories" className="hover:text-emerald-600 transition-colors">Materials</a>
            <a href="#recommendations" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              AI Matcher
            </a>
            <a href="#connection-test" className="hover:text-emerald-600 transition-colors">System Probe</a>
          </nav>

          {/* Right Action & Live Health Indicator */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Live Backend Connection Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium">
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                connectionStatus === 'error' ? 'bg-rose-500' : 'bg-amber-400 animate-ping'
              }`} />
              <span className="text-slate-700 capitalize">
                API: {connectionStatus}
              </span>
            </div>

            <a
              href="#connection-test"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </a>
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
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            How It Works
          </a>
          <a
            href="#categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Materials &amp; Categories
          </a>
          <a
            href="#recommendations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            AI Recommendations
          </a>
          <a
            href="#connection-test"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            System Health Check
          </a>
        </div>
      )}
    </header>
  );
}
