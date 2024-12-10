import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { Config } from '../../configs'
import { AuthMiddleware } from '../auth/auth.middleware'
import { EventSettingController } from './event-setting.controller'
import { transformAndValidate } from '../../utils/validator'
import { EventSettingGetByKeyReqDTO } from './dtos/event-setting-get-by-key.dto'

@Service()
export class EventSettingRoute implements BaseRoute {
    route?: string = 'event-setting'
    router: Router = Router()

    constructor(
        @Inject() private config: Config,
        @Inject() private authMiddleware: AuthMiddleware,
        @Inject() private eventSettingController: EventSettingController
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.get(
            '/:key',
            transformAndValidate(EventSettingGetByKeyReqDTO),
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.eventSettingController.getEventSettingByKey.bind(
                this.eventSettingController
            )
        )
    }
}
