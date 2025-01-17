import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../../app'
import { Router } from 'express'
import { GameAirdropAdminController } from './game-airdrop-admin.controller'
import { AuthMiddleware } from '../../auth/auth.middleware'
import { transformAndValidate } from '../../../utils/validator'
import { GameAirdropCreateReqDTO } from '../dtos/game-airdrop-create.dto'
import { GameAirdropGetListReqDTO } from '../dtos/game-airdrop-list-get.dto'
import { GameAirdropAdminGetListReqDTO } from '../dtos/game-airdrop-admin-get-list-get.dto'
import { GameAirdropTransactionAdminGetListReqDTO } from '../dtos/game-airdrop-transaction-admin-get-list-req.dto'
import { AuthAdminMiddleware } from '../../admin/auth/auth-admin.middleware'

@Service()
export class GameAirdropAdminRoute implements BaseRoute {
    route?: string = 'airdrops'
    router: Router = Router()

    constructor(
        @Inject()
        private gameAirdropAdminController: GameAirdropAdminController,
        @Inject() private authAdminMiddleware: AuthAdminMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        // middleware
        this.router.use(
            '',
            this.authAdminMiddleware.authorize.bind(this.authAdminMiddleware)
        )

        // get game airdrops
        this.router.get(
            '',
            transformAndValidate(GameAirdropAdminGetListReqDTO),
            this.gameAirdropAdminController.getGameAirdrops.bind(
                this.gameAirdropAdminController
            )
        )

        // create info game airdrop
        this.router.post(
            '/airdrop',
            transformAndValidate(GameAirdropCreateReqDTO),
            this.gameAirdropAdminController.createAirdrop.bind(
                this.gameAirdropAdminController
            )
        )

        // get participants by game airdrop id
        this.router.get(
            '/:gameAirdropId/game-airdrop-transactions',
            transformAndValidate(GameAirdropTransactionAdminGetListReqDTO),
            this.gameAirdropAdminController.getGameAirdropTransactions.bind(
                this.gameAirdropAdminController
            )
        )
    }
}
