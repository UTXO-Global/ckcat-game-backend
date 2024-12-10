import { Inject, Service } from 'typedi'
import { EventSettingService } from './event-setting.service'
import { DataRequest } from '../../base/base.request'
import { EventSettingGetByKeyReqDTO } from './dtos/event-setting-get-by-key.dto'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'

@Service()
export class EventSettingController {
    constructor(@Inject() private eventSettingService: EventSettingService) {}
    getEventSettingByKey = async (
        req: DataRequest<EventSettingGetByKeyReqDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const setting = await this.eventSettingService.getEventSettingByKey(
                req.data
            )
            res.send(new ResponseWrapper(setting))
        } catch (err) {
            next(err)
        }
    }
}
