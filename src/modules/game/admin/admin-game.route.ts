import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../../app'
import { Router } from 'express'
import { AuthAdminMiddleware } from '../../admin/auth/auth-admin.middleware'
import { AdminGameController } from './admin-game.controller'
import { transformAndValidate } from '../../../utils/validator'
import { GameRewardUpdateReqDTO } from './dtos/game-reward-update.dto'
import { GameRewardGetListReqDTO } from './dtos/game-reward-get-list.dto'

@Service()
export class AdminGameRoute implements BaseRoute {
    route?: string = 'game'
    router: Router = Router()

    constructor(
        @Inject() private authAdminMiddleware: AuthAdminMiddleware,
        @Inject() private adminGameController: AdminGameController
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.get(
            '/rewards',
            this.authAdminMiddleware.authorize.bind(this.authAdminMiddleware),
            transformAndValidate(GameRewardGetListReqDTO),
            this.adminGameController.getListGameReward.bind(
                this.adminGameController
            )
        )

        this.router.put(
            '/rewards',
            this.authAdminMiddleware.authorize.bind(this.authAdminMiddleware),
            transformAndValidate(GameRewardUpdateReqDTO),
            this.adminGameController.updateListGameReawrd.bind(
                this.adminGameController
            )
        )
    }
}
