import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { Router } from 'express'
import { BotController } from './bot.controller'
import { AuthAdminMiddleware } from '../admin/auth/auth-admin.middleware'
import { transformAndValidate } from '../../utils/validator'
import { BotSettingGetDetailReqDTO } from './dtos/bot-setting-get-detail.dto'
import { BotSettingUpdateReqDTO } from './dtos/bot-setting-update.dto'

@Service()
export class BotRoute implements BaseRoute {
    route?: string = 'bot'
    router: Router = Router()

    constructor(
        @Inject() private botController: BotController,
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

        // get setting
        this.router.get(
            '/:settingKey',
            transformAndValidate(BotSettingGetDetailReqDTO),
            this.botController.getSettingByKey.bind(this.botController)
        )

        // push content bot
        this.router.post(
            '',
            this.botController.sendContentBot.bind(this.botController)
        )

        // update setting
        this.router.post(
            '/update-setting',
            transformAndValidate(BotSettingUpdateReqDTO),
            this.botController.updateSetting.bind(this.botController)
        )
    }
}
