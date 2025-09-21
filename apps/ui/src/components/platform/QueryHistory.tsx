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
    {
      id: 'q1',
      content: "What are the key risk factors for this contractor?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      category: 'Risk Analysis'
    },
    {
      id: 'q2',
      content: "Show me the financial performance trends",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      category: 'Financial'
    },
    {
      id: 'q3',
      content: "Analyze the compliance status of recent contracts",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      category: 'Compliance'
    },
    {
      id: 'q4',
      content: "Compare this contractor's performance to industry benchmarks",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      category: 'Benchmarking'
    },
    {
      id: 'q5',
      content: "What are the upcoming contract expiration dates?",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      category: 'Timeline'
    },
    {
      id: 'q6',
      content: "Generate a summary of subcontractor relationships",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      category: 'Relationships'
    }
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
      {!isMinimized && (
        <div
          className="fixed bottom-0 left-0 w-[420px] h-[100vh] shadow-2xl overflow-hidden z-50 flex flex-col rounded-xl"
          style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
        >
          {/* Header */}
          <div className="border-b border-gray-700/30 p-4 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-[#D2AC38]/20 border border-[#D2AC38]/40 flex items-center justify-center">
                <History className="h-4 w-4 text-[#D2AC38]" />
              </div>
              <h3 className="text-gray-200 font-normal tracking-wider uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '16px' }}>CHAT HISTORY</h3>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-[#D2AC38] hover:bg-gray-800/50"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-[#D2AC38] hover:bg-gray-800/50"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Query History List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
            {mockQueries.map((query) => (
              <div
                key={query.id}
                onClick={() => {
                  setInput(query.content);
                  setIsMinimized(true);
                  // TODO: Integrate with AI chat to populate input
                }}
                className="flex justify-start"
              >
                <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-gray-800/80 text-gray-200 border border-gray-700/50 cursor-pointer hover:bg-gray-700/80 transition-all duration-200">
                  <div className="whitespace-pre-wrap">{query.content}</div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(query.timestamp)}</span>
                    <span className="text-[#D2AC38]">•</span>
                    <span>{query.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search Input */}
          <div className="border-t border-gray-700/30 p-4 flex-shrink-0" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search query history..."
                className="flex-1 bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-[#D2AC38]/50 focus:ring-1 focus:ring-[#D2AC38]/50 backdrop-blur-sm"
              />
              <Button
                onClick={() => setIsMinimized(true)}
                className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-300 border border-gray-600/50 h-10 w-10 p-0 rounded-lg"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                className="bg-[#D2AC38]/20 hover:bg-[#D2AC38]/30 text-[#D2AC38] border border-[#D2AC38]/40 hover:border-[#D2AC38]/60 h-10 w-10 p-0 rounded-lg transition-all duration-200"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Query History Bar in Footer */}
      <div
        onClick={() => setIsMinimized(false)}
        className="flex items-center gap-2 h-10 px-3 rounded-lg border border-[#D2AC38]/40 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 relative overflow-hidden"
        style={{
          backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor,
          background: `linear-gradient(90deg, transparent, rgba(210, 172, 56, 0.02), transparent), ${CONTRACTOR_DETAIL_COLORS.panelColor}`,
          backgroundSize: '300% 100%',
          animation: 'shimmer 8s ease-in-out infinite'
        }}
      >
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -300% 0; }
            50% { background-position: 300% 0; }
            100% { background-position: -300% 0; }
          }
        `}</style>
        <div className="h-6 w-6 rounded bg-[#D2AC38]/20 border border-[#D2AC38]/40 flex items-center justify-center">
          <History className="h-3 w-3 text-[#D2AC38]" />
        </div>
        <span className="text-gray-300 text-sm font-light uppercase" style={{ fontFamily: 'Genos, sans-serif' }}>CHAT HISTORY</span>
      </div>
    </div>
  );
}