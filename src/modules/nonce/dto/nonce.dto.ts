import { Column } from 'typeorm'
import { BaseDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'
import Container from 'typedi'
import { CacheKeys, CacheManager, CacheTimes } from '../../../caches'

export class NonceDTO extends BaseDTO {
    @Expose()
    nonce: string

    static async isNonceAlready(nonce: string) {
        const cacheManager = Container.get(CacheManager)
        const cachedNonce = await cacheManager.getObject<NonceDTO>(
            CacheKeys.nonce(nonce)
        )
        return cachedNonce != null
    }

    async save() {
        const cacheManager = Container.get(CacheManager)
        await cacheManager.setObject(
            CacheKeys.nonce(this.nonce),
            this,
            CacheTimes.minute(3)
        )
    }
}
