import { Inject, Service } from 'typedi'
import { Config } from '../../configs'
import { UserService } from '../user/user.service'
import { InvoiceDTO } from '../invoice/dtos/invoice.dto'
import { DataRequest } from '../../base/base.request'
import { RefundPurchaseStarsReqDTO } from '../user/dtos/refund_purchase_star.dto'
import { NextFunction, Response } from 'express'
import axios from 'axios'
import { ResponseWrapper } from '../../utils/response'
import { GetStarTransactionReqDTO } from '../user/dtos/get_star_transaction.dto'
import { TransactionService } from './transaction.service'

@Service()
export class TransactionController {
    constructor(
        @Inject() private config: Config,
        @Inject() public transactionService: TransactionService
    ) {}

    async createTransaction(
        invoiceDTO: InvoiceDTO,
        telegramPaymentChargeId: string,
        providerPaymentChargeId: string
    ) {
        try {
            await this.transactionService.createTransaction(
                invoiceDTO,
                telegramPaymentChargeId,
                providerPaymentChargeId
            )
        } catch (error) {
            throw error
        }
    }

    async refundPurchaseStar(
        req: DataRequest<RefundPurchaseStarsReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const refundInfo = {
                user_id: req.data.userId,
                telegram_payment_charge_id: req.data.telegramPaymentChargeId,
            }
            const response = await axios.post(
                `https://api.telegram.org/bot${this.config.telegramTokenBot}/refundStarPayment`,
                refundInfo
            )

            res.send(new ResponseWrapper(response.data.result))
        } catch (error) {
            next(error)
        }
    }

    async getStarTransactions(
        req: DataRequest<GetStarTransactionReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const transactionsInfo = {
                limit: req.data.limit ?? 100,
                offset: req.data.offset ?? 0,
            }
            const response = await axios.post(
                `https://api.telegram.org/bot${this.config.telegramTokenBot}/getStarTransactions`,
                transactionsInfo
            )

            res.send(new ResponseWrapper(response.data.result))
        } catch (error) {
            next(error)
        }
    }
}
