import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { AuthMiddleware } from '../auth/auth.middleware'
import { UserController } from './user.controller'
import { Config } from '../../configs'
import { transformAndValidate } from '../../utils/validator'
import { UserGetLeaderboardReqDTO } from './dtos/user-get-leaderboard.dto'

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
        this.router.post(
            '/sign-in',
            this.authMiddleware.authorizeTelegram.bind(this.authMiddleware),
            this.userController.signIn.bind(this.userController)
        )

        this.router.post(
            '/refresh-token',
            this.userController.refreshToken.bind(this.userController)
        )

        this.router.get(
            '/sign-out',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.userController.signOut.bind(this.userController)
        )

        this.router.get(
            '/profile',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.userController.getProfile.bind(this.userController)
        )

        this.router.get(
            '/leaderboard',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            transformAndValidate(UserGetLeaderboardReqDTO),
            this.userController.getLeaderboard.bind(this.userController)
        )
    }
}
