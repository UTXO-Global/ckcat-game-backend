import { Job, Worker } from 'bullmq'
import { QueueName } from '../queues'
import { Telegraf } from 'telegraf'
import Container from 'typedi'
import { Config } from '../../../configs'
import { WorkerManager } from '../workers'

export const createBotWorker = () => {
    return new Worker(
        QueueName.bot,
        async (job: Job) => {
            const { userId, urlImage, content, reply_markup } = job.data
            const config = Container.get(Config)
            const bot = new Telegraf(config.telegramTokenBot)
            try {
                await bot.telegram.sendPhoto(userId, urlImage, {
                    caption: content,
                    reply_markup,
                })
            } catch (error) {
                throw error
            }
        },
        {
            connection: WorkerManager.connection(),
        }
    )
}
