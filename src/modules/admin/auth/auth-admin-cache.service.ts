import { Inject, Service } from 'typedi'
import { Config } from '../../../configs'
import { AuthCMSPayload } from './auth-admin.service'
import { CacheManager } from '../../../cache'

@Service()
export class AuthAdminCacheService {
    keys = {
        accessTokens: (email: string, token: string) =>
            `admin:access-tokens:${email}:${token}`,
        refreshTokens: (email: string, token: string) =>
            `admin:refresh-tokens:${email}:${token}`,
    }

    constructor(
        @Inject() private cacheManager: CacheManager,
        @Inject() private config: Config
    ) {}

    async setAccessToken(payload: AuthCMSPayload, token: string) {
        const key = this.keys.accessTokens(payload.email, token)
        await this.cacheManager.set(
            key,
            Date.now().toString(),
            this.config.jwt.accessExpiresIn
        )
    }

    async setRefreshToken(payload: AuthCMSPayload, token: string) {
        const key = this.keys.refreshTokens(payload.email, token)
        await this.cacheManager.set(
            key,
            Date.now().toString(),
            this.config.jwt.refreshExpiresIn
        )
    }

    async tokenExists(key: string) {
        return await this.cacheManager.exist(key)
    }

    async removeToken(key: string) {
        return await this.cacheManager.del(key)
    }
}
