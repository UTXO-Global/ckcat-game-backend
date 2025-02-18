import { ClassConstructor, plainToInstance } from 'class-transformer'
import { Redis } from 'ioredis'
import { Inject, Service } from 'typedi'
import { Config } from '../configs'

export const CacheKeys = {
    accessToken: (userId: string, token: string) =>
        `access-token:${userId}:${token}`,

    refreshToken: (userId: string, token: string) =>
        `refresh-token:${userId}:${token}`,

    user: (userId: string) => `user:${userId}`,
    aiBullets: `ai-bullets`,
    deduction: (meetingId: string) => `deduction:${meetingId}`,
    admin: (email: string) => `admin:${email}`,
    leaderBoard: () => 'leader-board',
}

export const CacheTimes = {
    day: (time = 1) => {
        return time * CacheTimes.hour(24)
    },
    hour: (time = 1) => {
        return time * CacheTimes.minute(60)
    },
    minute: (time = 1) => time * 60,
}

@Service()
export class CacheManager {
    public redisClient: Redis

    constructor(@Inject() private config: Config) {
        this.redisClient = new Redis(this.config.redisUri)
    }

    async check() {
        await this.redisClient.ping()
    }

    async get(key: string): Promise<string> {
        return await this.redisClient.get(key)
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        await this.redisClient.set(key, value)
        if (ttl) {
            await this.redisClient.expire(key, ttl)
        }
    }

    async getObject<T>(cls: ClassConstructor<T>, key: string): Promise<T> {
        const res = await this.get(key)
        return plainToInstance(cls, JSON.parse(res), {
            excludeExtraneousValues: true,
        })
    }

    async setObject(key: string, object: unknown, ttl?: number) {
        await this.set(key, JSON.stringify(object), ttl)
    }

    async del(key: string): Promise<number> {
        return await this.redisClient.del(key)
    }

    async exist(key: string) {
        return await this.redisClient.exists(key)
    }

    async hget(key: string, field: string) {
        return await this.redisClient.hget(key, field)
    }

    async hset(key: string, field: string, value: string) {
        await this.redisClient.hset(key, field, value)
    }

    async hgetall(key: string) {
        return await this.redisClient.hgetall(key)
    }

    async hmset(key: string, obj: object, ttl?: number) {
        await this.redisClient.hmset(key, obj)
        if (ttl) {
            await this.redisClient.expire(key, ttl)
        }
    }

    async hexists(key: string, field: string) {
        return await this.redisClient.hexists(key, field)
    }

    async hdel(key: string, fields: string[]): Promise<number> {
        return await this.redisClient.hdel(key, ...fields)
    }

    async getExpired(key: string) {
        return await this.redisClient.ttl(key)
    }

    async setExpired(key: string, seconds: number, value: string) {
        await this.redisClient.setex(key, seconds, value)
    }

    async jsonset(key: string, object: unknown, path?: string, ttl?: number) {
        path = path ? `$.${path}` : '$'
        return await this.redisClient
            .multi()
            .call('JSON.SET', key, path, JSON.stringify(object))
            .expire(key, ttl)
            .exec()
    }

    async jsonget<T>(cls: ClassConstructor<T>, key: string, path?: string) {
        path = path ? `$.${path}` : '$'
        const res = await this.redisClient.call('JSON.GET', key, path)

        if (typeof res !== 'string') return

        const parsed: [] = JSON.parse(res)
        return plainToInstance(cls, parsed, {
            excludeExtraneousValues: true,
        })
    }

    async zAdd(key: string, member: string, score: number) {
        return await this.redisClient.zadd(key, score, member)
    }

    async getLeaderBoardWithTop(key: string, top: number) {
        return await this.redisClient.zrevrange(key, 0, top)
    }

    async getUserRank(key: string, member: string) {
        return await this.redisClient.zrevrank(key, member)
    }
}
