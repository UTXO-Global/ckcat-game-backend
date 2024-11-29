import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { AuthMiddleware } from '../auth/auth.middleware'
import { BaseRoute } from '../../app'
import { GameAirdropController } from './game-airdrop.controller'
import { transformAndValidate } from '../../utils/validator'
import { GameAirdropGetListReqDTO } from './dtos/game-airdrop-get-list.dto'
import { GameAirdropJoinReqDTO } from './dtos/game-airdrop-join.dto'
import { GameAirdropGetDetailReqDTO } from './dtos/game-airdrop-get-detail.dto'

@Service()
export class GameAirdropRoute implements BaseRoute {
    route?: string = 'game-airdrop'
    router: Router = Router()

    constructor(
        @Inject() private gameAirdropController: GameAirdropController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        // middleware
        this.router.use(
            '',
            this.authMiddleware.authorization.bind(this.authMiddleware)
        )

        // get list airdrop
        this.router.get(
            '/airdrops',
            transformAndValidate(GameAirdropGetListReqDTO),
            this.gameAirdropController.getListAirdrop.bind(
                this.gameAirdropController
            )
        )

        // get detail airdrop
        this.router.get(
            '/:gameAirdropId/airdrop',
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
    }
}
