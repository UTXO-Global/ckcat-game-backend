import IORedis from 'ioredis'
import { createClient, RedisClientType } from 'redis'
import { Config, config } from '../../configs'
import { logger } from '../../helpers/logger'

export class RedisService {
    conf: Config
    client: RedisClientType

    constructor(conf: Config) {
        this.conf = conf
        this.client = createClient({ url: this.conf.redisUri })
    }

    async connect() {
        await this.client.connect()
        logger.info('Redis connect successful!')
    }

    initIORedis() {
        return new IORedis(this.conf.redisUri, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        })
    }

    async get(key: string): Promise<string> {
        return await this.client.get(key)
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        await this.client.set(key, value)
        if (ttl) {
            await this.client.expire(key, ttl)
        }
    }

    async setObject(key: string, object: unknown, ttl?: number) {
        await this.set(key, JSON.stringify(object), ttl)
    }

    async del(key: string): Promise<number> {
        return await this.client.del(key)
    }

    async exist(key: string) {
        return await this.client.exists(key)
    }

    async hget(key: string, field: string) {
        return await this.client.hGet(key, field)
    }

    async hset(key: string, field: string, value: string) {
        await this.client.hSet(key, field, value)
    }

    async hgetall(key: string) {
        return await this.client.hGetAll(key)
    }

    async hsetBulk(key: string, fv: string[]) {
        await this.client.hSet(key, fv)
    }
}

export const redisService = new RedisService(config)
