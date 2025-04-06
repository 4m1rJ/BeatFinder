import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface MonetizationContextType {
  isPremium: boolean;
  showAds: boolean;
  togglePremium: () => void;
}

const MonetizationContext = createContext<MonetizationContextType | undefined>(undefined);

export const MonetizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has premium status saved
    const premiumStatus = localStorage.getItem('premium') === 'true';
    setIsPremium(premiumStatus);
  }, []);

  // Show ads if not premium
  const showAds = !isPremium;

  const togglePremium = () => {
    setIsPremium(prev => {
      const newStatus = !prev;
      localStorage.setItem('premium', newStatus.toString());
      return newStatus;
    });
  };

  return (
    <MonetizationContext.Provider value={{ isPremium, showAds, togglePremium }}>
      {children}
    </MonetizationContext.Provider>
  );
};

export const useMonetization = (): MonetizationContextType => {
  const context = useContext(MonetizationContext);
  if (context === undefined) {
    throw new Error('useMonetization must be used within a MonetizationProvider');
  }
  return context;
};
