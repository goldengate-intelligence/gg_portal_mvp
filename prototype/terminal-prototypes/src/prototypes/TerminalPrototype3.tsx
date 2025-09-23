import React, { useState, useEffect, useRef } from 'react'
import { Brain, Zap, Eye, TrendingUp, Search, Clock, CheckCircle, AlertCircle, Play, Sparkles } from 'lucide-react'

export function TerminalPrototype3() {
  const [input, setInput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [livePreview, setLivePreview] = useState<any[]>([])
  const [queryAnalysis, setQueryAnalysis] = useState<string>('')
  const [executionTime, setExecutionTime] = useState<number>(0)
  const [showOptimization, setShowOptimization] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Live preview updates as user types
  useEffect(() => {
    if (input.toLowerCase().includes('contractors')) {
      setLivePreview([
        { contractor_name: 'Advanced Systems Corp', total_obligated: 45600000, performance: 'Strong' },
        { contractor_name: 'Precision Manufacturing LLC', total_obligated: 32100000, performance: 'Good' },
        { contractor_name: 'Tech Solutions Inc', total_obligated: 78200000, performance: 'Excellent' }
      ])
      setQueryAnalysis('Searching contractor database with performance metrics')
    } else if (input.toLowerCase().includes('defense')) {
      setLivePreview([
        { contractor_name: 'Defense Systems Corp', total_obligated: 156000000, performance: 'Excellent' },
        { contractor_name: 'Military Tech LLC', total_obligated: 89000000, performance: 'Strong' }
      ])
      setQueryAnalysis('Filtering for defense contractors')
    } else {
      setLivePreview([])
      setQueryAnalysis('')
    }
  }, [input])

  // Simulate execution time counter
  useEffect(() => {
    if (isExecuting) {
      const interval = setInterval(() => {
        setExecutionTime(prev => prev + 1)
      }, 1)
      return () => clearInterval(interval)
    }
  }, [isExecuting])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    return `$${amount.toLocaleString()}`
  }

  const executeQuery = () => {
    setIsExecuting(true)
    setExecutionTime(0)
    setTimeout(() => {
      setIsExecuting(false)
      setShowOptimization(true)
    }, 1200)
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
              PROTOTYPE 3: LIVE PREVIEW • SMART ANALYSIS • REAL-TIME OPTIMIZATION
            </p>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-12 gap-6">
        {/* Query Input - Left */}
        <div className="col-span-5">
          <div className="border border-gray-700/50 rounded-xl overflow-hidden h-[500px]" style={{ backgroundColor: '#111726' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>

            <div className="relative z-10 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-medium">Smart Query Builder</span>
                </div>
                <div className="flex items-center gap-2">
                  {isExecuting ? (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <div className="animate-spin w-3 h-3 border border-yellow-400 border-t-transparent rounded-full"></div>
                      <span className="text-xs">{executionTime}ms</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs">Ready</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Area */}
              <div className="flex-1 p-4">
                <div className="h-full">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-32 bg-black border border-gray-700 rounded-lg p-4 text-green-400 outline-none resize-none terminal-font text-sm"
                    placeholder="Try: 'Show me defense contractors with over $50M in contracts'
or: 'SELECT * FROM contractors WHERE industry = 'aerospace''
"
                    style={{ lineHeight: '1.4' }}
                  />

                  {/* Analysis */}
                  {queryAnalysis && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">Query Analysis</span>
                      </div>
                      <p className="text-sm text-blue-300">{queryAnalysis}</p>
                    </div>
                  )}

                  {/* Optimization Suggestions */}
                  {showOptimization && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">Optimization Tip</span>
                      </div>
                      <p className="text-sm text-green-300">
                        Consider adding an index on total_obligated for 3x faster queries
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Auto-preview enabled</span>
                  </div>
                  <button
                    onClick={executeQuery}
                    disabled={!input.trim() || isExecuting}
                    className="flex items-center gap-1 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 rounded text-sm transition-all disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    Execute Query
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview - Center */}
        <div className="col-span-4">
          <div className="border border-gray-700/50 rounded-xl overflow-hidden h-[500px]" style={{ backgroundColor: '#111726' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>

            <div className="relative z-10 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">Live Preview</span>
                  {livePreview.length > 0 && (
                    <span className="text-xs text-gray-400">({livePreview.length} rows)</span>
                  )}
                </div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 p-4 overflow-auto">
                {livePreview.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Start typing to see live preview</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {livePreview.map((row, index) => (
                      <div key={index} className="bg-black/30 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-white font-medium text-sm mb-1">
                              {row.contractor_name}
                            </div>
                            <div className="text-green-400 text-sm font-medium">
                              {formatCurrency(row.total_obligated)}
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            row.performance === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                            row.performance === 'Strong' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {row.performance}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview Stats */}
              {livePreview.length > 0 && (
                <div className="p-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">Avg Contract Value:</span>
                      <div className="text-white font-medium">
                        {formatCurrency(livePreview.reduce((sum, row) => sum + row.total_obligated, 0) / livePreview.length)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Preview Time:</span>
                      <div className="text-white font-medium">~12ms</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Insights Panel - Right */}
        <div className="col-span-3">
          <div className="border border-gray-700/50 rounded-xl overflow-hidden h-[500px]" style={{ backgroundColor: '#111726' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>

            <div className="relative z-10 h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">Smart Insights</span>
                </div>
              </div>

              {/* Insights Content */}
              <div className="flex-1 p-4 space-y-4">
                {/* Query Performance */}
                <div className="bg-black/30 border border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-green-400 font-medium">Performance</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    Query complexity: Low<br/>
                    Estimated time: &lt;100ms<br/>
                    Cache hit rate: 87%
                  </div>
                </div>

                {/* Data Quality */}
                <div className="bg-black/30 border border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-3 h-3 text-blue-400" />
                    <span className="text-sm text-blue-400 font-medium">Data Quality</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    Completeness: 94%<br/>
                    Last updated: 2 hours ago<br/>
                    Source: Verified
                  </div>
                </div>

                {/* Smart Suggestions */}
                <div className="bg-black/30 border border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span className="text-sm text-yellow-400 font-medium">Suggestions</span>
                  </div>
                  <div className="space-y-2">
                    <button className="w-full text-left text-xs text-blue-300 hover:text-blue-200 transition-colors">
                      + Add agency filter
                    </button>
                    <button className="w-full text-left text-xs text-blue-300 hover:text-blue-200 transition-colors">
                      + Include contract dates
                    </button>
                    <button className="w-full text-left text-xs text-blue-300 hover:text-blue-200 transition-colors">
                      + Group by industry
                    </button>
                  </div>
                </div>

                {/* Related Queries */}
                <div className="bg-black/30 border border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span className="text-sm text-purple-400 font-medium">Recent Queries</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">Defense contractors {'>'} $100M</div>
                    <div className="text-xs text-gray-400">Aerospace industry trends</div>
                    <div className="text-xs text-gray-400">Small business set-asides</div>
                  </div>
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
            <span>Live Preview Active</span>
          </div>
          <div>Smart analysis enabled</div>
          <div>Real-time optimization</div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3" />
          <span>AI-powered insights</span>
        </div>
      </div>
    </div>
  )
}