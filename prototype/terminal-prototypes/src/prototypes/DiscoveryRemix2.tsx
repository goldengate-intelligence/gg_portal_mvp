import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ChevronDown, Database, Target, Activity, Filter, Globe, BarChart3, TrendingUp, Shield, X, Brain, Paperclip, Settings, History, MessageSquare, FileSpreadsheet } from 'lucide-react';

/**
 * DISCOVERY REMIX 2: RESULTS INTEGRATION
 * - Takes your actual Discovery UI
 * - Moves results panel to the right side permanently
 * - Terminal on left, live results on right
 * - Side-by-side split layout
 */

const ExternalPanelContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="h-full border border-[#F97316]/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#F97316]/50 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 backdrop-blur-sm">
    <div className="absolute inset-0 opacity-5 z-0">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(90deg, #F97316 1px, transparent 1px),
          linear-gradient(180deg, #F97316 1px, transparent 1px)
        `,
        backgroundSize: '15px 15px'
      }} />
    </div>
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0"
         style={{ background: 'linear-gradient(135deg, #F9731620, transparent)' }} />
    {children}
  </div>
);

const ChartStyleContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    className="rounded-lg p-4"
    style={{
      backgroundColor: '#223040'
    }}
  >
    {children}
  </div>
);

const InternalContentContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 h-full flex flex-col relative z-10">
    {children}
  </div>
);

export function DiscoveryRemix2() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'ai', content: string, timestamp: Date}>>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [processingDots, setProcessingDots] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [queryColumns, setQueryColumns] = useState<string[]>([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const mockResults = [
    { CONTRACTOR_NAME: 'Advanced Manufacturing Solutions LLC', UEI: 'ADV123456789', TOTAL_OBLIGATED: 45600000, CONTRACT_COUNT: 23, PRIMARY_AGENCY: 'DEPARTMENT OF DEFENSE' },
    { CONTRACTOR_NAME: 'Aerospace Dynamics Corporation', UEI: 'AER987654321', TOTAL_OBLIGATED: 78200000, CONTRACT_COUNT: 45, PRIMARY_AGENCY: 'DEPARTMENT OF THE NAVY' },
    { CONTRACTOR_NAME: 'Precision Systems Integration Inc', UEI: 'PSI555666777', TOTAL_OBLIGATED: 32100000, CONTRACT_COUNT: 67, PRIMARY_AGENCY: 'DEPARTMENT OF THE AIR FORCE' },
    { CONTRACTOR_NAME: 'Complex Systems Research LLC', UEI: 'CSR444555666', TOTAL_OBLIGATED: 91500000, CONTRACT_COUNT: 34, PRIMARY_AGENCY: 'DEPARTMENT OF DEFENSE' },
    { CONTRACTOR_NAME: 'Industrial Technologies Group', UEI: 'ITG222333444', TOTAL_OBLIGATED: 23800000, CONTRACT_COUNT: 89, PRIMARY_AGENCY: 'GENERAL SERVICES ADMINISTRATION' }
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
        content: `Found ${mockResults.length} contractors matching your search criteria.`,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, aiMessage]);
      setQueryResults(mockResults);
      setQueryColumns(['CONTRACTOR_NAME', 'UEI', 'TOTAL_OBLIGATED', 'CONTRACT_COUNT', 'PRIMARY_AGENCY']);
      setShowResults(true);
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
    <div className="text-white relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 pt-20 pb-20" style={{ minHeight: '100vh' }}>
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
        {/* Hero Discovery Header */}
        <div className="relative overflow-hidden mt-6">
          <div className="container mx-auto px-6 pt-0 pb-4 relative max-w-7xl">
            <div className="w-full">
              <div className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 relative p-6 border border-gray-700/50 hover:border-gray-600/40">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/20 border border-[#F97316]/40 rounded-xl backdrop-blur-sm">
                          <Brain className="w-8 h-8 text-[#F97316]" />
                        </div>
                        <div>
                          <h1 className="text-4xl text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '250' }}>
                            Discovery Engine
                          </h1>
                          <p className="text-[#F97316] font-sans text-sm tracking-wide">
                            REMIX 2: RESULTS INTEGRATION • SPLIT LAYOUT • LIVE UPDATES
                          </p>
                        </div>
                      </div>
                      <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        Research government contractors using intelligent search with integrated database access.
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 px-4 py-2 bg-black/50 border border-[#F97316]/30 rounded-lg backdrop-blur-sm">
                        <Target className="w-4 h-4 text-[#F97316] animate-pulse" />
                        <span className="text-xs text-[#F97316] font-sans uppercase">SCANNING</span>
                      </div>
                      <button className="bg-[#6366F1] hover:bg-[#6366F1]/80 text-white font-bold px-4 py-2 rounded">
                        VIEW PORTFOLIO
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6">
          {/* REMIX: Split layout with terminal and results */}
          <div className="mb-8 mt-6">
            <div className="grid grid-cols-12 gap-6">

              {/* Terminal Section - Left 7 columns */}
              <div className="col-span-7">
                <div className="border border-[#F97316]/30 rounded-xl hover:border-[#F97316]/50 transition-all duration-500">
                  <InternalContentContainer>
                    <div className="flex-1">
                      <ChartStyleContainer>
                        <div className="relative h-full">
                          {/* Title */}
                          <div className="absolute top-0 left-0 z-10">
                            <h3 className="font-sans text-xs uppercase tracking-wider text-[#D2AC38]">
                              Goldengate Terminal
                            </h3>
                          </div>

                          {/* Content */}
                          <div className="pt-8 space-y-6">
                            {/* Terminal */}
                            <div
                              className="bg-black border border-gray-700 rounded-lg h-80 overflow-hidden font-mono text-sm tracking-tighter cursor-text"
                              onClick={(e) => {
                                const textarea = e.currentTarget.querySelector('textarea');
                                if (textarea) {
                                  textarea.focus();
                                }
                              }}
                            >
                              <div className="h-full overflow-y-auto p-4">
                                {/* History */}
                                <div className="text-gray-500 mb-2">
                                  <div>Goldengate Terminal is Active...</div>
                                  <div className="mb-2">Ready for queries and export requests.</div>
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
                                  <div className="text-gray-500">
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
                                      />
                                    </div>
                                  </div>
                                )}
                                <div ref={conversationEndRef} />
                              </div>
                            </div>

                            {/* Keyboard Shortcuts Info */}
                            <div className="text-xs text-gray-500 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span>Press <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-300">Enter</kbd> to execute</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="p-1 text-gray-400 hover:text-[#F97316] transition-colors">
                                  <Settings className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ChartStyleContainer>
                    </div>
                  </InternalContentContainer>
                </div>
              </div>

              {/* Results Section - Right 5 columns */}
              <div className="col-span-5">
                <div className="border border-[#D2AC38]/30 rounded-xl hover:border-[#D2AC38]/50 transition-all duration-500">
                  <InternalContentContainer>
                    <div className="flex-1">
                      <ChartStyleContainer>
                        <div className="relative h-full">
                          {/* Title */}
                          <div className="mb-4">
                            <h3 className="font-sans text-xs uppercase tracking-wider text-[#D2AC38]">
                              Live Results
                            </h3>
                          </div>

                          {/* Results Content */}
                          <div className="h-80 overflow-y-auto">
                            {!showResults ? (
                              <div className="text-center py-16">
                                <BarChart3 className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">Execute a query to see results</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-sm text-green-400">Query Results ({mockResults.length})</span>
                                  <button
                                    className="p-1 text-gray-400 hover:text-[#D2AC38] transition-colors"
                                    onClick={handleExport}
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>

                                {queryResults.map((result, index) => (
                                  <div key={index} className="bg-black/30 border border-gray-700 rounded-lg p-3 hover:border-[#D2AC38]/30 transition-colors">
                                    <div className="text-white font-medium text-sm mb-1">{result.CONTRACTOR_NAME}</div>
                                    <div className="text-xs text-gray-400 mb-2">{result.UEI}</div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-green-400 text-sm">{result.TOTAL_OBLIGATED}</span>
                                      <span className="text-blue-400 text-sm">{result.CONTRACT_COUNT} contracts</span>
                                    </div>
                                  </div>
                                ))}

                                <div className="mt-4 pt-4 border-t border-gray-700">
                                  <button className="w-full text-center text-xs text-[#F97316] hover:text-[#F97316]/80 transition-colors">
                                    View Full Results →
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </ChartStyleContainer>
                    </div>
                  </InternalContentContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <div className="mt-16 text-center">
          <p className="uppercase tracking-wider" style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#D2AC38' }}>
            © 2025 GOLDENGATE INTELLIGENCE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </div>
  );
}