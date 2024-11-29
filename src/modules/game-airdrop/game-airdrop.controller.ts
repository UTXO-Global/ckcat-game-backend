import { Inject, Service } from 'typedi'
import { GameAirdropService } from './game-airdrop.service'
import { DataRequest } from '../../base/base.request'
import { GameAirdropGetListReqDTO } from './dtos/game-airdrop-get-list.dto'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { GameAirdropJoinReqDTO } from './dtos/game-airdrop-join.dto'
import { GameAirdropGetDetailReqDTO } from './dtos/game-airdrop-get-detail.dto'

@Service()
export class GameAirdropController {
    constructor(@Inject() private gameAirdropService: GameAirdropService) {}

    async getListAirdrop(
        req: DataRequest<GameAirdropGetListReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            req.data.userId = req.userId
            const result = await this.gameAirdropService.getListAirdrop(
                req.data
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    async getAirdropDetail(
        req: DataRequest<GameAirdropGetDetailReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            req.data.userId = req.userId
            const result = await this.gameAirdropService.getAirdropDetail(
                req.data
            )
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    async joinAirdrop(
        req: DataRequest<GameAirdropJoinReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            req.data.userId = req.userId
            const result = await this.gameAirdropService.joinAirdrop(req.data)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }
}
