import { Inject, Service } from 'typedi'
import { AdminGameService } from './admin-game.service'
import { DataRequest } from '../../../base/base.request'
import { DataReqDTO } from '../../../base/base.dto'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../../utils/response'
import { GameRewardUpdateReqDTO } from './dtos/game-reward-update.dto'
import { GameRewardGetListReqDTO } from './dtos/game-reward-get-list.dto'

@Service()
export class AdminGameController {
    constructor(@Inject() private adminGameService: AdminGameService) {}

    getListGameReward = async (
        req: DataRequest<GameRewardGetListReqDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { list, pagination } =
                await this.adminGameService.getListGameReward(req.data)
            res.send(new ResponseWrapper(list, null, pagination))
        } catch (err) {
            next(err)
        }
    }

    updateListGameReawrd = async (
        req: DataRequest<GameRewardUpdateReqDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            res.send(
                new ResponseWrapper(
                    await this.adminGameService.updateGameReward(req.data)
                )
            )
        } catch (err) {
            next(err)
        }
    }
}
