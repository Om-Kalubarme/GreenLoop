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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A524C] hover:text-[#1A261D] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-[#0A5C36]" />
        Back to Dashboard
      </button>

      <div className="bg-[#FDFBF7] rounded-2xl border border-[#EAE3D2] shadow-sm p-6 sm:p-10">
        
        {/* Header */}
        <div className="pb-6 border-b border-[#EAE3D2] mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1F2E8] border border-[#CEEAD8] text-[#0A5C36] text-xs font-semibold mb-3">
            <Package className="w-3.5 h-3.5 text-[#0A5C36]" />
            <span>Donor Creation Portal</span>
            <span className="text-[#D9381E]">◇</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A261D] tracking-tight">
            Offer Reusable Surplus Material
          </h1>
          <p className="text-sm text-[#5A524C] mt-1.5">
            Provide details so nearby students, artisans, and non-profits can discover and repurpose your discarded items.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#FCEBE6] border border-[#F8D0C7] text-[#B72B15] text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#D9381E] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-1.5">
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
              className="mt-1 block w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-[#1A261D] placeholder:text-[#8C827A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] text-sm transition-all"
            />
          </div>

          {/* Category & Specific Material Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-1.5">
                Material Category *
              </label>
              <select
                id="category"
                value={formData.material_category}
                onChange={(e) => setFormData({ ...formData, material_category: e.target.value })}
                className="mt-1 block w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-[#1A261D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] text-sm transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="mtype" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-1.5">
                Specific Material Type *
              </label>
              <input
                id="mtype"
                type="text"
                required
                value={formData.material_type}
                onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                placeholder="e.g. Corrugated Cardboard, Pine Pallets"
                className="mt-1 block w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-[#1A261D] placeholder:text-[#8C827A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] text-sm transition-all"
              />
            </div>
          </div>

          {/* Condition, Quantity & City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label htmlFor="condition" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-1.5">
                Condition Grade *
              </label>
              <select
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="mt-1 block w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-[#1A261D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] text-sm transition-all"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="qty" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-1.5">
                Quantity / Volume *
              </label>
              <input
                id="qty"
                type="text"
                required
                value={formData.quantity_description}
                onChange={(e) => setFormData({ ...formData, quantity_description: e.target.value })}
                placeholder="e.g. 25 boxes, 15 kg"
                className="mt-1 block w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-[#1A261D] placeholder:text-[#8C827A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] text-sm transition-all"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-1.5">
                Pickup City *
              </label>
              <input
                id="city"
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Bengaluru, Mumbai"
                className="mt-1 block w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-[#1A261D] placeholder:text-[#8C827A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] text-sm transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="desc" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-1.5">
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
              className="mt-1 block w-full p-4 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-[#1A261D] placeholder:text-[#8C827A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] text-sm transition-all"
            />
          </div>

          {/* Image Upload Component */}
          <div>
            <label className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-2">
              Listing Image (Upload Photo or Provide Image URL)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-dashed border-[#D5CBBA] bg-[#FAF6EE]">
              {/* Preview Thumbnail */}
              <div className="w-28 h-28 rounded-xl bg-[#F3ECE0] overflow-hidden shrink-0 flex items-center justify-center border border-[#EAE3D2]">
                {imagePreview || formData.image_url ? (
                  <img
                    src={imagePreview || formData.image_url}
                    alt="Listing Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#8C827A]" />
                )}
              </div>

              {/* Upload controls */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FDFBF7] border border-[#EAE3D2] text-xs font-semibold text-[#1A261D] hover:bg-[#F3ECE0] cursor-pointer shadow-sm transition-all">
                    <Upload className="w-4 h-4 text-[#0A5C36]" />
                    <span>{uploadingImage ? 'Uploading Image...' : 'Choose Local Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  {uploadingImage && <RefreshCw className="w-4 h-4 animate-spin text-[#0A5C36]" />}
                  {formData.image_url && !uploadingImage && (
                    <span className="text-xs text-[#0A5C36] font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Uploaded to Media Store
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-[#8C827A] block mb-1">Or paste a direct web image URL:</span>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => {
                      setFormData({ ...formData, image_url: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="block w-full px-3 py-1.5 bg-white border border-[#EAE3D2] rounded-lg text-xs text-[#1A261D] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[#EAE3D2] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-[#EAE3D2] text-[#5A524C] text-sm font-semibold hover:bg-[#F3ECE0] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#0A5C36] hover:bg-[#0D7A47] shadow-sm shadow-[#0A5C36]/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
