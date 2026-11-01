import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchListingById, updateListing, deleteListing } from '../api/listings.api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Package, 
  Trash2, 
  Save, 
  ArrowLeft, 
  AlertCircle, 
  Check, 
  RefreshCw 
} from 'lucide-react';

const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'Salvage'];
const STATUS_OPTIONS = ['available', 'reserved', 'collected', 'archived'];

function EditListingContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    material_category: '',
    material_type: '',
    condition: '',
    quantity_description: '',
    city: '',
    description: '',
    status: 'available',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadListing = async () => {
      try {
        const res = await fetchListingById(id);
        if (res.success && res.listing) {
          // Check ownership
          if (res.listing.owner_id !== user?.id && user?.role !== 'admin') {
            setError('Access Denied: You do not own this listing.');
            setLoading(false);
            return;
          }

          setFormData({
            title: res.listing.title,
            material_category: res.listing.material_category,
            material_type: res.listing.material_type,
            condition: res.listing.condition,
            quantity_description: res.listing.quantity_description,
            city: res.listing.city,
            description: res.listing.description,
            status: res.listing.status,
          });
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await updateListing(id, formData);
      if (res.success) {
        navigate(`/listings/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to archive this listing? It will no longer appear in the active marketplace.')) {
      return;
    }

    setArchiving(true);
    try {
      await deleteListing(id);
      navigate('/donor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to archive listing');
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-[#5A524C]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0A5C36] mb-3" />
        <p className="text-sm font-medium">Loading listing information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A524C] hover:text-[#1A261D] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-[#0A5C36]" />
        Back
      </button>

      <div className="bg-[#FDFBF7] rounded-2xl border border-[#EAE3D2] shadow-sm p-6 sm:p-10">
        
        <div className="pb-6 border-b border-[#EAE3D2] mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1F2E8] border border-[#CEEAD8] text-[#0A5C36] text-xs font-semibold mb-2">
              <Package className="w-3.5 h-3.5 text-[#0A5C36]" />
              <span>Listing Management</span>
              <span className="text-[#D9381E]">◇</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1A261D] tracking-tight">
              Edit Material Listing
            </h1>
            <p className="text-sm text-[#5A524C] mt-1">
              Update listing status, quantity, or collection details.
            </p>
          </div>

          <button
            type="button"
            onClick={handleArchive}
            disabled={archiving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#B72B15] bg-[#FCEBE6] border border-[#F8D0C7] hover:bg-[#F8D0C7] transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-[#D9381E]" />
            {archiving ? 'Archiving...' : 'Archive Listing'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#FCEBE6] border border-[#F8D0C7] text-[#B72B15] text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#D9381E] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="edit-title" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-1.5">
              Listing Title
            </label>
            <input
              id="edit-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-[#1A261D] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label htmlFor="edit-status" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-1.5">
                Listing Status *
              </label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-[#1A261D] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] capitalize transition-all"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit-cond" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-1.5">
                Condition
              </label>
              <select
                id="edit-cond"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="mt-1 block w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-[#1A261D] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] transition-all"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit-qty" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-1.5">
                Quantity
              </label>
              <input
                id="edit-qty"
                type="text"
                required
                value={formData.quantity_description}
                onChange={(e) => setFormData({ ...formData, quantity_description: e.target.value })}
                className="mt-1 block w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-[#1A261D] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-desc" className="block text-xs font-semibold text-[#5A524C] uppercase tracking-wider mb-1.5">
              Description &amp; Guidelines
            </label>
            <textarea
              id="edit-desc"
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full p-4 bg-[#FAF6EE] border border-[#EAE3D2] rounded-xl text-[#1A261D] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36] transition-all"
            />
          </div>

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
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#0A5C36] hover:bg-[#0D7A47] shadow-sm shadow-[#0A5C36]/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default function EditListing() {
  return (
    <DashboardLayout activeTab="create-listing">
      <EditListingContent />
    </DashboardLayout>
  );
}
