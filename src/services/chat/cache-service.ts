import { Redis } from '@upstash/redis';

export class CacheService {
  private redis: Redis;
  private prefix: string;

  constructor(prefix = 'chat') {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get<T>(this.getKey(key));
      return data;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const redisKey = this.getKey(key);
      if (ttlSeconds) {
        await this.redis.set(redisKey, value, { ex: ttlSeconds });
      } else {
        await this.redis.set(redisKey, value);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.redis.del(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async setWithExpiry(key: string, value: any, expiryDate: Date): Promise<boolean> {
    try {
      const ttlSeconds = Math.floor((expiryDate.getTime() - Date.now()) / 1000);
      if (ttlSeconds > 0) {
        return this.set(key, value, ttlSeconds);
      }
      return false;
    } catch (error) {
      console.error('Redis setWithExpiry error:', error);
      return false;
    }
  }
}

// Singleton para uso en cliente
let cacheInstance: CacheService | null = null;

export function getCacheService(): CacheService {
  if (!cacheInstance) {
    cacheInstance = new CacheService();
  }
  return cacheInstance;
}