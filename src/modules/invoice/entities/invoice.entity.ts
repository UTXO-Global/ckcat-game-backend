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
import { InvoiceDTO } from '../dtos/invoice.dto'

@Entity()
export class Invoice extends AppBaseEntity {
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
    isPaid: boolean

    static async isOrderIdAlready(orderId: string) {
        return await Invoice.findOne({
            where: {
                orderId,
            },
        })
    }

    static async createInvoice(
        data: InvoiceDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(InvoiceDTO, data, {
            excludeExtraneousValues: true,
        })

        await manager.save(
            Invoice.create({
                ...createFields,
            })
        )
    }

    static async paid(
        orderId: string,
        manager: EntityManager = AppDataSource.manager
    ) {
        await manager.update(Invoice, { orderId }, { ...{ isPaid: true } })
    }
}
