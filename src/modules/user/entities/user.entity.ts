import { Column, Entity, EntityManager, ObjectIdColumn } from 'typeorm'
import { ObjectId } from 'bson'
import { AppBaseEntity } from '../../../base/base.entity'
import { AppDataSource } from '../../../database/connection'
import { UserDTO } from '../dtos/user.dto'
import { plainToInstance } from 'class-transformer'
import { Errors } from '../../../utils/error'
import { GemsDTO } from '../../gems/dtos/gems.dto'
import { getNowUtc } from '../../../utils'
import Container from 'typedi'
import { CacheKeys, CacheManager } from '../../../cache'
import { UserGameAttributes } from './user-game-attributes.entity'
import { UserGetLeaderboardReqDTO } from '../dtos/user-get-leaderboard.dto'

@Entity()
export class User extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    id: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    username: string

    @Column()
    gems: number

    @Column()
    unlockTraining: number

    @Column()
    isConvert: boolean

    @Column()
    lastLogin: Date

    @Column()
    totalPlayingTime: number

    @Column()
    totalLaunch: number

    static async createUser(
        data: UserDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        await this.validateUserInfo({ id: data.id })
        const createFields = plainToInstance(UserDTO, data, {
            excludeExtraneousValues: true,
        })

        const user = await manager.save(
            User.create({
                ...createFields,
                unlockTraining: 0,
                isConvert: false,
            })
        )

        return user
    }

    static async getUser(id: string) {
        const res = await User.findOne({
            where: {
                id: id,
            },
        })

        if (res) {
            const user = plainToInstance(UserDTO, res, {
                excludeExtraneousValues: true,
            })
            return user
        }
    }

    static async updateGems(
        data: GemsDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const user = await User.getUser(data.userId)
        await manager.update(
            User,
            { id: data.userId },
            { gems: user.gems + data.gems }
        )
    }

    static async validateUserInfo(data: { id?: string }) {
        const { id } = data
        if (id) {
            const existedEmail = await User.findOne({
                where: {
                    id,
                },
            })
            if (existedEmail) {
                throw Errors.UserIdExisted
            }
        } else {
            throw Errors.UserIdExisted
        }
    }

    static async updateUser(
        data: User | UserDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        data.updatedAt = getNowUtc()
        await manager.update(User, { id: data.id }, { ...data })
        const user = plainToInstance(UserDTO, data, {
            excludeExtraneousValues: true,
        })
        return user
    }

    static async getLeaderBoard(data: UserGetLeaderboardReqDTO) {
        const { userId, pagination } = data
        const cacheManager = Container.get(CacheManager)

        const allIds = await cacheManager.getPaginatedLeaderBoardIds(
            CacheKeys.leaderBoard(),
            pagination.getOffset(),
            pagination.limit
        )

        let userRank = await cacheManager.getUserRank(
            CacheKeys.leaderBoard(),
            userId
        )
        userRank = userRank !== null ? userRank + 1 : null

        const usersMap = await UserGameAttributes.getUsersWithAttributesByIds(
            allIds
        )
        let rankedUsers = allIds.map((id, index) => ({
            ...usersMap.get(id),
            rank: pagination.getOffset() + index + 1,
        }))

        let userEntry =
            rankedUsers.find((entry) => entry.userId === userId) || null

        if (!userEntry) {
            const userAttributes =
                await UserGameAttributes.getUserWithAttributesById(userId)

            if (userAttributes) {
                userEntry = { ...userAttributes, rank: userRank }
            }
        }

        pagination.total = await cacheManager.getLeaderBoardTotal(
            CacheKeys.leaderBoard()
        )

        return {
            user: userEntry,
            leaderBoard: rankedUsers,
            pagination,
        }
    }

    static async updateRedisLeaderboard() {
        const profiles = await User.find()
        const cacheManager = Container.get(CacheManager)

        const updates = profiles.map(async (profile) => {
            const attribute = await UserGameAttributes.findOne({
                where: { userId: profile.id },
            })
            if (!attribute) return 0

            const score =
                attribute.amountBossKill +
                (1 - profile.totalPlayingTime / 1e6) / 1e3
            return cacheManager.zAdd(CacheKeys.leaderBoard(), profile.id, score)
        })

        const results = await Promise.all(updates)
        return results.reduce((acc, val) => acc + val, 0)
    }
}
