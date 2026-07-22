import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUser } from '../lib/api';

export type SubscriptionTier = 'free' | 'pro' | 'agency';

interface User {
  id: number;
  email: string;
  tier: SubscriptionTier;
  credits: number;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  credits: number;
  setCredits: (credits: number) => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(5);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('bizsocial_theme') as 'light' | 'dark') || 'dark';
  });

  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('bizsocial_token');
    if (token) {
      fetchUser().then(data => {
        setUser(data.user);
        setCredits(data.user.credits);
        setSubscriptionTier(data.user.tier);
      }).catch(err => {
        console.error("Auth failed:", err);
        localStorage.removeItem('bizsocial_token');
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bizsocial_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
        user,
        setUser,
        credits,
        setCredits,
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
