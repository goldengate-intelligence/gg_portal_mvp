import { MessageSquare, Trash2, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { CONTRACTOR_DETAIL_COLORS, cn } from "../../logic/utils";
import { Button } from "../ui/button";

interface ChatSession {
  id: string;
  sessionId: string;
  title?: string;
  context?: any;
  lastMessageAt: string;
  createdAt: string;
  messages?: Array<{
    id: string;
    content: string;
    role: "user" | "agent";
    type: "text" | "data" | "action" | "error";
    createdAt: string;
  }>;
}

interface RecentChatsPanelProps {
  userId?: string;
  currentSessionId?: string;
  onSessionSelect?: (sessionId: string) => void;
  className?: string;
}

export function RecentChatsPanel({
  userId,
  currentSessionId,
  onSessionSelect,
  className
}: RecentChatsPanelProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load recent chat sessions
  useEffect(() => {
    const loadRecentSessions = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/ai-chat/sessions?userId=${userId}&limit=10`);
        if (!response.ok) {
          throw new Error('Failed to load chat sessions');
        }

        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (error) {
        console.error('Failed to load recent sessions:', error);
        setError('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentSessions();
  }, [userId]);

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent session selection

    try {
      const response = await fetch(`/api/v1/ai-chat/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      } else {
        console.error('Failed to delete session');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getLastMessagePreview = (session: ChatSession) => {
    if (!session.messages || session.messages.length === 0) {
      return 'New chat';
    }

    const lastMessage = session.messages[session.messages.length - 1];
    const content = lastMessage.content.substring(0, 50);
    return content.length === 50 ? content + '...' : content;
  };

  const getContextIcon = (context?: any) => {
    if (context?.contractorName) {
      return '🏢';
    }
    if (context?.currentPage === 'dashboard') {
      return '📊';
    }
    if (context?.currentPage === 'discovery') {
      return '🔍';
    }
    return '💬';
  };

  if (isLoading) {
    return (
      <div
        className={cn("p-4 space-y-3", className)}
        style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}
      >
        <div className="flex items-center space-x-2 text-gray-400">
          <Clock className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading chats...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn("p-4", className)}
        style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}
      >
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div
        className={cn("p-4", className)}
        style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}
      >
        <div className="text-gray-400 text-sm text-center">
          Sign in to see chat history
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("overflow-y-auto", className)}
      style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-gray-700/30"
           style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}>
        <h3 className="text-gray-200 font-medium text-sm tracking-wide">
          Recent Chats
        </h3>
      </div>

      {/* Sessions List */}
      <div className="p-2 space-y-1">
        {sessions.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-8">
            No chat history yet
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.sessionId}
              className={cn(
                "group relative p-3 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-gray-800/50 border border-transparent hover:border-gray-600/30",
                currentSessionId === session.sessionId
                  ? "bg-[#D2AC38]/10 border-[#D2AC38]/30"
                  : "bg-gray-800/30"
              )}
              onClick={() => onSessionSelect?.(session.sessionId)}
            >
              {/* Session Content */}
              <div className="flex items-start justify-between space-x-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  {/* Context Icon */}
                  <div className="flex-shrink-0 text-lg">
                    {getContextIcon(session.context)}
                  </div>

                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-gray-200 text-sm font-medium truncate">
                        {session.title || 'New Chat'}
                      </h4>
                      <span className="text-gray-400 text-xs flex-shrink-0 ml-2">
                        {formatRelativeTime(session.lastMessageAt)}
                      </span>
                    </div>

                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                      {getLastMessagePreview(session)}
                    </p>

                    {/* Context Info */}
                    {session.context?.contractorName && (
                      <div className="flex items-center mt-2">
                        <div className="bg-[#D2AC38]/20 text-[#D2AC38] text-xs px-2 py-1 rounded border border-[#D2AC38]/30">
                          {session.context.contractorName}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                  onClick={(e) => handleDeleteSession(session.sessionId, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Chat Button */}
      <div className="sticky bottom-0 p-4 border-t border-gray-700/30"
           style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}>
        <Button
          variant="outline"
          className="w-full border-[#D2AC38]/30 text-[#D2AC38] hover:bg-[#D2AC38]/10 hover:text-[#D2AC38]"
          onClick={() => {
            // Create new session
            const newSessionId = `session_${Date.now()}`;
            onSessionSelect?.(newSessionId);
          }}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
    </div>
  );
}