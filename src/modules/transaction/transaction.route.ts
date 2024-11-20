import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { Router } from 'express'
import { Config } from '../../configs'
import { TransactionController } from './transaction.controller'
import { AuthMiddleware } from '../auth/auth.middleware'
import { transformAndValidate } from '../../utils/validator'
import { RefundPurchaseStarsReqDTO } from '../user/dtos/refund_purchase_star.dto'
import { GetStarTransactionReqDTO } from '../user/dtos/get_star_transaction.dto'

@Service()
export class TransactionRoute implements BaseRoute {
    route?: string = 'transaction'
    router: Router = Router()

    constructor(
        @Inject() private config: Config,
        @Inject() private transactionController: TransactionController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            '/refund-purchase-stars',
            transformAndValidate(RefundPurchaseStarsReqDTO),
            this.transactionController.refundPurchaseStar.bind(
                this.transactionController
            )
        )

        this.router.get(
            '/get_star_transactions',
            transformAndValidate(GetStarTransactionReqDTO),
            this.transactionController.getStarTransactions.bind(
                this.transactionController
            )
        )
    }
}
