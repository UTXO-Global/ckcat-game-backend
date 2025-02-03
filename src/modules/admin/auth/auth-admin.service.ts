import { instanceToPlain, plainToInstance } from 'class-transformer'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Inject, Service } from 'typedi'
import { Config } from '../../../configs'
import { Errors } from '../../../utils/error'
import { AuthAdminCacheService } from './auth-admin-cache.service'
import { AdminRepos } from '../repos/admin.repos'

export class AuthCMSPayload {
    email: string
}

export interface AuthToken {
    token: string
    expireAt: number
}

@Service()
export class AuthAdminService {
    constructor(
        @Inject() private config: Config,
        @Inject()
        private authAdminCacheService: AuthAdminCacheService
    ) {}

    async signToken(payload: AuthCMSPayload, salt?: string) {
        const { accessSecret, accessExpiresIn } = this.config.jwt
        const jwtSecret = accessSecret + (salt ?? '')
        const sign = jwt.sign(payload, jwtSecret, {
            expiresIn: accessExpiresIn,
        })
        await this.authAdminCacheService.setAccessToken(payload, sign)

        return this.generateAuthToken(sign)
    }

    async verifyToken(token: string) {
        const decoded = jwt.decode(token, {
            complete: true,
        })
        const authPayload = plainToInstance(
            AuthCMSPayload,
            instanceToPlain(decoded.payload)
        )
        const admin = await AdminRepos.getAdmin(authPayload.email)
        if (!admin) {
            throw Errors.Unauthorized
        }

        const jwtSecret = this.config.jwt.accessSecret + (admin.salt ?? '')
        try {
            jwt.verify(token, jwtSecret)
        } catch {
            throw Errors.Unauthorized
        }

        const { email } = authPayload
        const cacheKey = this.authAdminCacheService.keys.accessTokens(
            email,
            token
        )
        const isTokenExisted = await this.authAdminCacheService.tokenExists(
            cacheKey
        )
        if (!isTokenExisted) {
            throw Errors.Unauthorized
        }

        return authPayload
    }

    async signRefreshToken(payload: AuthCMSPayload, salt?: string) {
        const { refreshSecret, refreshExpiresIn } = this.config.jwt
        const jwtSecret = refreshSecret + (salt ?? '')
        const sign = jwt.sign(payload, jwtSecret, {
            expiresIn: refreshExpiresIn,
        })
        await this.authAdminCacheService.setRefreshToken(payload, sign)

        return this.generateAuthToken(sign)
    }

    async verifyRefreshToken(token: string) {
        const decoded = jwt.decode(token, {
            complete: true,
        })
        const authPayload = plainToInstance(
            AuthCMSPayload,
            instanceToPlain(decoded.payload)
        )
        const admin = await AdminRepos.getAdmin(authPayload.email)
        if (!admin) {
            throw Errors.Unauthorized
        }

        const jwtSecret = this.config.jwt.refreshSecret + (admin.salt ?? '')
        try {
            jwt.verify(token, jwtSecret)
        } catch {
            throw Errors.Unauthorized
        }

        const { email } = authPayload
        const cacheKey = this.authAdminCacheService.keys.refreshTokens(
            email,
            token
        )
        const isTokenExisted = await this.authAdminCacheService.tokenExists(
            cacheKey
        )
        if (!isTokenExisted) {
            throw Errors.Unauthorized
        }

        return authPayload
    }

    async revokeAccessToken(token: string) {
        const decoded = jwt.decode(token, {
            complete: true,
        })
        const authPayload = plainToInstance(
            AuthCMSPayload,
            instanceToPlain(decoded.payload)
        )
        const key = this.authAdminCacheService.keys.accessTokens(
            authPayload.email,
            token
        )
        await this.authAdminCacheService.removeToken(key)
    }

    async revokeRefreshToken(token: string) {
        const decoded = jwt.decode(token, {
            complete: true,
        })
        const authPayload = plainToInstance(
            AuthCMSPayload,
            instanceToPlain(decoded.payload)
        )
        const key = this.authAdminCacheService.keys.refreshTokens(
            authPayload.email,
            token
        )
        await this.authAdminCacheService.removeToken(key)
    }

    async generateAuthTokenPairs(payload: AuthCMSPayload, salt: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.signToken(payload, salt),
            this.signRefreshToken(payload, salt),
        ])
        return {
            accessToken,
            refreshToken,
        }
    }

    private generateAuthToken(sign: string): AuthToken {
        const decoded = jwt.decode(sign, { complete: true })
        const decodedPayload = decoded.payload as JwtPayload
        return {
            token: sign,
            expireAt: decodedPayload.exp,
        }
    }
}
