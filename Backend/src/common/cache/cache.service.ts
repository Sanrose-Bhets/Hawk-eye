import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redis: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    return this.redis.getJSON<T>(key);
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    await this.redis.setJSON(key, value, ttlSeconds);
  }

  async invalidate(...keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.redis.del(key);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    await this.redis.delPattern(pattern);
  }
}
