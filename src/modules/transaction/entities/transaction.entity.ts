import {
    Column,
    Entity,
    EntityManager,
    ObjectId,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { AppDataSource } from '../../../database/connection'
import { plainToInstance } from 'class-transformer'
import { TransactionDTO } from '../dtos/transaction.dto'

@Entity()
export class Transaction extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    orderId: string

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    numberCoin: number

    @Column()
    price: number

    @Column()
    currency: string

    @Column()
    providerToken: string

    @Column()
    telegramPaymentChargeId: string

    @Column()
    providerPaymentChargeId: string

    static async createTransaction(
        data: TransactionDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(TransactionDTO, data, {
            excludeExtraneousValues: true,
        })

        await manager.save(
            Transaction.create({
                ...createFields,
            })
        )
    }
}
