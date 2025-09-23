import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ChevronDown, Database, Target, Activity, Filter, Globe, BarChart3, TrendingUp, Shield, X, Brain, Paperclip, Settings, History, MessageSquare, FileSpreadsheet } from 'lucide-react';

/**
 * ACTUAL DISCOVERY BASE: Your Real UI
 * - Copied from your actual discovery.tsx
 * - This is the base for all remixes
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

export function ActualDiscoveryBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFullscreenResults, setShowFullscreenResults] = useState(false);
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'ai', content: string, timestamp: Date}>>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [processingDots, setProcessingDots] = useState('');
  const [showResultsNotification, setShowResultsNotification] = useState(false);
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
        content: `I've processed your query and returned ${mockResults.length} relevant contractor records. The data includes comprehensive information about each organization's contract history, performance metrics, and key identifiers.`,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, aiMessage]);
      setQueryResults(mockResults);
      setQueryColumns(['CONTRACTOR_NAME', 'UEI', 'TOTAL_OBLIGATED', 'CONTRACT_COUNT', 'PRIMARY_AGENCY']);
      setShowResultsNotification(true);
      setIsExecuting(false);
    }, 2000);
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
          {/* AI-Native Search Section */}
          <div className="mb-8 mt-6 flex justify-center">
            <div className="w-full max-w-4xl">
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

                        {/* Results notification - top right */}
                        <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
                          {showResultsNotification && (
                            <button
                              onClick={() => setShowFullscreenResults(true)}
                              className="flex items-center gap-1 px-2 py-0.5 bg-green-600/20 border border-green-600/40 rounded-full hover:bg-green-600/30 transition-colors animate-pulse"
                              title="View results"
                            >
                              <BarChart3 className="w-3 h-3 text-green-400" />
                              <span className="text-xs text-green-400">Results Ready</span>
                            </button>
                          )}
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
                              {/* Initialization */}
                              {conversation.length === 0 && (
                                <>
                                  <div className="text-gray-500">Initializing...</div>
                                  <div className="text-gray-500">Connected.</div>
                                  <div className="text-gray-500">Goldengate Terminal is Active...</div>
                                  <div className="text-gray-500 mb-2">Ready for queries and export requests.</div>
                                </>
                              )}

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
                              <div ref={conversationEndRef} />
                            </div>
                          </div>

                          {/* Keyboard Shortcuts Info */}
                          <div className="text-xs text-gray-500 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span>Press <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-300">Enter</kbd> to execute</span>
                              <span>Press <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-300">Esc</kbd> to interrupt</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-gray-400 hover:text-[#F97316] transition-colors">
                                <Paperclip className="w-3 h-3" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-[#F97316] transition-colors">
                                <Settings className="w-3 h-3" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-[#F97316] transition-colors">
                                <Download className="w-3 h-3" />
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
          </div>
        </div>

        {/* Fullscreen Results Modal - Your Snowflake Style */}
        {showFullscreenResults && (
          <div
            className="fixed z-[70] bg-black/90 backdrop-blur-sm"
            style={{ top: '80px', left: '0', right: '0', bottom: '80px' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFullscreenResults(false);
                setShowResultsNotification(false);
              }
            }}
          >
            <div className="w-full h-full flex">
              {/* Main Results Panel */}
              <div className="flex-1 bg-gray-900 border-r border-gray-700 overflow-hidden flex flex-col">
                {/* Top Tabs */}
                <div className="flex items-center border-b border-gray-700 bg-gray-800">
                  <div className="flex">
                    <button className="px-6 py-3 text-sm font-medium text-blue-400 bg-blue-500/10 border-b-2 border-blue-400 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      Results
                    </button>
                    <button className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-gray-300 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Chart
                    </button>
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-3 px-6">
                    <button
                      className="px-3 py-1.5 text-sm bg-[#F97316]/20 hover:bg-[#F97316]/30 text-[#F97316] border border-[#F97316]/40 rounded flex items-center gap-1.5"
                      onClick={handleExport}
                    >
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                    <button
                      onClick={() => {
                        setShowFullscreenResults(false);
                        setShowResultsNotification(false);
                      }}
                      className="h-8 w-8 p-0 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-300 rounded-md flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Results Content */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-800 border-b border-gray-700">
                      <tr>
                        <th className="text-left p-3 text-gray-300">CONTRACTOR_NAME</th>
                        <th className="text-left p-3 text-gray-300">UEI</th>
                        <th className="text-left p-3 text-gray-300">TOTAL_OBLIGATED</th>
                        <th className="text-left p-3 text-gray-300">CONTRACT_COUNT</th>
                        <th className="text-left p-3 text-gray-300">PRIMARY_AGENCY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queryResults.map((row, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="p-3 text-white">{row.CONTRACTOR_NAME}</td>
                          <td className="p-3 text-gray-400">{row.UEI}</td>
                          <td className="p-3 text-white">{row.TOTAL_OBLIGATED}</td>
                          <td className="p-3 text-white">{row.CONTRACT_COUNT}</td>
                          <td className="p-3 text-white">{row.PRIMARY_AGENCY}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Side Panel */}
              <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-sm font-medium text-gray-200 mb-3">Query Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Query duration</span>
                      <span className="text-sm text-gray-200">67ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Rows</span>
                      <span className="text-sm text-gray-200">{queryResults.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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