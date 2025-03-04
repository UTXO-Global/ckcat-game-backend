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
import { User } from './user.entity'

interface UserWithAttributes extends User {
    attributes?: {
        amountBossKill?: number
        soul?: number
        catHighest?: number
    }
}
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

    static async getUsersWithAttributesByIds(userIds: string[]) {
        const userRepos = AppDataSource.getMongoRepository(User)

        const users: UserWithAttributes[] = await userRepos
            .aggregate([
                { $match: { id: { $in: userIds } } },
                {
                    $lookup: {
                        from: 'user_game_attributes',
                        localField: 'id',
                        foreignField: 'userId',
                        as: 'attributes',
                    },
                },
                {
                    $unwind: {
                        path: '$attributes',
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ])
            .toArray()

        return new Map(
            users.map((user) => [
                user.id,
                {
                    userId: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    amountBossKill: user.attributes?.amountBossKill || 0,
                    soul: user.attributes?.soul || 0,
                    catHighest: user.attributes?.catHighest || 0,
                    totalPlayingTime: user.totalPlayingTime || 0,
                },
            ])
        )
    }

    static async getUserWithAttributesById(userId: string) {
        const userRepos = AppDataSource.getMongoRepository(User)

        const user: UserWithAttributes[] = await userRepos
            .aggregate([
                { $match: { id: userId } },
                {
                    $lookup: {
                        from: 'user_game_attributes',
                        localField: 'id',
                        foreignField: 'userId',
                        as: 'attributes',
                    },
                },
                {
                    $unwind: {
                        path: '$attributes',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                { $limit: 1 },
            ])
            .toArray()

        if (!user.length) return null

        return {
            userId: user[0].id,
            firstName: user[0].firstName,
            lastName: user[0].lastName,
            username: user[0].username,
            amountBossKill: user[0].attributes?.amountBossKill || 0,
            soul: user[0].attributes?.soul || 0,
            catHighest: user[0].attributes?.catHighest || 0,
            totalPlayingTime: user[0].totalPlayingTime || 0,
        }
    }
}
