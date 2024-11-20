import { ClassConstructor, plainToInstance } from 'class-transformer'
import { Redis } from 'ioredis'
import { Inject, Service } from 'typedi'
import { Config } from '../configs'
import { Pagination } from '../utils/response'

export const CacheTime = {
    day: (time = 1) => {
        return time * CacheTime.hour(24)
    },
    hour: (time = 1) => {
        return time * CacheTime.minute(60)
    },
    minute: (time = 1) => time * 60,
}

@Service()
export class CacheService {
    private redisClient: Redis

    constructor(@Inject() private config: Config) {
        this.redisClient = new Redis(this.config.redis)
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

    async hexists(key: string, field: string) {
        return await this.redisClient.hexists(key, field)
    }

    async hdel(key: string, fields: string[]): Promise<number> {
        return await this.redisClient.hdel(key, ...fields)
    }

    async jsonset(key: string, object: unknown, path?: string, ttl?: number) {
        path = path ? `$.${path}` : '$'
        return await this.redisClient
            .multi()
            .call('JSON.SET', key, path, JSON.stringify(object))
            .expire(key, ttl)
            .exec()
    }

    async jsonmset(
        data: { key: string; object: unknown; path?: string }[],
        ttl?: number
    ) {
        const args = data
            .map(({ key, object, path }) => {
                path = path ? `$.${path}` : '$'
                return [key, path, JSON.stringify(object)]
            })
            .flat()
        await this.redisClient.multi().call('JSON.MSET', args).exec()
        if (ttl) {
            await this.mexpire(data.map((item) => ({ key: item.key, ttl })))
        }
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

    async jsonmget<T>(cls: ClassConstructor<T>, keys: string[], path?: string) {
        keys.push(path ? `$.${path}` : '$')
        const results = await this.redisClient.call('JSON.MGET', keys)

        if (!Array.isArray(results)) return

        const parseds = results
            .map((res) => {
                return <[]>JSON.parse(res)
            })
            .flat()
        return plainToInstance(cls, parseds, { excludeExtraneousValues: true })
    }

    async zadd(key: string, member: string, score: number) {
        return await this.redisClient.zadd(key, score, member)
    }

    async zmadd(
        data: { key: string; member: string; score: number }[],
        ttl?: number
    ) {
        const pipeline = this.redisClient.pipeline()
        for (const { key, member, score } of data) {
            pipeline.zadd(key, score, member)
            pipeline.expire(key, ttl)
        }
        return await pipeline.exec()
    }

    async zrem(key: string, member: string) {
        return await this.redisClient.zrem(key, member)
    }

    async zrevrangebyscore(key: string, pagination: Pagination) {
        return await this.redisClient.zrange(
            key,
            '+inf',
            0,
            'BYSCORE',
            'REV',
            'LIMIT',
            pagination.getOffset(),
            pagination.limit
        )
    }

    async getLeaderboardWithTop(key: string, top: number){
        return await this.redisClient.zrevrange(
            key,
            0,
            top
        )
    }

    async getUserShare(key:string){
        return await this.redisClient.smembers(key);
    }

    async sadd(key: string, member: string) {
        return await this.redisClient.sadd(key, member)
    }

    async sismember(key: string, member: string) {
        return (await this.redisClient.sismember(key, member)) === 1
    }

    async sismembers(key: string, members: string[]) {
        const pipeline = this.redisClient.pipeline()
        for (const member of members) {
            pipeline.sismember(key, member)
        }
        return await pipeline.exec()
    }

    async mexpire(data: { key: string; ttl: number }[]) {
        const pipeline = this.redisClient.pipeline()
        for (const { key, ttl } of data) {
            pipeline.expire(key, ttl)
        }
        return await pipeline.exec()
    }
}
