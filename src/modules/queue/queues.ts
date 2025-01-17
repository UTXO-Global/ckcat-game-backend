import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { DefaultJobOptions, Queue } from 'bullmq'
import Container, { Inject, Service } from 'typedi'
import express from 'express'
import expressBasicAuth from 'express-basic-auth'
import { Config } from '../../configs'
import { redisService } from '../redis/redis.service'
export enum QueueName {
    bot = 'bot',
}

@Service()
export class QueueManager {
    private readonly queues: Record<string, Queue> = {}

    constructor(@Inject() private config: Config) {}

    createQueue(
        queueName: string,
        jobOptions: DefaultJobOptions = {
            removeOnComplete: 50,
            removeOnFail: 50,
        }
    ): Queue {
        const queue = new Queue(queueName, {
            connection: redisService.initIORedis(),
            defaultJobOptions: jobOptions,
        })
        this.queues[queueName] = queue
        return queue
    }

    getQueue(queueName: QueueName | string): Queue {
        const queue = this.queues[queueName]
        if (!queue) {
            throw new Error(`Queue [${queueName}] does not exist`)
        }
        return queue
    }

    createBoard() {
        const queueAdapter = new ExpressAdapter()
        createBullBoard({
            queues: Object.values(this.queues).map(
                (queue) => new BullMQAdapter(queue)
            ),
            serverAdapter: queueAdapter,
            options: {
                uiConfig: {
                    boardTitle: '',
                    boardLogo: { path: '' },
                },
            },
        })
        queueAdapter.setBasePath('/admin/queues')

        return queueAdapter
    }

    async removeRepeatableJobs(queueName: string) {
        const queue = this.getQueue(queueName)
        const jobs = await queue.getRepeatableJobs()
        await Promise.all(
            jobs.map((job) => queue.removeRepeatableByKey(job.key))
        )
    }
}

export const setupQueues = (app: express.Express, extras: string[] = []) => {
    const queueManager = Container.get(QueueManager)
    Object.values(QueueName).forEach((queueName) => {
        queueManager.createQueue(queueName)
    })

    extras.forEach((queueName) => queueManager.createQueue(queueName))
    app.use(
        '/admin/queues',
        expressBasicAuth({
            challenge: true,
            users: { admin: Container.get(Config).basicAuthPassword },
        }),
        queueManager.createBoard().getRouter()
    )
}
