import React, { useState, useEffect, useRef } from 'react'
import { Brain, Database, Search, Filter, Eye, Play, Download, Settings, ChevronRight, Table, BarChart3 } from 'lucide-react'

export function TerminalPrototype2() {
  const [input, setInput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [activeTab, setActiveTab] = useState<'query' | 'results' | 'schema'>('query')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Mock schema data
  const schema = {
    tables: [
      { name: 'contractors', columns: ['contractor_name', 'uei', 'total_obligated', 'contract_count'] },
      { name: 'contracts', columns: ['contract_id', 'contractor_uei', 'agency', 'amount'] },
      { name: 'agencies', columns: ['agency_code', 'agency_name', 'department'] }
    ]
  }

  // Mock suggestions based on input
  useEffect(() => {
    if (input.toLowerCase().includes('select')) {
      setSuggestions(['contractor_name', 'total_obligated', 'contract_count', 'primary_agency'])
    } else if (input.toLowerCase().includes('from')) {
      setSuggestions(['contractors', 'contracts', 'agencies'])
    } else {
      setSuggestions(['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY'])
    }
  }, [input])

  const mockResults = [
    { contractor_name: 'Advanced Systems Corp', uei: 'ADV123456789', total_obligated: 45600000, contract_count: 23 },
    { contractor_name: 'Precision Manufacturing LLC', uei: 'PRE987654321', total_obligated: 32100000, contract_count: 67 },
    { contractor_name: 'Tech Solutions Inc', uei: 'TEX555666777', total_obligated: 78200000, contract_count: 45 }
  ]

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    return `$${amount.toLocaleString()}`
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/40 rounded-xl backdrop-blur-sm">
            <Brain className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-4xl text-white font-light">
              Goldengate Terminal
            </h1>
            <p className="text-orange-500 text-sm tracking-wide">
              PROTOTYPE 2: SPLIT SCREEN • LIVE PREVIEW • SCHEMA BROWSER
            </p>
          </div>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-2 gap-6 h-[600px]">
        {/* Left Side - Query Input */}
        <div className="border border-gray-700/50 rounded-xl overflow-hidden" style={{ backgroundColor: '#111726' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>

          <div className="relative z-10 h-full flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('query')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'query'
                    ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Query
                </div>
              </button>
              <button
                onClick={() => setActiveTab('schema')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'schema'
                    ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Schema
                </div>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              {activeTab === 'query' && (
                <div className="h-full flex flex-col">
                  {/* Query Input */}
                  <div className="flex-1 mb-4">
                    <div className="bg-black border border-gray-700 rounded-lg h-full p-4">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full h-full bg-transparent text-green-400 outline-none border-none resize-none terminal-font text-sm"
                        placeholder="-- Enter SQL query or natural language
SELECT contractor_name, total_obligated
FROM contractors
WHERE total_obligated > 50000000
ORDER BY total_obligated DESC;"
                        style={{
                          lineHeight: '1.4',
                        }}
                      />
                    </div>
                  </div>

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">Suggestions:</div>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setInput(prev => prev + suggestion + ' ')}
                            className="px-2 py-1 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-600/50 rounded text-xs transition-all"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-300">Ctrl+Enter</kbd>
                      <span>to execute</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50 rounded text-xs transition-all">
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                      <button
                        disabled={!input.trim() || isExecuting}
                        className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 rounded text-xs transition-all disabled:opacity-50"
                      >
                        <Play className="w-3 h-3" />
                        Execute
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schema' && (
                <div className="h-full">
                  <div className="space-y-4">
                    {schema.tables.map((table, index) => (
                      <div key={index} className="bg-black/30 border border-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Table className="w-4 h-4 text-orange-400" />
                          <span className="text-white font-medium">{table.name}</span>
                        </div>
                        <div className="space-y-1">
                          {table.columns.map((column, colIndex) => (
                            <div key={colIndex} className="flex items-center gap-2 text-sm">
                              <ChevronRight className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-300">{column}</span>
                              <span className="text-xs text-gray-500">VARCHAR</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Live Results */}
        <div className="border border-gray-700/50 rounded-xl overflow-hidden" style={{ backgroundColor: '#111726' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>

          <div className="relative z-10 h-full flex flex-col">
            {/* Results Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-400" />
                <span className="text-white font-medium">Live Results</span>
                <span className="text-xs text-gray-400">({mockResults.length} rows)</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-black/30 border border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3 text-gray-300 font-medium">Contractor Name</th>
                      <th className="text-left p-3 text-gray-300 font-medium">UEI</th>
                      <th className="text-left p-3 text-gray-300 font-medium">Total Obligated</th>
                      <th className="text-left p-3 text-gray-300 font-medium">Contracts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockResults.map((row, index) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                        <td className="p-3 text-white">{row.contractor_name}</td>
                        <td className="p-3 text-gray-400 font-mono text-xs">{row.uei}</td>
                        <td className="p-3 text-green-400 font-medium">{formatCurrency(row.total_obligated)}</td>
                        <td className="p-3 text-blue-400">{row.contract_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Results Footer */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Query executed in 67ms</span>
                <div className="flex items-center gap-4">
                  <span>3 of 3 rows shown</span>
                  <button className="text-orange-400 hover:text-orange-300">View All</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 p-3 bg-gray-900/50 border border-gray-700 rounded-lg flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Split Screen Mode Active</span>
          </div>
          <div>Live preview enabled</div>
        </div>
        <div className="flex items-center gap-2">
          <span>Auto-refresh: ON</span>
        </div>
      </div>
    </div>
  )
}