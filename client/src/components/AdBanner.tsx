import React from 'react';

export const AdBanner: React.FC = () => {
  return (
    <div className="ad-container text-center">
      <span className="text-gray-500 dark:text-gray-400 text-sm">Advertisement</span>
      <div className="bg-gray-200 dark:bg-slate-700 p-6 rounded-md mt-1 flex items-center justify-center min-h-[120px]">
        <span className="text-gray-600 dark:text-gray-300">
          Ad space - Full width banner
        </span>
      </div>
    </div>
  );
};