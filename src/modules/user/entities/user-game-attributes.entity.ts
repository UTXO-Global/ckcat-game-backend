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

    static async getAttributesByIds(
        userIds: string[]
    ): Promise<Map<string, UserGameAttributeDTO>> {
        const userAttributesRepos =
            AppDataSource.getMongoRepository(UserGameAttributes)

        const attributes = await userAttributesRepos.find({
            where: { userId: { $in: userIds } },
        })

        return new Map(
            attributes.map((attr) => [
                attr.userId,
                plainToInstance(UserGameAttributeDTO, attr, {
                    excludeExtraneousValues: true,
                }),
            ])
        )
    }
}
