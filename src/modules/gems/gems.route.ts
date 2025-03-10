import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { AuthMiddleware } from '../auth/auth.middleware'
import { GemsController } from './gems.controller'
import { Config } from '../../configs'
import { transformAndValidate } from '../../utils/validator'
import { GemsConvertDTO } from './dtos/gems-convert.dto'

@Service()
export class GemsRoute implements BaseRoute {
    route?: string = 'gems'
    router: Router = Router()

    constructor(
        @Inject() private config: Config,
        @Inject() private gemsController: GemsController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            '/gems-history',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.gemsController.gemsHistory.bind(this.gemsController)
        )

        this.router.post(
            '/convert',
            this.authMiddleware.authorizeApiKey.bind(this.authMiddleware),
            transformAndValidate(GemsConvertDTO),
            this.gemsController.convertGems.bind(this.gemsController)
        )
    }
}
