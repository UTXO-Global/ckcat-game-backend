import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { AuthMiddleware } from '../auth/auth.middleware'
import { BaseRoute } from '../../app'
import { transformAndValidate } from '../../utils/validator'
import { GameAirdropController } from './game-airdrop.controller'
import { GameAirdropAdminGetListReqDTO } from './dtos/game-airdrop-admin-get-list-get.dto'
import { GameAirdropTransactionAdminGetListReqDTO } from './dtos/game-airdrop-transaction-admin-get-list-req.dto'
import { GameAirdropGetDetailReqDTO } from './dtos/game-airdrop-get-detail.dto'
import { GameAirdropJoinReqDTO } from './dtos/game-airdrop-join.dto'
import { GameAirdropUserGetReqDTO } from './dtos/game-airdrop-user-get.dto'
import { GameAirdropInfoGetListReqDTO } from './dtos/game-airdrop-info-get-list.dto'

@Service()
export class GameAirdropRoute implements BaseRoute {
    route?: string = 'game-airdrops'
    router: Router = Router()

    constructor(
        @Inject() private gameAirdropController: GameAirdropController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.use(
            '',
            this.authMiddleware.authorization.bind(this.authMiddleware)
        )

        // get list airdrop
        this.router.get(
            '/list',
            transformAndValidate(GameAirdropInfoGetListReqDTO),
            this.gameAirdropController.getListAirdrop.bind(
                this.gameAirdropController
            )
        )

        // get airdrop detail
        this.router.get(
            '/:gameAirdropId',
            transformAndValidate(GameAirdropGetDetailReqDTO),
            this.gameAirdropController.getAirdropDetail.bind(
                this.gameAirdropController
            )
        )

        // join airdrop
        this.router.post(
            '/join',
            transformAndValidate(GameAirdropJoinReqDTO),
            this.gameAirdropController.joinAirdrop.bind(
                this.gameAirdropController
            )
        )

        // get list airdrop tx of user
        this.router.get(
            '/:gameAirdropId/transactions',
            transformAndValidate(GameAirdropUserGetReqDTO),
            this.gameAirdropController.getAirdropTxUser.bind(
                this.gameAirdropController
            )
        )
    }
}
