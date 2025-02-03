import { Inject, Service } from 'typedi'
import { GameAirdropAdminService } from './game-airdrop-admin.service'
import { DataRequest } from '../../../base/base.request'
import { GameAirdropCreateReqDTO } from '../dtos/game-airdrop-create.dto'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../../utils/response'
import { GameAirdropGetListReqDTO } from '../dtos/game-airdrop-list-get.dto'
import { GameAirdropAdminGetListReqDTO } from '../dtos/game-airdrop-admin-get-list-get.dto'
import { GameAirdropTransactionAdminGetListReqDTO } from '../dtos/game-airdrop-transaction-admin-get-list-req.dto'
import { GameAirdropTransactionRepos } from '../repos/game-airdrop-transaction.repos'

@Service()
export class GameAirdropAdminController {
    constructor(
        @Inject() private gameAirdropAdmindService: GameAirdropAdminService
    ) {}

    async createAirdrop(
        req: DataRequest<GameAirdropCreateReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req
            const result =
                await this.gameAirdropAdmindService.createGameAirdrop(data)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    async getGameAirdrops(
        req: DataRequest<GameAirdropAdminGetListReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req
            const { gameAirdrops, pagination } =
                await this.gameAirdropAdmindService.getGameAirdrops(data)
            res.send(new ResponseWrapper(gameAirdrops, null, pagination))
        } catch (error) {
            next(error)
        }
    }

    async getGameAirdropTransactions(
        req: DataRequest<GameAirdropTransactionAdminGetListReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req
            const { gameAirdropTransactions, pagination } =
                await this.gameAirdropAdmindService.getAirdropsTransactions(
                    data
                )
            res.send(
                new ResponseWrapper(gameAirdropTransactions, null, pagination)
            )
        } catch (error) {
            next(error)
        }
    }
}
