import Redis from 'ioredis';
import logger from '../utils/logger';

export class CacheService {
    private static redis: Redis | null = null;
    private static isEnabled = false;

    static initialize() {
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            this.redis = new Redis(redisUrl);

            this.redis.on('connect', () => {
                logger.info('✅ Redis connected successfully');
                this.isEnabled = true;
            });

            this.redis.on('error', (error) => {
                logger.error('Redis connection error:', error);
                this.isEnabled = false;
            });
        } catch (error) {
            logger.warn('Redis not available, caching disabled');
            this.isEnabled = false;
        }
    }

    static async get<T>(key: string): Promise<T | null> {
        if (!this.isEnabled || !this.redis) return null;

        try {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error('Cache get error:', error);
            return null;
        }
    }

    static async set(key: string, value: any, ttl: number = 300): Promise<void> {
        if (!this.isEnabled || !this.redis) return;

        try {
            await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
        } catch (error) {
            logger.error('Cache set error:', error);
        }
    }

    static async del(key: string): Promise<void> {
        if (!this.isEnabled || !this.redis) return;

        try {
            await this.redis.del(key);
        } catch (error) {
            logger.error('Cache delete error:', error);
        }
    }

    static async invalidatePattern(pattern: string): Promise<void> {
        if (!this.isEnabled || !this.redis) return;

        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            logger.error('Cache invalidate error:', error);
        }
    }

    static async clear(): Promise<void> {
        if (!this.isEnabled || !this.redis) return;

        try {
            await this.redis.flushdb();
        } catch (error) {
            logger.error('Cache clear error:', error);
        }
    }

    // Helper methods for common cache patterns
    static async remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const fresh = await callback();
        await this.set(key, fresh, ttl);
        return fresh;
    }

    static async tags(tags: string[]): Promise<{ set: (key: string, value: any, ttl?: number) => Promise<void>, invalidate: () => Promise<void> }> {
        return {
            set: async (key: string, value: any, ttl: number = 300) => {
                await this.set(key, value, ttl);
                // Store key in tag sets
                for (const tag of tags) {
                    if (this.redis) {
                        await this.redis.sadd(`tag:${tag}`, key);
                    }
                }
            },
            invalidate: async () => {
                for (const tag of tags) {
                    if (this.redis) {
                        const keys = await this.redis.smembers(`tag:${tag}`);
                        if (keys.length > 0) {
                            await this.redis.del(...keys);
                        }
                        await this.redis.del(`tag:${tag}`);
                    }
                }
            }
        };
    }
}
