import { Inject, Service } from 'typedi'
import { QuestService } from './quest.service'
import { CKAuthRequest } from '../auth/auth.middleware'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { DataRequest } from '../../base/base.request'
import { QuestGetListReqDTO } from './dtos/quest-get-list.dto'

@Service()
export class QuestController {
    constructor(@Inject() private questService: QuestService) {}

    async getListQuest(
        req: DataRequest<QuestGetListReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            req.data.userId = req.userId
            const list = await this.questService.getListQuest(req.data)
            res.send(new ResponseWrapper(list))
        } catch (error) {
            next(error)
        }
    }
}
