import { NextFunction, Response } from 'express'
import { Inject, Service } from 'typedi'
import { DataRequest } from '../../base/base.request'
import { UserService } from './user.service'
import { ResponseWrapper } from '../../utils/response'
import { AuthRequest } from '../auth/auth.middleware'
import { CoinReqDTO } from './dtos/coin.dto'
import { Config } from '../../configs'
import { BaseReqDTO } from '../../base/base.dto'
@Service()
export class UserController {
    constructor(
        @Inject() private config: Config,
        @Inject() public userService: UserService
    ) {}

    async generatePayload(req: BaseReqDTO, res: Response, next: NextFunction) {
        try {
            res.send(new ResponseWrapper(this.userService.generatePayload()))
        } catch (err) {
            next(err)
        }
    }

    async checkProof(req: AuthRequest, res: Response, next: NextFunction) {
        const { user } = req
        try {
            res.send(
                new ResponseWrapper(this.userService.checkProof(req, user.id))
            )
        } catch (err) {
            next(err)
        }
    }
    async getUserInfo(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req
            res.send(
                new ResponseWrapper(await this.userService.getUserInfo(user))
            )
        } catch (err) {
            next(err)
        }
    }

    async updateCoin(
        req: DataRequest<CoinReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data, user } = req
            res.send(
                new ResponseWrapper(
                    await this.userService.updateCoin(user.id, data)
                )
            )
        } catch (err) {
            next(err)
        }
    }

    async updateCoinPurchaseStar(id: string, numberCoin: number) {
        try {
            await this.userService.updateCoinPurchaseStar(id, numberCoin)
        } catch (err) {}
    }

    async getLeaderBoard(req: AuthRequest, res: Response, next: NextFunction) {
        const { user } = req
        try {
            res.send(
                new ResponseWrapper(
                    await this.userService.getLeaderBoard(user.id)
                )
            )
        } catch (err) {
            next(err)
        }
    }
}
