import { Worker } from 'bullmq'
import Container, { Service } from 'typedi'
import Redis from 'ioredis'
import { config } from '../configs'
import { bitCoinPrice } from './workers/bit-coin-price'
import { QueueManager } from './queues'

@Service()
export class WorkerManager {
    private workers: Record<string, Worker> = {}

    static connection() {
        return new Redis({
            ...config.redis,
            maxRetriesPerRequest: null,
        })
    }

    getWorker(name: string) {
        return this.workers[name]
    }

    addWorker(worker: Worker) {
        this.workers[worker.name] = worker
        return worker
    }

    async close() {
        await Promise.all(
            Object.values(this.workers).map((worker) => worker.close())
        )
    }
}

export const setupWorkers = () => {
    const workers = [bitCoinPrice()]
    workers.forEach((worker) => Container.get(WorkerManager).addWorker(worker))
}

export const setupCrons = async () => {
    const crons = [
        {
            worker: bitCoinPrice(),
            pattern: '*/10 * * * *',
        },
    ]
    for (const cron of crons) {
        const queue = Container.get(QueueManager).getQueue(cron.worker.name)
        // remove all existing repeatable jobs
        const jobs = await queue.getRepeatableJobs()
        await Promise.all(
            jobs.map((job) => queue.removeRepeatableByKey(job.key))
        )
        // add new repeatable job
        await queue.add(cron.worker.name, null, {
            repeat: {
                pattern: cron.pattern,
            },
        })
    }
}
