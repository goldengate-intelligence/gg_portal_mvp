import { useState, useCallback } from 'react';
import type { QueryTab, QueryHistoryItem, AIConversationItem, DiscoveryState, Contractor } from '../types/discovery';

export function useDiscoveryState() {
  const [searchQuery, setSearchQuery] = useState('');
  const [queryTabs, setQueryTabs] = useState<QueryTab[]>([
    {
      id: 0,
      name: 'Query 1',
      query: '',
      results: [],
      columns: [],
      status: 'idle'
    }
  ]);
  const [activeQueryTab, setActiveQueryTab] = useState(0);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiConversation, setAiConversation] = useState<AIConversationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Additional UI state
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [queryExecutionTime, setQueryExecutionTime] = useState(0);

  const addQueryTab = useCallback(() => {
    const newTab: QueryTab = {
      id: queryTabs.length,
      name: `Query ${queryTabs.length + 1}`,
      query: '',
      results: [],
      columns: [],
      status: 'idle'
    };
    setQueryTabs(prev => [...prev, newTab]);
    setActiveQueryTab(queryTabs.length);
  }, [queryTabs.length]);

  const closeQueryTab = useCallback((index: number) => {
    if (queryTabs.length === 1) return; // Don't close last tab

    const newTabs = queryTabs.filter((_, i) => i !== index);
    setQueryTabs(newTabs);

    if (activeQueryTab === index) {
      setActiveQueryTab(Math.max(0, index - 1));
    } else if (activeQueryTab > index) {
      setActiveQueryTab(activeQueryTab - 1);
    }
  }, [queryTabs, activeQueryTab]);

  const updateQueryTab = useCallback((index: number, updates: Partial<QueryTab>) => {
    setQueryTabs(prev => prev.map((tab, i) =>
      i === index ? { ...tab, ...updates } : tab
    ));
  }, []);

  const addQueryToHistory = useCallback((query: string, status: 'completed' | 'running' | 'failed', results_count?: number) => {
    const historyItem: QueryHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: new Date(),
      status,
      results_count
    };
    setQueryHistory(prev => [historyItem, ...prev]);
  }, []);

  const addAIMessage = useCallback((type: 'user' | 'ai', content: string) => {
    const message: AIConversationItem = {
      type,
      content,
      timestamp: new Date()
    };
    setAiConversation(prev => [...prev, message]);
  }, []);

  const toggleRowSelection = useCallback((rowIndex: number) => {
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(rowIndex)) {
        newSelected.delete(rowIndex);
      } else {
        newSelected.add(rowIndex);
      }
      return newSelected;
    });
  }, []);

  const clearSelectedRows = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const state: DiscoveryState & {
    viewMode: 'table' | 'chart';
    selectedRows: Set<number>;
    showColumnSelector: boolean;
    queryExecutionTime: number;
  } = {
    searchQuery,
    queryTabs,
    activeQueryTab,
    queryHistory,
    isAiOpen,
    aiInput,
    aiConversation,
    isSearching,
    viewMode,
    selectedRows,
    showColumnSelector,
    queryExecutionTime
  };

  const actions = {
    setSearchQuery,
    setActiveQueryTab,
    setIsAiOpen,
    setAiInput,
    setIsSearching,
    setViewMode,
    setShowColumnSelector,
    setQueryExecutionTime,
    addQueryTab,
    closeQueryTab,
    updateQueryTab,
    addQueryToHistory,
    addAIMessage,
    toggleRowSelection,
    clearSelectedRows
  };

  return { state, actions };
}