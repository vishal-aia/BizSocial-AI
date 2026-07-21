import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Zap, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { createRazorpayOrder, verifyRazorpayPayment } from '../lib/api';
import { loadRazorpay } from '../lib/razorpay';

export const UpgradeModal: React.FC = () => {
  const { isUpgradeModalOpen, setUpgradeModalOpen, setSubscriptionTier } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const { order, tier } = await createRazorpayOrder('pro');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TG5ObFivD35Trb',
        amount: order.amount,
        currency: order.currency,
        name: 'BizSocial',
        description: 'Upgrade to Pro Plan',
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
              setSubscriptionTier(tier as 'pro' | 'agency');
              setUpgradeModalOpen(false);
              alert('Payment successful! You are now a Pro user.');
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
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md p-6 overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          
          <button 
            onClick={() => setUpgradeModalOpen(false)}
            className="absolute p-1 transition-colors rounded-full top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/20 text-violet-400">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">Out of Credits!</h2>
            <p className="text-slate-400">
              Upgrade to Pro to get unlimited generations and unlock premium features.
            </p>
          </div>

          <div className="p-4 mb-6 border rounded-xl bg-slate-800/50 border-slate-700">
            <div className="flex items-end mb-4">
              <span className="text-3xl font-bold text-white">₹499</span>
              <span className="mb-1 ml-1 text-slate-400">/month</span>
            </div>
            <ul className="space-y-3">
              {[
                'Unlimited AI Generations',
                'Advanced Tone Controls',
                'Priority Support',
                'Save unlimited posts'
              ].map((feature, i) => (
                <li key={i} className="flex items-center text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 mr-3 text-emerald-400 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <button 
            onClick={handleUpgrade}
            disabled={isLoading}
            className="flex items-center justify-center w-full py-3 font-semibold text-white transition-all shadow-lg rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-violet-500/25 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upgrade to Pro Now'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
