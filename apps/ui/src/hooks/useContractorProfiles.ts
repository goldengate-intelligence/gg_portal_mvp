import { useState, useEffect, useCallback } from 'react';
import { apiClient, type ContractorProfile, type ContractorProfileQueryResult } from '../services/api-client';

export interface ContractorProfileFilters {
  search?: string;
  states?: string[];
  agencies?: string[];
  industries?: string[];
  sizeTiers?: string[];
  lifecycleStages?: string[];
  minObligated?: number;
  maxObligated?: number;
}

export interface UseContractorProfilesOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: ContractorProfileFilters;
  enabled?: boolean;
}

export interface UseContractorProfilesResult {
  data: ContractorProfile[];
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

export function useContractorProfiles(options: UseContractorProfilesOptions = {}): UseContractorProfilesResult {
  const {
    page = 1,
    limit = 24,
    sortBy = 'totalObligated',
    sortOrder = 'desc',
    filters = {},
    enabled = true
  } = options;

  const [data, setData] = useState<ContractorProfile[]>([]);
  const [pagination, setPagination] = useState<UseContractorProfilesResult['pagination']>(null);
  const [aggregations, setAggregations] = useState<UseContractorProfilesResult['aggregations']>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContractorProfiles = useCallback(async () => {
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
      if (filters.states?.length) params.states = filters.states.join(',');
      if (filters.agencies?.length) params.agencies = filters.agencies.join(',');
      if (filters.industries?.length) params.industries = filters.industries.join(',');
      if (filters.sizeTiers?.length) params.sizeTiers = filters.sizeTiers.join(',');
      if (filters.lifecycleStages?.length) params.lifecycleStages = filters.lifecycleStages.join(',');
      if (filters.minObligated !== undefined) params.minObligated = filters.minObligated.toString();
      if (filters.maxObligated !== undefined) params.maxObligated = filters.maxObligated.toString();

      const result = await apiClient.getContractorProfiles(params);
      
      if (result.success) {
        setData(result.data);
        setPagination(result.pagination);
        setAggregations(result.aggregations || null);
      } else {
        throw new Error('Failed to fetch contractor profiles');
      }
    } catch (err) {
      console.error('Error fetching contractor profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contractor profiles');
      setData([]);
      setPagination(null);
      setAggregations(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, page, limit, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchContractorProfiles();
  }, [fetchContractorProfiles]);

  return {
    data,
    pagination,
    aggregations,
    isLoading,
    error,
    refetch: fetchContractorProfiles,
  };
}

// Hook for top contractor profiles by metric
export function useTopContractorProfiles(
  metric: 'totalObligated' | 'totalContracts' | 'agencyDiversity' | 'totalUeis' | 'performanceScore',
  options: {
    limit?: number;
    states?: string[];
    agencies?: string[];
    industries?: string[];
    enabled?: boolean;
  } = {}
) {
  const { limit = 10, states, agencies, industries, enabled = true } = options;
  
  const [data, setData] = useState<ContractorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopProfiles = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const params: any = { limit };
      
      if (states?.length) params.states = states.join(',');
      if (agencies?.length) params.agencies = agencies.join(',');
      if (industries?.length) params.industries = industries.join(',');

      const result = await apiClient.getTopContractorProfiles(metric, params);
      setData(result);
    } catch (err) {
      console.error('Error fetching top contractor profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch top contractor profiles');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [metric, enabled, limit, states, agencies, industries]);

  useEffect(() => {
    fetchTopProfiles();
  }, [fetchTopProfiles]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTopProfiles,
  };
}