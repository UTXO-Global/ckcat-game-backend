import {
    Column,
    CreateDateColumn,
    Entity,
    EntityManager,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { ObjectId } from 'mongodb';
import { PackageTransactionDTO } from '../dtos/package-transaction.dto';
import { AppDataSource } from '../../../database/connection';
import { plainToInstance } from 'class-transformer';

@Entity()
export class PackageTransactions extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    packageId: string

    @Column()
    orderId: string

    @Column()
    purchaseID: string

    @Column()
    expired: number

    static async createPackageTransaction(
        data: PackageTransactionDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(PackageTransactionDTO, data, {
            excludeExtraneousValues: true,
        })
        
        return await manager.save(
            PackageTransactions.create({
                ...createFields,
            })
        )
    }

    static async getPackageTransactions() {
        return await PackageTransactions.find({
            where: {
                expired: 0,
            },
        })
    }

}
