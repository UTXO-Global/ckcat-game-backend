import { NextFunction, Response } from 'express'
import { Inject, Service } from 'typedi'
import { GameSessionCreateReqDTO } from './dtos/game-session-create-req.dto'
import { ResponseWrapper } from '../../utils/response'
import { DataRequest } from '../../base/base.request'
import { GameSessionService } from './game-session.service'

@Service()
export class GameSessionController {
    constructor(@Inject() private gameSessionService: GameSessionService) {}
    async createGameSession(
        req: DataRequest<GameSessionCreateReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const data = req.body
            data.userId = req.userId
            res.send(
                new ResponseWrapper(
                    await this.gameSessionService.createSession(data)
                )
            )
        } catch (error) {
            next(error)
        }
    }
}
