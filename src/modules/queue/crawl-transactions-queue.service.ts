import { Queue } from 'bullmq'
import { redisService } from '../redis/redis.service'

export const TransactionsCrawlQueueName = 'transactions-crawl'

export const TransactionsCrawlQueue = new Queue(TransactionsCrawlQueueName, {
    connection: redisService.initIORedis(),
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 100,
    },
})