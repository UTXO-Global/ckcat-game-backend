import { Service } from 'typedi'
import { startTransaction } from '../../database/connection'
import { TransactionDTO } from './dtos/transaction.dto'
import { Transaction } from './entities/transaction.entity'

@Service()
export class TransactionService {

    async createTransaction(data: TransactionDTO) {
        return await startTransaction(async (manager) => {
            const transactionDTO = new TransactionDTO()
            transactionDTO.init(data)
            return await Transaction.createTransaction(transactionDTO, manager)
        })
    }

    async getTransactionInfo(userId: string, transactionId: string) {
        return await Transaction.getTransaction(userId, transactionId)
    }

    async getTransactions(userId: string) {
        return await Transaction.getTransactions(userId)
    }
}
