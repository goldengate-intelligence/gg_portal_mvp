import React, { useState } from 'react';
import {
  MessageSquare,
  Navigation,
  Command,
  Globe,
  Terminal,
  Cpu,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { AgentChat } from './AgentChat';
import { QueryHistory } from './QueryHistory';
import { useAuth } from '../../contexts/auth-context';
import { useLocation } from '@tanstack/react-router';
import { CONTRACTOR_DETAIL_COLORS } from '../../lib/utils';

interface PlatformFooterProps {
  mode?: string;
  contextInfo?: string;
}

export function PlatformFooter({ mode = 'platform', contextInfo }: PlatformFooterProps) {
  const { user } = useAuth();
  const location = useLocation();

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
      {/* Footer Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 flex-shrink-0" style={{ backgroundColor: getFooterBackground() }}>
        
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left - Query History */}
            <div className="w-auto">
              <QueryHistory />
            </div>

            {/* Center Status */}
            <div className="flex items-center justify-center gap-2">
              <Command className="w-3 h-3 text-green-400" />
              <span className="text-sm text-green-400 font-light uppercase" style={{ fontFamily: 'Genos, sans-serif' }}>
                NETWORK: CONNECTED
              </span>
            </div>

            {/* Right Status */}
            <div className="flex items-center justify-end gap-6">
              {/* Chat always present */}
              <div className="w-auto">
                <AgentChat
                  forceOpen={true}
                  isEmbedded={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  );
}