import { Inject, Service } from 'typedi'
import { AuthRequest } from '../auth/auth.middleware'
import { GameSeasonService } from './game-season.service'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'

@Service()
export class GameSeasonController {
    constructor(@Inject() private gameSeasonService: GameSeasonService) {}
    async getGameSeasons(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            res.send(
                new ResponseWrapper(
                    await this.gameSeasonService.getGameSeasons()
                )
            )
        } catch (err) {
            next(err)
        }
    }
}
