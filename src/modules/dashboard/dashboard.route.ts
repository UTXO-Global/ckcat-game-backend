import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { AuthMiddleware } from '../auth/auth.middleware'
import { BaseRoute } from '../../app'
import { transformAndValidate } from '../../utils/validator'
import { DashboardController } from './dashboard.controller'
import { DashboardGetListNewPlayerReqDTO } from './dtos/dashboard-get-list-new-player.dto'
import { DashboardGetListActivePlayerReqDTO } from './dtos/dashboad-get-list-active-player.dto'
import { DashboardGetNumOfPlayerReqDTO } from './dtos/dashboad-get-num-of-player.dto'
import { AuthAdminMiddleware } from '../admin/auth/auth-admin.middleware'

@Service()
export class DashboardRoute implements BaseRoute {
    route?: string = 'dashboard'
    router: Router = Router()

    constructor(
        @Inject() private dashboardController: DashboardController,
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

        // get new players
        this.router.get(
            '/new-players',
            transformAndValidate(DashboardGetListNewPlayerReqDTO),
            this.dashboardController.getNewPlayers.bind(
                this.dashboardController
            )
        )

        // get active players
        this.router.get(
            '/active-players',
            transformAndValidate(DashboardGetListActivePlayerReqDTO),
            this.dashboardController.getActivePlayers.bind(
                this.dashboardController
            )
        )

        // get num of players
        this.router.get(
            '/num-of-players',
            transformAndValidate(DashboardGetNumOfPlayerReqDTO),
            this.dashboardController.getNumOfPlayers.bind(
                this.dashboardController
            )
        )

        // get num of wallets
        this.router.get(
            '/num-of-wallets',
            transformAndValidate(DashboardGetNumOfPlayerReqDTO),
            this.dashboardController.getNumOfWallets.bind(
                this.dashboardController
            )
        )
    }
}
