import { NextFunction, Request, Response } from 'express'
import { Inject, Service } from 'typedi'
import { Errors } from '../../utils/error'
import { AuthService } from './auth.service'
import { plainToInstance } from 'class-transformer'
import { UserDTO } from '../user/dtos/user.dto'
import { decrypt } from '../../utils'
import { Config } from '../../configs'

export interface AuthRequest extends Request {
    initData: string
    user: UserDTO
}

export interface CKAuthRequest extends Request {
    userId: string
}

@Service()
export class AuthMiddleware {
    constructor(
        @Inject() private config: Config,
        @Inject() private authService: AuthService
    ) {}

    authorization = async (
        req: CKAuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const authHeader = req.headers['authorization']
            const [, token] = authHeader && authHeader.split(' ')
            if (token == null) {
                return next(Errors.Unauthorized)
            }
            const payload = await this.authService.verifyToken(token)
            req.userId = payload.userId
            
            next()
        } catch (error) {
            next(Errors.Unauthorized)
        }
    }


    async authorizeTelegram(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            const rawData = getAuthTelegramHeader(req)
            const initData = decrypt(
                rawData,
                this.config.secretKey,
                this.config.ivKey
            )
            if (!rawData) throw Errors.Unauthorized
            if (await this.authService.verifyInitData(initData)) {
                const params = new URLSearchParams(initData)
                const obj: Record<string, string> = {}
                for (const [key, value] of params.entries()) {
                    obj[key] = value
                }
                var userObject = JSON.parse(obj.user)
                userObject['id'] = userObject.id.toString()
                userObject['firstName'] = userObject.first_name
                userObject['lastName'] = userObject.last_name
                userObject['gems'] = 0
                const user = plainToInstance(UserDTO, userObject, {
                    excludeExtraneousValues: true,
                })
                req.initData = initData
                req.user = user
                next()
                return
            }
            throw Errors.Unauthorized
        } catch (err) {
            next(err)
        }
    }
}

const getAuthTelegramHeader = (req: Request) => {
    const authHeader = req.headers['authorization']
    return authHeader?.split(' ')[1]
}