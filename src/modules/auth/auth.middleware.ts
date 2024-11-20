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

@Service()
export class AuthMiddleware {
    constructor(
        @Inject() private config: Config,
        @Inject() private authService: AuthService
    ) {}

    async authorizePurchase(initData: string) {
        return await this.authService.verifyInitData(initData)
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
                userObject['coin'] = 0
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

const getAuthHeader = (req: Request) => {
    const authHeader = req.headers['authorization']
    return authHeader?.split(' ')[1]
}

const getAuthTelegramHeader = (req: Request) => {
    const authHeader = req.headers['authorization']
    return authHeader?.split(' ')[1]
}

const getAuthTelegramHeaderFromX = (req: Request) => {
    const authHeader = req.headers['x-api-key'] as string
    return authHeader
}
