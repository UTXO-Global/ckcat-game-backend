import { NextFunction, Response } from 'express'
import { Inject, Service } from 'typedi'
import { ResponseWrapper } from '../../utils/response'
import { DataRequest } from '../../base/base.request'
import { GameAirdropInfoGetListReqDTO } from './dtos/game-airdrop-info-get-list.dto'
import { GameAirdropService } from './game-airdrop.service'
import { GameAirdropGetDetailReqDTO } from './dtos/game-airdrop-get-detail.dto'
import { GameAirdropJoinReqDTO } from './dtos/game-airdrop-join.dto'
import { GameAirdropUserGetReqDTO } from './dtos/game-airdrop-user-get.dto'

@Service()
export class GameAirdropController {
    constructor(@Inject() private gameAirdropService: GameAirdropService) {}
    async getListAirdrop(
        req: DataRequest<GameAirdropInfoGetListReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            res.send(
                new ResponseWrapper(
                    await this.gameAirdropService.getListAirdrop(req.data)
                )
            )
        } catch (err) {
            next(err)
        }
    }

    async getAirdropDetail(
        req: DataRequest<GameAirdropGetDetailReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            res.send(
                new ResponseWrapper(
                    await this.gameAirdropService.getAirdropDetails(req.data)
                )
            )
        } catch (err) {
            next(err)
        }
    }

    async joinAirdrop(
        req: DataRequest<GameAirdropJoinReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const result = await this.gameAirdropService.joinAirdrop(req.data)
            res.send(new ResponseWrapper(result))
        } catch (err) {
            next(err)
        }
    }
    async getAirdropTxUser(
        req: DataRequest<GameAirdropUserGetReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            res.send(
                new ResponseWrapper(
                    await this.gameAirdropService.getAirdropTxUser(req.data)
                )
            )
        } catch (err) {
            next(err)
        }
    }
}
