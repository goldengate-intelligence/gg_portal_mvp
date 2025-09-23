import React, { useState } from 'react';
import {
  MessageSquare,
  Navigation,
  Command,
  Globe,
  Terminal,
  Cpu,
  X,
  History,
  Pin,
  Bot
} from 'lucide-react';
import { Button } from '../ui/button';
import { QueryHistory } from './QueryHistory';
import { AIAssistant } from '../discovery/AIAssistant';
import { useAuth } from '../../contexts/auth-context';
import { useLocation } from '@tanstack/react-router';
import { CONTRACTOR_DETAIL_COLORS } from '../../logic/utils';
import type { AIConversationItem } from '../discovery/types/discovery';

interface PlatformFooterProps {
  mode?: string;
  contextInfo?: string;
}

export function PlatformFooter({ mode = 'platform', contextInfo }: PlatformFooterProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [showQueryHistory, setShowQueryHistory] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiConversation, setAiConversation] = useState<AIConversationItem[]>([]);
  const [aiInput, setAiInput] = useState('');

  // AI message handler
  const handleAIMessage = () => {
    if (!aiInput.trim()) return;

    const newUserMessage: AIConversationItem = {
      type: 'user',
      content: aiInput,
      timestamp: new Date()
    };

    setAiConversation(prev => [...prev, newUserMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AIConversationItem = {
        type: 'ai',
        content: "I'll help you with platform navigation and research. What would you like to explore?",
        timestamp: new Date()
      };
      setAiConversation(prev => [...prev, aiResponse]);
    }, 500);

    setAiInput('');
  };

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
      {/* Left floating button - Recent */}
      <div className="fixed bottom-6 z-50" style={{ left: '24px' }}>
        <button
          onClick={() => setShowQueryHistory(!showQueryHistory)}
          className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
            showQueryHistory
              ? 'bg-[#D2AC38] text-[#223040] hover:bg-[#D2AC38]/80'
              : 'bg-[#223040] border border-[#D2AC38] text-[#D2AC38] hover:bg-[#223040]/80'
          }`}
          title={showQueryHistory ? "Close Recent Searches" : "Open Recent Searches"}
        >
          <History className="w-5 h-5" />
        </button>
      </div>

      {/* Query History Panel - Direct Full View */}
      {showQueryHistory && (
        <div className={`fixed top-0 left-0 h-screen w-80 bg-gray-900/95 border-r border-gray-700 backdrop-blur-sm transform transition-transform duration-300 z-50 translate-x-0`}>
          {/* Recents button inside panel - positioned to match external position */}
          <div className="fixed z-50" style={{ bottom: '24px', left: '24px' }}>
            <button
              onClick={() => setShowQueryHistory(false)}
              className="p-3 rounded-full shadow-lg transition-all duration-300 bg-[#D2AC38] text-[#223040] hover:bg-[#D2AC38]/80"
              title="Close Recent Searches"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#D2AC38]" />
                <h3 className="text-white font-medium">Archived Chats</h3>
              </div>
              <button
                onClick={() => setShowQueryHistory(false)}
                className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
                title="Close Recent Searches"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div
              className="flex-1 overflow-y-auto mb-4 scroll-smooth focus:outline-none"
              tabIndex={0}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#4B5563 #1F2937',
                scrollbarGutter: 'stable',
                paddingRight: '4px'
              }}
            >
              <div className="space-y-6 px-1">
                {/* Pinned Chats Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="w-4 h-4 text-orange-400" />
                    <h4 className="text-gray-400 text-xs uppercase tracking-wider font-sans">Pinned</h4>
                  </div>
                  <div className="space-y-2">
                    {[
                      "Lockheed Martin analysis",
                      "Defense contractors comparison"
                    ].map((query, index) => (
                      <div
                        key={`pinned-${index}`}
                        onClick={() => {
                          setShowQueryHistory(false);
                          // TODO: Integrate with AI chat to populate input
                        }}
                        className="p-3 bg-gray-800 rounded-lg text-sm text-white hover:bg-gray-700 cursor-pointer transition-colors relative"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {query}
                            <div className="text-xs opacity-60 mt-1">
                              {new Date(Date.now() - (index + 1) * 172800000).toLocaleDateString()}
                            </div>
                          </div>
                          <Pin className="w-3 h-3 text-orange-400 fill-orange-400/20 ml-2 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Searches Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <History className="w-4 h-4 text-[#D2AC38]" />
                    <h4 className="text-gray-400 text-xs uppercase tracking-wider font-sans">Recent</h4>
                  </div>
                  <div className="space-y-2">
                    {[
                      "Risk factors analysis",
                      "Financial performance trends",
                      "Compliance status check",
                      "Industry benchmarks comparison",
                      "Contract expiration dates",
                      "Subcontractor relationships summary"
                    ].map((query, index) => (
                      <div
                        key={`recent-${index}`}
                        onClick={() => {
                          setShowQueryHistory(false);
                          // TODO: Integrate with AI chat to populate input
                        }}
                        className="p-3 bg-gray-800 rounded-lg text-sm text-white hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        {query}
                        <div className="text-xs opacity-60 mt-1">
                          {new Date(Date.now() - index * 86400000).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom divider and info section */}
            <div className="border-t border-gray-700 pt-2" style={{ marginBottom: '80px' }}>
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-8">
                  Access your recent searches and pinned conversations
                </p>
                <p className="text-gray-500 text-xs">
                  Recent chats stored for 48 hours, Pinned remain indefinitely
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right floating AI button */}
      <div className="fixed bottom-6 z-50" style={{ right: '24px' }}>
        <button
          onClick={() => {
            if (isAiOpen) {
              setIsAiOpen(false);
            } else {
              setIsAiOpen(true);
            }
          }}
          className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
            isAiOpen
              ? 'bg-[#D2AC38] text-[#223040] hover:bg-[#D2AC38]/80'
              : 'bg-[#223040] border border-[#D2AC38] text-[#D2AC38] hover:bg-[#223040]/80'
          }`}
          title={isAiOpen ? "Minimize AI Assistant" : "Open AI Assistant"}
        >
          <Bot className="w-5 h-5" />
        </button>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        conversation={aiConversation}
        input={aiInput}
        onInputChange={setAiInput}
        onSendMessage={handleAIMessage}
        onSuggestedPrompt={(prompt) => setAiInput(prompt)}
      />
    </>
  );
}