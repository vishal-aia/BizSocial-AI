import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Copy, Star, MessageCircle, RefreshCw } from 'lucide-react';
import { generateReviewResponses } from '../../lib/api';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

interface Replies {
  optionA: string;
  optionB: string;
  optionC: string;
}

export const ReviewResponder: React.FC = () => {
  const { deductCredit } = useAppContext();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState<Replies | null>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    vibe: 'Polite & Professional',
    reviewText: '',
    starRating: 5
  });

  const vibes = ['Polite & Professional', 'Empathetic & Apologetic', 'Enthusiastic & Warm', 'Casual & Friendly'];

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.reviewText) {
      addToast('Please provide business name and review text.', 'error');
      return;
    }

    if (!deductCredit()) return;

    setLoading(true);
    try {
      const response = await generateReviewResponses(formData);
      setReplies(response);
      addToast('Responses generated successfully!');
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Response copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Review Auto-Responder</h1>
        <p className="text-slate-400">Generate professional, tailored responses to customer reviews instantly.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Form */}
        <div className="flex flex-col space-y-6 lg:col-span-5">
          <div className="flex-1 p-6 space-y-5 border shadow-2xl bg-slate-900/50 border-white/10 rounded-3xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Auto-Responder</h2>
            </div>
            
            <div>
              <label className="block mb-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500">Business Name *</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                className="w-full px-4 py-2.5 text-sm transition-colors border outline-none bg-slate-800/50 border-white/10 rounded-xl focus:border-indigo-500/50 text-white"
                placeholder="e.g. The Daily Grind Cafe"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500">Customer Rating</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFormData({...formData, starRating: star})}
                    className="transition-transform focus:outline-none hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= formData.starRating 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'fill-slate-800 text-slate-700'
                      }`} 
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-slate-400">
                  {formData.starRating} / 5
                </span>
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500">Desired Vibe</label>
              <select
                value={formData.vibe}
                onChange={(e) => setFormData({...formData, vibe: e.target.value})}
                className="w-full px-4 py-2.5 text-sm transition-colors border outline-none appearance-none bg-slate-800/50 border-white/10 rounded-xl focus:border-indigo-500/50 text-white"
              >
                {vibes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500">Customer Review Text *</label>
              <textarea
                value={formData.reviewText}
                onChange={(e) => setFormData({...formData, reviewText: e.target.value})}
                className="w-full px-4 py-3 text-sm leading-relaxed transition-colors border outline-none resize-none bg-slate-800/50 border-white/10 rounded-xl focus:border-indigo-500/50 h-32 text-white"
                placeholder="Paste the customer's review here..."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 py-4 mt-4 text-sm font-bold text-white transition-all transform shadow-xl bg-indigo-500 hover:bg-indigo-600 rounded-2xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Drafting Replies...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Generate Replies
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Display */}
        <div className="flex flex-col space-y-6 lg:col-span-7">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 border border-dashed border-white/10 rounded-3xl bg-slate-900/30 backdrop-blur-xl">
              <Loader2 className="w-10 h-10 mb-4 animate-spin text-indigo-500" />
              <p className="font-medium text-slate-400">Analyzing review sentiment...</p>
            </div>
          ) : replies ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">Generated Options</h3>
                <button 
                  onClick={handleGenerate}
                  className="flex items-center text-sm font-medium transition-colors text-slate-400 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                </button>
              </div>

              <AnimatePresence>
                {[
                  { id: 'optionA', label: 'Option A (Professional)', text: replies.optionA, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                  { id: 'optionB', label: 'Option B (Friendly)', text: replies.optionB, color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10' },
                  { id: 'optionC', label: 'Option C (Action-Oriented)', text: replies.optionC, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
                ].map((opt, i) => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex-1 p-6 border shadow-2xl bg-slate-900/50 border-white/10 rounded-3xl backdrop-blur-md group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md border border-white/5 ${opt.bg} ${opt.color}`}>
                        {opt.label}
                      </div>
                      <button
                        onClick={() => copyToClipboard(opt.text)}
                        className="flex items-center p-2 text-xs font-bold transition-colors border rounded-lg opacity-0 text-slate-300 bg-white/5 hover:bg-white/10 border-white/10 group-hover:opacity-100"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm italic font-medium leading-relaxed text-slate-200 whitespace-pre-wrap">
                      "{opt.text}"
                    </p>
                    
                    {/* Mobile copy button fallback */}
                    <button
                      onClick={() => copyToClipboard(opt.text)}
                      className="flex items-center justify-center w-full py-2 mt-4 text-sm font-bold transition-all border md:hidden text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl border-white/10"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy Response
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center border border-dashed border-white/10 rounded-3xl bg-slate-900/30 backdrop-blur-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-300">Ready to Respond</h3>
              <p className="max-w-sm text-slate-500">
                Paste a review and select the tone to generate multiple tailored reply options.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
