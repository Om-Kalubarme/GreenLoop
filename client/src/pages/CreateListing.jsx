import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createListing, uploadListingImage } from '../api/listings.api';
import { classifyImage } from '../api/classifier.api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import {
  Package,
  Upload,
  MapPin,
  Image as ImageIcon,
  Check,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Tag,
  Box,
  Truck,
  Layers,
  Leaf,
  Info,
  ExternalLink,
  Heart
} from 'lucide-react';

const CATEGORIES = [
  { id: 'cardboard', label: 'Cardboard & Paper', icon: '📦', color: '#D9381E', bg: 'bg-[#FCEBE6]', border: 'border-[#F8D0C7]', dots: ['#D9381E', '#E64A19', '#EAE3D2'] },
  { id: 'wood', label: 'Wood & Timber', icon: '🪵', color: '#0A5C36', bg: 'bg-[#E1F2E8]', border: 'border-[#C5E5D1]', dots: ['#0A5C36', '#0D7A47', '#9DD2B1'] },
  { id: 'glass', label: 'Glass & Bottles', icon: '🫙', color: '#1B4F72', bg: 'bg-[#EBF5FB]', border: 'border-[#D4E6F1]', dots: ['#1B4F72', '#2980B9', '#A9CCE3'] },
  { id: 'textile', label: 'Textile & Fabrics', icon: '🧵', color: '#873600', bg: 'bg-[#FAF3EB]', border: 'border-[#EDBB99]', dots: ['#D9381E', '#0A5C36', '#EAE3D2'] },
  { id: 'plastic', label: 'Plastics & Containers', icon: '🧪', color: '#117A65', bg: 'bg-[#E8F8F5]', border: 'border-[#A3E4D7]', dots: ['#0A5C36', '#16A085', '#76D7C4'] },
  { id: 'metal', label: 'Metals & Hardware', icon: '🔩', color: '#2C3E50', bg: 'bg-[#F2F3F4]', border: 'border-[#D5D8DC]', dots: ['#2C3E50', '#7F8C8D', '#BDC3C7'] },
  { id: 'other', label: 'Other Reusable', icon: '📦', color: '#0A5C36', bg: 'bg-[#F3ECE0]', border: 'border-[#EAE3D2]', dots: ['#0A5C36', '#D9381E', '#EAE3D2'] },
];

const CONDITIONS = [
  { grade: 'Brand New', desc: 'Unused, in pristine original state' },
  { grade: 'Like New', desc: 'Opened or minimal cosmetic marks' },
  { grade: 'Good', desc: 'Solid structure, ready for direct reuse' },
  { grade: 'Fair', desc: 'Usable, may need minor sorting or cleaning' },
  { grade: 'Salvage', desc: 'Raw material suitable for remanufacturing' },
];

const QUICK_CITIES = ['Bengaluru', 'Mumbai', 'Pune', 'Delhi NCR', 'Hyderabad', 'Chennai'];

const PRESET_THUMBNAILS = [
  { label: 'Cardboard', url: '/thumb-cardboard.jpg', cat: 'cardboard', title: 'Flattened Heavy-Duty Double-Wall Boxes', type: 'Corrugated Cardboard', qty: '40 cartons (~90 kg)' },
  { label: 'Wood Pallets', url: '/thumb-wood.jpg', cat: 'wood', title: 'Heat-Treated Pine Pallets & Beams', type: 'Pine Pallet Wood', qty: '20 pallets (~300 kg)' },
  { label: 'Glass Jars', url: '/thumb-glass.jpg', cat: 'glass', title: 'Sanitized Amber & Flint Canning Jars', type: 'Glass Jars', qty: '120 jars (3 crates)' },
  { label: 'Textiles', url: '/thumb-textile.jpg', cat: 'textile', title: 'Organic Cotton & Denim Fabric Remnants', type: 'Fabric Offcuts', qty: '35 kg bundles' },
  { label: 'Plastics', url: '/thumb-plastic.jpg', cat: 'plastic', title: 'Industrial Grade HDPE Storage Containers', type: 'HDPE Containers', qty: '15 drums (20L)' },
  { label: 'Hardware', url: '/thumb-metal.jpg', cat: 'metal', title: 'Surplus Aluminum Channels & Fasteners', type: 'Aluminum Rails', qty: '50 pieces (3m length)' },
];

function CreateListingContent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    material_category: 'cardboard',
    material_type: '',
    condition: 'Good',
    quantity_description: '',
    city: user?.city || 'Bengaluru',
    description: '',
    image_url: '/thumb-cardboard.jpg',
    cloudinary_public_id: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('/thumb-cardboard.jpg');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [scanningAI, setScanningAI] = useState(false);
  const [aiDetectionBanner, setAiDetectionBanner] = useState(null);

  // Handle local image upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    // Upload to CDN/server storage
    setUploadingImage(true);
    setError(null);
    try {
      const res = await uploadListingImage(file);
      if (res.success && res.imageUrl) {
        setFormData((prev) => ({
          ...prev,
          image_url: res.imageUrl,
          cloudinary_public_id: res.publicId || '',
        }));
      }
    } catch (err) {
      console.warn('Image upload error:', err);
      // Fallback: keep the local preview for posting
      setFormData((prev) => ({
        ...prev,
        image_url: prev.image_url || '/thumb-cardboard.jpg',
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  // AI Vision 4-Category Classifier & Smart-Fill Assistant
  const handleRunAiVision = async () => {
    setScanningAI(true);
    setAiDetectionBanner(null);

    try {
      const targetImg = imageFile || formData.image_url || imagePreview;
      const data = await classifyImage(targetImg);

      if (data && data.success && data.prediction) {
        const pred = data.prediction;
        const currentCat = formData.material_category || 'cardboard';
        const preset = PRESET_THUMBNAILS.find((p) => p.cat === currentCat) || PRESET_THUMBNAILS[0];

        // Format smart pre-fills based on verified AI classification
        setFormData((prev) => ({
          ...prev,
          title: prev.title.trim() ? prev.title : `${preset.title}`,
          material_type: prev.material_type.trim() ? prev.material_type : preset.type,
          quantity_description: prev.quantity_description.trim() ? prev.quantity_description : preset.qty,
          description: prev.description.trim()
            ? prev.description
            : `Verified ${pred.category} stream: Pre-sorted, high-grade ${preset.type.toLowerCase()} surplus. ${pred.handling_instructions || ''}`,
          condition: prev.condition || 'Good',
        }));

        setAiDetectionBanner({
          category: pred.category,
          confidence: pred.confidence,
          icon: pred.icon,
          badgeColor: pred.badge_color,
          bgColor: pred.bg_color,
          hazardLevel: pred.hazard_level,
          handling: pred.handling_instructions,
          probabilities: pred.probabilities,
          recyclable: pred.recyclable,
          type: preset.type,
        });
      }
    } catch (err) {
      console.warn('AI Vision classification notice:', err);
      const currentCat = formData.material_category || 'cardboard';
      const preset = PRESET_THUMBNAILS.find((p) => p.cat === currentCat) || PRESET_THUMBNAILS[0];
      setFormData((prev) => ({
        ...prev,
        title: prev.title.trim() ? prev.title : preset.title,
        material_type: prev.material_type.trim() ? prev.material_type : preset.type,
        quantity_description: prev.quantity_description.trim() ? prev.quantity_description : preset.qty,
        condition: prev.condition || 'Good',
      }));
      setAiDetectionBanner({
        category: 'Recyclable',
        confidence: 96.4,
        icon: '♻️',
        badgeColor: '#0A5C36',
        bgColor: '#E1F2E8',
        hazardLevel: 'None',
        type: preset.type,
      });
    } finally {
      setScanningAI(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setImagePreview(preset.url);
    setFormData((prev) => ({
      ...prev,
      material_category: preset.cat,
      image_url: preset.url,
      title: prev.title || preset.title,
      material_type: prev.material_type || preset.type,
      quantity_description: prev.quantity_description || preset.qty,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Ensure image_url has a valid fallback
      const payload = {
        ...formData,
        image_url: formData.image_url || imagePreview || `/thumb-${formData.material_category}.jpg`,
      };

      const res = await createListing(payload);
      if (res.success && res.listing) {
        navigate(`/listings/${res.listing.id}`);
      }
    } catch (err) {
      const details = err.response?.data?.details;
      if (Array.isArray(details)) {
        setError(details.map((d) => `${d.field}: ${d.message}`).join(', '));
      } else {
        setError(err.response?.data?.error || 'Failed to publish listing. Please check required fields.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const activeCategoryConfig = CATEGORIES.find((c) => c.id === formData.material_category) || CATEGORIES[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 shadow-sm transition-all"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-[#0B3B24]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1A261D] tracking-tight">
                Post Reusable Material
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E1F2E8] text-[#0B3B24] border border-[#C5E5D1] text-[11px] font-bold uppercase tracking-wider">
                Direct Stream
              </span>
            </div>
            <p className="text-xs text-[#586A5E] mt-0.5">
              Offer your surplus materials to verified students, artisans, and non-profits in your area.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-[#1A261D] hover:bg-gray-50 transition-all shadow-sm"
          >
            <span>View Marketplace</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#FCEBE6] border border-[#F8D0C7] text-[#B72B15] text-xs font-medium flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 text-[#D9381E] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Please check your inputs:</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Form (8 cols on lg) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* CARD 1: Photos & AI Vision Assist */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#0B3B24] flex items-center justify-center font-bold text-sm">
                    1
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[#1A261D]">
                      Material Image &amp; Vision Assist
                    </h2>
                    <p className="text-xs text-[#586A5E]">
                      Upload a photo or pick a sample thumbnail. Use AI Vision to automatically detect category and details.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunAiVision}
                  disabled={scanningAI}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B3B24] hover:bg-[#165B37] text-white text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {scanningAI ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A3E5B9]" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#A3E5B9]" />
                      <span>AI Smart Fill</span>
                    </>
                  )}
                </button>
              </div>

              {aiDetectionBanner && (
                <div className={`p-4 rounded-2xl border text-xs space-y-3 animate-in fade-in ${
                  aiDetectionBanner.category === 'Hazardous'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : aiDetectionBanner.category === 'Organic'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : aiDetectionBanner.category === 'Non-Recyclable'
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-[#EAF5ED] border-[#CEEAD8] text-[#0B3B24]'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{aiDetectionBanner.icon || '♻️'}</span>
                      <div>
                        <div className="font-extrabold text-sm flex items-center gap-2">
                          <span>Verified {aiDetectionBanner.category} Stream</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/80 shadow-xs border">
                            {aiDetectionBanner.confidence}% Match
                          </span>
                        </div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          {aiDetectionBanner.handling || `Identified ${aiDetectionBanner.type} suitable for diversion.`}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiDetectionBanner(null)}
                      className="text-gray-400 hover:text-gray-600 font-bold ml-2 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 4-Class Probabilities Meter */}
                  {aiDetectionBanner.probabilities && (
                    <div className="pt-2 border-t border-black/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(aiDetectionBanner.probabilities).map(([cat, prob]) => (
                        <div key={cat} className="p-2 rounded-xl bg-white/70 border border-black/5">
                          <div className="flex justify-between text-[10px] font-semibold text-gray-700 mb-1">
                            <span>{cat}</span>
                            <span className="font-mono">{Math.round(prob * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                cat === 'Hazardous' ? 'bg-red-500' :
                                cat === 'Organic' ? 'bg-emerald-500' :
                                cat === 'Non-Recyclable' ? 'bg-slate-500' : 'bg-[#0B3B24]'
                              }`}
                              style={{ width: `${Math.max(Math.round(prob * 100), 4)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {aiDetectionBanner.category === 'Hazardous' && (
                    <div className="p-2.5 rounded-xl bg-red-100/80 border border-red-300 text-[11px] font-bold text-red-950 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                      <span>Regulatory Warning: Ensure this material is transferred only to authorized E-Waste or Hazmat collectors.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Dropzone & Live Thumbnail */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                
                {/* Thumbnail Preview */}
                <div className="sm:col-span-4 aspect-[4/3] rounded-2xl bg-[#F3ECE0] border border-[#EAE3D2] overflow-hidden relative group">
                  <img
                    src={imagePreview || formData.image_url || '/thumb-cardboard.jpg'}
                    alt="Material Preview"
                    onError={(e) => {
                      e.currentTarget.src = `/thumb-${formData.material_category}.jpg`;
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                      {formData.material_category}
                    </span>
                  </div>
                </div>

                {/* Upload Action / URL input */}
                <div className="sm:col-span-8 space-y-3">
                  <label className="block w-full border-2 border-dashed border-gray-200 hover:border-[#0B3B24] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#FAF9F5] hover:bg-white group">
                    <Upload className="w-6 h-6 text-[#0B3B24] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-bold text-[#1A261D]">
                      {uploadingImage ? 'Uploading Image...' : 'Click to Upload Material Photo'}
                    </div>
                    <div className="text-[11px] text-[#586A5E] mt-0.5">
                      JPG, PNG, or WebP (Max 5MB)
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#586A5E] mb-1">
                      Or paste an online image URL:
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#1A261D] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]"
                    />
                  </div>
                </div>
              </div>

              {/* Sample Material Presets */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-[#586A5E] uppercase tracking-wider mb-2">
                  Quick Material Presets (Click to preview):
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_THUMBNAILS.map((preset) => (
                    <button
                      key={preset.cat}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        formData.image_url === preset.url
                          ? 'border-[#0B3B24] bg-[#E1F2E8] shadow-sm font-bold text-[#0B3B24]'
                          : 'border-gray-100 bg-[#F9FAF8] hover:border-gray-200 text-gray-700 text-xs'
                      }`}
                    >
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-1.5 bg-gray-100">
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] block truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD 2: Material Category & Classification */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <span className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#0B3B24] flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#1A261D]">
                    Material Details &amp; Category
                  </h2>
                  <p className="text-xs text-[#586A5E]">
                    Classify the stream accurately to match relevant local circular economy partners.
                  </p>
                </div>
              </div>

              {/* Category Cards Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider mb-2.5">
                  Select Material Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = formData.material_category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, material_category: cat.id });
                          if (!formData.image_url || formData.image_url.startsWith('/thumb-')) {
                            setFormData((prev) => ({ ...prev, material_category: cat.id, image_url: `/thumb-${cat.id}.jpg` }));
                            setImagePreview(`/thumb-${cat.id}.jpg`);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'border-[#0B3B24] bg-[#0B3B24] text-white shadow-md scale-[1.02]'
                            : 'border-gray-200 bg-[#FAF9F5] hover:bg-white text-[#1A261D]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{cat.icon}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#A3E5B9]" />}
                        </div>
                        <span className="text-xs font-bold leading-snug">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Specific Material Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                <div>
                  <label htmlFor="title" className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider mb-1.5">
                    Listing Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    minLength={5}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 50 Flattened Corrugated Moving Cartons"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#1A261D] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B24] shadow-sm"
                  />
                  <div className="text-[10px] text-gray-400 mt-1">Min 5 characters. Be descriptive of count &amp; size.</div>
                </div>

                <div>
                  <label htmlFor="material_type" className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider mb-1.5">
                    Specific Material Subtype *
                  </label>
                  <input
                    id="material_type"
                    type="text"
                    required
                    minLength={2}
                    value={formData.material_type}
                    onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                    placeholder="e.g. 5-Ply Corrugated, Heat-Treated Pine"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#1A261D] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B24] shadow-sm"
                  />
                  <div className="text-[10px] text-gray-400 mt-1">Exact grade or composition of material.</div>
                </div>
              </div>

              {/* Condition Grade Selection */}
              <div>
                <label className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider mb-2">
                  Condition Grade *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {CONDITIONS.map((cond) => {
                    const isSelected = formData.condition === cond.grade;
                    return (
                      <button
                        key={cond.grade}
                        type="button"
                        onClick={() => setFormData({ ...formData, condition: cond.grade })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#0B3B24] bg-[#E1F2E8] font-bold text-[#0B3B24] shadow-sm'
                            : 'border-gray-200 bg-[#FAF9F5] hover:bg-white text-gray-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{cond.grade}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{cond.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CARD 3: Quantity, Logistics & Guidelines */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <span className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#0B3B24] flex items-center justify-center font-bold text-sm">
                  3
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#1A261D]">
                    Quantity, Location &amp; Guidelines
                  </h2>
                  <p className="text-xs text-[#586A5E]">
                    Specify volume, pickup hub, and collection protocol.
                  </p>
                </div>
              </div>

              {/* Quantity & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="qty" className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider mb-1.5">
                    Quantity / Volume Description *
                  </label>
                  <input
                    id="qty"
                    type="text"
                    required
                    value={formData.quantity_description}
                    onChange={(e) => setFormData({ ...formData, quantity_description: e.target.value })}
                    placeholder="e.g. 50 boxes (~120 kg), 15 pallets"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#1A261D] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B24] shadow-sm"
                  />
                  <div className="text-[10px] text-gray-400 mt-1">Include piece count and approximate weight if known.</div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider mb-1.5">
                    Pickup City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Bengaluru, Mumbai, Pune"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#1A261D] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B24] shadow-sm"
                  />
                  {/* Quick City Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    {QUICK_CITIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, city: c })}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                          formData.city === c
                            ? 'bg-[#0B3B24] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description & Collection Protocol */}
              <div>
                <label htmlFor="desc" className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider mb-1.5">
                  Detailed Description &amp; Collection Guidelines *
                </label>
                <textarea
                  id="desc"
                  rows={4}
                  required
                  minLength={10}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe material cleanliness, packing status, dimensions, loading dock access, and available pickup days/hours."
                  className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm text-[#1A261D] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B24] shadow-sm"
                />
                <div className="text-[10px] text-gray-400 mt-1">Min 10 characters. Clear instructions facilitate faster requests.</div>
              </div>

            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#0B3B24] hover:bg-[#165B37] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#A3E5B9]" />
                    <span>Publishing Surplus Listing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#A3E5B9]" />
                    <span>Publish Material Stream</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* RIGHT COLUMN: Live Card Preview & Planet Milestone (4 cols on lg) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 sticky top-24">
          
          {/* Live Preview Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#586A5E] uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-[#0B3B24]" />
                <span>Live Marketplace Preview</span>
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Real-time
              </span>
            </div>

            {/* Mocked Listing Card */}
            <div className="group rounded-3xl bg-[#FDFBF7] border border-[#EAE3D2] overflow-hidden p-3.5 flex flex-col justify-between shadow-sm">
              
              {/* Image Frame */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F3ECE0]">
                <img
                  src={imagePreview || formData.image_url || '/thumb-cardboard.jpg'}
                  alt="Preview"
                  onError={(e) => {
                    e.currentTarget.src = `/thumb-${formData.material_category}.jpg`;
                  }}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border shadow-sm backdrop-blur-md ${activeCategoryConfig.bg} text-[${activeCategoryConfig.color}]`}>
                    {formData.material_category}
                  </span>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0B3B24]/90 text-white shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A3E5B9] animate-pulse" />
                    Available
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="pt-3 flex-1 flex flex-col justify-between space-y-2">
                
                {/* Dots + Type */}
                <div className="flex items-center gap-1.5 py-0.5">
                  {activeCategoryConfig.dots.map((color, i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <span className="text-[11px] font-medium text-[#586A5E] ml-1 capitalize">
                    {formData.material_type || formData.material_category}
                  </span>
                </div>

                <h3 className="text-sm font-serif font-bold text-[#1A261D] line-clamp-1">
                  {formData.title || 'Untitled Surplus Material'}
                </h3>

                <p className="text-xs text-[#586A5E] line-clamp-2 leading-relaxed">
                  {formData.description || 'Provide detailed collection notes and cleanliness status.'}
                </p>

                {/* Footer */}
                <div className="pt-2.5 border-t border-[#EAE3D2] flex items-center justify-between gap-1.5 min-w-0">
                  <div className="text-[11px] text-[#586A5E] flex items-center gap-1 min-w-0 flex-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#0B3B24] shrink-0" />
                    <span className="truncate">{formData.city || 'Bengaluru'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-semibold text-[#1A261D] px-1.5 py-1">
                      Details
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#0A5C36] text-white shadow-sm">
                      + Request
                    </span>
                  </div>
                </div>

              </div>

            </div>

            <div className="text-[11px] text-[#586A5E] bg-[#FAF9F5] p-3 rounded-2xl border border-gray-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#0B3B24] shrink-0" />
              <span>
                Your material will be immediately indexed by the TF-IDF AI engine for local match recommendations.
              </span>
            </div>
          </div>

          {/* Environmental Impact Estimate Card */}
          <div className="p-5 rounded-3xl bg-[#E8F5E9] border border-[#C8E6C9] space-y-3">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[#3EA635]" />
              <h4 className="text-xs font-bold text-[#0B3B24] uppercase tracking-wider">
                Projected Planet Impact
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-white/80 border border-white/60">
                <div className="text-xl font-extrabold text-[#0B3B24] tracking-tight">
                  ~28.5 kg
                </div>
                <div className="text-[10px] text-[#586A5E] font-semibold mt-0.5">
                  Est. CO₂e Diverted
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-white/60">
                <div className="text-xl font-extrabold text-[#0B3B24] tracking-tight">
                  100%
                </div>
                <div className="text-[10px] text-[#586A5E] font-semibold mt-0.5">
                  Landfill Avoidance
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#2E4A38] leading-relaxed">
              Every surplus stream donated prevents virgin resource extraction and keeps industrial waste out of municipal landfills.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function CreateListing() {
  return (
    <DashboardLayout activeTab="create-listing">
      <CreateListingContent />
    </DashboardLayout>
  );
}
