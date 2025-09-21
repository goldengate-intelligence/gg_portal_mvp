import React, { useState } from 'react';
import {
  MessageSquare,
  Navigation,
  Command,
  Globe,
  Terminal,
  Cpu
} from 'lucide-react';
import { Button } from '../ui/button';
import { AgentChat } from './AgentChat';
import { useAuth } from '../../contexts/auth-context';
import { CONTRACTOR_DETAIL_COLORS } from '../../lib/utils';

interface PlatformFooterProps {
  mode?: string;
  contextInfo?: string;
}

export function PlatformFooter({ mode = 'platform', contextInfo }: PlatformFooterProps) {
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* Footer Status Bar */}
      <div className="relative backdrop-blur-xl border-t border-gray-800 flex-shrink-0" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.bannerColor + 'ee' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#D2AC38]/5 to-transparent" />
        
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Status */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Navigation className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-400 font-light uppercase" style={{ fontFamily: 'Genos, sans-serif' }}>MODE:</span>
                <span className="text-sm text-gray-400 font-light uppercase font-bold" style={{ fontFamily: 'Genos, sans-serif' }}>{mode}</span>
              </div>
              {contextInfo && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3 text-gray-400" />
                  <span className="text-sm text-gray-400 font-light uppercase" style={{ fontFamily: 'Genos, sans-serif' }}>CONTEXT:</span>
                  <span className="text-sm text-gray-400 font-light" style={{ fontFamily: 'Genos, sans-serif' }}>{contextInfo}</span>
                </div>
              )}
            </div>

            {/* Center Status */}
            <div className="flex items-center gap-2">
              <Command className="w-3 h-3 text-green-400" />
              <span className="text-sm text-green-400 font-light uppercase" style={{ fontFamily: 'Genos, sans-serif' }}>
                NETWORK: CONNECTED
              </span>
            </div>

            {/* Right Status */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-400 font-light uppercase" style={{ fontFamily: 'Genos, sans-serif' }}>USER:</span>
                <span className="text-sm text-gray-400 font-light" style={{ fontFamily: 'Genos, sans-serif' }}>{user?.username || 'AGENT'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-400 font-light uppercase" style={{ fontFamily: 'Genos, sans-serif' }}>CPU:</span>
                <span className="text-sm text-gray-400 font-light" style={{ fontFamily: 'Genos, sans-serif' }}>12%</span>
              </div>
              <div className="border-l border-gray-700 pl-4 ml-2">
                <Button
                  onClick={() => setChatOpen(!chatOpen)}
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-2 ${chatOpen ? 'bg-[#D2AC38]/20 text-[#D2AC38] border-[#D2AC38]/30' : 'text-[#D2AC38] hover:text-[#E0BC4A] border-[#D2AC38]'} border hover:border-[#E0BC4A]`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-light uppercase" style={{ fontFamily: 'Genos, sans-serif' }}>CHAT</span>
                  {chatOpen && <span className="text-sm text-green-400">●</span>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Chat */}
      {chatOpen && <AgentChat forceOpen={true} />}
    </>
  );
}