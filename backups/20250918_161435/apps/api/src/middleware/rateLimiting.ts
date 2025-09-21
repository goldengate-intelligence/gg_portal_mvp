import { Elysia, Context } from "elysia";
import type { AuthContext } from "./auth";
import type { TenantContext } from "./tenant";

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (context: Context) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Only count failed requests
  skipFailedRequests?: boolean; // Only count successful requests
  message?: string; // Custom error message
  headers?: boolean; // Include rate limit headers in response
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export const rateLimiting = (config: RateLimitConfig) =>
  new Elysia({ name: "rate-limiting" })
    .derive(async (context: Context) => {
      const key = config.keyGenerator ? config.keyGenerator(context) : getDefaultKey(context);
      const now = Date.now();
      const windowStart = now - config.windowMs;
      
      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);
      if (!entry || entry.resetTime <= now) {
        entry = {
          count: 0,
          resetTime: now + config.windowMs,
        };
        rateLimitStore.set(key, entry);
      }

      // Check if limit exceeded
      if (entry.count >= config.maxRequests) {
        const resetTime = new Date(entry.resetTime);
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        
        const error = new Error(config.message || "Too many requests");
        (error as any).statusCode = 429;
        (error as any).headers = {
          "X-Rate-Limit-Limit": config.maxRequests.toString(),
          "X-Rate-Limit-Remaining": "0",
          "X-Rate-Limit-Reset": resetTime.toISOString(),
          "Retry-After": retryAfter.toString(),
        };
        
        throw error;
      }

      // Increment counter
      entry.count++;
      rateLimitStore.set(key, entry);

      const remaining = Math.max(0, config.maxRequests - entry.count);
      const resetTime = new Date(entry.resetTime);

      // Add headers if requested
      if (config.headers) {
        context.set = context.set || {};
        context.set.headers = {
          ...context.set.headers,
          "X-Rate-Limit-Limit": config.maxRequests.toString(),
          "X-Rate-Limit-Remaining": remaining.toString(),
          "X-Rate-Limit-Reset": resetTime.toISOString(),
        };
      }

      return {
        rateLimitKey: key,
        rateLimitRemaining: remaining,
        rateLimitReset: resetTime,
      };
    })
    .onError(({ error, set }) => {
      if ((error as any).statusCode === 429) {
        const headers = (error as any).headers || {};
        Object.assign(set.headers || {}, headers);
        
        return {
          error: error.message,
          code: "RATE_LIMIT_EXCEEDED",
          statusCode: 429,
          retryAfter: headers["Retry-After"],
          resetTime: headers["X-Rate-Limit-Reset"],
        };
      }
    });

// Default key generator
function getDefaultKey(context: Context): string {
  // Try to get IP address
  const forwarded = context.request.headers.get("x-forwarded-for");
  const realIp = context.request.headers.get("x-real-ip");
  const cfIp = context.request.headers.get("cf-connecting-ip");
  
  const ip = forwarded?.split(",")[0] || realIp || cfIp || "unknown";
  return `rate-limit:${ip}`;
}

// IP-based rate limiting
export const rateLimitByIP = (maxRequests: number, windowMs: number) =>
  rateLimiting({
    maxRequests,
    windowMs,
    keyGenerator: (context) => {
      const ip = getIPAddress(context);
      return `ip:${ip}`;
    },
    headers: true,
  });

// User-based rate limiting
export const rateLimitByUser = (maxRequests: number, windowMs: number) =>
  rateLimiting({
    maxRequests,
    windowMs,
    keyGenerator: (context) => {
      const authContext = context as Context & AuthContext;
      const userId = authContext.user?.id || "anonymous";
      return `user:${userId}`;
    },
    headers: true,
  });

// Tenant-based rate limiting
export const rateLimitByTenant = (maxRequests: number, windowMs: number) =>
  rateLimiting({
    maxRequests,
    windowMs,
    keyGenerator: (context) => {
      const tenantContext = context as Context & TenantContext;
      const tenantId = tenantContext.tenantId || "no-tenant";
      return `tenant:${tenantId}`;
    },
    headers: true,
  });

// API endpoint-based rate limiting
export const rateLimitByEndpoint = (maxRequests: number, windowMs: number) =>
  rateLimiting({
    maxRequests,
    windowMs,
    keyGenerator: (context) => {
      const url = new URL(context.request.url);
      const method = context.request.method;
      const path = url.pathname;
      return `endpoint:${method}:${path}`;
    },
    headers: true,
  });

// Combined rate limiting (IP + User)
export const rateLimitCombined = (maxRequests: number, windowMs: number) =>
  rateLimiting({
    maxRequests,
    windowMs,
    keyGenerator: (context) => {
      const authContext = context as Context & AuthContext;
      const ip = getIPAddress(context);
      const userId = authContext.user?.id || "anonymous";
      return `combined:${ip}:${userId}`;
    },
    headers: true,
  });

// Sliding window rate limiting (more sophisticated)
export const slidingWindowRateLimit = (maxRequests: number, windowMs: number) =>
  new Elysia({ name: "sliding-window-rate-limit" })
    .derive(async (context: Context) => {
      const key = getDefaultKey(context);
      const now = Date.now();
      const windowStart = now - windowMs;

      // This is a simplified sliding window - in production, use Redis with sorted sets
      const entry = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
      
      // Simple sliding window approximation
      const timeElapsed = now - (entry.resetTime - windowMs);
      const windowProgress = Math.min(1, timeElapsed / windowMs);
      const allowedRequests = Math.floor(maxRequests * windowProgress);
      
      if (entry.count >= allowedRequests && windowProgress < 1) {
        throw new Error("Rate limit exceeded (sliding window)");
      }

      entry.count++;
      entry.resetTime = Math.max(entry.resetTime, now + windowMs);
      rateLimitStore.set(key, entry);

      return {
        rateLimitKey: key,
        rateLimitType: "sliding-window",
      };
    });

// Utility function to extract IP address
function getIPAddress(context: Context): string {
  const forwarded = context.request.headers.get("x-forwarded-for");
  const realIp = context.request.headers.get("x-real-ip");
  const cfIp = context.request.headers.get("cf-connecting-ip");
  
  return forwarded?.split(",")[0]?.trim() || realIp || cfIp || "unknown";
}

// Burst rate limiting (allow short bursts but limit over longer period)
export const burstRateLimit = (burstLimit: number, sustainedLimit: number, windowMs: number) =>
  new Elysia({ name: "burst-rate-limit" })
    .derive(async (context: Context) => {
      const key = getDefaultKey(context);
      const now = Date.now();
      
      // Get or create burst and sustained counters
      const burstKey = `burst:${key}`;
      const sustainedKey = `sustained:${key}`;
      
      const burstEntry = rateLimitStore.get(burstKey) || { count: 0, resetTime: now + 60000 }; // 1 minute burst window
      const sustainedEntry = rateLimitStore.get(sustainedKey) || { count: 0, resetTime: now + windowMs };
      
      // Reset expired windows
      if (burstEntry.resetTime <= now) {
        burstEntry.count = 0;
        burstEntry.resetTime = now + 60000;
      }
      if (sustainedEntry.resetTime <= now) {
        sustainedEntry.count = 0;
        sustainedEntry.resetTime = now + windowMs;
      }
      
      // Check limits
      if (burstEntry.count >= burstLimit) {
        throw new Error("Burst rate limit exceeded");
      }
      if (sustainedEntry.count >= sustainedLimit) {
        throw new Error("Sustained rate limit exceeded");
      }
      
      // Increment counters
      burstEntry.count++;
      sustainedEntry.count++;
      
      rateLimitStore.set(burstKey, burstEntry);
      rateLimitStore.set(sustainedKey, sustainedEntry);
      
      return {
        burstRemaining: burstLimit - burstEntry.count,
        sustainedRemaining: sustainedLimit - sustainedEntry.count,
      };
    });

export default rateLimiting;