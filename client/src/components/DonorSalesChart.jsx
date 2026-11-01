import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDonorSalesAnalytics } from '../api/listings.api';
import {
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  Download,
  Filter,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function DonorSalesChart() {
  const { user, isDonor } = useAuth();

  // Mode: 'revenue' (Image 1 line chart), 'batches' (Image 2 purple area chart), 'combined'
  const [viewMode, setViewMode] = useState('revenue');
  // Timeframe: 'sixMonths' (May-Oct) or 'fullYear' (Jan-Dec)
  const [timeframe, setTimeframe] = useState('sixMonths');
  // Hovered data point for tooltip
  const [hoveredPoint, setHoveredPoint] = useState(null);
  // Expand monthly ledger table
  const [showLedger, setShowLedger] = useState(false);
  // API state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // If user is not donor or admin, DO NOT display this component at all
  if (!isDonor && user?.role !== 'donor' && user?.role !== 'admin') {
    return null;
  }

  useEffect(() => {
    let isMounted = true;
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetchDonorSalesAnalytics();
        if (isMounted && res.success) {
          setAnalyticsData(res);
        }
      } catch (err) {
        console.warn('Using client fallback for donor sales analytics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fallback data if offline or freshly registered
  const fallbackData = useMemo(() => {
    const fullYear = [
      { month: 'Jan', monthFull: 'January', revenue: 2400, batches: 4, topCategory: 'Cardboard & Paper', growth: '+12.4%' },
      { month: 'Feb', monthFull: 'February', revenue: 3100, batches: 5, topCategory: 'Glass Jars & Bottles', growth: '+29.1%' },
      { month: 'Mar', monthFull: 'March', revenue: 3500, batches: 5, topCategory: 'Wood & Timber', growth: '+12.9%' },
      { month: 'Apr', monthFull: 'April', revenue: 3900, batches: 6, topCategory: 'Plastics & Containers', growth: '+11.4%' },
      { month: 'May', monthFull: 'May', revenue: 4200, batches: 8, topCategory: 'Cardboard & Paper', growth: '+7.6%' },
      { month: 'Jun', monthFull: 'June', revenue: 5800, batches: 8, topCategory: 'Textile & Fabrics', growth: '+38.0%' },
      { month: 'Jul', monthFull: 'July', revenue: 7400, batches: 8, topCategory: 'Wood & Timber', growth: '+27.5%' },
      { month: 'Aug', monthFull: 'August', revenue: 9200, batches: 8, topCategory: 'Cardboard & Paper', growth: '+24.3%' },
      { month: 'Sep', monthFull: 'September', revenue: 11500, batches: 8, topCategory: 'Metals & Hardware', growth: '+25.0%' },
      { month: 'Oct', monthFull: 'October', revenue: 14200, batches: 8, topCategory: 'Cardboard & Paper', growth: '+23.4%' },
      { month: 'Nov', monthFull: 'November (Proj.)', revenue: 16500, batches: 9, topCategory: 'Cardboard & Paper', growth: '+16.1%' },
      { month: 'Dec', monthFull: 'December (Proj.)', revenue: 18800, batches: 10, topCategory: 'Wood & Timber', growth: '+13.9%' },
    ];
    return {
      timeframes: {
        sixMonths: fullYear.slice(4, 10), // May to Oct (matches user images)
        fullYear: fullYear,
      },
      summary: {
        totalAnnualRevenue: 90300,
        sixMonthRevenue: 52300,
        avgMonthlyRevenue: 8716,
        totalBatchesSold: 48,
        growthPercentage: 38.5,
        peakMonth: 'October',
        peakRevenue: 14200,
      }
    };
  }, []);

  const activeDataset = useMemo(() => {
    const source = analyticsData?.timeframes || fallbackData.timeframes;
    return timeframe === 'sixMonths' ? source.sixMonths : source.fullYear;
  }, [timeframe, analyticsData, fallbackData]);

  const summary = useMemo(() => {
    return analyticsData?.summary || fallbackData.summary;
  }, [analyticsData, fallbackData]);

  // SVG Chart Geometry Constants
  const svgWidth = 840;
  const svgHeight = 360;
  const padding = { top: 40, right: 40, bottom: 50, left: 75 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Maximum scales
  // Revenue max rounded up to nearest 4000 (Image 1 uses steps of 4000: 0, 4000, 8000, 12000, 16000)
  const maxRevenueData = Math.max(...activeDataset.map((d) => d.revenue));
  const maxRevenue = Math.max(16000, Math.ceil(maxRevenueData / 4000) * 4000);
  const revenueTicks = [0, 4000, 8000, 12000, 16000];
  if (maxRevenue > 16000) {
    revenueTicks.push(maxRevenue);
  }

  // Batches max (Image 2 uses steps of 2: 0, 2, 4, 6, 8)
  const maxBatchesData = Math.max(...activeDataset.map((d) => d.batches));
  const maxBatches = Math.max(8, Math.ceil(maxBatchesData / 2) * 2);
  const batchTicks = [0, 2, 4, 6, 8];
  if (maxBatches > 8) {
    batchTicks.push(maxBatches);
  }

  // Calculate coordinates for points
  const points = useMemo(() => {
    const totalPoints = activeDataset.length;
    return activeDataset.map((item, index) => {
      const x = padding.left + (index / (totalPoints - 1)) * chartWidth;
      
      // Revenue Y coordinate
      const yRevenue = padding.top + chartHeight - (item.revenue / maxRevenue) * chartHeight;
      
      // Batches Y coordinate
      const yBatches = padding.top + chartHeight - (item.batches / maxBatches) * chartHeight;

      return {
        ...item,
        index,
        x,
        yRevenue,
        yBatches,
      };
    });
  }, [activeDataset, maxRevenue, maxBatches, chartWidth, chartHeight, padding.left, padding.top]);

  // Construct SVG Path Strings
  // 1. Orange Line Path for Revenue (Image 1)
  const revenueLinePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((path, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.yRevenue}` : `${path} L ${pt.x} ${pt.yRevenue}`;
    }, '');
  }, [points]);

  // 2. Purple Area Path for Batches (Image 2)
  const batchAreaPath = useMemo(() => {
    if (points.length === 0) return '';
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const baseY = padding.top + chartHeight;

    const topPath = points.reduce((path, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.yBatches}` : `${path} L ${pt.x} ${pt.yBatches}`;
    }, '');

    return `${topPath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [points, padding.top, chartHeight]);

  const batchLinePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((path, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.yBatches}` : `${path} L ${pt.x} ${pt.yBatches}`;
    }, '');
  }, [points]);

  // Download CSV report
  const handleExportCSV = () => {
    const headers = ['Month,Full Month,Sales Revenue (INR),Batches Sold,Top Category\n'];
    const rows = activeDataset.map((d) => `"${d.month}","${d.monthFull}",${d.revenue},${d.batches},"${d.topCategory}"\n`);
    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GreenLoop_Donor_Sales_${timeframe}_2026.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100 space-y-6">
      
      {/* Top Header & Role Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF5ED] text-[#0B3B24] text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#3EA635]" />
            <span>Donor Monetization Analytics</span>
            <span className="text-[#3EA635]">•</span>
            <span className="font-semibold text-[11px] text-[#586A5E]">Exclusive to Donor Accounts</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A261D] tracking-tight">
            Annual Surplus Sales Performance
          </h2>
          <p className="text-xs sm:text-sm text-[#586A5E] mt-1">
            Month-wise tracking of revenue earned and industrial surplus batches monetized with local reusers.
          </p>
        </div>

        {/* Action Controls: View Mode & Timeframe Switchers */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Timeframe Pill Selector */}
          <div className="flex items-center p-1 bg-[#F5F7F5] rounded-xl border border-gray-200/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTimeframe('sixMonths')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === 'sixMonths'
                  ? 'bg-white text-[#0B3B24] shadow-sm'
                  : 'text-[#586A5E] hover:text-[#1A261D]'
              }`}
            >
              6 Months (May – Oct)
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('fullYear')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === 'fullYear'
                  ? 'bg-white text-[#0B3B24] shadow-sm'
                  : 'text-[#586A5E] hover:text-[#1A261D]'
              }`}
            >
              Full Year (Jan – Dec)
            </button>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F9FAF8] border border-gray-200/80 text-xs font-bold text-[#1A261D] transition-colors shadow-sm"
            title="Download CSV sales ledger"
          >
            <Download className="w-3.5 h-3.5 text-[#586A5E]" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Total Revenue */}
        <div className="p-4 rounded-2xl bg-[#FFF7F2] border border-[#FFE0D1] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#E65100] uppercase tracking-wider">
              {timeframe === 'sixMonths' ? '6-Mo Sales' : 'Annual Sales'}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{summary.growthPercentage}%</span>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1A261D] tracking-tight">
            ₹{Number(timeframe === 'sixMonths' ? summary.sixMonthRevenue : summary.totalAnnualRevenue).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#8C6D58]">
            Direct payout from verified makers
          </div>
        </div>

        {/* KPI 2: Average Monthly Revenue */}
        <div className="p-4 rounded-2xl bg-[#F9FAF8] border border-gray-200/80 space-y-1">
          <span className="text-[11px] font-bold text-[#586A5E] uppercase tracking-wider">
            Monthly Average
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1A261D] tracking-tight">
            ₹{Number(summary.avgMonthlyRevenue).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#586A5E]">
            Consistent surplus monetization
          </div>
        </div>

        {/* KPI 3: Total Batches Reclaimed */}
        <div className="p-4 rounded-2xl bg-[#F6F4FF] border border-[#E9E4FF] space-y-1">
          <span className="text-[11px] font-bold text-[#6D28D9] uppercase tracking-wider">
            Batches Monetized
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1A261D] tracking-tight flex items-baseline gap-1">
            <span>{summary.totalBatchesSold}</span>
            <span className="text-xs font-semibold text-[#6D28D9]">Batches</span>
          </div>
          <div className="text-[11px] text-[#7C6FA0]">
            Diverted from industrial disposal
          </div>
        </div>

        {/* KPI 4: Peak Revenue Month */}
        <div className="p-4 rounded-2xl bg-[#EAF5ED] border border-[#CEEAD8] space-y-1">
          <span className="text-[11px] font-bold text-[#0B3B24] uppercase tracking-wider">
            Highest Earning Month
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#0B3B24] tracking-tight">
            {summary.peakMonth}
          </div>
          <div className="text-[11px] text-[#2C6E49] font-medium">
            ₹{Number(summary.peakRevenue).toLocaleString('en-IN')} earned
          </div>
        </div>

      </div>

      {/* Chart View Toggle Tabs (Matches User Images) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          
          {/* Option 1: Sales Revenue Line Chart (Image 1 Inspiration) */}
          <button
            type="button"
            onClick={() => setViewMode('revenue')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'revenue'
                ? 'bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/25 ring-2 ring-[#EA580C]/30'
                : 'bg-white hover:bg-gray-50 text-[#586A5E] border border-gray-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#EA580C]"></span>
            <span>Total Sales (₹ Rupee Line)</span>
          </button>

          {/* Option 2: Units Sold Area Chart (Image 2 Inspiration) */}
          <button
            type="button"
            onClick={() => setViewMode('batches')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'batches'
                ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/25 ring-2 ring-[#8B5CF6]/30'
                : 'bg-white hover:bg-gray-50 text-[#586A5E] border border-gray-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#8B5CF6]"></span>
            <span>Batches Sold (Purple Area)</span>
          </button>

          {/* Option 3: Combined View */}
          <button
            type="button"
            onClick={() => setViewMode('combined')}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'combined'
                ? 'bg-[#0B3B24] text-white shadow-md shadow-[#0B3B24]/25'
                : 'bg-white hover:bg-gray-50 text-[#586A5E] border border-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dual View</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-[#586A5E]">
          {(viewMode === 'revenue' || viewMode === 'combined') && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#EA580C] rounded-full"></span>
              <span className="w-2 h-2 rounded-full bg-[#EA580C]"></span>
              <span>Sales Revenue (₹)</span>
            </div>
          )}
          {(viewMode === 'batches' || viewMode === 'combined') && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm bg-[#A855F7]/40 border border-[#8B5CF6]"></span>
              <span>Batches / Volume</span>
            </div>
          )}
        </div>
      </div>

      {/* Actual Graph Canvas (Custom High-DPI Vector SVG) */}
      <div className="relative w-full bg-white rounded-2xl border border-gray-100 p-2 sm:p-4 overflow-x-auto">
        <div className="min-w-[640px]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none overflow-visible"
            style={{ minHeight: '300px' }}
          >
            <defs>
              {/* Purple Area Gradient matching Image 2 */}
              <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C084FC" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#DDD6FE" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#F5F3FF" stopOpacity="0.0" />
              </linearGradient>

              {/* Orange Area Gradient for subtle backdrop */}
              <linearGradient id="orangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FB923C" stopOpacity="0.20" />
                <stop offset="100%" stopColor="#FFF7ED" stopOpacity="0.0" />
              </linearGradient>

              {/* Marker Drop Shadow */}
              <filter id="markerShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Background Grid Lines (Horizontal) */}
            {(viewMode === 'revenue' || viewMode === 'combined' ? revenueTicks : batchTicks).map((val, idx) => {
              const y =
                viewMode === 'revenue' || viewMode === 'combined'
                  ? padding.top + chartHeight - (val / maxRevenue) * chartHeight
                  : padding.top + chartHeight - (val / maxBatches) * chartHeight;

              return (
                <g key={`grid-${idx}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                </g>
              );
            })}

            {/* Left Y-Axis Vertical Line (matching user images) */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + chartHeight}
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />

            {/* Bottom X-Axis Horizontal Line (matching user images) */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight}
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />

            {/* Left Y-Axis Labels & Tick Marks (Image 1: ₹0, ₹4000, ₹8000, ₹12000, ₹16000) */}
            {(viewMode === 'revenue' || viewMode === 'combined') &&
              revenueTicks.map((val) => {
                const y = padding.top + chartHeight - (val / maxRevenue) * chartHeight;
                return (
                  <g key={`y-rev-${val}`}>
                    {/* Tick Mark on Axis */}
                    <line
                      x1={padding.left - 4}
                      y1={y}
                      x2={padding.left}
                      y2={y}
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />
                    {/* Label */}
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="#64748B"
                      fontSize="12"
                      fontWeight="500"
                      fontFamily="inherit"
                    >
                      ₹{val}
                    </text>
                  </g>
                );
              })}

            {/* Left Y-Axis Labels for Batches Mode (Image 2: 0, 2, 4, 6, 8) */}
            {viewMode === 'batches' &&
              batchTicks.map((val) => {
                const y = padding.top + chartHeight - (val / maxBatches) * chartHeight;
                return (
                  <g key={`y-batch-${val}`}>
                    <line
                      x1={padding.left - 4}
                      y1={y}
                      x2={padding.left}
                      y2={y}
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="#64748B"
                      fontSize="12"
                      fontWeight="500"
                      fontFamily="inherit"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

            {/* Right Y-Axis for Combined Dual View */}
            {viewMode === 'combined' &&
              batchTicks.map((val) => {
                const y = padding.top + chartHeight - (val / maxBatches) * chartHeight;
                return (
                  <g key={`y-batch-right-${val}`}>
                    <line
                      x1={padding.left + chartWidth}
                      y1={y}
                      x2={padding.left + chartWidth + 4}
                      y2={y}
                      stroke="#A855F7"
                      strokeWidth="1.5"
                    />
                    <text
                      x={padding.left + chartWidth + 8}
                      y={y + 4}
                      textAnchor="start"
                      fill="#7C3AED"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="inherit"
                    >
                      {val} b.
                    </text>
                  </g>
                );
              })}

            {/* X-Axis Month Labels & Tick Marks (May, Jun, Jul, Aug, Sep, Oct) */}
            {points.map((pt) => {
              const baseY = padding.top + chartHeight;
              const isHovered = hoveredPoint?.month === pt.month;

              return (
                <g key={`x-tick-${pt.month}`}>
                  {/* Tick Mark */}
                  <line
                    x1={pt.x}
                    y1={baseY}
                    x2={pt.x}
                    y2={baseY + 5}
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />
                  {/* Month Label */}
                  <text
                    x={pt.x}
                    y={baseY + 22}
                    textAnchor="middle"
                    fill={isHovered ? '#0B3B24' : '#64748B'}
                    fontSize="12"
                    fontWeight={isHovered ? '700' : '500'}
                    fontFamily="inherit"
                    className="transition-all"
                  >
                    {pt.month}
                  </text>
                </g>
              );
            })}

            {/* 1. Purple Gradient Area (Image 2 style) */}
            {(viewMode === 'batches' || viewMode === 'combined') && (
              <g>
                <path d={batchAreaPath} fill="url(#purpleAreaGrad)" />
                <path
                  d={batchLinePath}
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth={viewMode === 'combined' ? '2.5' : '3'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* 2. Orange Line with Circular Data Markers (Image 1 style) */}
            {(viewMode === 'revenue' || viewMode === 'combined') && (
              <g>
                {/* Connecting Line */}
                <path
                  d={revenueLinePath}
                  fill="none"
                  stroke="#EA580C"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />

                {/* Circular Node Dots (Exact matching Image 1) */}
                {points.map((pt) => {
                  const isHovered = hoveredPoint?.month === pt.month;
                  return (
                    <g
                      key={`dot-${pt.month}`}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer"
                    >
                      {/* Pulse Ring when Hovered */}
                      {isHovered && (
                        <circle
                          cx={pt.x}
                          cy={pt.yRevenue}
                          r="14"
                          fill="#EA580C"
                          opacity="0.25"
                          className="animate-ping"
                        />
                      )}

                      {/* Main Solid Dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.yRevenue}
                        r={isHovered ? '7' : '5.5'}
                        fill="#EA580C"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        filter="url(#markerShadow)"
                        className="transition-transform duration-200"
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* Purple Dots for Batches Mode */}
            {viewMode === 'batches' &&
              points.map((pt) => {
                const isHovered = hoveredPoint?.month === pt.month;
                return (
                  <g
                    key={`batch-dot-${pt.month}`}
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.yBatches}
                        r="14"
                        fill="#8B5CF6"
                        opacity="0.25"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.yBatches}
                      r={isHovered ? '6.5' : '4.5'}
                      fill="#8B5CF6"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      className="transition-transform duration-200"
                    />
                  </g>
                );
              })}

            {/* Interactive Vertical Guide Line & Hover Crosshair */}
            {hoveredPoint && (
              <g pointerEvents="none">
                <line
                  x1={hoveredPoint.x}
                  y1={padding.top}
                  x2={hoveredPoint.x}
                  y2={padding.top + chartHeight}
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Floating Tooltip Card */}
        {hoveredPoint && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${Math.min(hoveredPoint.yRevenue, hoveredPoint.yBatches) - 14}px`,
            }}
          >
            <div className="bg-[#1A261D] text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs w-48 space-y-1.5 backdrop-blur-md">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <span className="font-bold text-[#A3E5B9] text-[11px] uppercase tracking-wider">
                  {hoveredPoint.monthFull || hoveredPoint.month} 2026
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">
                  {hoveredPoint.growth}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Total Sales:</span>
                <strong className="text-[#FF8A48] font-bold text-sm">
                  ₹{Number(hoveredPoint.revenue).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Batches Sold:</span>
                <span className="text-purple-300 font-semibold">{hoveredPoint.batches} batches</span>
              </div>
              <div className="text-[10px] text-gray-400 pt-1 border-t border-white/10">
                Top Stream: <span className="text-white font-medium">{hoveredPoint.topCategory}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Accordion: Detailed Month-by-Month Sales Ledger */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowLedger(!showLedger)}
          className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-[#F9FAF8] hover:bg-[#F2F5F0] border border-gray-200/80 text-xs font-bold text-[#1A261D] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0B3B24]" />
            <span>View Month-by-Month Financial Ledger</span>
          </div>
          <div className="flex items-center gap-1 text-[#586A5E]">
            <span>{showLedger ? 'Collapse' : 'Expand'}</span>
            {showLedger ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showLedger && (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-100 shadow-sm animate-in fade-in">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F5] text-[#586A5E] font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Sales Revenue (INR)</th>
                  <th className="py-3 px-4">Batches Monetized</th>
                  <th className="py-3 px-4">Primary Category</th>
                  <th className="py-3 px-4">MoM Growth</th>
                  <th className="py-3 px-4">Disbursement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {activeDataset.map((row) => (
                  <tr key={row.month} className="hover:bg-[#F9FAF8] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1A261D]">
                      {row.monthFull || row.month} 2026
                    </td>
                    <td className="py-3 px-4 font-bold text-[#EA580C]">
                      ₹{Number(row.revenue).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#8B5CF6]">
                      {row.batches} Units
                    </td>
                    <td className="py-3 px-4 text-[#586A5E]">
                      {row.topCategory}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">
                      {row.growth || '+18.5%'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Settled</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
