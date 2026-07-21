import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Copy, Save, RefreshCw, Wand2, Image as ImageIcon, Clock, MessageSquare } from 'lucide-react';
import { generatePosts } from '../../lib/api';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

interface PostResult {
  day: string;
  caption: string;
  hashtags: string;
  imagePrompt: string;
  bestTime: string;
}

export const SocialPostGenerator: React.FC = () => {
  const { deductCredit } = useAppContext();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PostResult[] | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState({
    businessName: '',
    industry: 'Gym & Fitness',
    platform: 'Instagram',
    tone: 'Energetic & Motivational',
    goal: ''
  });

  const industries = ['Gym & Fitness', 'Restaurant/Cafe', 'Real Estate', 'Dental Clinic', 'Salon & Spa', 'E-commerce'];
  const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter/X'];
  const tones = ['Professional', 'Casual', 'Energetic & Motivational', 'Promotional', 'Friendly & Warm'];

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.goal) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    if (!deductCredit()) return;

    setLoading(true);
    try {
      const response = await generatePosts(formData);
      setResults(response.posts);
      setActiveTab(0);
      addToast('Posts generated successfully!');
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${type} copied to clipboard!`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Social Post Generator</h1>
        <p className="text-slate-400">Generate a full week of high-converting social media content in seconds.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Form */}
        <div className="flex flex-col space-y-6 lg:col-span-5">
          <div className="flex-1 p-6 border shadow-2xl bg-slate-900/50 border-white/10 rounded-3xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Wand2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Post Generator</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500">Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm transition-colors border outline-none bg-slate-800/50 border-white/10 rounded-xl focus:border-indigo-500/50 text-white"
                  placeholder="e.g. Iron Gym"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm transition-colors border outline-none appearance-none bg-slate-800/50 border-white/10 rounded-xl focus:border-indigo-500/50 text-white"
                  >
                    {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm transition-colors border outline-none appearance-none bg-slate-800/50 border-white/10 rounded-xl focus:border-indigo-500/50 text-white"
                  >
                    {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500">Tone of Voice</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({...formData, tone: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm transition-colors border outline-none appearance-none bg-slate-800/50 border-white/10 rounded-xl focus:border-indigo-500/50 text-white"
                >
                  {tones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500">Goal / Topic *</label>
                <textarea
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm transition-colors border outline-none resize-none bg-slate-800/50 border-white/10 rounded-xl focus:border-indigo-500/50 h-24 text-white"
                  placeholder="e.g. Announcing a new weekend discount offer for new members..."
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
                    Generating Batch...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Content Batch
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Display */}
        <div className="flex flex-col space-y-6 lg:col-span-7">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 border border-dashed border-white/10 rounded-3xl bg-slate-900/30 backdrop-blur-xl">
              <Loader2 className="w-10 h-10 mb-4 animate-spin text-indigo-500" />
              <p className="font-medium text-slate-400">Brewing your social content...</p>
              <p className="mt-2 text-sm text-slate-500">Connecting to Gemini AI</p>
            </div>
          ) : results ? (
            <div className="flex flex-col flex-1 overflow-hidden border bg-slate-900/30 border-white/10 rounded-3xl backdrop-blur-xl">
              <div className="flex overflow-x-auto border-b border-white/10 no-scrollbar">
                {results.map((post, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`px-6 py-3 text-[10px] font-bold whitespace-nowrap transition-colors ${
                      activeTab === idx 
                        ? 'text-indigo-400 bg-white/5' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {(post.day || `Day ${idx + 1}`).toUpperCase()}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-col flex-1 p-8 space-y-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 space-y-6"
                  >
                    <div className="p-6 border shadow-inner bg-slate-800/40 rounded-2xl border-white/5">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">{formData.platform} Content</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => copyToClipboard(results[activeTab].caption, 'Caption')}
                            className="p-2 transition-colors rounded-lg hover:bg-white/10 text-slate-400"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mb-4 text-lg font-medium leading-relaxed italic text-slate-200 whitespace-pre-wrap">
                        "{results[activeTab].caption}"
                      </p>
                      
                      <div className="flex flex-wrap gap-2 text-sm font-mono text-indigo-400">
                        {results[activeTab].hashtags.split(' ').map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10">{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="p-4 border border-white/5 bg-slate-800/20 rounded-xl">
                        <span className="block mb-2 text-[10px] font-bold tracking-tighter text-slate-500">VISUAL PROMPT</span>
                        <p className="text-xs italic leading-relaxed text-slate-400">{results[activeTab].imagePrompt}</p>
                      </div>
                      <div className="p-4 border border-white/5 bg-slate-800/20 rounded-xl">
                        <span className="block mb-2 text-[10px] font-bold tracking-tighter text-slate-500">OPTIMAL POSTING TIME</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-bold text-slate-200">{results[activeTab].bestTime}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex justify-between gap-4 p-6 mt-auto border-t border-white/10 bg-slate-900/60">
                <button 
                  onClick={() => handleGenerate()}
                  className="flex-1 py-3 text-sm font-bold transition-all border text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl border-white/10"
                >
                  Regenerate Draft
                </button>
                <button 
                  onClick={() => addToast('Post saved to library!', 'success')}
                  className="flex-1 py-3 text-sm font-bold text-white transition-all shadow-lg bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-indigo-500/30"
                >
                  Save to Library
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 border border-dashed border-white/10 rounded-3xl bg-slate-900/30 backdrop-blur-xl text-center">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-300">No Posts Generated Yet</h3>
              <p className="max-w-sm text-slate-500">
                Fill in the details on the left and hit generate to create a full week of social media content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
