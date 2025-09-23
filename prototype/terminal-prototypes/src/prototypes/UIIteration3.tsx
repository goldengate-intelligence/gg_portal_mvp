import React, { useState, useEffect, useRef } from 'react'
import { Brain, BarChart3, Download, Settings, X, Play, Database, Sparkles, Eye, ChevronRight, Table, TrendingUp } from 'lucide-react'

/**
 * UI ITERATION 3: SPLIT-VIEW WITH PERSISTENT TERMINAL
 * - Terminal takes left half permanently
 * - Results and tools on right half
 * - Multiple tabs in results area
 * - Always visible, no hiding
 * - More like an IDE layout
 */

export function UIIteration3() {
  const [input, setInput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState<'results' | 'schema' | 'history' | 'exports'>('results')
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'ai', content: string, timestamp?: Date}>>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const mockResults = [
    { contractor_name: 'Advanced Systems Corp', uei: 'ADV123456789', total_obligated: 45600000, contract_count: 23, primary_agency: 'DEPT OF DEFENSE' },
    { contractor_name: 'Precision Manufacturing LLC', uei: 'PRE987654321', total_obligated: 32100000, contract_count: 67, primary_agency: 'DEPT OF NAVY' },
    { contractor_name: 'Tech Solutions Inc', uei: 'TEX555666777', total_obligated: 78200000, contract_count: 45, primary_agency: 'DEPT OF AIR FORCE' },
    { contractor_name: 'Engineering Services Corp', uei: 'ENG888999000', total_obligated: 156000000, contract_count: 12, primary_agency: 'DEPT OF DEFENSE' },
    { contractor_name: 'Systems Integration LLC', uei: 'SYS111222333', total_obligated: 91500000, contract_count: 34, primary_agency: 'GENERAL SERVICES ADMIN' }
  ]

  const mockSchema = {
    tables: [
      { name: 'contractors', columns: ['contractor_name', 'uei', 'total_obligated', 'contract_count', 'primary_agency', 'industry'] },
      { name: 'contracts', columns: ['contract_id', 'contractor_uei', 'agency', 'amount', 'start_date', 'end_date'] },
      { name: 'agencies', columns: ['agency_code', 'agency_name', 'department', 'budget'] }
    ]
  }

  const executeQuery = () => {
    if (!input.trim()) return

    setConversation(prev => [...prev, { type: 'user', content: input, timestamp: new Date() }])
    setIsExecuting(true)
    setInput('')

    setTimeout(() => {
      setConversation(prev => [...prev, {
        type: 'ai',
        content: `Query executed successfully. Found ${mockResults.length} contractors matching your criteria.`,
        timestamp: new Date()
      }])
      setShowResults(true)
      setActiveTab('results')
      setIsExecuting(false)
    }, 800)
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    return `$${amount.toLocaleString()}`
  }

  const tabs = [
    { id: 'results' as const, name: 'Results', icon: BarChart3, count: showResults ? mockResults.length : 0 },
    { id: 'schema' as const, name: 'Schema', icon: Database, count: mockSchema.tables.length },
    { id: 'history' as const, name: 'History', icon: TrendingUp, count: conversation.filter(m => m.type === 'user').length },
    { id: 'exports' as const, name: 'Exports', icon: Download, count: 0 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/20 border border-[#F97316]/40 rounded-lg">
            <Brain className="w-6 h-6 text-[#F97316]" />
          </div>
          <div>
            <h1 className="text-2xl text-white font-light">Discovery Engine</h1>
            <p className="text-[#F97316] text-xs tracking-wide">
              UI ITERATION 3: SPLIT-VIEW • PERSISTENT TERMINAL • IDE-STYLE LAYOUT
            </p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Side - Terminal (50%) */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          {/* Terminal Header */}
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-300 text-sm font-medium">Goldengate Terminal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Connected</span>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 bg-black p-4 terminal-font text-sm overflow-y-auto">
            {/* Initial Info */}
            <div className="text-gray-500 mb-4">
              <div>Goldengate Terminal v2.1.0 - Split View Mode</div>
              <div>Connected to Snowflake database cluster.</div>
              <div>Type queries or use natural language.</div>
              <div className="mb-2">───────────────────────────────────────</div>
            </div>

            {/* Conversation History */}
            {conversation.map((msg, index) => (
              <div key={index} className="mb-3">
                {msg.type === 'user' ? (
                  <div className="text-green-400">
                    <span className="text-green-400">user@discovery:~$ </span>{msg.content}
                  </div>
                ) : (
                  <div className="text-white whitespace-pre-wrap leading-relaxed">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      <span className="text-xs text-gray-400">
                        {msg.timestamp?.toLocaleTimeString()}
                      </span>
                    </div>
                    {msg.content}
                  </div>
                )}
              </div>
            ))}

            {isExecuting && (
              <div className="text-yellow-400 flex items-center gap-2 mb-3">
                <div className="animate-spin w-3 h-3 border border-yellow-400 border-t-transparent rounded-full"></div>
                Executing query...
              </div>
            )}

            {/* Current Input */}
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
                disabled={isExecuting}
              />
            </div>
          </div>

          {/* Terminal Footer */}
          <div className="bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Split View Mode</span>
              <span>Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Enter</kbd> to execute</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={executeQuery}
                disabled={!input.trim() || isExecuting}
                className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 rounded text-sm transition-all disabled:opacity-50"
              >
                <Play className="w-3 h-3" />
                Execute
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Results & Tools (50%) */}
        <div className="w-1/2 flex flex-col">
          {/* Tabs */}
          <div className="bg-gray-800 border-b border-gray-700">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                  {tab.count > 0 && (
                    <span className="bg-gray-600 text-gray-200 text-xs px-1.5 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'results' && (
              <div className="h-full flex flex-col">
                {showResults ? (
                  <>
                    {/* Results Header */}
                    <div className="bg-gray-900/50 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">Query Results</span>
                        <span className="text-xs text-gray-400">({mockResults.length} rows)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Results Table */}
                    <div className="flex-1 overflow-auto bg-gray-900/20">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-800 border-b border-gray-700">
                          <tr>
                            <th className="text-left p-3 text-gray-300 font-medium">Contractor Name</th>
                            <th className="text-left p-3 text-gray-300 font-medium">UEI</th>
                            <th className="text-left p-3 text-gray-300 font-medium">Total Obligated</th>
                            <th className="text-left p-3 text-gray-300 font-medium">Contracts</th>
                            <th className="text-left p-3 text-gray-300 font-medium">Agency</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockResults.map((row, index) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                              <td className="p-3 text-white font-medium">{row.contractor_name}</td>
                              <td className="p-3 text-gray-400 font-mono text-xs">{row.uei}</td>
                              <td className="p-3 text-green-400 font-medium">{formatCurrency(row.total_obligated)}</td>
                              <td className="p-3 text-blue-400">{row.contract_count}</td>
                              <td className="p-3 text-gray-300 text-xs">{row.primary_agency}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-900/20">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Execute a query to see results</p>
                      <p className="text-xs text-gray-500 mt-2">Try: "Show defense contractors with over $50M"</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'schema' && (
              <div className="h-full bg-gray-900/20 p-4 overflow-auto">
                <div className="space-y-4">
                  {mockSchema.tables.map((table, index) => (
                    <div key={index} className="bg-black/30 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Table className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-medium">{table.name}</span>
                        <span className="text-xs text-gray-400">({table.columns.length} columns)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {table.columns.map((column, colIndex) => (
                          <div key={colIndex} className="flex items-center gap-2 text-sm p-2 bg-gray-800/30 rounded">
                            <ChevronRight className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-300">{column}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="h-full bg-gray-900/20 p-4 overflow-auto">
                <div className="space-y-3">
                  {conversation.filter(m => m.type === 'user').map((msg, index) => (
                    <div key={index} className="bg-black/30 border border-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">
                          {msg.timestamp?.toLocaleString()}
                        </span>
                        <button className="text-xs text-orange-400 hover:text-orange-300">
                          Run Again
                        </button>
                      </div>
                      <div className="text-sm text-gray-300 font-mono bg-black/30 p-2 rounded">
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {conversation.filter(m => m.type === 'user').length === 0 && (
                    <div className="text-center py-8">
                      <TrendingUp className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No query history yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'exports' && (
              <div className="h-full bg-gray-900/20 p-4">
                <div className="text-center py-8">
                  <Download className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No exports available</p>
                  <p className="text-xs text-gray-500 mt-2">Execute queries to generate exportable data</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}