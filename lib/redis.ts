import { Redis } from '@upstash/redis';

// 从环境变量创建 Redis 客户端
export const redis = Redis.fromEnv();

/**
 * 缓存辅助函数
 * @param key 缓存键
 * @param fetcher 数据获取函数
 * @param ttl 过期时间（秒），默认 5 分钟
 */
export async function cache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 默认 5 分钟
): Promise<T> {
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
}

/**
 * 缓存失效
 * @param pattern 键模式（支持通配符）
 */
export async function invalidateCache(pattern: string): Promise<void> {
  // 注意：Upstash Redis 可能不支持 KEYS 命令
  // 对于生产环境，建议使用 SCAN 或维护键的索引
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * 删除单个缓存键
 */
export async function deleteCache(key: string): Promise<void> {
  await redis.del(key);
}

/**
 * 检查键是否存在
 */
export async function cacheExists(key: string): Promise<boolean> {
  const result = await redis.exists(key);
  return result === 1;
}

/**
 * 获取缓存 TTL
 */
export async function getCacheTTL(key: string): Promise<number> {
  return await redis.ttl(key);
}
