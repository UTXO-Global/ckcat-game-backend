import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { Router } from 'express'
import { Config } from '../../configs'
import { WalletController } from './wallet.controller'
import { transformAndValidate } from '../../utils/validator'
import { WalletConnectionDTO } from './dtos/wallet-connect-req.dto'
import { GenerateCustomTokenDTO } from './dtos/generate-custom-token-req.dto'

@Service()
export class WalletRoute implements BaseRoute {
    route?: string = 'wallet'
    router: Router = Router()

    constructor(
        @Inject() private config: Config,
        @Inject() private walletController: WalletController
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            '/connection',
            transformAndValidate(WalletConnectionDTO),
            this.walletController.connection.bind(this.walletController)
        )
        this.router.post(
            '/connected',
            transformAndValidate(WalletConnectionDTO),
            this.walletController.connected.bind(this.walletController)
        )

        this.router.post(
            '/generate-custom-wallet',
            transformAndValidate(GenerateCustomTokenDTO),
            this.walletController.generateCustomTokenFirebase.bind(
                this.walletController
            )
        )
    }
}
