/**
 * Large Data Cache Service
 *
 * Optimized for caching large datasets (50M+ rows) with intelligent eviction.
 * Uses LRU eviction and TTL-based expiry.
 */

export interface CacheConfig {
  maxCacheSize: number;
  ttlMinutes: number;
}

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  size: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
}

export class LargeDataCache {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats: CacheStats = {
    size: 0,
    hitRate: 0,
    totalHits: 0,
    totalMisses: 0
  };

  constructor(config: CacheConfig) {
    this.config = config;

    // Setup automatic cleanup
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.totalMisses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    const now = Date.now();
    const ttlMs = this.config.ttlMinutes * 60 * 1000;

    if (now - entry.timestamp > ttlMs) {
      this.cache.delete(key);
      this.stats.size--;
      this.stats.totalMisses++;
      this.updateHitRate();
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = now;

    this.stats.totalHits++;
    this.updateHitRate();
    return entry.data;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T): void {
    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictLeastUsed();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    });

    this.stats.size = this.cache.size;
  }

  /**
   * Remove specific entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Clear cache entries by pattern
   */
  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      this.stats.size = 0;
      return;
    }

    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    this.stats.size = this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    const ttlMs = this.config.ttlMinutes * 60 * 1000;

    if (now - entry.timestamp > ttlMs) {
      this.cache.delete(key);
      this.stats.size--;
      return false;
    }

    return true;
  }

  /**
   * Get all cache keys (for debugging)
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Private: Evict least recently used entries
   */
  private evictLeastUsed(): void {
    if (this.cache.size === 0) return;

    // Find the least recently used entry
    let lruKey: string | null = null;
    let oldestAccess = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.stats.size = this.cache.size;
    }
  }

  /**
   * Private: Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const ttlMs = this.config.ttlMinutes * 60 * 1000;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > ttlMs) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    this.stats.size = this.cache.size;
  }

  /**
   * Private: Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.totalHits + this.stats.totalMisses;
    this.stats.hitRate = total > 0 ? this.stats.totalHits / total : 0;
  }
}