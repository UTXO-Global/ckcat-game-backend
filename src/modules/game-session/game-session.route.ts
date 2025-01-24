import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { GameSessionController } from './game-session.controller'
import { GameSessionCreateReqDTO } from './dtos/game-session-create-req.dto'
import { AuthMiddleware } from '../auth/auth.middleware'
import { BaseRoute } from '../../app'
import { transformAndValidate } from '../../utils/validator'

@Service()
export class GameSessionRoute implements BaseRoute {
    route?: string = 'game-sessions'
    router: Router = Router()

    constructor(
        @Inject() private gameSessionController: GameSessionController,
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

        // create game session
        this.router.post(
            '',
            transformAndValidate(GameSessionCreateReqDTO),
            this.gameSessionController.createGameSession.bind(
                this.gameSessionController
            )
        )
    }
}
