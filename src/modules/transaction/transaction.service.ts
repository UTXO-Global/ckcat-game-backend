import { Inject, Service } from 'typedi'
import { Config } from '../../configs'
import { CacheManager } from '../../caches'
import { InvoiceDTO } from '../invoice/dtos/invoice.dto'
import { startTransaction } from '../../database/connection'
import { plainToInstance } from 'class-transformer'
import { TransactionDTO } from './dtos/transaction.dto'
import { Transaction } from './entities/transaction.entity'

@Service()
export class TransactionService {
    constructor(
        @Inject() private config: Config,
        @Inject() private cacheManager: CacheManager
    ) {}

    async createTransaction(
        invoiceDTO: InvoiceDTO,
        telegramPaymentChargeId: string,
        providerPaymentChargeId: string
    ) {
        await startTransaction(async (manager) => {
            const transactionDTO = plainToInstance(TransactionDTO, invoiceDTO, {
                excludeExtraneousValues: true,
            })
            transactionDTO.telegramPaymentChargeId = telegramPaymentChargeId
            transactionDTO.providerPaymentChargeId = providerPaymentChargeId
            await Transaction.createTransaction(transactionDTO, manager)
        })
    }
}
