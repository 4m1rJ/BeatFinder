import React from 'react';

export const AdHeader: React.FC = () => {
  return (
    <div className="bg-gray-100 dark:bg-slate-800 py-2">
      <div className="container-custom">
        <div className="ad-container text-center text-sm p-2">
          <span className="text-gray-500 dark:text-gray-400">Advertisement</span>
          <div className="bg-gray-200 dark:bg-slate-700 p-4 rounded-md mt-1 flex items-center justify-center min-h-[60px]">
            <span className="text-gray-600 dark:text-gray-300">
              Ad space - Header banner
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};