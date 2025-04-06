import React from 'react';

export const AdSidebar: React.FC = () => {
  return (
    <div className="ad-container mb-6">
      <span className="text-gray-500 dark:text-gray-400 text-sm">Advertisement</span>
      <div className="bg-gray-200 dark:bg-slate-700 p-4 rounded-md mt-1 flex flex-col items-center justify-center min-h-[300px]">
        <span className="text-gray-600 dark:text-gray-300">
          Ad space - Sidebar
        </span>
      </div>
    </div>
  );
};