import { AppDataSource } from './../../../database/connection'
import {
    Column,
    Entity,
    EntityManager,
    ObjectId,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { GameRewardDTO } from '../admin/dtos/game-reward.dto'
import { plainToInstance } from 'class-transformer'
import { GameRewardUpdateReqDTO } from '../admin/dtos/game-reward-update.dto'
import { DataReqDTO } from '../../../base/base.dto'
import { getNowUtc } from '../../../utils'
import { GameRewardGetListReqDTO } from '../admin/dtos/game-reward-get-list.dto'

@Entity()
export class GameReward extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    level: number

    @Column()
    isReward: boolean

    @Column()
    rewardAt: Date

    static async createGameReward(
        data: GameRewardDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const existingReward = await manager.findOne(GameReward, {
            where: { userId: data.userId, level: data.level },
        })

        if (existingReward) {
            return existingReward
        }

        const createFields = plainToInstance(GameRewardDTO, data, {
            excludeExtraneousValues: true,
        })

        return await manager.save(
            GameReward.create({
                ...createFields,
                isReward: false,
            })
        )
    }

    static async getListGameReward(data: GameRewardGetListReqDTO) {
        const { pagination, level } = data
        const repo = AppDataSource.getMongoRepository(GameReward)

        const pipeline: any[] = []

        const skip = (pagination.page - 1) * pagination.limit

        pipeline.push(
            { $match: { isReward: false, level } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'user',
                    localField: 'userId',
                    foreignField: 'id',
                    as: 'user',
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    username: '$user.username',
                    level: 1,
                    isReward: 1,
                    createdAt: 1,
                },
            },
            { $skip: skip },
            { $limit: pagination.limit }
        )

        const list = await repo.aggregate(pipeline).toArray()
        const totalCount = await repo.count({
            isReward: false,
            level,
        })
        pagination.total = totalCount

        return {
            list,
            pagination,
        }
    }

    static async updateGameRewards(data: GameRewardUpdateReqDTO) {
        const { userIds, level } = data
        if (!userIds.length || !level) return { updatedCount: 0 }
        const now = getNowUtc()

        const repo = AppDataSource.getMongoRepository(GameReward)

        const result = await repo.updateMany(
            { userId: { $in: userIds }, level },
            { $set: { isReward: true, rewardAt: new Date(now) } }
        )

        return { updatedCount: result.modifiedCount }
    }
}
