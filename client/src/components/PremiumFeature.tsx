import React from 'react';
import { useMonetization } from '../contexts/MonetizationContext';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export const PremiumFeature: React.FC = () => {
  const { isPremium, togglePremium } = useMonetization();
  
  if (isPremium) {
    return (
      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 font-medium">
          <Sparkles className="h-4 w-4" />
          <span>Premium Feature</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          Get personalized recommendations based on your event history.
        </p>
        <div className="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 rounded-md p-3 text-sm text-gray-600 dark:text-gray-400">
          Your personalized event recommendations will appear here.
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-r from-indigo-100 to-pink-100 dark:from-indigo-950/50 dark:to-pink-950/50 border border-indigo-200 dark:border-indigo-900/50 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-2 font-semibold bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
        <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span>Upgrade to Premium</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        Get ad-free browsing, personalized recommendations, and more.
      </p>
      <Button 
        onClick={togglePremium}
        className="w-full brand-gradient-bg hover:opacity-90"
      >
        Try Premium Free
      </Button>
    </div>
  );
};