import { Queue } from 'bullmq'
import { redisService } from '../redis/redis.service'

export const PackageCronQueueName = 'package-cron'

export const PackageCronQueue = new Queue(PackageCronQueueName, {
    connection: redisService.initIORedis(),
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 100,
    },
})