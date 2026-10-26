import React, { useState } from 'react';
import { submitInterest } from '../api/interests.api';
import { X, Heart, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function InterestModal({ listing, isOpen, onClose, onSuccess }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await submitInterest(listing.id, message);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setMessage('');
          onSuccess && onSuccess(res.interest);
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit interest request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Interest Request Sent!</h3>
            <p className="text-sm text-slate-600 max-w-xs mx-auto">
              The donor has received your proposal and collection timeline.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              Express Interest in Material
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
              {listing.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Quantity available: <strong>{listing.quantity_description}</strong> &bull; Location: {listing.city}
            </p>

            {error && (
              <div className="my-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="interest-msg" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Intended Reuse &amp; Pickup Proposal *
                </label>
                <textarea
                  id="interest-msg"
                  rows={4}
                  required
                  minLength={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hello! I am an architecture student building a model, and would love to collect these boxes this Saturday morning..."
                  className="block w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Describe why you need the materials and when you can arrange pickup (min. 10 characters).
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || message.trim().length < 10}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Interest Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
