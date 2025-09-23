import React, { useState, useEffect, useRef } from 'react'
import { Brain, Database, Target, Settings, Download, BarChart3, X, Play, Zap, Clock } from 'lucide-react'

interface Message {
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  executionTime?: number
}

interface QueryResult {
  columns: string[]
  data: any[]
  rowCount: number
  executionTime: number
}

export function TerminalPrototype1() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentResults, setCurrentResults] = useState<QueryResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const executeQuery = async () => {
    if (!input.trim() || isExecuting) return

    const userMessage: Message = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsExecuting(true)
    setInput('')

    // Simulate instant response start with streaming
    const startTime = Date.now()

    // Add system message immediately
    const systemMessage: Message = {
      type: 'system',
      content: 'Executing query...',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, systemMessage])

    // Simulate quick database response (like Claude Code speed)
    setTimeout(() => {
      const endTime = Date.now()
      const executionTime = endTime - startTime

      // Mock query results
      const results: QueryResult = {
        columns: ['CONTRACTOR_NAME', 'UEI', 'TOTAL_OBLIGATED', 'CONTRACT_COUNT', 'PRIMARY_AGENCY'],
        data: [
          { CONTRACTOR_NAME: 'Advanced Systems Corp', UEI: 'ADV123456789', TOTAL_OBLIGATED: 45600000, CONTRACT_COUNT: 23, PRIMARY_AGENCY: 'DEPARTMENT OF DEFENSE' },
          { CONTRACTOR_NAME: 'Precision Manufacturing LLC', UEI: 'PRE987654321', TOTAL_OBLIGATED: 32100000, CONTRACT_COUNT: 67, PRIMARY_AGENCY: 'DEPARTMENT OF THE NAVY' },
          { CONTRACTOR_NAME: 'Tech Solutions Inc', UEI: 'TEX555666777', TOTAL_OBLIGATED: 78200000, CONTRACT_COUNT: 45, PRIMARY_AGENCY: 'DEPARTMENT OF THE AIR FORCE' }
        ],
        rowCount: 3,
        executionTime
      }

      setCurrentResults(results)
      setShowResults(true)

      // Remove system message and add AI response
      setMessages(prev => {
        const withoutSystem = prev.slice(0, -1)
        const aiMessage: Message = {
          type: 'ai',
          content: `Found ${results.rowCount} contractors matching your query. Results are displayed in the table below.`,
          timestamp: new Date(),
          executionTime
        }
        return [...withoutSystem, aiMessage]
      })

      setIsExecuting(false)
    }, 300) // Much faster than original
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      executeQuery()
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
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
              PROTOTYPE 1: CLAUDE CODE STYLE • INSTANT FEEDBACK • STREAMING RESPONSES
            </p>
          </div>
        </div>
      </div>

      {/* Terminal Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Terminal */}
        <div className="lg:col-span-2">
          <div className="border border-gray-700/50 rounded-xl overflow-hidden" style={{ backgroundColor: '#111726' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>

            <div className="p-4 relative z-10">
              {/* Terminal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="ml-3 text-gray-400 text-sm font-mono">user@goldengate:database$</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Connected</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="bg-black border border-gray-700 rounded-lg h-80 overflow-y-auto p-4 terminal-font text-sm">
                {messages.length === 0 && (
                  <div className="text-gray-500">
                    <div>Goldengate Terminal v2.1.0</div>
                    <div>Connected to Snowflake database.</div>
                    <div className="mb-4">Ready for queries...</div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div key={index} className="mb-3">
                    {message.type === 'user' && (
                      <div className="text-green-400">
                        <span className="text-green-400">user@goldengate:database$ </span>
                        {message.content}
                      </div>
                    )}
                    {message.type === 'ai' && (
                      <div className="text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 className="w-3 h-3 text-blue-400" />
                          <span className="text-xs text-gray-400">
                            Query executed in {message.executionTime}ms
                          </span>
                        </div>
                        <div>{message.content}</div>
                      </div>
                    )}
                    {message.type === 'system' && (
                      <div className="text-yellow-400 flex items-center gap-2">
                        <div className="animate-spin w-3 h-3 border border-yellow-400 border-t-transparent rounded-full"></div>
                        {message.content}
                      </div>
                    )}
                  </div>
                ))}

                {/* Current Input Line */}
                <div className="flex items-start">
                  <span className="text-green-400 flex-shrink-0">user@goldengate:database$ </span>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-green-400 outline-none border-none resize-none overflow-hidden"
                    placeholder=""
                    rows={1}
                    disabled={isExecuting}
                    style={{
                      lineHeight: '1.2',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = target.scrollHeight + 'px'
                    }}
                  />
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-300">Enter</kbd>
                  <span>to execute</span>
                  <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-300">Shift+Enter</kbd>
                  <span>for new line</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={executeQuery}
                    disabled={!input.trim() || isExecuting}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 rounded text-xs transition-all disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    Execute
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-1">
          <div className="border border-gray-700/50 rounded-xl overflow-hidden" style={{ backgroundColor: '#111726' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>

            <div className="p-4 relative z-10">
              <h3 className="text-gray-200 text-sm font-medium mb-4 uppercase tracking-wide" style={{ fontFamily: 'Genos, sans-serif' }}>
                Live Results
              </h3>

              {!showResults ? (
                <div className="text-center py-8">
                  <Database className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Execute a query to see results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Query Stats */}
                  <div className="bg-black/30 border border-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Query Performance</span>
                      <div className="flex items-center gap-1 text-xs">
                        <Zap className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">{currentResults?.executionTime}ms</span>
                      </div>
                    </div>
                    <div className="text-lg text-white font-medium">
                      {currentResults?.rowCount} rows
                    </div>
                  </div>

                  {/* Quick Preview */}
                  <div className="bg-black/30 border border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-2">Preview (first 3 rows)</div>
                    <div className="space-y-2">
                      {currentResults?.data.slice(0, 3).map((row, index) => (
                        <div key={index} className="text-xs">
                          <div className="text-white font-medium">{row.CONTRACTOR_NAME}</div>
                          <div className="text-gray-400">{formatCurrency(row.TOTAL_OBLIGATED)} • {row.CONTRACT_COUNT} contracts</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-2 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 rounded text-xs transition-all">
                      <Download className="w-3 h-3" />
                      Export CSV
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50 rounded text-xs transition-all">
                      <BarChart3 className="w-3 h-3" />
                      View Full Table
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 p-3 bg-gray-900/50 border border-gray-700 rounded-lg flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Database Connected</span>
          </div>
          <div>Last query: {currentResults ? `${currentResults.executionTime}ms` : 'None'}</div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  )
}