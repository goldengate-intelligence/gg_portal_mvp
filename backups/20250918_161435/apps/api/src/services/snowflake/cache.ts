import { createHash } from 'crypto';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  queryHash: string;
}

export class SnowflakeQueryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTTL = 300000; // 5 minutes
  private readonly maxCacheSize = 100;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
  }

  private generateQueryHash(query: string, params?: any): string {
    const content = JSON.stringify({ query, params });
    return createHash('sha256').update(content).digest('hex');
  }

  set(query: string, data: any, ttl?: number, params?: any): void {
    const queryHash = this.generateQueryHash(query, params);
    
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(queryHash, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      queryHash,
    });
  }

  get(query: string, params?: any): any | null {
    const queryHash = this.generateQueryHash(query, params);
    const entry = this.cache.get(queryHash);

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(queryHash);
      return null;
    }

    return entry.data;
  }

  has(query: string, params?: any): boolean {
    return this.get(query, params) !== null;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern, 'i');
    for (const [key, entry] of this.cache.entries()) {
      if (regex.test(entry.queryHash)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateByTable(tableName: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.data?.metadata?.table === tableName) {
        this.cache.delete(key);
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Clean up every minute
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{
      queryHash: string;
      age: number;
      ttl: number;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([_, entry]) => ({
      queryHash: entry.queryHash,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl,
    }));

    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: 0, // Would need to track hits/misses for accurate rate
      entries,
    };
  }
}

export const queryCache = new SnowflakeQueryCache();