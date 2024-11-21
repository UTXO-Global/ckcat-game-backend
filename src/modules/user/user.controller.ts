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
}
