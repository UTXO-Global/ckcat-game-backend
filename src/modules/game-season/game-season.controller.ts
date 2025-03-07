import { Inject, Service } from 'typedi'
import { GameSeasonService } from './game-season.service'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { DataRequest } from '../../base/base.request'
import { GameSeasionGetDTO } from './dtos/game-season-get.dto'

@Service()
export class GameSeasonController {
    constructor(@Inject() private gameSeasonService: GameSeasonService) {}
    async getGameSeasons(
        req: DataRequest<GameSeasionGetDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            res.send(
                new ResponseWrapper(
                    await this.gameSeasonService.getGameSeasons(req.data)
                )
            )
        } catch (err) {
            next(err)
        }
    }
}
