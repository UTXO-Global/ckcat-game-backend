import {
    Column,
    Entity,
    EntityManager,
    ObjectId,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { UserGameAttributeDTO } from '../dtos/user-game-attribute.dto'
import { AppDataSource } from '../../../database/connection'
import { plainToInstance } from 'class-transformer'

@Entity()
export class UserGameAttributes extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    amountBossKill: number

    @Column()
    soul: number

    @Column()
    catHighest: number

    static async createAttributes(
        data: UserGameAttributeDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(UserGameAttributeDTO, data, {
            excludeExtraneousValues: true,
        })

        let attributes = await manager.findOne(UserGameAttributes, {
            where: { userId: data.userId },
        })

        if (attributes) {
            attributes.amountBossKill = createFields.amountBossKill
            attributes.soul = createFields.soul
            attributes.catHighest = createFields.catHighest

            attributes = await manager.save(attributes)
        } else {
            attributes = await manager.save(
                UserGameAttributes.create({
                    ...createFields,
                })
            )
        }

        return attributes
    }

    static async getUserGameAttributes(userId: string) {
        const res = await UserGameAttributes.findOne({
            where: {
                userId,
            },
        })

        if (res) {
            const user = plainToInstance(UserGameAttributeDTO, res, {
                excludeExtraneousValues: true,
            })
            return user
        }
    }
}
