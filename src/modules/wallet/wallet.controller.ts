import { Inject, Service } from 'typedi'
import { DataRequest } from '../../base/base.request'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { WalletService } from './wallet.service'
import { WalletDTO } from './dtos/wallet.dto'

@Service()
export class WalletController {
    constructor(
        @Inject() private walletService: WalletService
    ) {}

    connectWallet = async (
        req: DataRequest<WalletDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const params = req.body
            params.userId = req.userId
            await this.walletService.connectWallet(params)
            res.send(new ResponseWrapper(true))
        } catch (err) {
            next(err)
        }
    }
}
