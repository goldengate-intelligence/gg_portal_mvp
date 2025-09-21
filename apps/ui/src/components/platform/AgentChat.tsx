import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2, Minimize2, Maximize2, Cpu, Zap, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';
import { useAgentChat } from '../../hooks/useAgentChat';
import { CONTRACTOR_DETAIL_COLORS } from '../../lib/utils';

interface AgentChatProps {
  className?: string;
  forceOpen?: boolean;
  isEmbedded?: boolean;
  onToggle?: () => void;
}

export function AgentChat({ className, forceOpen = false, isEmbedded = false, onToggle }: AgentChatProps) {
  const [isOpen, setIsOpen] = useState(forceOpen);
  const [isMinimized, setIsMinimized] = useState(isEmbedded ? true : false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { messages, isTyping, sendMessage, clearChat } = useAgentChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    setIsOpen(forceOpen);
  }, [forceOpen]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const messageContent = input.trim();
    setInput('');
    
    await sendMessage(messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Embedded mode: render expandable chat from footer
  if (isEmbedded) {
    // Don't render anything if forceOpen is false
    if (!forceOpen) {
      return null;
    }

    return (
      <div className="relative">
        {/* Expanded Chat Window */}
        {!isMinimized && (
          <div
            className="fixed bottom-0 right-0 w-[420px] h-[100vh] shadow-2xl overflow-hidden z-50 flex flex-col rounded-xl"
            style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
          >
            {/* Header */}
            <div className="border-b border-gray-700/30 p-4 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-[#D2AC38]/20 border border-[#D2AC38]/40 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-[#D2AC38]" />
                </div>
                <h3 className="text-gray-200 font-normal tracking-wider uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '16px' }}>GOLDENGATE AI</h3>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-[#D2AC38] hover:bg-gray-800/50"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-[#D2AC38] hover:bg-gray-800/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.role === 'user'
                        ? "bg-[#D2AC38]/20 text-gray-200 border border-[#D2AC38]/40"
                        : "bg-gray-800/80 text-gray-200 border border-gray-700/50"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/80 text-gray-200 border border-gray-700/50 rounded-lg px-3 py-2 text-sm max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-[#D2AC38] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 bg-[#D2AC38] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 bg-[#D2AC38] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-700/30 p-4 flex-shrink-0" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}>
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything"
                  className="flex-1 bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-[#D2AC38]/50 focus:ring-1 focus:ring-[#D2AC38]/50 backdrop-blur-sm"
                />
                <Button
                  onClick={() => setIsMinimized(true)}
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-300 border border-gray-600/50 h-10 w-10 p-0 rounded-lg"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                  className="bg-[#D2AC38]/20 hover:bg-[#D2AC38]/30 text-[#D2AC38] border border-[#D2AC38]/40 hover:border-[#D2AC38]/60 h-10 w-10 p-0 rounded-lg transition-all duration-200"
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Minimized Chat Bar in Footer */}
        <div
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 h-10 px-3 rounded-lg border border-[#D2AC38]/40 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 relative overflow-hidden"
          style={{
            backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor,
            background: `linear-gradient(90deg, transparent, rgba(210, 172, 56, 0.02), transparent), ${CONTRACTOR_DETAIL_COLORS.panelColor}`,
            backgroundSize: '300% 100%',
            animation: 'shimmer 8s ease-in-out infinite'
          }}
        >
          <style jsx>{`
            @keyframes shimmer {
              0% { background-position: -300% 0; }
              50% { background-position: 300% 0; }
              100% { background-position: -300% 0; }
            }
          `}</style>
          <div className="h-6 w-6 rounded bg-[#D2AC38]/20 border border-[#D2AC38]/40 flex items-center justify-center">
            <MessageSquare className="h-3 w-3 text-[#D2AC38]" />
          </div>
          <span className="text-gray-300 text-sm font-light uppercase" style={{ fontFamily: 'Genos, sans-serif' }}>AI ANALYSIS</span>
        </div>
      </div>
    );
  }

  // Non-embedded floating chat - should not render when embedded
  return null;
}