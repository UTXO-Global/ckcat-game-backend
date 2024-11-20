import { Job, Worker } from 'bullmq'
import { QueueName } from '../queues'
import Container from 'typedi'
import { CacheKeys, CacheManager } from '../../caches'
import axios from 'axios'
import { WorkerManager } from '../workers'

export const bitCoinPrice = () => {
    
    return new Worker(
        QueueName.bitCoinPrice,
        async (job: Job) => {
            const cacheManager = Container.get(CacheManager)
            try {
                const response = await axios.get(
                    `https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`
                )
                await cacheManager.set(
                    CacheKeys.bitCoinPrice(),
                    response.data.price
                )
            } catch (_) {}
        },
        {
            connection: WorkerManager.connection(),
        }
    )
}
