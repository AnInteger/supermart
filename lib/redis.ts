import { Redis } from '@upstash/redis';

// 检查 Redis 配置是否存在
const hasRedisConfig =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN;

// 创建 Redis 实例（仅在配置存在时）
export let redis: Redis | null = null;
let isRedisAvailable = false;

if (hasRedisConfig) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    isRedisAvailable = true;
  } catch (error) {
    // Redis 初始化失败，将使用无缓存模式
    redis = null;
    isRedisAvailable = false;
  }
}

/**
 * 缓存辅助函数
 * @param key 缓存键
 * @param fetcher 数据获取函数
 * @param ttl 过期时间（秒），默认 5 分钟
 */
export async function cache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  // 如果 Redis 不可用，直接获取数据（无缓存模式）
  if (!isRedisAvailable || !redis) {
    return fetcher();
  }

  try {
    // 尝试从缓存获取
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 获取新数据
    const data = await fetcher();

    // 存入缓存
    await redis.setex(key, ttl, JSON.stringify(data));

    return data;
  } catch (error) {
    // 缓存错误时，直接获取数据
    return fetcher();
  }
}

/**
 * 缓存失效
 * @param pattern 键模式（支持通配符）
 */
export async function invalidateCache(pattern: string): Promise<void> {
  if (!isRedisAvailable || !redis) {
    return;
  }

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    // 静默处理错误
  }
}

/**
 * 删除单个缓存键
 */
export async function deleteCache(key: string): Promise<void> {
  if (!isRedisAvailable || !redis) {
    return;
  }
  await redis.del(key);
}

/**
 * 检查键是否存在
 */
export async function cacheExists(key: string): Promise<boolean> {
  if (!isRedisAvailable || !redis) {
    return false;
  }
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    return false;
  }
}

/**
 * 获取缓存 TTL
 */
export async function getCacheTTL(key: string): Promise<number> {
  if (!isRedisAvailable || !redis) {
    return -1;
  }
  try {
    return await redis.ttl(key);
  } catch (error) {
    return -1;
  }
}
