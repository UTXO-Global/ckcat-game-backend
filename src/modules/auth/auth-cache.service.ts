import { Inject, Service } from 'typedi'
import { CacheService } from '../../caches/cache.service'
import { Config } from '../../configs'
import { AuthPayload } from './auth.service'

@Service()
export class AuthCacheService {
    keys = {
        accessTokens: (userId: string, token: string) =>
            `access-tokens:${userId}:${token}`,
        refreshTokens: (userId: string, token: string) =>
            `refresh-tokens:${userId}:${token}`,
    }

    constructor(
        @Inject() private cacheService: CacheService,
        @Inject() private config: Config
    ) {}

    async setAccessToken(payload: AuthPayload, token: string) {
        const key = this.keys.accessTokens(payload.userId, token)
        await this.cacheService.set(
            key,
            Date.now().toString(),
            this.config.jwt.accessExpiresIn
        )
    }

    async setRefreshToken(payload: AuthPayload, token: string) {
        const key = this.keys.refreshTokens(payload.userId, token)
        await this.cacheService.set(
            key,
            Date.now().toString(),
            this.config.jwt.refreshExpiresIn
        )
    }

    async tokenExists(key: string) {
        return await this.cacheService.exist(key)
    }
}
