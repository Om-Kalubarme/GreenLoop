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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EAE3D2] relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-5 right-5 p-2 rounded-full text-[#586A5E] hover:text-[#1A261D] hover:bg-[#FAF6EE] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#E1F2E8] text-[#0A5C36] flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#1A261D]">Interest Request Sent!</h3>
            <p className="text-xs text-[#586A5E] max-w-xs mx-auto">
              The donor has received your reuse proposal and collection timeline.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D9381E] mb-2">
              <Heart className="w-4 h-4 text-[#D9381E] fill-[#D9381E]" />
              Express Interest in Material
            </div>

            <h3 className="text-xl font-serif font-bold text-[#1A261D] leading-snug">
              {listing.title}
            </h3>
            <p className="text-xs text-[#586A5E] mt-1">
              Quantity available: <strong className="text-[#0A5C36]">{listing.quantity_description}</strong> &bull; Location: {listing.city}
            </p>

            {error && (
              <div className="my-4 p-3.5 rounded-2xl bg-[#FCEBE6] border border-[#F8D0C7] text-[#D9381E] text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#D9381E] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="interest-msg" className="block text-xs font-bold text-[#1A261D] uppercase tracking-wider mb-1.5">
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
                  className="block w-full p-3.5 bg-white border border-[#EAE3D2] rounded-2xl text-[#1A261D] placeholder-[#586A5E]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36] text-xs transition-all"
                />
                <span className="text-[11px] text-[#586A5E] block mt-1">
                  Describe why you need the materials and when you can arrange pickup (min. 10 characters).
                </span>
              </div>

              <div className="pt-3 border-t border-[#EAE3D2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 rounded-full border border-[#EAE3D2] text-xs font-semibold text-[#586A5E] hover:bg-[#FAF6EE] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || message.trim().length < 10}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#D9381E] hover:bg-[#B72B15] shadow-vermillion-glow transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Reuse Proposal
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
