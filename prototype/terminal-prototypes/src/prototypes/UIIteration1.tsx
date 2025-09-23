import React, { useState, useEffect, useRef } from 'react'
import { Brain, BarChart3, Download, Settings, X, Play, Database, Sparkles, Eye, ChevronDown, ChevronUp } from 'lucide-react'

/**
 * UI ITERATION 1: ENHANCED FIXED TERMINAL
 * - Keep terminal in center like current design
 * - Expand terminal height dynamically
 * - Results slide up from bottom
 * - Side panels for context and tools
 */

export function UIIteration1() {
  const [input, setInput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [resultsExpanded, setResultsExpanded] = useState(false)
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'ai', content: string}>>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const mockResults = [
    { contractor_name: 'Advanced Systems Corp', uei: 'ADV123456789', total_obligated: 45600000, contract_count: 23 },
    { contractor_name: 'Precision Manufacturing LLC', uei: 'PRE987654321', total_obligated: 32100000, contract_count: 67 },
    { contractor_name: 'Tech Solutions Inc', uei: 'TEX555666777', total_obligated: 78200000, contract_count: 45 }
  ]

  const executeQuery = () => {
    if (!input.trim()) return

    setConversation(prev => [...prev, { type: 'user', content: input }])
    setIsExecuting(true)
    setInput('')

    setTimeout(() => {
      setConversation(prev => [...prev, {
        type: 'ai',
        content: `Found ${mockResults.length} contractors matching your query. Results are displayed below.`
      }])
      setShowResults(true)
      setIsExecuting(false)
    }, 800)
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    return `$${amount.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 text-white relative">
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
        {/* Header */}
        <div className="container mx-auto px-6 pt-20 pb-4">
          <div className="border border-gray-700/50 hover:border-gray-600/40 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 relative p-6" style={{ backgroundColor: '#111726' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/20 border border-[#F97316]/40 rounded-xl backdrop-blur-sm">
                  <Brain className="w-8 h-8 text-[#F97316]" />
                </div>
                <div>
                  <h1 className="text-4xl text-white font-light">Discovery Engine</h1>
                  <p className="text-[#F97316] text-sm tracking-wide">
                    UI ITERATION 1: ENHANCED FIXED TERMINAL • EXPANDABLE RESULTS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Terminal Area */}
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-12 gap-6">

            {/* Left Context Panel */}
            <div className="col-span-2">
              <div className="border border-gray-700/50 rounded-xl p-4" style={{ backgroundColor: '#111726' }}>
                <h3 className="text-sm font-medium text-gray-300 mb-4">Query Context</h3>
                <div className="space-y-3">
                  <div className="bg-black/30 border border-gray-700 rounded p-2">
                    <div className="text-xs text-gray-400">Database</div>
                    <div className="text-xs text-white">Contractors</div>
                  </div>
                  <div className="bg-black/30 border border-gray-700 rounded p-2">
                    <div className="text-xs text-gray-400">Tables</div>
                    <div className="text-xs text-white">contractors, contracts, agencies</div>
                  </div>
                  <div className="bg-black/30 border border-gray-700 rounded p-2">
                    <div className="text-xs text-gray-400">Last Query</div>
                    <div className="text-xs text-white">67ms</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Central Terminal */}
            <div className="col-span-8">
              <div className="border border-[#F97316]/30 rounded-xl hover:border-[#F97316]/50 transition-all duration-500">
                <div className="p-4">
                  <div className="bg-gray-800 rounded-lg overflow-hidden">

                    {/* Terminal Header */}
                    <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="ml-3 text-gray-400 text-sm font-mono">Goldengate Terminal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">Connected</span>
                      </div>
                    </div>

                    {/* Terminal Body - Expands with content */}
                    <div
                      className="bg-black p-4 terminal-font text-sm overflow-y-auto transition-all duration-300"
                      style={{
                        height: showResults ? (resultsExpanded ? '600px' : '300px') : '350px'
                      }}
                    >
                      {/* Conversation History */}
                      {conversation.map((msg, index) => (
                        <div key={index} className="mb-3">
                          {msg.type === 'user' ? (
                            <div className="text-green-400">
                              <span className="text-green-400">user@discovery:~$ </span>{msg.content}
                            </div>
                          ) : (
                            <div className="text-white whitespace-pre-wrap">{msg.content}</div>
                          )}
                        </div>
                      ))}

                      {isExecuting && (
                        <div className="text-yellow-400 flex items-center gap-2">
                          <div className="animate-spin w-3 h-3 border border-yellow-400 border-t-transparent rounded-full"></div>
                          Executing query...
                        </div>
                      )}

                      {/* Current Input */}
                      {!isExecuting && (
                        <div className="flex items-start">
                          <span className="text-green-400 flex-shrink-0">user@discovery:~$ </span>
                          <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                executeQuery()
                              }
                            }}
                            className="flex-1 bg-transparent text-green-400 outline-none border-none resize-none overflow-hidden"
                            placeholder=""
                            rows={1}
                            autoFocus
                          />
                        </div>
                      )}
                    </div>

                    {/* Results Section - Slides up when available */}
                    {showResults && (
                      <div className="border-t border-gray-700 bg-gray-900">
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">Query Results ({mockResults.length} rows)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setResultsExpanded(!resultsExpanded)}
                              className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                            >
                              {resultsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {resultsExpanded && (
                          <div className="border-t border-gray-700 p-4 bg-black">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-700">
                                    <th className="text-left p-2 text-gray-300">Contractor Name</th>
                                    <th className="text-left p-2 text-gray-300">UEI</th>
                                    <th className="text-left p-2 text-gray-300">Total Obligated</th>
                                    <th className="text-left p-2 text-gray-300">Contracts</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {mockResults.map((row, index) => (
                                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30">
                                      <td className="p-2 text-white">{row.contractor_name}</td>
                                      <td className="p-2 text-gray-400 font-mono text-xs">{row.uei}</td>
                                      <td className="p-2 text-green-400">{formatCurrency(row.total_obligated)}</td>
                                      <td className="p-2 text-blue-400">{row.contract_count}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Terminal Controls */}
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>Press <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-300">Enter</kbd> to execute</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={executeQuery}
                        disabled={!input.trim() || isExecuting}
                        className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 rounded transition-all disabled:opacity-50"
                      >
                        <Play className="w-3 h-3" />
                        Execute
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Tools Panel */}
            <div className="col-span-2">
              <div className="border border-gray-700/50 rounded-xl p-4" style={{ backgroundColor: '#111726' }}>
                <h3 className="text-sm font-medium text-gray-300 mb-4">Tools</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50 rounded text-xs transition-all">
                    <Database className="w-3 h-3" />
                    Schema Browser
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50 rounded text-xs transition-all">
                    <Sparkles className="w-3 h-3" />
                    Query Builder
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50 rounded text-xs transition-all">
                    <Eye className="w-3 h-3" />
                    Export Options
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50 rounded text-xs transition-all">
                    <Settings className="w-3 h-3" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="container mx-auto px-6 mt-6">
          <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Enhanced Fixed Terminal Mode</span>
              </div>
              <div>Terminal expands with content</div>
              <div>Results integrated inline</div>
            </div>
            <div className="flex items-center gap-2">
              <span>Last query: {showResults ? '67ms' : 'None'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}