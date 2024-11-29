import { Queue, Worker } from 'bullmq'
import { Config } from '../../configs'
import {
    EventService,
} from '../event/event.service'

import {
    TransactionsCrawlQueueName,
} from '../queue/crawl-transactions-queue.service'
import { redisService } from '../redis/redis.service'

export class TransactionsCrawlService {
    config: Config
    eventService: EventService
    transactionsCrawlQueue: Queue

    constructor(
        config: Config,
        eventService: EventService,
        transactionsCrawlQueue: Queue,
    ) {
        this.config = config
        this.eventService = eventService
        this.transactionsCrawlQueue = transactionsCrawlQueue
        this.initTransactionsCrawlWorker()
    }

    initTransactionsCrawlWorker = () => {
        new Worker(
            TransactionsCrawlQueueName,
            async () => {
                await this.transactionsCrawl()
            },
            { connection: redisService.initIORedis() }
        )
    }

    transactionsCrawl = async () => {
        try {
        } catch (err) {
            throw err
        }
    }

    addTransactionsCrawlToQueue = async () => {
        await this.transactionsCrawlQueue.add(
            TransactionsCrawlQueueName,
            {},
            {
                repeat: {
                    every: 10 * 1000,
                },
            }
        )
    }
}
