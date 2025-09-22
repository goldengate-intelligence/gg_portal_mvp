import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Send, 
  Copy, 
  RefreshCw,
  MessageSquare,
  ChevronRight,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { HudCard } from '../ui/hud-card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/input';
import { CONTRACTOR_DETAIL_COLORS, cn } from '../../logic/utils';
import type { Contractor, Opportunity } from '../../types';

interface AISummaryPanelProps {
  entity: Contractor | Opportunity | null;
  entityType: 'contractor' | 'opportunity';
  onClose?: () => void;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

export function AISummaryPanel({ entity, entityType, onClose }: AISummaryPanelProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  // Pre-defined quick queries
  const quickQueries = entityType === 'contractor' ? [
    'What are the key strengths of this contractor?',
    'Analyze their recent contract performance',
    'What risks should I be aware of?',
    'How do they compare to industry peers?',
    'What is their growth trajectory?',
  ] : [
    'Is this opportunity a good fit for us?',
    'What are the key requirements?',
    'Who are likely competitors?',
    'What is the win probability?',
    'What resources would we need?',
  ];

  const generateSummary = async (prompt?: string) => {
    setIsGenerating(true);
    const messageId = Date.now().toString();
    
    // Add user message if prompt provided
    if (prompt) {
      setMessages(prev => [...prev, {
        id: messageId + '-user',
        role: 'user',
        content: prompt,
        timestamp: new Date()
      }]);
    }

    // Simulate AI response generation
    setTimeout(() => {
      const response = generateAIResponse(prompt || 'Generate summary', entity, entityType);
      setMessages(prev => [...prev, {
        id: messageId,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
      setIsGenerating(false);
    }, 1500);
  };

  const generateAIResponse = (prompt: string, entity: any, type: string): string => {
    if (!entity) return 'No entity data available for analysis.';

    if (type === 'contractor') {
      const contractor = entity as Contractor;
      
      if (prompt.toLowerCase().includes('strength')) {
        return `Based on my analysis of ${contractor.name}:

**Key Strengths:**
• Strong past performance score of ${contractor.pastPerformanceScore}/100
• Established presence in ${contractor.industry} sector
• ${contractor.lifecycleStage} stage contractor with proven track record
• Total contract value of $${((contractor.totalContractValue || 0) / 1000000).toFixed(1)}M demonstrates financial stability

**Competitive Advantages:**
• ${contractor.businessMomentum} business momentum indicates ${(contractor.businessMomentum as any) === 'growing' ? 'positive growth trajectory' : 'stable market position'}
• Located in ${contractor.location}, providing strategic geographic advantage
• ${contractor.ownershipType} ownership structure enables flexible contracting options`;
      }

      if (prompt.toLowerCase().includes('risk')) {
        return `**Risk Assessment for ${contractor.name}:**

⚠️ **Potential Risks:**
• Concentration risk if heavily dependent on single agency contracts
• ${(contractor.lifecycleStage as any) === 'mature' ? 'Mature stage may indicate limited growth potential' : 'Growth stage may indicate operational scaling challenges'}
• Industry sector ${contractor.industry} facing ${Math.random() > 0.5 ? 'increased competition' : 'regulatory changes'}

✅ **Risk Mitigation Factors:**
• Past performance score of ${contractor.pastPerformanceScore}/100 indicates reliable delivery
• Diversified contract portfolio worth $${((contractor.totalContractValue || 0) / 1000000).toFixed(1)}M
• ${(contractor.businessMomentum as any) === 'growing' ? 'Positive growth momentum' : 'Stable business operations'}

**Overall Risk Level:** ${(contractor.pastPerformanceScore || 0) > 80 ? 'Low' : (contractor.pastPerformanceScore || 0) > 60 ? 'Medium' : 'High'}`;
      }

      return `**Executive Summary for ${contractor.name}**

${contractor.name} is a ${contractor.lifecycleStage} stage ${contractor.ownershipType} contractor specializing in ${contractor.industry}. With a total contract value of $${((contractor.totalContractValue || 0) / 1000000).toFixed(1)}M and a past performance score of ${contractor.pastPerformanceScore}/100, they demonstrate strong capabilities in federal contracting.

**Key Metrics:**
• UEI: ${contractor.uei}
• Location: ${contractor.location}
• Business Momentum: ${contractor.businessMomentum}
• Lifecycle Stage: ${contractor.lifecycleStage}

**Strategic Insights:**
The contractor shows ${(contractor.businessMomentum as any) === 'growing' ? 'positive growth indicators' : 'stable performance metrics'} with opportunities for ${(contractor.lifecycleStage as any) === 'emerging' ? 'rapid expansion' : 'strategic partnerships'}.`;
    } else {
      const opportunity = entity as Opportunity;
      
      if (prompt.toLowerCase().includes('fit')) {
        return `**Opportunity Fit Analysis for ${opportunity.title}**

✅ **Positive Indicators:**
• Contract value of $${(opportunity.totalValue / 1000000).toFixed(1)}M aligns with typical project scope
• ${opportunity.type} contract type provides ${opportunity.type === 'AWD' ? 'immediate award opportunity' : 'long-term vehicle access'}
• ${opportunity.competitionLevel} competition level ${opportunity.competitionLevel === 'full-open' ? 'allows broad participation' : 'may limit competitors'}

⚠️ **Considerations:**
• Response deadline: ${opportunity.responseDeadline ? new Date(opportunity.responseDeadline).toLocaleDateString() : 'Not specified'}
• Risk level assessed as: ${opportunity.riskLevel}
• Agency: ${opportunity.agency} ${opportunity.subAgency ? `(${opportunity.subAgency})` : ''}

**Recommendation:** ${opportunity.riskLevel === 'low' || opportunity.riskLevel === 'medium' ? 'Pursue with standard bid approach' : 'Carefully evaluate resource requirements'}`;
      }

      return `**Opportunity Intelligence Brief**

${opportunity.title} (${opportunity.piid}) is a ${opportunity.type} opportunity from ${opportunity.agency} with a total value of $${(opportunity.totalValue / 1000000).toFixed(1)}M.

**Key Details:**
• Posted: ${new Date(opportunity.postedDate).toLocaleDateString()}
• Response Due: ${opportunity.responseDeadline ? new Date(opportunity.responseDeadline).toLocaleDateString() : 'TBD'}
• Competition Level: ${opportunity.competitionLevel}
• Risk Assessment: ${opportunity.riskLevel}

**Strategic Analysis:**
${opportunity.description}

**AI Recommendation:** This opportunity presents a ${opportunity.riskLevel === 'low' ? 'strong' : opportunity.riskLevel === 'medium' ? 'moderate' : 'challenging'} bid opportunity with ${opportunity.competitionLevel === 'full-open' ? 'open competition' : 'limited competitor pool'}.`;
    }
  };

  const handleSendQuery = () => {
    if (query.trim() && !isGenerating) {
      generateSummary(query);
      setQuery('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!entity) {
    return (
      <HudCard variant="default" priority="medium" className="border-gray-700/30">
        <div className="py-8 text-center" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
          <AlertCircle className="h-8 w-8 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Select an entity to view AI insights</p>
        </div>
      </HudCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <HudCard variant="default" priority="high" className="border-gray-700/30">
        <div className="p-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-yellow-500" />
              <h3 className="text-gray-200 font-normal tracking-wider uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '16px' }}>
                AI Intelligence Assistant
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
              <span className="text-[10px] text-yellow-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                GPT-4 POWERED
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Analyzing {entityType === 'contractor' ? (entity as Contractor).name : (entity as Opportunity).title}
          </p>
        </div>
      </HudCard>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <HudCard variant="default" priority="medium" className="border-gray-700/30">
          <div className="p-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
            <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500 mb-3">
              Quick Insights
            </h4>
            <div className="space-y-2">
              {quickQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => generateSummary(query)}
                  disabled={isGenerating}
                  className="w-full text-left p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-colors flex items-center justify-between group border border-gray-700/50"
                >
                  <span className="text-sm text-gray-300">{query}</span>
                  <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-yellow-500 transition-colors" />
                </button>
              ))}
              <button
                onClick={() => generateSummary()}
                disabled={isGenerating}
                className="w-full p-3 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/50 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">Generate Full Analysis</span>
              </button>
            </div>
          </div>
        </HudCard>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <HudCard variant="default" priority="medium" className="border-gray-700/30 max-h-96 overflow-y-auto">
          <div className="p-4 space-y-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                )}
                <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30'
                        : 'bg-black/40 text-gray-300 border border-gray-700/50'
                    }`}
                  >
                    {message.isGenerating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Analyzing...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 pt-2 border-t border-yellow-500/20">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => generateSummary('Provide more details')}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isGenerating && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 rounded-lg bg-black/40 border border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                      <span className="text-sm text-gray-400">Generating insights...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </HudCard>
      )}

      {/* Query Input */}
      <HudCard variant="default" priority="medium" className="border-gray-700/30">
        <div className="p-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
          <div className="flex gap-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="flex-1 min-h-[60px] resize-none bg-black/20 border-gray-700/50 text-gray-300 placeholder-gray-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendQuery();
                }
              }}
            />
            <Button
              onClick={handleSendQuery}
              disabled={!query.trim() || isGenerating}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </HudCard>
    </div>
  );
}