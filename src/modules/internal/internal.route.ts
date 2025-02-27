import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { Router } from 'express'
import { Config } from '../../configs'
import { AuthMiddleware } from '../auth/auth.middleware'
import { InternalController } from './internal.controller'
import { transformAndValidate } from '../../utils/validator'
import { InternalRefferalReqDTO } from './dtos/internal-refferal.dto'
import { InternalLeaderboardReqDTO } from './dtos/internal-leaderboard.dto'

@Service()
export class InternalRoute implements BaseRoute {
    route?: string = 'internal'
    router: Router = Router()

    constructor(
        @Inject() private config: Config,
        @Inject() private internalController: InternalController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            '/daily-check-in',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.internalController.dailyCheckin.bind(this.internalController)
        )
        this.router.get(
            '/profile',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.internalController.getProfile.bind(this.internalController)
        )
        this.router.post(
            '/referral',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            transformAndValidate(InternalRefferalReqDTO),
            this.internalController.addReferral.bind(this.internalController)
        )
        this.router.get(
            '/leaderboard',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            transformAndValidate(InternalLeaderboardReqDTO),
            this.internalController.getLeaderboard.bind(this.internalController)
        )
        this.router.get(
            '/referrals',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.internalController.getListReferral.bind(
                this.internalController
            )
        )
    }
}
