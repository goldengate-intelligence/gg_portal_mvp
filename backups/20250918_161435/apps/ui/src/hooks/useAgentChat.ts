import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'agent';
  timestamp: Date;
  type: 'text' | 'data' | 'action' | 'error';
  metadata?: {
    contractors?: string[];
    searchQuery?: string;
    filterApplied?: boolean;
    actionType?: string;
    data?: any;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  sessionId: string;
}

export interface AgentChatHook {
  // State
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  sessionId: string;
  
  // Actions
  sendMessage: (content: string, metadata?: ChatMessage['metadata']) => Promise<void>;
  clearChat: () => void;
  resendLastMessage: () => Promise<void>;
  
  // UI Actions
  executeAgentAction: (actionType: string, data: any) => Promise<void>;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  content: "Hi! I'm Midas, your GoldenGate AI agent. I can help you:\n\n• Find and research contractors\n• Analyze market data and trends\n• Manage your portfolio\n• Generate reports and insights\n\nWhat would you like to explore today?",
  role: 'agent',
  timestamp: new Date(),
  type: 'text'
};

export function useAgentChat(): AgentChatHook {
  const [state, setState] = useState<ChatState>({
    messages: [INITIAL_MESSAGE],
    isTyping: false,
    isConnected: true, // Simulated connection
    sessionId: `session_${Date.now()}`
  });
  
  const lastUserMessageRef = useRef<string>('');

  const addMessage = useCallback((message: ChatMessage) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  const setTyping = useCallback((isTyping: boolean) => {
    setState(prev => ({
      ...prev,
      isTyping
    }));
  }, []);

  // Simulate API call to agent service
  const callAgentAPI = async (
    userMessage: string, 
    metadata?: ChatMessage['metadata']
  ): Promise<ChatMessage> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const response = generateAgentResponse(userMessage, metadata);
    
    return {
      id: `agent_${Date.now()}`,
      content: response.content,
      role: 'agent',
      timestamp: new Date(),
      type: response.type,
      metadata: response.metadata
    };
  };

  const sendMessage = useCallback(async (
    content: string, 
    metadata?: ChatMessage['metadata']
  ) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
      type: 'text',
      metadata
    };

    // Store for potential resend
    lastUserMessageRef.current = content.trim();

    // Add user message
    addMessage(userMessage);
    
    // Set typing indicator
    setTyping(true);

    try {
      // Get agent response
      const agentResponse = await callAgentAPI(content, metadata);
      addMessage(agentResponse);
    } catch (error) {
      // Handle error
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        role: 'agent',
        timestamp: new Date(),
        type: 'error'
      };
      addMessage(errorMessage);
    } finally {
      setTyping(false);
    }
  }, [addMessage, setTyping]);

  const clearChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [INITIAL_MESSAGE],
      isTyping: false
    }));
  }, []);

  const resendLastMessage = useCallback(async () => {
    if (lastUserMessageRef.current) {
      await sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  const executeAgentAction = useCallback(async (actionType: string, data: any) => {
    const actionMessage: ChatMessage = {
      id: `action_${Date.now()}`,
      content: `Executing ${actionType}...`,
      role: 'agent',
      timestamp: new Date(),
      type: 'action',
      metadata: {
        actionType,
        data
      }
    };

    addMessage(actionMessage);

    // Simulate action execution
    setTimeout(() => {
      const resultMessage: ChatMessage = {
        id: `result_${Date.now()}`,
        content: `Action "${actionType}" completed successfully!`,
        role: 'agent',
        timestamp: new Date(),
        type: 'text'
      };
      addMessage(resultMessage);
    }, 2000);
  }, [addMessage]);

  return {
    messages: state.messages,
    isTyping: state.isTyping,
    isConnected: state.isConnected,
    sessionId: state.sessionId,
    sendMessage,
    clearChat,
    resendLastMessage,
    executeAgentAction
  };
}

// Agent response generation logic
function generateAgentResponse(
  userInput: string, 
  metadata?: ChatMessage['metadata']
): { content: string; type: ChatMessage['type']; metadata?: ChatMessage['metadata'] } {
  const input = userInput.toLowerCase();
  
  // Contractor search queries
  if (input.includes('find') || input.includes('search') || input.includes('contractor')) {
    if (input.includes('defense') || input.includes('aerospace') || input.includes('military')) {
      return {
        content: "I found several defense contractors that might interest you. Let me show you the top ones:\n\n• Lockheed Martin - Prime defense contractor\n• Raytheon Technologies - Aerospace & defense\n• General Dynamics - Defense systems\n\nWould you like me to filter by location, contract size, or specific capabilities?",
        type: 'data',
        metadata: {
          contractors: ['lockheed-martin', 'raytheon', 'general-dynamics'],
          searchQuery: 'defense contractors'
        }
      };
    }
    
    if (input.includes('small') || input.includes('sba')) {
      return {
        content: "I can help you find small businesses! Are you looking for:\n\n• Small disadvantaged businesses (SDB)\n• Woman-owned small businesses (WOSB)\n• HUBZone certified companies\n• Service-disabled veteran-owned businesses (SDVOSB)\n\nOr would you like me to search by industry or location?",
        type: 'text'
      };
    }
    
    return {
      content: "I can help you search for contractors! Try being more specific:\n\n• \"Find cybersecurity contractors in Virginia\"\n• \"Show me small businesses in construction\"\n• \"Defense contractors with $10M+ contracts\"\n\nWhat type of contractors are you looking for?",
      type: 'text'
    };
  }
  
  // Portfolio management
  if (input.includes('portfolio') || input.includes('list') || input.includes('save')) {
    return {
      content: "I can help you organize your contractor portfolio! You can:\n\n• Create themed lists (\"Q1 Prospects\", \"Competitors\")\n• Add notes and ratings to contractors\n• Set up alerts for contract changes\n• Share lists with your team\n\nWould you like me to help you create a new list or organize existing contractors?",
      type: 'text'
    };
  }
  
  // Data analysis
  if (input.includes('analysis') || input.includes('report') || input.includes('trend')) {
    return {
      content: "I can generate powerful insights from contractor data:\n\n📊 **Market Analysis**\n• Industry trends and growth patterns\n• Agency spending analysis\n• Competitive landscape mapping\n\n📈 **Performance Metrics**\n• Contract win rates\n• Revenue trends\n• Risk assessments\n\nWhat kind of analysis would be most valuable for you?",
      type: 'data'
    };
  }
  
  // Specific agencies
  if (input.includes('dod') || input.includes('department of defense')) {
    return {
      content: "The Department of Defense is the largest federal contracting agency. I can show you:\n\n• Top DoD contractors by spending\n• Emerging opportunities in defense tech\n• Small business set-aside programs\n• Recent contract awards\n\nWhat DoD information interests you most?",
      type: 'data',
      metadata: {
        searchQuery: 'DoD contractors'
      }
    };
  }
  
  // Help and greetings
  if (input.includes('help') || input.includes('hello') || input.includes('hi') || input.includes('what can you do')) {
    return {
      content: "I'm your AI assistant for federal contractor intelligence! Here's what I can help with:\n\n🔍 **Research & Discovery**\n• Find contractors by industry, location, size\n• Analyze contract history and performance\n• Identify partnership opportunities\n\n📊 **Data & Analytics**\n• Market trend analysis\n• Competitive intelligence\n• Custom reports and insights\n\n📁 **Portfolio Management**\n• Organize contractor lists\n• Track favorites and prospects\n• Team collaboration tools\n\nJust ask me naturally - like \"Find cybersecurity companies in Texas\" or \"Show me defense spending trends\"!",
      type: 'text'
    };
  }
  
  // Default response
  return {
    content: "I understand you're interested in federal contractor intelligence! I can help with:\n\n• Finding specific contractors\n• Analyzing market data\n• Managing your portfolio\n• Generating reports\n\nCould you tell me more about what you're looking for? For example:\n• \"Find contractors in [industry/location]\"\n• \"Analyze spending trends for [agency]\"\n• \"Help me organize my contractor research\"",
    type: 'text'
  };
}