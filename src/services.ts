import { config } from './configs'
import { EventService } from './modules/event/event.service'
import { redisService } from './modules/redis/redis.service'
import { TransactionsCrawlService } from './modules/transaction/transaction-crawl.service'
import { TransactionsCrawlQueue } from './modules/queue/crawl-transactions-queue.service'

export const eventService = new EventService(redisService)

export const transactionCrawlService = new TransactionsCrawlService(
    config,
    eventService,
    TransactionsCrawlQueue
)