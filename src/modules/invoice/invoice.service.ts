import { Inject, Service } from 'typedi'
import { Config } from '../../configs'
import { CacheManager } from '../../caches'
import { PurchaseReqDTO } from '../user/dtos/purchase_req.dto'
import { startTransaction } from '../../database/connection'
import { InvoiceDTO } from './dtos/invoice.dto'
import { Invoice } from './entities/invoice.entity'

@Service()
export class InvoiceService {
    constructor(
        @Inject() private config: Config,
        @Inject() private cacheManager: CacheManager
    ) {}

    async createInvoice(orderId: string, userId: string, data: PurchaseReqDTO) {
        await startTransaction(async (manager) => {
            const invoiceDTO = new InvoiceDTO()
            invoiceDTO.init(orderId, userId, data)
            await Invoice.createInvoice(invoiceDTO, manager)
        })
    }

    async paidInvoice(orderId: string) {
        await startTransaction(async (manager) => {
            await Invoice.paid(orderId, manager)
        })
    }
}
