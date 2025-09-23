import React, { useState, useEffect, useRef } from 'react'
import { Brain, BarChart3, Download, Settings, X, Play, Database, Sparkles, Eye, Maximize2, Minimize2, Move } from 'lucide-react'

/**
 * UI ITERATION 2: FLOATING TERMINAL WITH CONTEXTUAL RESULTS
 * - Terminal floats like Claude Code
 * - Can be moved around the screen
 * - Results appear in dedicated areas
 * - Background shows data context
 * - Terminal can be minimized/maximized
 */

export function UIIteration2() {
  const [input, setInput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [terminalPosition, setTerminalPosition] = useState({ x: 50, y: 50 })
  const [terminalMinimized, setTerminalMinimized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'ai', content: string}>>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

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
        content: `Found ${mockResults.length} contractors matching your query.`
      }])
      setShowResults(true)
      setIsExecuting(false)
    }, 800)
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    return `$${amount.toLocaleString()}`
  }

  // Handle terminal dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return
    setIsDragging(true)
    const rect = terminalRef.current?.getBoundingClientRect()
    const offsetX = e.clientX - (rect?.left || 0)
    const offsetY = e.clientY - (rect?.top || 0)

    const handleMouseMove = (e: MouseEvent) => {
      setTerminalPosition({
        x: e.clientX - offsetX,
        y: e.clientY - offsetY
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 text-white relative overflow-hidden">
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

      {/* Background Data Context */}
      <div className="absolute inset-0 z-1 p-6">
        <div className="grid grid-cols-3 gap-6 h-full">
          {/* Database Schema Panel */}
          <div className="border border-gray-700/30 rounded-xl p-6 bg-gray-900/20 backdrop-blur-sm">
            <h2 className="text-xl text-gray-300 mb-4 font-medium">Database Schema</h2>
            <div className="space-y-4">
              <div className="bg-black/20 border border-gray-700 rounded-lg p-3">
                <div className="text-orange-400 font-medium mb-2">contractors</div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>• contractor_name (VARCHAR)</div>
                  <div>• uei (VARCHAR)</div>
                  <div>• total_obligated (NUMERIC)</div>
                  <div>• contract_count (INTEGER)</div>
                </div>
              </div>
              <div className="bg-black/20 border border-gray-700 rounded-lg p-3">
                <div className="text-orange-400 font-medium mb-2">contracts</div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>• contract_id (VARCHAR)</div>
                  <div>• contractor_uei (VARCHAR)</div>
                  <div>• agency (VARCHAR)</div>
                  <div>• amount (NUMERIC)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel - Hidden until query executes */}
          <div className={`border border-gray-700/30 rounded-xl p-6 bg-gray-900/20 backdrop-blur-sm transition-opacity duration-500 ${showResults ? 'opacity-100' : 'opacity-30'}`}>
            <h2 className="text-xl text-gray-300 mb-4 font-medium">Query Results</h2>
            {showResults ? (
              <div className="space-y-3">
                {mockResults.map((row, index) => (
                  <div key={index} className="bg-black/20 border border-gray-700 rounded-lg p-3 hover:border-orange-500/30 transition-colors">
                    <div className="text-white font-medium text-sm mb-1">{row.contractor_name}</div>
                    <div className="text-xs text-gray-400 mb-2">{row.uei}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 text-sm">{formatCurrency(row.total_obligated)}</span>
                      <span className="text-blue-400 text-sm">{row.contract_count} contracts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Execute a query to see results</p>
              </div>
            )}
          </div>

          {/* Analytics Panel */}
          <div className="border border-gray-700/30 rounded-xl p-6 bg-gray-900/20 backdrop-blur-sm">
            <h2 className="text-xl text-gray-300 mb-4 font-medium">Live Analytics</h2>
            <div className="space-y-4">
              <div className="bg-black/20 border border-gray-700 rounded-lg p-3">
                <div className="text-orange-400 text-sm mb-1">Total Records</div>
                <div className="text-2xl text-white font-medium">1,247,328</div>
              </div>
              <div className="bg-black/20 border border-gray-700 rounded-lg p-3">
                <div className="text-orange-400 text-sm mb-1">Active Contractors</div>
                <div className="text-2xl text-white font-medium">89,456</div>
              </div>
              <div className="bg-black/20 border border-gray-700 rounded-lg p-3">
                <div className="text-orange-400 text-sm mb-1">Query Performance</div>
                <div className="text-2xl text-white font-medium">{showResults ? '67ms' : '--'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Terminal */}
      <div
        ref={terminalRef}
        className={`fixed z-50 transition-all duration-200 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          left: `${terminalPosition.x}px`,
          top: `${terminalPosition.y}px`,
          width: terminalMinimized ? '300px' : '600px',
          height: terminalMinimized ? '50px' : '400px'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="border border-orange-500/50 rounded-xl overflow-hidden bg-gray-900/95 backdrop-blur-md shadow-2xl">
          {/* Terminal Header */}
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between cursor-move">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="ml-3 text-gray-300 text-sm">Goldengate Terminal</span>
            </div>
            <div className="flex items-center gap-2 no-drag">
              <button
                onClick={() => setTerminalMinimized(!terminalMinimized)}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {terminalMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <Move className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Terminal Body */}
          {!terminalMinimized && (
            <div className="bg-black p-4 terminal-font text-sm h-80 overflow-y-auto no-drag">
              {/* Header Info */}
              <div className="text-gray-500 mb-4">
                <div>Goldengate Terminal v2.1.0 - Floating Mode</div>
                <div>Connected to Snowflake database.</div>
              </div>

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
          )}

          {/* Terminal Footer Controls */}
          {!terminalMinimized && (
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between no-drag">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Floating Terminal Mode</span>
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
          )}
        </div>
      </div>

      {/* Status Overlay */}
      <div className="fixed bottom-6 left-6 z-40">
        <div className="bg-gray-900/90 border border-gray-700 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Floating Terminal Mode</span>
            </div>
            <div>Drag to reposition</div>
            <div>Results appear in context</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Overlay */}
      <div className="fixed top-6 right-6 z-40">
        <div className="bg-gray-900/90 border border-gray-700 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-orange-400 transition-colors">
              <Database className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-orange-400 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-orange-400 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}