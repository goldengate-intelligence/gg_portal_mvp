import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ChevronDown, Database, Target, Activity, Filter, Globe, BarChart3, TrendingUp, Shield, X, Brain, Paperclip, Settings, History, MessageSquare, FileSpreadsheet } from 'lucide-react';

/**
 * DISCOVERY REMIX 3: FULLSCREEN WORKSPACE
 * - Takes your actual Discovery UI
 * - Makes terminal fullscreen with overlay results
 * - Terminal is the primary workspace
 * - Results appear as floating panels
 */

export function DiscoveryRemix3() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'ai', content: string, timestamp: Date}>>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [processingDots, setProcessingDots] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [queryColumns, setQueryColumns] = useState<string[]>([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const mockResults = [
    { CONTRACTOR_NAME: 'Advanced Manufacturing Solutions LLC', UEI: 'ADV123456789', TOTAL_OBLIGATED: 45600000, CONTRACT_COUNT: 23, PRIMARY_AGENCY: 'DEPARTMENT OF DEFENSE' },
    { CONTRACTOR_NAME: 'Aerospace Dynamics Corporation', UEI: 'AER987654321', TOTAL_OBLIGATED: 78200000, CONTRACT_COUNT: 45, PRIMARY_AGENCY: 'DEPARTMENT OF THE NAVY' },
    { CONTRACTOR_NAME: 'Precision Systems Integration Inc', UEI: 'PSI555666777', TOTAL_OBLIGATED: 32100000, CONTRACT_COUNT: 67, PRIMARY_AGENCY: 'DEPARTMENT OF THE AIR FORCE' }
  ];

  const handleAISearch = () => {
    if (!searchQuery.trim() || isExecuting) return;

    const userMessage = {
      type: 'user' as const,
      content: searchQuery.trim(),
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setIsExecuting(true);
    setSearchQuery('');

    setTimeout(() => {
      const aiMessage = {
        type: 'ai' as const,
        content: `Found ${mockResults.length} contractors matching your search criteria. Results are available in the floating panel.`,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, aiMessage]);
      setQueryResults(mockResults);
      setQueryColumns(['CONTRACTOR_NAME', 'UEI', 'TOTAL_OBLIGATED', 'CONTRACT_COUNT', 'PRIMARY_AGENCY']);
      setShowResultsPanel(true);
      setIsExecuting(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAISearch();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsExecuting(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting results...');
  };

  return (
    <div className="text-white relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90" style={{ minHeight: '100vh' }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, #F97316 1px, transparent 1px),
            linear-gradient(180deg, #F97316 1px, transparent 1px)
          `,
          backgroundSize: '15px 15px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Compact Header */}
        <div className="relative overflow-hidden">
          <div className="container mx-auto px-6 pt-6 pb-4 relative max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/20 border border-[#F97316]/40 rounded-lg backdrop-blur-sm">
                  <Brain className="w-6 h-6 text-[#F97316]" />
                </div>
                <div>
                  <h1 className="text-2xl text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '250' }}>
                    Discovery Engine
                  </h1>
                  <p className="text-[#F97316] font-sans text-xs tracking-wide">
                    REMIX 3: FULLSCREEN WORKSPACE • FLOATING RESULTS • IMMERSIVE TERMINAL
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 py-1 bg-black/50 border border-[#F97316]/30 rounded-lg backdrop-blur-sm">
                <Target className="w-3 h-3 text-[#F97316] animate-pulse" />
                <span className="text-xs text-[#F97316] font-sans uppercase">SCANNING</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Terminal Workspace */}
        <div className="container mx-auto px-6">
          <div className="border border-[#F97316]/30 rounded-xl hover:border-[#F97316]/50 transition-all duration-500" style={{ height: 'calc(100vh - 180px)' }}>
            <div className="p-4 h-full">
              <div className="rounded-lg p-4 h-full" style={{ backgroundColor: '#223040' }}>
                <div className="relative h-full">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-sans text-xs uppercase tracking-wider text-[#D2AC38]">
                      Goldengate Terminal - Fullscreen Workspace
                    </h3>
                    <div className="flex items-center gap-2">
                      {showResultsPanel && (
                        <button
                          onClick={() => setShowResultsPanel(true)}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600/20 border border-green-600/40 rounded-full hover:bg-green-600/30 transition-colors"
                        >
                          <BarChart3 className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-400">Results Ready</span>
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-[#F97316] transition-colors">
                        <Settings className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Fullscreen Terminal */}
                  <div
                    className="bg-black border border-gray-700 rounded-lg overflow-hidden font-mono text-sm tracking-tighter cursor-text flex-1"
                    style={{ height: 'calc(100% - 100px)' }}
                    onClick={(e) => {
                      const textarea = e.currentTarget.querySelector('textarea');
                      if (textarea) {
                        textarea.focus();
                      }
                    }}
                  >
                    <div className="h-full overflow-y-auto p-4">
                      {/* Welcome message */}
                      <div className="text-gray-500 mb-4">
                        <div>Goldengate Terminal v2.1.0 - Fullscreen Workspace Mode</div>
                        <div>Connected to Snowflake database cluster.</div>
                        <div>Type queries or use natural language.</div>
                        <div className="mb-4">Ready for queries and export requests.</div>
                      </div>

                      {conversation.map((message, index) => (
                        <div key={index}>
                          {message.type === 'user' ? (
                            <div className="text-green-400 mb-3">
                              <span className="text-green-400">user@discovery:~$ </span>{message.content}
                            </div>
                          ) : (
                            <div className="text-white whitespace-pre-wrap leading-relaxed mb-3">
                              {message.content}
                            </div>
                          )}
                        </div>
                      ))}

                      {isExecuting && (
                        <div className="text-yellow-400 flex items-center gap-2">
                          <div className="animate-spin w-3 h-3 border border-yellow-400 border-t-transparent rounded-full"></div>
                          Processing query...
                        </div>
                      )}

                      {/* Current prompt */}
                      {!isExecuting && (
                        <div className="flex items-start">
                          <span className="text-green-400 flex-shrink-0">user@discovery:~$ </span>
                          <div className="flex-1 min-w-0">
                            <textarea
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="w-full bg-transparent text-green-400 outline-none border-none resize-none overflow-hidden"
                              placeholder=""
                              autoFocus
                              rows={1}
                              style={{
                                lineHeight: '1.2',
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap'
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <div ref={conversationEndRef} />
                    </div>
                  </div>

                  {/* Terminal Footer */}
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>Press <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-300">Enter</kbd> to execute</span>
                      <span>Press <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-300">Esc</kbd> to interrupt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Fullscreen Mode</span>
                      <button className="p-1 text-gray-400 hover:text-[#F97316] transition-colors">
                        <Paperclip className="w-3 h-3" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-[#F97316] transition-colors">
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Results Panel */}
        {showResultsPanel && (
          <div className="fixed top-24 right-6 z-50 w-80">
            <div className="border border-[#D2AC38]/50 rounded-xl bg-gray-900/95 backdrop-blur-md shadow-2xl">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#D2AC38]" />
                    <span className="text-sm text-[#D2AC38] font-medium">Query Results</span>
                  </div>
                  <button
                    onClick={() => setShowResultsPanel(false)}
                    className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {queryResults.map((result, index) => (
                    <div key={index} className="bg-black/30 border border-gray-700 rounded-lg p-3 hover:border-[#D2AC38]/30 transition-colors">
                      <div className="text-white font-medium text-sm mb-1">{result.CONTRACTOR_NAME}</div>
                      <div className="text-xs text-gray-400 mb-1">{result.UEI}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 text-xs">{result.TOTAL_OBLIGATED}</span>
                        <span className="text-blue-400 text-xs">{result.CONTRACT_COUNT} contracts</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700 flex gap-2">
                  <button
                    className="flex-1 text-center text-xs text-[#F97316] hover:text-[#F97316]/80 transition-colors py-1"
                    onClick={handleExport}
                  >
                    Export
                  </button>
                  <button className="flex-1 text-center text-xs text-[#F97316] hover:text-[#F97316]/80 transition-colors py-1">
                    Full View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Status */}
        <div className="fixed bottom-6 left-6 z-40">
          <div className="bg-gray-900/90 border border-gray-700 rounded-lg p-2 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Fullscreen Workspace Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}