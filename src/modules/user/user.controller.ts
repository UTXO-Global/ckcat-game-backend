import { NextFunction, Response } from 'express'
import { Inject, Service } from 'typedi'
import { DataRequest } from '../../base/base.request'
import { UserService } from './user.service'
import { ResponseWrapper } from '../../utils/response'
import { AuthRequest } from '../auth/auth.middleware'
import { UserRefreshTokenReqDTO } from './dtos/user-refresh-token-req.dto'
import { Config } from '../../configs'
import { CKAuthRequest } from '../auth/auth.middleware'

@Service()
export class UserController {
    constructor(
        @Inject() private config: Config,
        @Inject() public userService: UserService
    ) {}

    async signIn(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { user } = req
            res.send(
                new ResponseWrapper(await this.userService.signIn(user))
            )
        } catch (err) {
            next(err)
        }
    }

    refreshToken = async (
        req: DataRequest<UserRefreshTokenReqDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const params = req.body
            res.send(
                new ResponseWrapper(await this.userService.refreshToken(params.refreshToken))
            )
        } catch (err) {
            next(err)
        }
    }

    signOut = async (
        req: CKAuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const authHeader = req.headers['authorization']
            const [, token] = authHeader && authHeader.split(' ')
            await this.userService.signOut(token)
            res.send(new ResponseWrapper(true))
        } catch (err) {
            next(err)
        }
    }

    getProfile = async (
        req: CKAuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { userId } = req
            res.send(
                new ResponseWrapper(await this.userService.getProfile(userId))
            )
        } catch (err) {
            next(err)
        }
    }

}
