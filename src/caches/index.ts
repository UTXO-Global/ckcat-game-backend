import { Redis } from 'ioredis'
import { Inject, Service } from 'typedi'
import { Config } from '../configs'

export const CacheKeys = {
    accessToken: (userId: string, token: string, address: string = '') =>
        `access-tokens:${userId}:${token}:${address}`,
    refreshToken: (userId: string, token: string, address: string = '') =>
        `refresh-tokens:${userId}:${token}:${address}`,
    user: (userId: string) => `user:${userId}`,
    userProfile: (userId: string) => `userProfile:${userId}`,
    trumpRunProfile: (userId: string) => `trumpRunProfile:${userId}`,
    pingpongzProfile: (userId: string) => `pingpongzProfile:${userId}`,
    blackJackProfile: (userId: string) => `blackJackProfile:${userId}`,
    bigMoneyProfile: (userId: string) => `bigMoneyProfile:${userId}`,
    attribute: () => `attribute`,
    skillSlot: () => `skill-slot-price`,
    nonce: (nonce: string) => `nonce:${nonce}`,
    leaderBoard: () => 'leader-board',
    shareBigMoney: (userId: string) => `shareBigMoney:${userId}`,
    basicTaskBigMoney: (userId: string) => `basicTaskBigMoney:${userId}`,
    bitCoinPrice: () => `bit-coin-price`,
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
    private redisClient: Redis

    constructor(@Inject() private config: Config) {
        this.redisClient = new Redis(config.redis)
    }

    async check() {
        await this.redisClient.ping()
    }

    async keys(pattern: string): Promise<string[]> {
        return await this.redisClient.keys(pattern)
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

    async getObject<T>(key: string): Promise<T> {
        const res = await this.get(key)
        return JSON.parse(res)
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

    async zAdd(key: string, member: string, score: number) {
        return await this.redisClient.zadd(key, score, member)
    }

    async getLeaderBoardWithTop(key: string, top: number) {
        return await this.redisClient.zrevrange(key, 0, top)
    }

    async getUserShare(key: string) {
        return await this.redisClient.smembers(key)
    }

    async sAdd(key: string, member: string) {
        return await this.redisClient.sadd(key, member)
    }

    async getUserRank(key: string, member: string) {
        return await this.redisClient.zrevrank(key, member)
    }
}
