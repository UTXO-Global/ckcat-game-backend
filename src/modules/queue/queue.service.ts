import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import {
    TransactionsCrawlQueue,
} from './crawl-transactions-queue.service'

export const serverAdapter = new ExpressAdapter()

createBullBoard({
    queues: [
        new BullMQAdapter(TransactionsCrawlQueue),
    ],
    serverAdapter: serverAdapter,
})

serverAdapter.setBasePath('/admin/queues')
