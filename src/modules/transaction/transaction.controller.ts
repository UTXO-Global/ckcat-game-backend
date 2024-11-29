import { Inject, Service } from 'typedi'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { TransactionDTO } from '../transaction/dtos/transaction.dto'
import { TransactionService } from './transaction.service'
import { DataRequest } from '../../base/base.request'
import { TransactionDetailReqDTO } from './dtos/transaction-detail-req.dto'
import { CKAuthRequest } from '../auth/auth.middleware'

@Service()
export class TransactionController {
    constructor(
        @Inject() public transactionService: TransactionService
    ) {}

    createTransaction = async (
        req: DataRequest<TransactionDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const params = req.body
            params.userId = req.userId
            const transaction = await this.transactionService.createTransaction(params)
            res.send(new ResponseWrapper(transaction))
        } catch (err) {
            next(err)
        }
    }

    getTransactionInfo = async (
        req: DataRequest<TransactionDetailReqDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { userId } = req
            res.send(
                new ResponseWrapper(await this.transactionService.getTransactionInfo(userId, req.params.transactionId))
            )
        } catch (err) {
            next(err)
        }
    }

    getTransactions = async (
        req: CKAuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { userId } = req
            res.send(
                new ResponseWrapper(await this.transactionService.getTransactions(userId))
            )
        } catch (err) {
            next(err)
        }
    }
}
