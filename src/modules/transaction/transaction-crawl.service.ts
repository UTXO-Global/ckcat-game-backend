import { Queue, Worker } from 'bullmq'
import { Config } from '../../configs'
import {
    EventService,
} from '../event/event.service'

import {
    TransactionsCrawlQueueName,
} from '../queue/crawl-transactions-queue.service'
import { redisService } from '../redis/redis.service'
import axios from 'axios'
import { Transaction } from './entities/transaction.entity'
import { Order } from '../order/entities/order.entity'
import { parseHexToString, parsePrice } from '../../utils'
import { Package } from '../package/entities/package.entity'
import { startTransaction } from '../../database/connection'
import { ObjectId } from 'mongodb';

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

    getCells = async () => {
        const url = this.config.ckbURL;
        try {
            let res = await axios.post(url, {
                "id": 2,
                "jsonrpc": "2.0",
                "method": "get_cells",
                "params": [{
                    "script": {
                            "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                            "hash_type": "type",
                            "args": "0xa600544bde5aa913b33a45b8f84dfe2227eded4c"
                        },
                    "script_type": "lock"
                  }, "desc", "0x3e8"]
            })
            return res.data.result;
        } catch (error) {
            throw error;
        }
        
    }

    getAllCells = async ( allCells = []) => {
        try {
            const result = await this.getCells();
            return allCells.concat(result.objects);
        } catch (error) {
            throw error;
        }
    }
    

    getTransactions = async () => {
        const data = await this.getAllCells();
        return data.filter(item => item.output_data !== '0x');
    }

    getTransaction = async (txHash) => {
        const url = this.config.ckbURL;

        const res = await axios.post(url, {
            "id": 2,
            "jsonrpc": "2.0",
            "method": "get_transaction",
            "params": [txHash]
        })
        return res.data.result;
    }

    transactionsCrawl = async () => {
        try {
            const transactions = await this.getTransactions();
            
            if (!transactions.length) return
            
            for (const transaction of transactions) {
                
                const transactionDetail = await this.getTransaction(transaction.out_point.tx_hash);
                const outputsData = transactionDetail.transaction.outputs_data;
                
                let orderId = parseHexToString(outputsData[1]);
                if (!ObjectId.isValid(orderId)) {
                    continue;
                }
                let order = await Order.getOrderById(orderId)
                
                if (!order || (transactionDetail.tx_status.status === order.status)) continue
                const capacities = transactionDetail.transaction.outputs.map(output => {
                    return parsePrice(output.capacity);
                });
                const packageModel = await Package.getPackage(order.packageId);
                const price = capacities.includes(packageModel.price);

                if (!price) continue;
                await startTransaction(async (manager) => {
                    await Transaction.saveTransaction({
                        userId: order.userId,
                        orderId: order._id.toString(),
                        txHash: transaction.out_point.tx_hash,
                        price: packageModel.price,
                        status: transactionDetail.tx_status.status,
                    }, manager)
                    await Order.updateOrderStatus(order._id.toString(), transactionDetail.tx_status.status, manager)
                })
            }
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
                    every: 100 * 1000,
                },
            }
        )
    }
}
