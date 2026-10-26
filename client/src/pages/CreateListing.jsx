import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing, uploadListingImage } from '../api/listings.api';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Upload, 
  MapPin, 
  Image as ImageIcon, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'cardboard', label: 'Cardboard & Paper' },
  { id: 'wood', label: 'Wood & Timber' },
  { id: 'glass', label: 'Glass Jars & Bottles' },
  { id: 'textile', label: 'Textile & Fabrics' },
  { id: 'plastic', label: 'Plastics & Containers' },
  { id: 'metal', label: 'Metals & Hardware' },
  { id: 'other', label: 'Other Reusable Items' },
];

const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'Salvage'];

export default function CreateListing() {
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
    image_url: '',
    cloudinary_public_id: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Upload immediately to get CDN URL
    setUploadingImage(true);
    setError(null);
    try {
      const res = await uploadListingImage(file);
      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          image_url: res.imageUrl,
          cloudinary_public_id: res.publicId,
        }));
      }
    } catch (err) {
      console.warn('Image upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload photo. Please check file format.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await createListing(formData);
      if (res.success && res.listing) {
        navigate(`/listings/${res.listing.id}`);
      }
    } catch (err) {
      const details = err.response?.data?.details;
      if (Array.isArray(details)) {
        setError(details.map((d) => `${d.field}: ${d.message}`).join(', '));
      } else {
        setError(err.response?.data?.error || 'Failed to publish listing. Please check inputs.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
        
        {/* Header */}
        <div className="pb-6 border-b border-slate-100 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            Donor Creation Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Offer Reusable Surplus Material
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Provide details so nearby students, artisans, and non-profits can discover and repurpose your discarded items.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Listing Title *
            </label>
            <input
              id="title"
              type="text"
              required
              minLength={5}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 40 Clean Flattened Double-Wall Moving Cartons"
              className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
            />
          </div>

          {/* Category & Specific Material Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Material Category *
              </label>
              <select
                id="category"
                value={formData.material_category}
                onChange={(e) => setFormData({ ...formData, material_category: e.target.value })}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="mtype" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Specific Material Type *
              </label>
              <input
                id="mtype"
                type="text"
                required
                value={formData.material_type}
                onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                placeholder="e.g. Corrugated Cardboard, Pine Pallets"
                className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
              />
            </div>
          </div>

          {/* Condition, Quantity & City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label htmlFor="condition" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Condition Grade *
              </label>
              <select
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="qty" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Quantity / Volume *
              </label>
              <input
                id="qty"
                type="text"
                required
                value={formData.quantity_description}
                onChange={(e) => setFormData({ ...formData, quantity_description: e.target.value })}
                placeholder="e.g. 25 boxes, 15 kg"
                className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Pickup City *
              </label>
              <input
                id="city"
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Bengaluru, Mumbai"
                className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="desc" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Detailed Description &amp; Collection Guidelines *
            </label>
            <textarea
              id="desc"
              rows={4}
              required
              minLength={10}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="State dimensions, cleanliness, packaging status, and when/where the recipient can pick up the materials."
              className="mt-1 block w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
            />
          </div>

          {/* Image Upload Component */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Listing Image (Upload Photo or Provide Image URL)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
              {/* Preview Thumbnail */}
              <div className="w-28 h-28 rounded-xl bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center border border-slate-300">
                {imagePreview || formData.image_url ? (
                  <img
                    src={imagePreview || formData.image_url}
                    alt="Listing Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>

              {/* Upload controls */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm transition-all">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>{uploadingImage ? 'Uploading Image...' : 'Choose Local Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  {uploadingImage && <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />}
                  {formData.image_url && !uploadingImage && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Uploaded to Media Store
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Or paste a direct web image URL:</span>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => {
                      setFormData({ ...formData, image_url: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="block w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
