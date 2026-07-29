/**
 * Simple in-memory rate limiting for development and single-instance deployments.
 *
 * Production should replace the in-memory store with a shared backend such as
 * Upstash Redis or Vercel KV so limits apply consistently across serverless
 * instances and edge regions.
 */

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

function pruneExpiredEntries(now: number): void {
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();

  if (memoryStore.size > 10_000) {
    pruneExpiredEntries(now);
  }

  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });

    return {
      success: true,
      remaining: Math.max(limit - 1, 0),
      reset: resetAt,
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: existing.resetAt,
    };
  }

  existing.count += 1;
  memoryStore.set(key, existing);

  return {
    success: true,
    remaining: Math.max(limit - existing.count, 0),
    reset: existing.resetAt,
  };
}

/**
 * Redis-ready helper shape for a future shared store implementation.
 *
 * Example with Upstash:
 *   const redis = Redis.fromEnv();
 *   await redis.incr(key);
 *   await redis.expire(key, Math.ceil(windowMs / 1000));
 */
export interface DistributedRateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; reset: number }>;
}

export async function hashIp(ip: string, salt = "silver-spring-studios"): Promise<string> {
  const normalized = ip.trim();

  if (!normalized) {
    return "unknown";
  }

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${salt}:${normalized}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  }

  let hash = 0;
  const input = `${salt}:${normalized}`;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return `fallback-${Math.abs(hash).toString(16)}`;
}
