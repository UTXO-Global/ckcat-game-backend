import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { Config } from '../../configs'
import { InvoiceController } from './invoice.controller'
import { AuthMiddleware } from '../auth/auth.middleware'
import {
    transformAndValidate,
    transformDecryptAndValidate,
} from '../../utils/validator'
import { PurchaseReqDTO } from '../user/dtos/purchase_req.dto'

@Service()
export class InvoiceRoute implements BaseRoute {
    route?: string = 'invoice'
    router: Router = Router()

    constructor(
        @Inject() private config: Config,
        @Inject() private invoiceController: InvoiceController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            '/send-invoice',
            this.authMiddleware.authorizeTelegram.bind(this.authMiddleware),
            this.invoiceController.sendInvoice.bind(this.invoiceController)
        )

        this.router.post(
            '/create-purchase-stars',
            this.authMiddleware.authorizeTelegram.bind(this.authMiddleware),
            transformAndValidate(PurchaseReqDTO),
            this.invoiceController.createPurchaseStars.bind(
                this.invoiceController
            )
        )

        this.router.post(
            '/create-purchase-with-provider',
            this.authMiddleware.authorizeTelegram.bind(this.authMiddleware),
            transformAndValidate(PurchaseReqDTO),
            this.invoiceController.createPurchaseWithProvider.bind(
                this.invoiceController
            )
        )
    }
}
