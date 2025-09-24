/**
 * Iceberg Reader Service
 *
 * Handles reading from materialized tables in Iceberg/S3.
 * Designed for large-scale data (50M-200M+ rows) with client-side caching.
 */

import { LargeDataCache } from '../caching/large-data-cache';

export interface IcebergConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

export interface TableQuery {
  tableName: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface TableResponse<T = any> {
  data: T[];
  totalRows: number;
  hasMore: boolean;
  nextOffset?: number;
}

class IcebergReaderService {
  private config: IcebergConfig;
  private cache: LargeDataCache;

  constructor(config: IcebergConfig) {
    this.config = config;
    this.cache = new LargeDataCache({
      maxCacheSize: 100_000, // Cache up to 100k records
      ttlMinutes: 15 // 15 minute cache TTL
    });
  }

  /**
   * Read contractor summary data
   */
  async getContractorSummary(uei: string): Promise<any> {
    const cacheKey = `contractor_summary:${uei}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const query: TableQuery = {
      tableName: 'contractor_summary',
      filters: { uei },
      limit: 1
    };

    const result = await this.executeQuery(query);
    if (result.data.length > 0) {
      this.cache.set(cacheKey, result.data[0]);
      return result.data[0];
    }
    return null;
  }

  /**
   * Read performance metrics for contractors
   */
  async getPerformanceMetrics(ueis: string[]): Promise<TableResponse> {
    const cacheKey = `performance_metrics:${ueis.sort().join(',')}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const query: TableQuery = {
      tableName: 'performance_metrics',
      filters: { uei: { in: ueis } }
    };

    const result = await this.executeQuery(query);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Read award/contract event data
   */
  async getContractEvents(filters: Record<string, any>, pagination: { limit: number; offset: number }): Promise<TableResponse> {
    const cacheKey = `contract_events:${JSON.stringify(filters)}:${pagination.offset}:${pagination.limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const query: TableQuery = {
      tableName: 'contract_events',
      filters,
      ...pagination,
      orderBy: 'award_date',
      orderDirection: 'desc'
    };

    const result = await this.executeQuery(query);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Read portfolio assets data
   */
  async getPortfolioAssets(portfolioId?: string): Promise<TableResponse> {
    const cacheKey = `portfolio_assets:${portfolioId || 'default'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const query: TableQuery = {
      tableName: 'portfolio_assets',
      filters: portfolioId ? { portfolio_id: portfolioId } : {}
    };

    const result = await this.executeQuery(query);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Read geographic data (both contract locations and virtual HQ)
   */
  async getGeographicData(type: 'contract_locations' | 'virtual_hq', filters?: Record<string, any>): Promise<TableResponse> {
    const cacheKey = `geographic:${type}:${JSON.stringify(filters || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const query: TableQuery = {
      tableName: type,
      filters: filters || {}
    };

    const result = await this.executeQuery(query);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Execute a generic table query
   */
  private async executeQuery<T = any>(query: TableQuery): Promise<TableResponse<T>> {
    try {
      // TODO: Replace with actual API call to your Iceberg/S3 service
      // For now, return mock structure that matches expected interface

      const url = `${this.config.baseUrl}/query`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(query),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Iceberg query failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      return {
        data: result.data || [],
        totalRows: result.totalRows || 0,
        hasMore: result.hasMore || false,
        nextOffset: result.nextOffset
      };

    } catch (error) {
      console.error('Iceberg Reader Error:', error);

      // Return empty result structure on error
      return {
        data: [],
        totalRows: 0,
        hasMore: false
      };
    }
  }

  /**
   * Clear cache for specific patterns
   */
  clearCache(pattern?: string): void {
    this.cache.clear(pattern);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return this.cache.getStats();
  }
}

// Export singleton instance
export const icebergReader = new IcebergReaderService({
  baseUrl: process.env.VITE_ICEBERG_API_URL || 'http://localhost:8000/api',
  apiKey: process.env.VITE_ICEBERG_API_KEY,
  timeout: 30000 // 30 second timeout for large queries
});

export { IcebergReaderService };