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
import { config } from '../../configs'
import { helpers } from "@ckb-lumos/lumos";
import { AGGRON4, LINA } from '../networks'
import { Transaction } from './entities/transaction.entity'
import { Order } from '../order/entities/order.entity'
import { parseHexToString, parsePrice } from '../../utils'
import { Package } from '../package/entities/package.entity'
import { startTransaction } from '../../database/connection'
import { ObjectId } from 'mongodb';

let firstCall = 0;
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
        firstCall = 0;
        new Worker(
            TransactionsCrawlQueueName,
            async () => {
                await this.transactionsCrawl()
            },
            { connection: redisService.initIORedis() }
        )
    }

    getCells = async (cursor = '0x', limit = '0x64') => {
        const url = this.config.ckbURL;
        const lumosConfig = config.isProductionNodeEnv() ? LINA  : AGGRON4;

        const toScript = helpers.parseAddress(this.config.ckAddress, {
            config: lumosConfig,
        });

        if (firstCall === 0) {
            let res = await axios.post(url, {
                "id": 2,
                "jsonrpc": "2.0",
                "method": "get_cells",
                "params": [{
                    "script": {
                            "code_hash": toScript.codeHash,
                            "hash_type": toScript.hashType,
                            "args": toScript.args
                        },
                    "script_type": "lock"
                  }, "desc", limit]
            })
            firstCall++;
            return res.data.result;
        } else {
            let res = await axios.post(url, {
                "id": 2,
                "jsonrpc": "2.0",
                "method": "get_cells",
                "params": [{
                    "script": {
                            "code_hash": toScript.codeHash,
                            "hash_type": toScript.hashType,
                            "args": toScript.args
                        },
                    "script_type": "lock"
                  }, "desc", limit, cursor]
            })
            return res.data.result;
        }
    }

    getAllCells = async (cursor = '0x', limit = '0x64', allCells = []) => {
        try {
            const result = await this.getCells(cursor, limit);
            allCells = allCells.concat(result.objects);
            
            if (result.last_cursor != '0x' || firstCall === 0) {
                return await this.getAllCells(result.last_cursor, limit, allCells);
            } else {
                return allCells;
            }
        } catch (error) {
            throw new Error('Error fetching all cells recursively');
        }
    }
    

    getTransactions = async () => {
        const data = await this.getAllCells('0x', '0x64');
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
            firstCall = 0;
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
