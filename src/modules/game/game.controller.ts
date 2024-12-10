import { Inject, Service } from 'typedi'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { GameDTO } from '../game/dtos/game.dto'
import { GameService } from './game.service'
import { DataRequest } from '../../base/base.request'
import { CKAuthRequest } from '../auth/auth.middleware'

@Service()
export class GameController {
    constructor(@Inject() public gameService: GameService) {}

    createGame = async (
        req: DataRequest<GameDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const params = req.body
            params.userId = req.userId
            const game = await this.gameService.createGame(params)
            res.send(new ResponseWrapper(game))
        } catch (err) {
            next(err)
        }
    }

    getGameInfo = async (
        req: CKAuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { userId } = req
            res.send(
                new ResponseWrapper(await this.gameService.getGameInfo(userId))
            )
        } catch (err) {
            next(err)
        }
    }

    claimWatchVideo = async (
        req: CKAuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.query.userId as string
            res.send(
                new ResponseWrapper(
                    await this.gameService.claimWatchVideo(userId)
                )
            )
        } catch (err) {
            next(err)
        }
    }
}
