import {
    Column,
    Entity,
    EntityManager,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { AppDataSource } from '../../../database/connection'
import { plainToInstance } from 'class-transformer'
import { TransactionDTO } from '../dtos/transaction.dto'
import { ObjectId } from 'mongodb';


@Entity()
export class Transaction extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    orderId: string

    @Column()
    txHash: string
    
    @Column()
    price: number

    @Column()
    status: string

    static async saveTransaction(
        data: TransactionDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(TransactionDTO, data, {
            excludeExtraneousValues: true,
        })

        const transaction = await this.getTransactionByTXHash(data.txHash);
        if (!transaction) {
            return await manager.save(
                Transaction.create({
                    ...createFields,
                })
            )
        }

        return await manager.update(Transaction, { _id: transaction._id }, { status: data.status })
        
    }

    static async getTransaction(userId: string, transactionId: string) {
        const id = new ObjectId(transactionId);
        return await Transaction.findOne({
            where: {
                _id: id,
                userId: userId,
            },
        })
    }

    static async getTransactionById(transactionId: string) {
        const id = new ObjectId(transactionId);
        return await Transaction.findOne({
            where: {
                _id: id,
            },
        })
    }

    static async getTransactionByTXHash(txHash: string) {
        return await Transaction.findOne({
            where: {
                txHash: txHash,
            },
        })
    }
    
    static async getTransactions(userId: string) {
        return await Transaction.find({
            where: {
                userId: userId,
            },
        })
    }

    static async updateStatusTransaction(
        transactionId: string,
        status: string,
        manager: EntityManager = AppDataSource.manager
    ) {
        await manager.update(Transaction, { _id: transactionId }, { status })
    }
}
