import { instanceToPlain, plainToInstance } from 'class-transformer'
import jwt from 'jsonwebtoken'
import { Inject, Service } from 'typedi'
import { CacheKeys, CacheManager } from '../../cache'
import { Config } from '../../configs'
import { Errors } from '../../utils/error'
import { User } from '../user/entities/user.entity'
import { verifyTelegramWebAppData } from '../../utils'

const CK_ACCESS_TOKEN_KEY = 'ck_access_token'

export class AuthPayload {
    userId: string
}

@Service()
export class AuthService {
    constructor(
        @Inject() private config: Config,
        @Inject() private cacheManager: CacheManager
    ) {}

    async signToken(userId: string) {
        
        const { accessSecret, accessExpiresIn } = this.config.jwt
        
        const jwtSecret = accessSecret
        const sign = jwt.sign({userId: userId}, jwtSecret, {
            expiresIn: accessExpiresIn,
        })

        this.cacheManager.set(
            CacheKeys.accessToken(userId.toString(), sign),
            Date.now().toString(),
            accessExpiresIn
        )
        return sign
        
    }

    async verifyToken(token: string) {
        const decoded = jwt.decode(token, {
            complete: true,
        })
        const authPayload = plainToInstance(
            AuthPayload,
            instanceToPlain(decoded.payload)
        )

        const user = await User.getUser(authPayload.userId.toString())
        if (!user) {
            throw Errors.Unauthorized
        }

        const jwtSecret = this.config.jwt.accessSecret
        jwt.verify(token, jwtSecret)

        const cacheKey = CacheKeys.accessToken(authPayload.userId, token)
        const isTokenExisted = await this.cacheManager.exist(cacheKey)
        if (!isTokenExisted) {
            throw Errors.Unauthorized
        }

        return authPayload
    }

    async signRefreshToken(userId: string) {
        const { refreshSecret, refreshExpiresIn } = this.config.jwt
        const jwtSecret = refreshSecret
        const sign = jwt.sign(userId, jwtSecret, {
            expiresIn: refreshExpiresIn,
        })
        const cacheKey = CacheKeys.refreshToken(userId, sign)
        await this.cacheManager.set(
            cacheKey,
            Date.now().toString(),
            refreshExpiresIn
        )
        return sign
    }

    async verifyRefreshToken(token: string) {
        const decoded = jwt.decode(token, {
            complete: true,
        })
        const authPayload = plainToInstance(
            AuthPayload,
            instanceToPlain(decoded.payload)
        )

        const user = await User.getUser(authPayload.userId)
        if (!user) {
            throw Errors.Unauthorized
        }

        const cacheKey = CacheKeys.accessToken(authPayload.userId, token)
        const isTokenExisted = await this.cacheManager.exist(cacheKey)
        if (!isTokenExisted) {
            throw Errors.Unauthorized
        }

        const accessTokenKey = CacheKeys.accessToken(authPayload.userId, token)
        await Promise.all([
            this.cacheManager.del(accessTokenKey)
        ])

        return authPayload
    }

    async getAccessTokens(userId: string) {
        const res = await this.cacheManager.hget(
            CK_ACCESS_TOKEN_KEY,
            userId.toString()
        )
        if (res != null) {
            return new Set(res.split(','))
        }
        return new Set()
    }

    async verifyInitData(initData: string) {
        return verifyTelegramWebAppData(initData, this.config.telegramTokenBot)
    }
}
