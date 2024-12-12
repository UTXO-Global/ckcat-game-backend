import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { Router } from 'express'
import { CheckInController } from './check-in.controller'
import { AuthMiddleware } from '../auth/auth.middleware'

@Service()
export class CheckInRoute implements BaseRoute {
    route?: string = 'check-in'
    router: Router = Router()

    constructor(
        @Inject() private checkInController: CheckInController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            '',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.checkInController.checkIn.bind(this.checkInController)
        )
    }
}
