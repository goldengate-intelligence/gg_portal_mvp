export interface Contractor {
  id: string;
  company_name: string;
  uei: string;
  naics_description: string;
  location: string;
  active_awards_value: string;
  performance_score: number;
  certification_level: string;
  employees: number;
  founded: number;
}

export interface ContractorData {
  company_name: string;
  uei: string;
  naics_description: string;
  location: string;
  active_awards_value: string;
  performance_score: number;
  certification_level: string;
  employees: number;
  founded: number;
}

export interface QueryTab {
  id: number;
  name: string;
  query: string;
  results: Contractor[];
  columns: string[];
  status: 'idle' | 'loading' | 'success' | 'error';
  lastExecuted?: Date;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  status: 'completed' | 'running' | 'failed';
  results_count?: number;
}

export interface AIConversationItem {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface DiscoveryState {
  searchQuery: string;
  queryTabs: QueryTab[];
  activeQueryTab: number;
  queryHistory: QueryHistoryItem[];
  isAiOpen: boolean;
  aiInput: string;
  aiConversation: AIConversationItem[];
  isSearching: boolean;
}