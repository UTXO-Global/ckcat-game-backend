import {
    Column,
    Entity,
    EntityManager,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { AppDataSource } from '../../../database/connection'
import { plainToInstance } from 'class-transformer'
import { ObjectId } from 'mongodb';
import { WalletDTO } from '../dtos/wallet.dto'


@Entity()
export class UserWallet extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    address: string

    static async createUserWallet(
        data: WalletDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(WalletDTO, data, {
            excludeExtraneousValues: true,
        })

        const wallet = await UserWallet.findOne({
            where: {
                userId : data.userId,
                address : data.address,
            },
        })

        if (!wallet) {
            return await manager.save(
                UserWallet.create({
                    ...createFields,
                })
            )
        }
    }

    static async getWalletByUserId(userId: string) {
        return await UserWallet.findOne({
            where: {
                userId,
            },
        })
    }
}
