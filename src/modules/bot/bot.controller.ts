import { error } from 'winston'
import { Inject, Service } from 'typedi'
import { BotService } from './bot.service'
import { AuthRequest } from '../auth/auth.middleware'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { DataRequest } from '../../base/base.request'
import { BotSettingGetDetailReqDTO } from './dtos/bot-setting-get-detail.dto'
import { BotSettingUpdateReqDTO } from './dtos/bot-setting-update.dto'
import { plainToInstance } from 'class-transformer'

@Service()
export class BotController {
    constructor(@Inject() private botService: BotService) {}

    async sendContentBot(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            res.send(
                new ResponseWrapper(await this.botService.sendContentBot())
            )
        } catch (error) {
            next(error)
        }
    }

    async getSettingByKey(
        req: DataRequest<BotSettingGetDetailReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const result = await this.botService.getSettingByKey(req.data)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    async updateSetting(
        req: DataRequest<BotSettingUpdateReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const data = {
                ...req.body,
                buttons: req.body.buttons
                    ? Array.isArray(req.body.buttons)
                        ? req.body.buttons
                        : JSON.parse(req.body.buttons)
                    : undefined,
            }

            const updateData = plainToInstance(BotSettingUpdateReqDTO, data)

            const result = await this.botService.updateSetting(updateData)

            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }
}
