/**
 * Data Source Indicator
 * Shows whether we're using mock data or real Snowflake data
 */

import React from 'react';

interface DataSourceIndicatorProps {
  className?: string;
}

export const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({ className = '' }) => {
  const isDevelopment = import.meta.env.MODE === 'development' || !import.meta.env.VITE_SNOWFLAKE_API_URL;
  const hasSnowflakeApiUrl = !!import.meta.env.VITE_SNOWFLAKE_API_URL;

  if (!isDevelopment && hasSnowflakeApiUrl) {
    // Production with real data - don't show indicator
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${className}`}>
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${isDevelopment ? 'bg-orange-400' : 'bg-green-400'}`} />
        <span className={isDevelopment ? 'text-orange-600' : 'text-green-600'}>
          {isDevelopment ? 'Mock Data' : 'Live Data'}
        </span>
      </div>
      {isDevelopment && (
        <div className="text-gray-500 text-xs">
          (Development Mode)
        </div>
      )}
    </div>
  );
};

export default DataSourceIndicator;