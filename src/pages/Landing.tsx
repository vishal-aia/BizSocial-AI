import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, MessageSquare, Star, CheckCircle, Loader2 } from 'lucide-react';
import { createRazorpayOrder, verifyRazorpayPayment } from '../lib/api';
import { loadRazorpay } from '../lib/razorpay';
import { useAppContext } from '../context/AppContext';

export const Landing: React.FC = () => {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { setSubscriptionTier } = useAppContext();
  const navigate = useNavigate();

  const handleCheckout = async (tier: 'pro' | 'agency') => {
    try {
      setLoadingTier(tier);
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const { order } = await createRazorpayOrder(tier);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TG5ObFivD35Trb',
        amount: order.amount,
        currency: order.currency,
        name: 'BizSocial',
        description: `Upgrade to ${tier === 'pro' ? 'Pro' : 'Agency'} Plan`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verification = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier
            });
            if (verification.success) {
              setSubscriptionTier(tier);
              alert(`Payment successful! You are now a ${tier === 'pro' ? 'Pro' : 'Agency'} user.`);
              navigate('/dashboard/settings');
            }
          } catch (error) {
            console.error(error);
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: 'Demo User',
          email: 'demo@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#8b5cf6'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error(response.error);
        alert('Payment failed.');
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert('Failed to initiate payment.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 bg-slate-950 font-sans selection:bg-violet-500/30 selection:text-violet-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b bg-slate-950/80 backdrop-blur-md border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">BizSocial AI</span>
          </div>
          <div className="hidden space-x-8 md:flex text-slate-300">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
          </div>
          <div>
            <Link 
              to="/dashboard"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white transition-all rounded-full bg-slate-800 hover:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden lg:pt-48 lg:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 rounded-full blur-3xl bg-gradient-to-b from-violet-500 to-transparent" />
        </div>
        
        <div className="relative px-6 mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 mb-8 border rounded-full bg-slate-900/50 border-violet-500/30 text-violet-300"
            >
              <Zap className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Powered by Google Gemini 2.5</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-5xl font-extrabold tracking-tight text-transparent lg:text-7xl bg-clip-text bg-gradient-to-r from-white to-slate-400"
            >
              Automate Your Agency's <br className="hidden md:block" />
              Social Media & Reviews
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto mb-10 text-lg text-slate-400 lg:text-xl"
            >
              Generate weeks of high-converting social content and professional review responses in seconds. Built for speed, designed for scale.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
            >
              <Link 
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 text-base font-semibold text-white transition-all shadow-xl rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-violet-500/25"
              >
                Try Demo Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div id="features" className="py-20 bg-slate-900/50">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 border bg-slate-950 rounded-3xl border-slate-800"
            >
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-violet-500/10 text-violet-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">Social Post Generator</h3>
              <p className="mb-6 text-slate-400">
                Create a full week of tailored social media posts for any platform. Includes captions, targeted hashtags, and AI image generation prompts.
              </p>
              <div className="p-4 border rounded-xl bg-slate-900 border-slate-800">
                <div className="flex items-center mb-3 space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-400">Live Output Example</span>
                </div>
                <p className="text-sm italic text-slate-300">"🚀 Level up your fitness journey this weekend! Get 20% off all personal training sessions when you book today... #FitnessGoals #WeekendVibes"</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 border bg-slate-950 rounded-3xl border-slate-800"
            >
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-fuchsia-500/10 text-fuchsia-400">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">Review Auto-Responder</h3>
              <p className="mb-6 text-slate-400">
                Turn angry 1-star reviews into win-backs, and 5-star reviews into loyal advocates. Get 3 distinct reply options instantly.
              </p>
              <div className="p-4 border rounded-xl bg-slate-900 border-slate-800">
                <div className="flex items-center mb-3 space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-400">Live Output Example</span>
                </div>
                <p className="text-sm italic text-slate-300">"Hi Sarah, thank you so much for the 5-star review! We're thrilled you loved the new espresso blend. Can't wait to welcome you back! ☕️"</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-24">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Simple, transparent pricing</h2>
            <p className="text-slate-400">Start for free, upgrade when you need more power.</p>
          </div>
          
          <div className="grid max-w-5xl gap-8 mx-auto lg:grid-cols-3">
            {/* Free */}
            <div className="p-8 border bg-slate-900 rounded-3xl border-slate-800">
              <h3 className="mb-2 text-xl font-semibold text-white">Free Trial</h3>
              <div className="flex items-end mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="mb-1 ml-1 text-slate-400">/mo</span>
              </div>
              <ul className="mb-8 space-y-4">
                <li className="flex items-center text-sm text-slate-300"><CheckCircle className="w-4 h-4 mr-3 text-emerald-400" /> 5 AI Generations / Day</li>
                <li className="flex items-center text-sm text-slate-300"><CheckCircle className="w-4 h-4 mr-3 text-emerald-400" /> Standard Support</li>
              </ul>
              <Link to="/dashboard" className="block w-full py-3 text-center transition-colors border rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                Get Started
              </Link>
            </div>
            
            {/* Pro */}
            <div className="relative p-8 border bg-slate-900 rounded-3xl border-violet-500 shadow-2xl shadow-violet-500/10">
              <div className="absolute top-0 px-3 py-1 text-xs font-semibold tracking-wider text-white uppercase -translate-y-1/2 rounded-full left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600">
                Most Popular
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">Pro</h3>
              <div className="flex items-end mb-6">
                <span className="text-4xl font-bold text-white">₹499</span>
                <span className="mb-1 ml-1 text-slate-400">/mo</span>
              </div>
              <ul className="mb-8 space-y-4">
                <li className="flex items-center text-sm text-slate-300"><CheckCircle className="w-4 h-4 mr-3 text-emerald-400" /> Unlimited AI Generations</li>
                <li className="flex items-center text-sm text-slate-300"><CheckCircle className="w-4 h-4 mr-3 text-emerald-400" /> Priority Support</li>
                <li className="flex items-center text-sm text-slate-300"><CheckCircle className="w-4 h-4 mr-3 text-emerald-400" /> Custom Tone Settings</li>
              </ul>
              <button 
                onClick={() => handleCheckout('pro')}
                disabled={loadingTier !== null}
                className="flex items-center justify-center w-full py-3 font-medium text-center text-white transition-colors rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50"
              >
                {loadingTier === 'pro' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upgrade to Pro'}
              </button>
            </div>
            
            {/* Agency */}
            <div className="p-8 border bg-slate-900 rounded-3xl border-slate-800">
              <h3 className="mb-2 text-xl font-semibold text-white">Agency</h3>
              <div className="flex items-end mb-6">
                <span className="text-4xl font-bold text-white">₹1499</span>
                <span className="mb-1 ml-1 text-slate-400">/mo</span>
              </div>
              <ul className="mb-8 space-y-4">
                <li className="flex items-center text-sm text-slate-300"><CheckCircle className="w-4 h-4 mr-3 text-emerald-400" /> Unlimited AI Generations</li>
                <li className="flex items-center text-sm text-slate-300"><CheckCircle className="w-4 h-4 mr-3 text-emerald-400" /> White-label Reports</li>
                <li className="flex items-center text-sm text-slate-300"><CheckCircle className="w-4 h-4 mr-3 text-emerald-400" /> Multi-account Management</li>
              </ul>
              <button 
                onClick={() => handleCheckout('agency')}
                disabled={loadingTier !== null}
                className="flex items-center justify-center w-full py-3 text-center transition-colors border rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                {loadingTier === 'agency' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upgrade to Agency'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
