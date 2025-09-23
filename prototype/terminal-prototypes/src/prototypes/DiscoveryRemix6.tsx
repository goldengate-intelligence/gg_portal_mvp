import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ChevronDown, Database, Target, Activity, Filter, Globe, BarChart3, TrendingUp, Shield, X, Brain, Paperclip, Settings, History, MessageSquare, FileSpreadsheet, Layers, SplitSquareVertical } from 'lucide-react';

/**
 * DISCOVERY REMIX 6: BENEATH TERMINAL WORKFLOW
 * - Terminal stays fixed at top in compact form
 * - Results unfold beneath in real-time as user types/searches
 * - Smooth accordion-style expansion
 * - More streamlined single-page flow
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

export function DiscoveryRemix6() {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'ai', content: string, timestamp: Date}>>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [processingDots, setProcessingDots] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [resultsHeight, setResultsHeight] = useState(0);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const mockResults = [
    { CONTRACTOR_NAME: 'Advanced Manufacturing Solutions LLC', UEI: 'ADV123456789', TOTAL_OBLIGATED: 45600000, CONTRACT_COUNT: 23, PRIMARY_AGENCY: 'DEPARTMENT OF DEFENSE', INDUSTRY: 'Manufacturing' },
    { CONTRACTOR_NAME: 'Aerospace Dynamics Corporation', UEI: 'AER987654321', TOTAL_OBLIGATED: 78200000, CONTRACT_COUNT: 45, PRIMARY_AGENCY: 'DEPARTMENT OF THE NAVY', INDUSTRY: 'Aerospace' },
    { CONTRACTOR_NAME: 'Precision Systems Integration Inc', UEI: 'PSI555666777', TOTAL_OBLIGATED: 32100000, CONTRACT_COUNT: 67, PRIMARY_AGENCY: 'DEPARTMENT OF THE AIR FORCE', INDUSTRY: 'Technology' },
    { CONTRACTOR_NAME: 'Complex Systems Research LLC', UEI: 'CSR444555666', TOTAL_OBLIGATED: 91500000, CONTRACT_COUNT: 34, PRIMARY_AGENCY: 'DEPARTMENT OF DEFENSE', INDUSTRY: 'R&D' },
    { CONTRACTOR_NAME: 'Industrial Technologies Group', UEI: 'ITG222333444', TOTAL_OBLIGATED: 23800000, CONTRACT_COUNT: 89, PRIMARY_AGENCY: 'GENERAL SERVICES ADMINISTRATION', INDUSTRY: 'Manufacturing' }
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

    // Immediately start expanding results area
    setShowResults(true);
    setResultsHeight(200); // Start with loading state height

    setTimeout(() => {
      const aiMessage = {
        type: 'ai' as const,
        content: `Analysis complete. Found ${mockResults.length} contractors matching your criteria.`,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, aiMessage]);
      setQueryResults(mockResults);
      setResultsHeight(400); // Expand to full results height
      setIsExecuting(false);
    }, 1600);
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

  const handleClearResults = () => {
    setShowResults(false);
    setQueryResults([]);
    setResultsHeight(0);
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
        {/* Hero Discovery Header - UNCHANGED */}
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
                            ASSET ORIGINATION • FORENSIC DUE DILIGENCE • BUSINESS DEVELOPMENT
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
          {/* Compact Terminal Section */}
          <div className="mb-6 mt-6 flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="border border-[#F97316]/30 rounded-xl hover:border-[#F97316]/50 transition-all duration-500">
                <InternalContentContainer>
                  <div className="flex-1">
                    <ChartStyleContainer>
                      <div className="relative h-full">
                        {/* Title with status */}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-sans text-xs uppercase tracking-wider text-[#D2AC38]">
                            Goldengate Terminal
                          </h3>
                          {showResults && (
                            <button
                              onClick={handleClearResults}
                              className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Compact Terminal */}
                        <div
                          className="bg-black border border-gray-700 rounded-lg h-40 overflow-hidden font-mono text-sm tracking-tighter cursor-text"
                          onClick={(e) => {
                            const textarea = e.currentTarget.querySelector('textarea');
                            if (textarea) {
                              textarea.focus();
                            }
                          }}
                        >
                          <div className="h-full overflow-y-auto p-4">
                            {/* Compact history */}
                            {conversation.length === 0 && (
                              <div className="text-gray-500 mb-2">Goldengate Terminal Active • Ready for queries</div>
                            )}

                            {conversation.slice(-2).map((message, index) => (
                              <div key={index}>
                                {message.type === 'user' ? (
                                  <div className="text-green-400 mb-2">
                                    <span className="text-green-400">user@discovery:~$ </span>{message.content}
                                  </div>
                                ) : (
                                  <div className="text-white text-sm leading-relaxed mb-2">
                                    {message.content}
                                  </div>
                                )}
                              </div>
                            ))}

                            {isExecuting && (
                              <div className="text-gray-500 mb-2">
                                Processing query{processingDots}
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
                          </div>
                        </div>

                        {/* Compact controls */}
                        <div className="text-xs text-gray-500 flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4">
                            <span><kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-300">Enter</kbd> execute</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-gray-400 hover:text-[#F97316] transition-colors">
                              <Settings className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </ChartStyleContainer>
                  </div>
                </InternalContentContainer>
              </div>
            </div>
          </div>

          {/* Results Section - Unfolds beneath terminal */}
          <div
            className="overflow-hidden transition-all duration-700 ease-out"
            style={{
              height: showResults ? `${resultsHeight}px` : '0px',
              opacity: showResults ? 1 : 0
            }}
          >
            <div className="w-full max-w-4xl mx-auto">
              <div className="border border-[#D2AC38]/30 rounded-xl hover:border-[#D2AC38]/50 transition-all duration-500">
                <InternalContentContainer>
                  <div className="flex-1">
                    <ChartStyleContainer>
                      <div className="relative h-full">
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Layers className="w-4 h-4 text-[#D2AC38]" />
                            <h3 className="font-sans text-xs uppercase tracking-wider text-[#D2AC38]">
                              Live Results
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {queryResults.length} found
                            </span>
                            <button
                              className="p-1 text-gray-400 hover:text-[#D2AC38] transition-colors"
                              onClick={handleExport}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Results Content */}
                        <div className="overflow-y-auto" style={{ height: `${resultsHeight - 80}px` }}>
                          {isExecuting ? (
                            /* Loading State */
                            <div className="flex items-center justify-center py-12">
                              <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D2AC38]"></div>
                                <span className="text-gray-400">Searching database...</span>
                              </div>
                            </div>
                          ) : queryResults.length > 0 ? (
                            /* Results Grid */
                            <div className="grid grid-cols-1 gap-3">
                              {queryResults.map((result, index) => (
                                <div key={index} className="bg-black/30 border border-gray-700 rounded-lg p-4 hover:border-[#D2AC38]/30 transition-colors group">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="text-white font-medium mb-1 group-hover:text-[#D2AC38] transition-colors">
                                        {result.CONTRACTOR_NAME}
                                      </div>
                                      <div className="text-xs text-gray-400 mb-2">{result.UEI} • {result.INDUSTRY}</div>
                                      <div className="text-xs text-gray-500">{result.PRIMARY_AGENCY}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-green-400 font-medium">${(result.TOTAL_OBLIGATED / 1000000).toFixed(1)}M</div>
                                      <div className="text-blue-400 text-sm">{result.CONTRACT_COUNT} contracts</div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Summary Footer */}
                              <div className="mt-4 pt-4 border-t border-gray-700/50">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div>
                                    <div className="text-lg font-medium text-white">{queryResults.length}</div>
                                    <div className="text-xs text-gray-400">Contractors</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-medium text-green-400">
                                      ${(queryResults.reduce((sum, r) => sum + r.TOTAL_OBLIGATED, 0) / 1000000).toFixed(1)}M
                                    </div>
                                    <div className="text-xs text-gray-400">Total Value</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-medium text-blue-400">
                                      {Math.round(queryResults.reduce((sum, r) => sum + r.CONTRACT_COUNT, 0) / queryResults.length)}
                                    </div>
                                    <div className="text-xs text-gray-400">Avg Contracts</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Empty State */
                            <div className="text-center py-12">
                              <BarChart3 className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                              <p className="text-gray-400 text-sm">Execute a query to see results unfold here</p>
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