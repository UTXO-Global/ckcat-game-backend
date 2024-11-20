import { Inject, Service } from 'typedi'
import { Config } from '../../configs'
import { NonceService } from '../nonce/nonce.service'
import { NextFunction } from 'express'
import { BaseReqWithNonceDTO } from '../../base/base.dto'
import { DataRequest } from '../../base/base.request'
import { isWithinSeconds } from '../../utils'
import { Errors } from '../../utils/error'

@Service()
export class AntiCheatMiddleware {
    constructor(
        @Inject() private config: Config,
        @Inject() private nonceService: NonceService
    ) {}

    async antiCheat(
        req: DataRequest<BaseReqWithNonceDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req
            if (!isWithinSeconds(new Date(data.date), this.config.expireNonce))
                throw Errors.Cheating
            if (await this.nonceService.isNonceAlready(data.nonce))
                throw Errors.Cheating
            await this.nonceService.saveNonce(data.nonce)
            next()
        } catch (error) {
            throw error
        }
    }
}
