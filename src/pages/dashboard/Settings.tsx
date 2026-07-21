import React from 'react';
import { CreditCard, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export const Settings: React.FC = () => {
  const { subscriptionTier } = useAppContext();
  const { addToast } = useToast();
  
  const handleManageSubscription = async () => {
    // For Razorpay, we can just show a message or redirect them to support
    addToast('To manage your Razorpay subscription, please contact support or use the billing portal link sent to your email.');
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your workspace preferences and billing.</p>
      </div>
      
      {/* Billing Section */}
      <div className="p-8 space-y-6 border shadow-2xl bg-slate-900/50 border-white/10 rounded-3xl backdrop-blur-md">
        <div className="flex items-center mb-6 space-x-3 text-white">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold">Billing & Subscription</h2>
        </div>
        
        <div className="flex items-center justify-between p-4 border bg-slate-800/50 border-white/5 rounded-xl">
          <div>
            <p className="text-sm text-slate-400 mb-1">Current Plan</p>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-white capitalize">{subscriptionTier}</span>
              {subscriptionTier !== 'free' && (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              )}
            </div>
          </div>
          {subscriptionTier !== 'free' && (
            <button
              onClick={handleManageSubscription}
              className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              Manage Billing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
