import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { TransactionsCrawlQueue } from './crawl-transactions-queue.service'
import { PackageCronQueue } from './cron-package-queue.service'
import { BotPushQueue } from './bot-push-queue.service'

export const serverAdapter = new ExpressAdapter()

createBullBoard({
    queues: [
        new BullMQAdapter(TransactionsCrawlQueue),
        new BullMQAdapter(PackageCronQueue),
        new BullMQAdapter(BotPushQueue),
    ],
    serverAdapter: serverAdapter,
})

serverAdapter.setBasePath('/admin/queues')
