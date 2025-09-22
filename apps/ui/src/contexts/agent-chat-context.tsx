import React, { createContext, useContext, useState, useCallback } from 'react';

interface AgentChatContextValue {
  isOpen: boolean;
  entityContext: {
    entityId?: string;
    entityName?: string;
    entityType?: string;
  } | null;

  open: (context: { entityId: string; entityName: string; entityType: string }) => void;
  openWithContext: (entityId: string, entityName: string, entityType: string) => void;
  close: () => void;
  sendCustomMessage: (message: string) => void;
}

const AgentChatContext = createContext<AgentChatContextValue | undefined>(undefined);

export function AgentChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [entityContext, setEntityContext] = useState<AgentChatContextValue['entityContext']>(null);
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  const open = useCallback((context: { entityId: string; entityName: string; entityType: string }) => {
    console.log('AgentChatContext.open called with:', context);
    setEntityContext(context);
    setIsOpen(true);
    console.log('AgentChatContext state updated - isOpen:', true);
  }, []);

  const openWithContext = useCallback((entityId: string, entityName: string, entityType: string) => {
    setEntityContext({ entityId, entityName, entityType });

    // Create custom note-taking message
    const noteMessage = `I'd like to take notes and conduct research on **${entityName}** (${entityId}).

I can help you with:

📝 **Note Taking**
• Capture meeting notes and observations
• Document key insights and concerns
• Track relationship status and communication

🔍 **Research & Analysis**
• Analyze contract history and performance
• Research market position and competitors
• Investigate company background and capabilities

💡 **Strategic Planning**
• Identify partnership opportunities
• Assess risks and opportunities
• Plan next steps and action items

What would you like to document or research about ${entityName}?`;

    setCustomMessage(noteMessage);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEntityContext(null);
    setCustomMessage(null);
  }, []);

  const sendCustomMessage = useCallback((message: string) => {
    setCustomMessage(message);
  }, []);

  const value: AgentChatContextValue = {
    isOpen,
    entityContext,
    open,
    openWithContext,
    close,
    sendCustomMessage
  };

  return (
    <AgentChatContext.Provider value={value}>
      {children}
    </AgentChatContext.Provider>
  );
}

export function useAgentChatContext() {
  const context = useContext(AgentChatContext);
  if (context === undefined) {
    throw new Error('useAgentChatContext must be used within an AgentChatProvider');
  }
  return context;
}