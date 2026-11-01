import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Upload,
  Sparkles,
  AlertTriangle,
  Recycle,
  Trash2,
  Leaf,
  CheckCircle2,
  ArrowRight,
  Info,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  BarChart2
} from 'lucide-react';
import { classifyImage } from '../api/classifier.api';

const SAMPLES = [
  {
    id: 'hazardous',
    label: 'Hazardous Waste',
    sub: 'Lithium / E-Waste',
    url: '/samples/hazardous.jpg',
    expected: 'Hazardous',
    icon: '⚠️'
  },
  {
    id: 'recyclable',
    label: 'Recyclable Stream',
    sub: 'Clean Metal Cans',
    url: '/samples/recyclable.jpg',
    expected: 'Recyclable',
    icon: '♻️'
  },
  {
    id: 'organic',
    label: 'Organic Biomass',
    sub: 'Kitchen Scraps',
    url: '/samples/organic.jpg',
    expected: 'Organic',
    icon: '🌱'
  },
  {
    id: 'non_recyclable',
    label: 'Non-Recyclable',
    sub: 'Styrofoam Beads',
    url: '/samples/non_recyclable.jpg',
    expected: 'Non-Recyclable',
    icon: '🗑️'
  }
];

const CATEGORY_STYLES = {
  'Hazardous': {
    badgeBg: 'bg-red-100 text-red-900 border-red-300',
    barColor: 'bg-red-600',
    icon: AlertTriangle,
    accent: '#D9381E',
    tag: 'Strict Handling Required'
  },
  'Non-Recyclable': {
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    barColor: 'bg-slate-500',
    icon: Trash2,
    accent: '#64748B',
    tag: 'Landfill / Recovery'
  },
  'Organic': {
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    barColor: 'bg-emerald-600',
    icon: Leaf,
    accent: '#059669',
    tag: '100% Compostable'
  },
  'Recyclable': {
    badgeBg: 'bg-green-100 text-[#0B3B24] border-green-300',
    barColor: 'bg-[#0B3B24]',
    icon: Recycle,
    accent: '#0B3B24',
    tag: 'Marketplace Eligible'
  }
};

export default function WasteClassifierModal({ isOpen, onClose, onSelectCategory }) {
  const [selectedImage, setSelectedImage] = useState('/samples/recyclable.jpg');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleRunClassification = async (imageInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await classifyImage(imageInput || selectedImage);
      if (data.success && data.prediction) {
        setResult(data.prediction);
      } else {
        setError('Classification failed. Please try another image.');
      }
    } catch (err) {
      console.error('Classification error:', err);
      setError(err.response?.data?.detail || err.message || 'Error processing image.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setSelectedImage(base64);
      handleRunClassification(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleSelect = (sample) => {
    setSelectedImage(sample.url);
    handleRunClassification(sample.url);
  };

  const currentStyle = result ? CATEGORY_STYLES[result.category] || CATEGORY_STYLES['Recyclable'] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl bg-[#FAF6EE] rounded-[32px] shadow-2xl border border-[#EAE3D2] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-[#0B3B24] text-white border-b border-[#125838] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#A3E5B9] shadow-inner shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  AI 4-Category Waste Classifier
                </h3>
                <span className="text-[11px] bg-[#A3E5B9] text-[#0B3B24] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  MobileNetV3 Deep Vision
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/80 font-medium">
                Trained on GreenLoop dataset: Hazardous • Non-Recyclable • Organic • Recyclable
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all hover:scale-105 active:scale-95 shrink-0 ml-4 cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-7 sm:p-8 overflow-y-auto space-y-7 flex-1">
          {/* Top Sample Picker */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-[#1A261D] uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-[#0B3B24]" />
                Test With Verified Dataset Samples
              </span>
              <span className="text-[11px] text-[#586A5E]">Click any sample to classify immediately</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSampleSelect(s)}
                  className={`group relative p-2 rounded-2xl border text-left transition-all overflow-hidden ${
                    selectedImage === s.url
                      ? 'border-[#0B3B24] bg-white ring-2 ring-[#0B3B24]/20 shadow-md'
                      : 'border-[#EAE3D2] bg-white/60 hover:bg-white hover:border-[#0B3B24]/40'
                  }`}
                >
                  <div className="w-full h-20 rounded-xl overflow-hidden bg-gray-100 mb-2 relative">
                    <img
                      src={s.url}
                      alt={s.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 right-1.5 text-xs bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-md">
                      {s.icon}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[#1A261D] truncate">{s.label}</div>
                  <div className="text-[10px] text-[#586A5E] truncate">{s.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Workspace Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Upload & Image Preview */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-[#EAE3D2] p-4 shadow-sm space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center group">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Selected item"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Upload or select a waste photo</p>
                    </div>
                  )}

                  {loading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                      <RefreshCw className="w-7 h-7 animate-spin text-[#A3E5B9]" />
                      <span className="text-xs font-bold tracking-wide">Classifying Image...</span>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer py-2.5 px-3 rounded-xl bg-[#F0ECE1] hover:bg-[#EAE3D2] text-[#1A261D] text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRunClassification(selectedImage)}
                    disabled={loading || !selectedImage}
                    className="px-4 py-2.5 rounded-xl bg-[#0B3B24] hover:bg-[#125838] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#A3E5B9]" />
                    <span>Re-Analyze</span>
                  </button>
                </div>
              </div>

              {/* Supported 4 Streams Info */}
              <div className="p-3.5 rounded-2xl bg-white/70 border border-[#EAE3D2] text-[11px] text-[#586A5E] space-y-1.5">
                <div className="font-bold text-[#1A261D] flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#0B3B24]" />
                  <span>The 4 Waste Streams:</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div>⚠️ <b>Hazardous:</b> e-waste, paints, batteries</div>
                  <div>♻️ <b>Recyclable:</b> metals, glass, paper, bottles</div>
                  <div>🌱 <b>Organic:</b> food scraps, yard waste</div>
                  <div>🗑️ <b>Non-Recyclable:</b> styrofoam, ceramics</div>
                </div>
              </div>
            </div>

            {/* Right: Prediction Details & Probabilities */}
            <div className="md:col-span-7 space-y-4">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <div className="font-bold">Classification Notice</div>
                    <div>{error}</div>
                  </div>
                </div>
              )}

              {result ? (
                <div className="bg-white rounded-3xl border border-[#EAE3D2] p-5 shadow-sm space-y-5 animate-fade-in">
                  {/* Primary Prediction Banner */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="text-[11px] uppercase tracking-wider font-extrabold text-[#586A5E]">
                        Predicted Stream Classification
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{result.icon}</span>
                        <h2 className="text-xl font-black text-[#1A261D] tracking-tight">
                          {result.category}
                        </h2>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentStyle?.badgeBg}`}>
                          {currentStyle?.tag}
                        </span>
                      </div>
                      {result.detected_item && (
                        <div className="text-[11px] text-[#0B3B24] font-medium flex items-center gap-1.5 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3EA635]" />
                          <span>Identified: <b>{result.detected_item}</b></span>
                        </div>
                      )}
                    </div>

                    {/* Circular Score Badge */}
                    <div className="text-right">
                      <div className="text-2xl font-black text-[#0B3B24]">
                        {result.confidence}%
                      </div>
                      <div className="text-[10px] text-[#586A5E] font-medium">Confidence Score</div>
                    </div>
                  </div>

                  {/* 4-Class Probability Breakdown */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A261D]">
                      <span>Classification Probabilities</span>
                      <span className="text-[10px] text-[#586A5E] font-normal">Softmax distribution</span>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(result.probabilities || {}).map(([cat, prob]) => {
                        const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES['Recyclable'];
                        const pct = Math.round(prob * 100);
                        const isWinner = cat === result.category;

                        return (
                          <div key={cat} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className={`font-semibold ${isWinner ? 'text-[#1A261D] font-bold' : 'text-gray-500'}`}>
                                {cat} {isWinner && '✓'}
                              </span>
                              <span className="font-mono text-xs text-gray-700 font-bold">{pct}%</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden p-0.5">
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${style.barColor}`}
                                style={{ width: `${Math.max(pct, 3)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Handling & Disposal Guidelines */}
                  <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#EAE3D2] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A261D]">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#0B3B24]" />
                      <span>Eco-Handling &amp; Diversion Protocol:</span>
                    </div>
                    <p className="text-xs text-[#586A5E] leading-relaxed">
                      {result.handling_instructions || result.description}
                    </p>

                    {result.suggested_actions && result.suggested_actions.length > 0 && (
                      <div className="pt-1.5 flex flex-wrap gap-1.5">
                        {result.suggested_actions.map((act, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-white border border-[#EAE3D2] text-[#1A261D] px-2 py-0.5 rounded-lg"
                          >
                            • {act}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action CTA */}
                  <div className="pt-1 flex gap-2.5">
                    {result.category === 'Recyclable' ? (
                      <Link
                        to="/create-listing"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#0B3B24] hover:bg-[#125838] text-white text-xs font-bold text-center uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <span>Post As Marketplace Surplus</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <Link
                        to="/browse"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#0B3B24] hover:bg-[#125838] text-white text-xs font-bold text-center uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <span>Explore Diverted Materials</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRunClassification(selectedImage)}
                      className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-dashed border-gray-300 text-center space-y-3">
                  <Sparkles className="w-10 h-10 text-gray-300" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#1A261D]">Ready to Classify</h4>
                    <p className="text-xs text-[#586A5E] max-w-xs">
                      Choose any of the 4 sample items above or upload your own waste photo to see instant classification.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRunClassification(selectedImage)}
                    className="px-5 py-2.5 rounded-xl bg-[#0B3B24] text-white text-xs font-bold shadow-sm hover:bg-[#125838] transition-all"
                  >
                    Classify Selected Sample
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
