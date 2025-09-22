import React, { useState } from 'react';
import {
  MessageSquare,
  Navigation,
  Command,
  Globe,
  Terminal,
  Cpu,
  X,
  History
} from 'lucide-react';
import { Button } from '../ui/button';
import { AgentChat } from './AgentChat';
import { QueryHistory } from './QueryHistory';
import { useAuth } from '../../contexts/auth-context';
import { useLocation } from '@tanstack/react-router';
import { CONTRACTOR_DETAIL_COLORS } from '../../logic/utils';

interface PlatformFooterProps {
  mode?: string;
  contextInfo?: string;
}

export function PlatformFooter({ mode = 'platform', contextInfo }: PlatformFooterProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [showQueryHistory, setShowQueryHistory] = useState(false);

  // Dynamic footer background based on current page (same logic as header)
  const getFooterBackground = () => {
    const pathname = location.pathname;
    if (pathname.includes('/platform/discovery')) {
      return '#000000'; // Pure black for discovery
    }
    if (pathname.includes('/platform/portfolio')) {
      return '#000000'; // Pure black for portfolio
    }
    if (pathname === '/platform') {
      return '#000000'; // Pure black for platform page
    }
    if (pathname === '/dashboard') {
      return '#000000'; // Pure black for dashboard
    }
    if (pathname.includes('/contractor-detail')) {
      return '#000000'; // Black for contractor detail pages
    }
    return CONTRACTOR_DETAIL_COLORS.bannerColor; // Default for other pages
  };

  return (
    <>
      {/* Left floating button - Recent (icon only, peeking from edge) */}
      <div className="fixed bottom-6 left-0 z-50">
        <button
          onClick={() => setShowQueryHistory(!showQueryHistory)}
          className="bg-black border border-[#D2AC38] hover:bg-[#D2AC38] h-10 rounded-r-md shadow-lg cursor-pointer transition-all duration-200 flex items-center group"
          style={{ width: '24px', paddingLeft: '4px' }}
        >
          <History className="w-6 h-6 text-[#D2AC38] group-hover:text-black flex-shrink-0" style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* Query History Panel - Direct Full View */}
      {showQueryHistory && (
        <div
          className="fixed bottom-0 left-0 w-[208px] shadow-2xl overflow-hidden z-40 flex flex-col transition-transform duration-300 ease-out"
          style={{
            backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor,
            height: 'calc(100vh - 74px)'
          }}
        >
          {/* Header */}
          <div className="border-b border-gray-700/30 px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}>
            <h3 className="text-gray-300 font-normal text-sm">Recent</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQueryHistory(false)}
              className="h-5 w-5 p-0 text-gray-400 hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Query History List */}
          <div className="flex-1 overflow-y-auto" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
            {[
              "Risk factors analysis",
              "Financial performance trends",
              "Compliance status check",
              "Industry benchmarks comparison",
              "Contract expiration dates",
              "Subcontractor relationships summary"
            ].map((query, index) => (
              <div
                key={index}
                onClick={() => {
                  setShowQueryHistory(false);
                  // TODO: Integrate with AI chat to populate input
                }}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/20 cursor-pointer transition-all duration-150 text-sm"
              >
                {query}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right floating button - AI Support */}
      <div className="fixed bottom-6 right-6 z-50">
        <AgentChat
          forceOpen={true}
          isEmbedded={true}
        />
      </div>
    </>
  );
}