import React, { useState } from 'react';
import { MessageSquare, X, Minimize2, Maximize2, Clock, Search, History } from 'lucide-react';
import { Button } from '../ui/button';
import { CONTRACTOR_DETAIL_COLORS } from '../../lib/utils';

interface QueryHistoryProps {
  className?: string;
}

export function QueryHistory({ className }: QueryHistoryProps) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [input, setInput] = useState('');

  const mockQueries = [
    "Risk factors analysis",
    "Financial performance trends",
    "Compliance status check",
    "Industry benchmarks comparison",
    "Contract expiration dates",
    "Subcontractor relationships summary"
  ];

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays === 0) {
      if (diffHours === 0) return 'Just now';
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="relative">
      {/* Expanded Query History Window */}
      <div
        className={`fixed bottom-0 left-0 w-[208px] shadow-2xl overflow-hidden z-40 flex flex-col transition-transform duration-300 ease-out ${
          isMinimized ? 'transform translate-y-full' : 'transform translate-y-0'
        }`}
        style={{
          backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor,
          height: 'calc(100vh - 74px)' // Extend 2px higher
        }}
      >
          {/* Header */}
          <div className="border-b border-gray-700/30 px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}>
            <h3 className="text-gray-300 font-normal text-sm">Recent</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-5 w-5 p-0 text-gray-400 hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Query History List */}
          <div className="flex-1 overflow-y-auto" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
            {mockQueries.map((query, index) => (
              <div
                key={index}
                onClick={() => {
                  setInput(query);
                  setIsMinimized(true);
                  // TODO: Integrate with AI chat to populate input
                }}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/20 cursor-pointer transition-all duration-150 text-sm"
              >
                {query}
              </div>
            ))}
          </div>

        </div>

      {/* Subtle Footer Button */}
      <div
        onClick={() => setIsMinimized(false)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700/30 cursor-pointer hover:bg-gray-800/30 hover:border-gray-600/50 transition-all duration-200 bg-gray-900/20"
      >
        <div className="w-3 h-3 border border-gray-600 rounded-sm flex items-center justify-center">
          <div className="w-1 h-1 bg-gray-400"></div>
        </div>
        <span className="text-gray-400 text-sm font-light" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Recent</span>
      </div>
    </div>
  );
}