import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { AuthMiddleware } from '../auth/auth.middleware'
import { GameController } from './game.controller'
import { Config } from '../../configs'

@Service()
export class GameRoute implements BaseRoute {
    route?: string = 'game'
    router: Router = Router()

    constructor(
        @Inject() private config: Config,
        @Inject() private gameController: GameController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            '/create-game',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.gameController.createGame.bind(this.gameController)
        )
        this.router.get(
            '/game-info',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.gameController.getGameInfo.bind(this.gameController)
        )
        //claim gems when watch video
        this.router.get(
            '/claim/watch-video',
            this.gameController.claimWatchVideo.bind(this.gameController)
        )
        //claim gems when watch ads
        this.router.get(
            '/claim/watch-ads',
            this.gameController.claimWatchAds.bind(this.gameController)
        )
        // unlock training cat
        this.router.post(
            '/unlock-training',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.gameController.unlockTraining.bind(this.gameController)
        )

        this.router.get(
            '/data',
            this.authMiddleware.authorization.bind(this.authMiddleware),

            this.gameController.getDecryptedGameData.bind(this.gameController)
        )
    }
}
