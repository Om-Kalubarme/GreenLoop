import React, { useState, useEffect } from 'react';
import { Trophy, X, Sparkles, RotateCcw, Trees, CloudFog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ImpactModal({ isOpen, onClose }) {
  const { isDonor } = useAuth();
  const [progress, setProgress] = useState(0);

  // Targets (default to donor numbers as shown in user's report)
  const targetTotal = isDonor ? 45.0 : 18.5;
  const targetCardboard = isDonor ? 24.5 : 8.2;
  const targetPallets = isDonor ? 12.6 : 6.1;
  const targetGlass = isDonor ? 7.9 : 4.2;
  const targetCo2 = isDonor ? 72.4 : 34.2;
  const targetTrees = isDonor ? 5 : 3;

  // Animation trigger whenever modal opens
  const startAnimation = () => {
    setProgress(0);
    let startTime = null;
    let animId = null;
    const duration = 1600; // 1.6s smooth easing

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / duration);
      // Cubic ease-out curve
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);

      if (t < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  };

  useEffect(() => {
    if (isOpen) {
      const cleanup = startAnimation();
      return cleanup;
    } else {
      setProgress(0);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Donut geometry calculations
  const size = 190;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4; // ~77px
  const circumference = 2 * Math.PI * radius; // ~483.8px

  // Segment fractions
  const frac1 = targetCardboard / targetTotal;
  const frac2 = targetPallets / targetTotal;
  const frac3 = targetGlass / targetTotal;

  const gap = 4; // visual gap in px
  const len1 = Math.max(0, circumference * frac1 - gap);
  const len2 = Math.max(0, circumference * frac2 - gap);
  const len3 = Math.max(0, circumference * frac3 - gap);

  // Animated arc lengths
  const animLen1 = len1 * progress;
  const animLen2 = len2 * progress;
  const animLen3 = len3 * progress;

  // Offsets (starting from top 12 o'clock, clockwise)
  const offset1 = 0;
  const offset2 = -(circumference * frac1 * progress);
  const offset3 = -(circumference * (frac1 + frac2) * progress);

  // Computed animated values
  const currentTotal = (targetTotal * progress).toFixed(1);
  const currentCardboard = (targetCardboard * progress).toFixed(1);
  const currentPallets = (targetPallets * progress).toFixed(1);
  const currentGlass = (targetGlass * progress).toFixed(1);
  const currentCo2 = (targetCo2 * progress).toFixed(1);
  const currentTrees = Math.round(targetTrees * progress);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="font-bold text-lg text-[#1A261D] flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#E8F5E9] text-[#0B3B24]">
              <Trophy className="w-5 h-5 text-[#3EA635]" />
            </span>
            <span>Eco Impact Report</span>
          </h3>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={startAnimation}
              title="Replay Animation"
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-[#0B3B24] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-[#1A261D] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Animated Donut Shape with Counting Numbers */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            
            {/* SVG Donut */}
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90 drop-shadow-sm"
            >
              {/* Background Ring Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#F1EADF"
                strokeWidth={strokeWidth}
                className="opacity-70"
              />

              {/* Segment 1: Corrugated Cardboard (Deep Forest Green) */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#0B3B24"
                strokeWidth={strokeWidth}
                strokeDasharray={`${animLen1} ${circumference}`}
                strokeDashoffset={offset1}
                strokeLinecap="round"
                className="transition-all duration-75"
              />

              {/* Segment 2: Reusable Pine Pallets (Vibrant Emerald) */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#3EA635"
                strokeWidth={strokeWidth}
                strokeDasharray={`${animLen2} ${circumference}`}
                strokeDashoffset={offset2}
                strokeLinecap="round"
                className="transition-all duration-75"
              />

              {/* Segment 3: Sanitized Glass Jars (Bright Leaf Green / Mint) */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#A3E5B9"
                strokeWidth={strokeWidth}
                strokeDasharray={`${animLen3} ${circumference}`}
                strokeDashoffset={offset3}
                strokeLinecap="round"
                className="transition-all duration-75"
              />
            </svg>

            {/* Centered Animated Numbers inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#0B3B24] tracking-tight font-sans">
                  {currentTotal}
                </span>
                <span className="text-base font-bold text-[#3EA635]">kg</span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-[#586A5E] uppercase tracking-wider mt-0.5">
                Diverted
              </div>
            </div>

          </div>

          <div className="text-xs text-[#586A5E] font-medium text-center mt-2">
            Verified Diversions away from landfill
          </div>
        </div>

        {/* Breakdown Rows with Segment Color Indicators & Animated Values */}
        <div className="space-y-2 text-xs">
          
          {/* Cardboard */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F9FAF8] border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B3B24] shrink-0 shadow-sm" />
              <span className="font-medium text-[#1A261D]">📦 Corrugated Cardboard</span>
            </div>
            <span className="font-bold text-[#0B3B24] text-sm tabular-nums">
              {currentCardboard} kg
            </span>
          </div>

          {/* Pallets */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F9FAF8] border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3EA635] shrink-0 shadow-sm" />
              <span className="font-medium text-[#1A261D]">🪵 Reusable Pine Pallets</span>
            </div>
            <span className="font-bold text-[#0B3B24] text-sm tabular-nums">
              {currentPallets} kg
            </span>
          </div>

          {/* Glass */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F9FAF8] border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A3E5B9] shrink-0 shadow-sm border border-emerald-400" />
              <span className="font-medium text-[#1A261D]">🫙 Sanitized Glass Jars</span>
            </div>
            <span className="font-bold text-[#0B3B24] text-sm tabular-nums">
              {currentGlass} kg
            </span>
          </div>

        </div>

        {/* Planet Milestone Callout with Animated CO2 & Tree count */}
        <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] text-xs space-y-1.5">
          <div className="font-bold text-[#0B3B24] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#3EA635]" />
            <span>Planet Milestone:</span>
          </div>
          <div className="text-[#2E4A38] leading-relaxed">
            Your contributions have saved{' '}
            <strong className="font-bold text-[#0B3B24] tabular-nums">{currentCo2} kg CO2e</strong> &amp; protected{' '}
            <strong className="font-bold text-[#0B3B24] tabular-nums">{currentTrees} mature trees</strong> from timber pulping.
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#0B3B24] hover:bg-[#165B37] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_14px_rgba(11,59,36,0.2)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          Close
        </button>

      </div>
    </div>
  );
}
