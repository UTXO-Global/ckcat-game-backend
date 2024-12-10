import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { AuthMiddleware } from '../auth/auth.middleware'
import { WalletController } from './wallet.controller'

@Service()
export class WalletRoute implements BaseRoute {
    route?: string = 'wallet'
    router: Router = Router()

    constructor(
        @Inject() private walletController: WalletController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            '/connect-wallet',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.walletController.connectWallet.bind(this.walletController)
        )
    }
}
