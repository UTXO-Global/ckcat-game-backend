import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { AuthMiddleware } from '../auth/auth.middleware'
import { UserController } from './user.controller'
import { CoinReqDTO } from './dtos/coin.dto'
import {
    transformAndValidate,
    transformDecryptAndValidate,
} from '../../utils/validator'
import { Config } from '../../configs'
import { PurchaseReqDTO } from './dtos/purchase_req.dto'
import { RefundPurchaseStarsReqDTO } from './dtos/refund_purchase_star.dto'
import { GetStarTransactionReqDTO } from './dtos/get_star_transaction.dto'

@Service()
export class UserRoute implements BaseRoute {
    route?: string = 'user'
    router: Router = Router()

    constructor(
        @Inject() private config: Config,
        @Inject() private userController: UserController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.get(
            '/get-user-info',
            this.authMiddleware.authorizeTelegram.bind(this.authMiddleware),
            this.userController.getUserInfo.bind(this.userController)
        )
    }
}
