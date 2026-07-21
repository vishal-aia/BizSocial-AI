import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSubscriptionStatus } from '../lib/api';

export type SubscriptionTier = 'free' | 'pro' | 'agency';

interface AppContextType {
  credits: number;
  deductCredit: () => boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  subscriptionTier: SubscriptionTier;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem('bizsocial_credits');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('bizsocial_theme') as 'light' | 'dark') || 'dark';
  });
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(() => {
    return (localStorage.getItem('bizsocial_tier') as SubscriptionTier) || 'free';
  });

  useEffect(() => {
    localStorage.setItem('bizsocial_credits', credits.toString());
  }, [credits]);

  useEffect(() => {
    localStorage.setItem('bizsocial_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('bizsocial_tier', subscriptionTier);
  }, [subscriptionTier]);

  const deductCredit = () => {
    if (subscriptionTier !== 'free') {
      return true; // Unlimited credits for Pro and Agency
    }
    
    if (credits > 0) {
      setCredits(prev => prev - 1);
      return true;
    }
    setUpgradeModalOpen(true);
    return false;
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppContext.Provider
      value={{
        credits,
        deductCredit,
        theme,
        toggleTheme,
        isUpgradeModalOpen,
        setUpgradeModalOpen,
        subscriptionTier,
        setSubscriptionTier
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
