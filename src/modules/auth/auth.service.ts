import { Inject, Service } from 'typedi'
import { Config } from '../../configs'
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken'
import { Errors } from '../../utils/error'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import { User } from '../user/entities/user.entity'
import { UserDTO } from '../user/dtos/user.dto'
import { verifyTelegramWebAppData } from '../../utils'

export class AuthTelegramPayload {
    initData: string
    id: string
    user: UserDTO
}

@Service()
export class AuthService {
    constructor(
        @Inject() private config: Config,
    ) {}

    async verifyInitData(initData: string) {
        return verifyTelegramWebAppData(initData, this.config.telegramTokenBot)
    }
}
