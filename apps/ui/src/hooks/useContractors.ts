import { useState, useEffect, useCallback } from 'react';
import { apiClient, type ContractorData, type ContractorQueryResult } from '../lib/api-client';

export interface ContractorFilters {
  search?: string;
  states?: string[];
  agencies?: string[];
  industries?: string[];
  lifecycleStages?: string[];
  sizeTiers?: string[];
  minObligated?: number;
  maxObligated?: number;
  minContracts?: number;
  maxContracts?: number;
}

export interface UseContractorsOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: ContractorFilters;
  enabled?: boolean;
}

export interface UseContractorsResult {
  data: ContractorData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  aggregations: {
    totalObligated: string;
    averageContracts: number;
    uniqueAgencies: number;
    uniqueStates: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useContractors(options: UseContractorsOptions = {}): UseContractorsResult {
  const {
    page = 1,
    limit = 24,
    sortBy = 'totalObligated',
    sortOrder = 'desc',
    filters = {},
    enabled = true
  } = options;

  const [data, setData] = useState<ContractorData[]>([]);
  const [pagination, setPagination] = useState<UseContractorsResult['pagination']>(null);
  const [aggregations, setAggregations] = useState<UseContractorsResult['aggregations']>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContractors = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      // Apply filters
      if (filters.search) params.search = filters.search;
      if (filters.states?.length) params.state = filters.states.join(',');
      if (filters.agencies?.length) params.agency = filters.agencies.join(',');
      if (filters.industries?.length) params.industry = filters.industries.join(',');
      if (filters.lifecycleStages?.length) params.lifecycle = filters.lifecycleStages.join(',');
      if (filters.sizeTiers?.length) params.size = filters.sizeTiers.join(',');
      if (filters.minObligated !== undefined) params.minObligated = filters.minObligated;
      if (filters.maxObligated !== undefined) params.maxObligated = filters.maxObligated;
      if (filters.minContracts !== undefined) params.minContracts = filters.minContracts;
      if (filters.maxContracts !== undefined) params.maxContracts = filters.maxContracts;

      const result = await apiClient.getContractors(params);

      if (result && result.success) {
        setData(result.data);
        setPagination(result.pagination);
        setAggregations(result.aggregations || null);
      } else {
        throw new Error(result ? 'Failed to fetch contractors' : 'Invalid response from server');
      }
    } catch (err) {
      console.error('Error fetching contractors:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contractors');
      setData([]);
      setPagination(null);
      setAggregations(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, page, limit, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  return {
    data,
    pagination,
    aggregations,
    isLoading,
    error,
    refetch: fetchContractors,
  };
}

// Hook for top contractors by metric
export function useTopContractors(
  metric: 'totalObligated' | 'totalContracts' | 'agencyDiversity',
  options: {
    limit?: number;
    states?: string[];
    agencies?: string[];
    industries?: string[];
    enabled?: boolean;
  } = {}
) {
  const { limit = 10, states, agencies, industries, enabled = true } = options;
  
  const [data, setData] = useState<ContractorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopContractors = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const params: any = { limit };
      
      if (states?.length) params.state = states.join(',');
      if (agencies?.length) params.agency = agencies.join(',');
      if (industries?.length) params.industry = industries.join(',');

      const result = await apiClient.getTopContractors(metric, params);
      setData(result || []);
    } catch (err) {
      console.error('Error fetching top contractors:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch top contractors');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [metric, enabled, limit, states, agencies, industries]);

  useEffect(() => {
    fetchTopContractors();
  }, [fetchTopContractors]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTopContractors,
  };
}