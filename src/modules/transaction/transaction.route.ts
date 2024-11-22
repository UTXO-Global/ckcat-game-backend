import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { AuthMiddleware } from '../auth/auth.middleware'
import { TransactionController } from './transaction.controller'

@Service()
export class TransactionRoute implements BaseRoute {
    route?: string = 'transaction'
    router: Router = Router()

    constructor(
        @Inject() private transactionController: TransactionController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            '/create-transaction',
            this.authMiddleware.authorizeTelegram.bind(this.authMiddleware),
            this.transactionController.createTransaction.bind(this.transactionController)
        )

        this.router.get(
            '/detail/:transactionId',
            this.authMiddleware.authorizeTelegram.bind(this.authMiddleware),
            this.transactionController.getTransactionInfo.bind(this.transactionController)
        )

        this.router.get(
            '/transactions',
            this.authMiddleware.authorizeTelegram.bind(this.authMiddleware),
            this.transactionController.getTransactions.bind(this.transactionController)
        )
    }
}
