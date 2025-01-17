import { Queue } from 'bullmq'
import { redisService } from '../redis/redis.service'
import { QueueName } from './queues'

export const BotPushQueue = new Queue(QueueName.bot, {
    connection: redisService.initIORedis(),
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 100,
    },
})
