import React, { useState } from 'react'
import { TerminalPrototype1 } from './prototypes/TerminalPrototype1'
import { TerminalPrototype2 } from './prototypes/TerminalPrototype2'
import { TerminalPrototype3 } from './prototypes/TerminalPrototype3'
import { UIIteration1 } from './prototypes/UIIteration1'
import { UIIteration2 } from './prototypes/UIIteration2'
import { UIIteration3 } from './prototypes/UIIteration3'
import { ActualDiscoveryBase } from './prototypes/ActualDiscoveryBase'
import { DiscoveryRemix1 } from './prototypes/DiscoveryRemix1'
import { DiscoveryRemix2 } from './prototypes/DiscoveryRemix2'
import { DiscoveryRemix3 } from './prototypes/DiscoveryRemix3'
import { DiscoveryRemix4 } from './prototypes/DiscoveryRemix4'
import { DiscoveryRemix5 } from './prototypes/DiscoveryRemix5'
import { DiscoveryRemix6 } from './prototypes/DiscoveryRemix6'

const prototypes = [
  { id: 0, name: 'Original Discovery UI', component: ActualDiscoveryBase, category: 'Discovery Remixes' },
  { id: 7, name: 'Terminal Prominence', component: DiscoveryRemix1, category: 'Discovery Remixes' },
  { id: 8, name: 'Results Integration', component: DiscoveryRemix2, category: 'Discovery Remixes' },
  { id: 9, name: 'Fullscreen Workspace', component: DiscoveryRemix3, category: 'Discovery Remixes' },
  { id: 10, name: 'Popout Terminal', component: DiscoveryRemix4, category: 'Workflow Patterns' },
  { id: 11, name: 'Separate Results Page', component: DiscoveryRemix5, category: 'Workflow Patterns' },
  { id: 12, name: 'Beneath Terminal Flow', component: DiscoveryRemix6, category: 'Workflow Patterns' },
  { id: 4, name: 'Enhanced Fixed Terminal', component: UIIteration1, category: 'UI Layout' },
  { id: 5, name: 'Floating Terminal', component: UIIteration2, category: 'UI Layout' },
  { id: 6, name: 'Split-View Persistent', component: UIIteration3, category: 'UI Layout' },
  { id: 1, name: 'Claude Code Style', component: TerminalPrototype1, category: 'Functionality' },
  { id: 2, name: 'Split Screen', component: TerminalPrototype2, category: 'Functionality' },
  { id: 3, name: 'Live Preview', component: TerminalPrototype3, category: 'Functionality' }
]

function App() {
  const [activePrototype, setActivePrototype] = useState(0) // Start with Original Discovery UI
  const ActiveComponent = prototypes.find(p => p.id === activePrototype)?.component || ActualDiscoveryBase

  const discoveryRemixes = prototypes.filter(p => p.category === 'Discovery Remixes')
  const workflowPatterns = prototypes.filter(p => p.category === 'Workflow Patterns')
  const uiPrototypes = prototypes.filter(p => p.category === 'UI Layout')
  const functionalityPrototypes = prototypes.filter(p => p.category === 'Functionality')

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 text-white">
      {/* Prototype Selector */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-2 backdrop-blur-sm w-48">
          <h3 className="text-xs font-medium text-gray-300 mb-2">Prototypes</h3>

          {/* Discovery Remixes Section */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-[#F97316] mb-2 uppercase tracking-wide">Discovery UI Remixes</h4>
            <div className="space-y-1">
              {discoveryRemixes.map((prototype) => (
                <button
                  key={prototype.id}
                  onClick={() => setActivePrototype(prototype.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    activePrototype === prototype.id
                      ? 'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  {prototype.name}
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Patterns Section */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-purple-400 mb-2 uppercase tracking-wide">Workflow Patterns</h4>
            <div className="space-y-1">
              {workflowPatterns.map((prototype) => (
                <button
                  key={prototype.id}
                  onClick={() => setActivePrototype(prototype.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    activePrototype === prototype.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  {prototype.name}
                </button>
              ))}
            </div>
          </div>

          {/* UI Layout Section */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-orange-400 mb-2 uppercase tracking-wide">UI Layout Concepts</h4>
            <div className="space-y-1">
              {uiPrototypes.map((prototype) => (
                <button
                  key={prototype.id}
                  onClick={() => setActivePrototype(prototype.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    activePrototype === prototype.id
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  {prototype.name}
                </button>
              ))}
            </div>
          </div>

          {/* Functionality Section */}
          <div>
            <h4 className="text-xs font-medium text-blue-400 mb-2 uppercase tracking-wide">Functionality Concepts</h4>
            <div className="space-y-1">
              {functionalityPrototypes.map((prototype) => (
                <button
                  key={prototype.id}
                  onClick={() => setActivePrototype(prototype.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    activePrototype === prototype.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  {prototype.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Prototype */}
      <div>
        <ActiveComponent />
      </div>
    </div>
  )
}

export default App
