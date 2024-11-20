import { Inject, Service } from 'typedi'
import { Config } from '../../configs'
import { CacheKeys, CacheManager } from '../../caches'
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken'
import { Errors } from '../../utils/error'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import { User } from '../user/entities/user.entity'
import { UserDTO } from '../user/dtos/user.dto'
import { verifyTelegramWebAppData } from '../../utils'

export class AuthPayload {
    userId: string
    email: string
}

export class AuthTelegramPayload {
    initData: string
    id: string
    user: UserDTO
}

export interface AuthToken {
    token: string
    expireAt: number
}

export class OTPPayload {
    phoneNumber: string
    otp: string
}

@Service()
export class AuthService {
    constructor(
        @Inject() private config: Config,
        @Inject() private cacheManager: CacheManager
    ) {}

    async signToken(payload: AuthPayload, salt?: string) {
        const { accessSecret, accessExpiresIn } = this.config.jwt
        const jwtSecret = accessSecret + (salt ?? '')
        const sign = jwt.sign(payload, jwtSecret, {
            expiresIn: accessExpiresIn,
        })

        this.cacheManager.set(
            CacheKeys.accessToken(payload.userId, sign),
            Date.now().toString(),
            accessExpiresIn
        )
        return this.generateAuthToken(sign)
    }

    async verifyInitData(initData: string) {
        return verifyTelegramWebAppData(initData, this.config.telegramTokenBot)
    }

    async verifyToken(token: string) {
        const decoded = jwt.decode(token, {
            complete: true,
        })
        if (!decoded) {
            throw Errors.Unauthorized
        }

        const authPayload = plainToInstance(
            AuthPayload,
            instanceToPlain(decoded.payload)
        )

        const user = await User.getUser(authPayload.userId)
        if (!user) {
            throw Errors.Unauthorized
        }

        const jwtSecret = this.config.jwt.accessSecret
        try {
            jwt.verify(token, jwtSecret)
        } catch (err) {
            if (err instanceof JsonWebTokenError) {
                throw Errors.Unauthorized
            }
            throw err
        }

        const cacheKey = CacheKeys.accessToken(authPayload.userId, token)
        const isTokenExisted = await this.cacheManager.exist(cacheKey)
        if (!isTokenExisted) {
            throw Errors.Unauthorized
        }

        return authPayload
    }

    async signRefreshToken(payload: AuthPayload, salt?: string) {
        const { refreshSecret, refreshExpiresIn } = this.config.jwt
        const jwtSecret = refreshSecret + (salt ?? '')
        const sign = jwt.sign(payload, jwtSecret, {
            expiresIn: refreshExpiresIn,
        })
        const cacheKey = CacheKeys.refreshToken(payload.userId, sign)
        await this.cacheManager.set(
            cacheKey,
            Date.now().toString(),
            refreshExpiresIn
        )
        return this.generateAuthToken(sign)
    }

    async verifyRefreshToken(token: string) {
        const decoded = jwt.decode(token, {
            complete: true,
        })
        if (!decoded) {
            throw Errors.Unauthorized
        }

        const authPayload = plainToInstance(
            AuthPayload,
            instanceToPlain(decoded.payload)
        )

        const user = await User.getUser(authPayload.userId)
        if (!user) {
            throw Errors.Unauthorized
        }

        const jwtSecret = this.config.jwt.refreshSecret
        try {
            jwt.verify(token, jwtSecret)
        } catch (err) {
            if (err instanceof JsonWebTokenError) {
                throw Errors.Unauthorized
            }
            throw err
        }

        const cacheKey = CacheKeys.refreshToken(authPayload.userId, token)
        const isTokenExisted = await this.cacheManager.exist(cacheKey)
        if (!isTokenExisted) {
            throw Errors.Unauthorized
        }

        return authPayload
    }

    async signOTPToken(phoneNumber: string, otp: string) {
        const { accessSecret } = this.config.jwt
        const sign = jwt.sign(
            {
                phoneNumber: phoneNumber,
                otp: otp,
            },
            accessSecret
        )
        return sign
    }

    async decodeOTPAccessCode(otpAccessCode: string) {
        const { accessSecret } = this.config.jwt
        const decoded = jwt.verify(otpAccessCode, accessSecret, {
            complete: true,
        })
        const otpPayload = plainToInstance(
            OTPPayload,
            instanceToPlain(decoded.payload)
        )
        return otpPayload
    }

    private generateAuthToken(sign: string): AuthToken {
        const decoded = jwt.decode(sign, { complete: true })
        const decodedPayload = decoded.payload as JwtPayload
        return {
            token: sign,
            expireAt: decodedPayload.exp,
        }
    }

    async generateAuthTokenPairs(payload: AuthPayload, salt: string) {
        const res = await Promise.all([
            this.signToken(payload, salt),
            this.signRefreshToken(payload, salt),
        ])
        return {
            accessToken: res[0],
            refreshToken: res[1],
        }
    }
}
