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
    package: string
    
    @Column()
    price: number

    @Column()
    status: string

    static async createTransaction(
        data: TransactionDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(TransactionDTO, data, {
            excludeExtraneousValues: true,
        })

        return await manager.save(
            Transaction.create({
                ...createFields,
            })
        )
        
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
    
    static async getTransactions(userId: string) {
        return await Transaction.find({
            where: {
                userId: userId,
            },
        })
    }
}
