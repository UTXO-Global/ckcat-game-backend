import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { Router } from 'express'
import { GameSeasonController } from './game-season.controller'
import { AuthMiddleware } from '../auth/auth.middleware'
import { transformAndValidate } from '../../utils/validator'
import { GameSeasionGetDTO } from './dtos/game-season-get.dto'

@Service()
export class GameSeasonRoute implements BaseRoute {
    route?: string = 'game-season'
    router: Router = Router()

    constructor(
        @Inject() private gameSeasonController: GameSeasonController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            '',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            transformAndValidate(GameSeasionGetDTO),
            this.gameSeasonController.getGameSeasons.bind(
                this.gameSeasonController
            )
        )
    }
}
