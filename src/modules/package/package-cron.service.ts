import { Queue, Worker } from 'bullmq'
import { Config } from '../../configs'
import {
    EventService,
} from '../event/event.service'

import { redisService } from '../redis/redis.service'
import { PackageCronQueueName } from '../queue/cron-package-queue.service'
import { PackageTransactions } from './entities/package-transactions.entity'
import { PurchaseTypes } from './types/purchase.type'
import { Package } from './entities/package.entity'
import { GemsService } from '../gems/gems.service'

export class PackageCronService {
    config: Config
    eventService: EventService
    packageCronQueue: Queue

    constructor(
        config: Config,
        eventService: EventService,
        packageCronQueue: Queue,
    ) {
        this.config = config
        this.eventService = eventService
        this.packageCronQueue = packageCronQueue
        this.initPackageCronWorker()
    }

    initPackageCronWorker = () => {
        new Worker(
            PackageCronQueueName,
            async () => {
                await this.packageCron()
            },
            { connection: redisService.initIORedis() }
        )
    }

    packageCron = async () => {
        try {
            
            const items = await PackageTransactions.getPackageTransactions();
            if (!items.length) return

            for (const item of items) {
                if (item.purchaseID === PurchaseTypes.MonthCard) {
                    // Calculate the date 30 days ago
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    const startDate = new Date(item.createdAt);
                    if (startDate > thirtyDaysAgo) {
                        const packageModel = await Package.getPackage(item.packageId);
                        if (!packageModel) continue;
                        await GemsService.crawlGemsHistory({
                            userId: item.userId,
                            type: packageModel.purchaseID,
                            gems: packageModel.gemReceived,
                        })
                    }
                }

                if (item.purchaseID === PurchaseTypes.WeeklyCard2) {
                    // Calculate the date 14 days ago
                    const fourteenDaysAgo = new Date();
                    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
                    const startDate = new Date(item.createdAt);
                    if (startDate > fourteenDaysAgo) {
                        const packageModel = await Package.getPackage(item.packageId);
                        if (!packageModel) continue;
                        await GemsService.crawlGemsHistory({
                            userId: item.userId,
                            type: packageModel.purchaseID,
                            gems: packageModel.gemReceived,
                        })
                    }
                }

                if (item.purchaseID === PurchaseTypes.WeeklyCard1) {
                    // Calculate the date 7 days ago
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    const startDate = new Date(item.createdAt);
                    if (startDate > sevenDaysAgo) {
                        const packageModel = await Package.getPackage(item.packageId);
                        if (!packageModel) continue;
                        await GemsService.crawlGemsHistory({
                            userId: item.userId,
                            type: packageModel.purchaseID,
                            gems: packageModel.gemReceived,
                        })
                    }
                }
            }
        } catch (err) {
            throw err
        }
    }

    addPackageCronToQueue = async () => {
        await this.packageCronQueue.add(
            PackageCronQueueName,
            {},
            {
                repeat: {
                    every: 24 * 60 * 60 * 1000,
                },
            }
        )
    }
}
