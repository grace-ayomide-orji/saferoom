export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryLimit(
  key: string,
  max: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1, resetAt: new Date(now + windowMs) };
  }

  if (entry.count >= max) {
    return { success: false, remaining: 0, resetAt: new Date(entry.resetAt) };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: max - entry.count,
    resetAt: new Date(entry.resetAt),
  };
}

let redisLimiter: ((key: string, max: number, windowSeconds: number) => Promise<RateLimitResult>) | null = null;

// async function getRedisLimiter() {
//   if (!process.env.UPSTASH_REDIS_REST_URL) return null;

//   if (!redisLimiter) {
//     try {
//       const { Ratelimit } = await import("@upstash/ratelimit");
//       const { Redis } = await import("@upstash/redis");

//       const redis = Redis.fromEnv();

//       redisLimiter = async (key: string, max: number, windowSeconds: number) => {
//         const limiter = new Ratelimit({
//           redis,
//           limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
//           prefix: "swe_rl",
//         });

//         const result = await limiter.limit(key);
//         return {
//           success: result.success,
//           remaining: result.remaining,
//           resetAt: new Date(result.reset),
//         };
//       };
//     } catch {
//       return null;
//     }
//   }

//   return redisLimiter;
// }


export async function rateLimit(
  identifier: string,
  action: string,
  { max = 5, windowSeconds = 900 }: { max?: number; windowSeconds?: number } = {}
): Promise<RateLimitResult> {
  const key = `${action}:${identifier}`;

  // const redis = await getRedisLimiter();
  // if (redis) {
  //   return redis(key, max, windowSeconds);
  // }

  return inMemoryLimit(key, max, windowSeconds);
}

export function getClientIp(req: Request | { headers: Headers }): string {
  const headers = req instanceof Request ? req.headers : req.headers;

  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") || 
    "unknown"
  );
}