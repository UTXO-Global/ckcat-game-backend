import { Service } from 'typedi'
import { Transaction } from './entities/transaction.entity'

@Service()
export class TransactionService {

    async getTransactionInfo(userId: string, transactionId: string) {
        return await Transaction.getTransaction(userId, transactionId)
    }

    async getTransactions(userId: string) {
        return await Transaction.getTransactions(userId)
    }
}
