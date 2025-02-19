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
        const cacheManager = Container.get(CacheManager)
        await cacheManager.zAdd(CacheKeys.leaderBoard(), user.id, 0)

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

    static async getLeaderBoard(userId: string) {
        const cacheManager = Container.get(CacheManager)

        const ids: string[] = await cacheManager.getLeaderBoardWithTop(
            CacheKeys.leaderBoard(),
            99
        )

        const allUserIds = [userId, ...ids]
        const [users, attributes] = await Promise.all([
            this.getUsersByIds(allUserIds),
            UserGameAttributes.getAttributesByIds(allUserIds),
        ])

        const leaderBoardEntries = ids
            .map((id) => {
                const user = users.get(id)
                const attr = attributes.get(id)

                return user
                    ? {
                          userId: user.id,
                          firstName: user.firstName,
                          lastName: user.lastName,
                          username: user.username,
                          bossKill: attr?.amountBossKill || 0,
                          soul: attr?.soul || 0,
                          catHighest: attr?.catHighest || 0,
                          duration: user.totalPlayingTime || 0,
                      }
                    : null
            })
            .filter((entry) => entry !== null)

        // Sort
        leaderBoardEntries.sort((a, b) => {
            if (a.bossKill === b.bossKill) {
                return a.duration - b.duration
            }
            return b.bossKill - a.bossKill
        })

        const sortedLeaderBoard = leaderBoardEntries.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }))

        const user = users.get(userId)
        const attr = attributes.get(userId)

        const userEntry = {
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            bossKill: attr?.amountBossKill || 0,
            soul: attr?.soul || 0,
            catHighest: attr?.catHighest || 0,
            duration: user.totalPlayingTime || 0,
            rank:
                sortedLeaderBoard.find(
                    (entry) => entry.username === user?.username
                )?.rank || sortedLeaderBoard.length + 1,
        }

        return {
            user: userEntry,
            leaderBoard: sortedLeaderBoard,
        }
    }

    static async getUsersByIds(
        userIds: string[]
    ): Promise<Map<string, UserDTO>> {
        const userRepos = AppDataSource.getMongoRepository(User)

        const users = await userRepos.find({ where: { id: { $in: userIds } } })

        return new Map(
            users.map((user) => [
                user.id,
                plainToInstance(UserDTO, user, {
                    excludeExtraneousValues: true,
                }),
            ])
        )
    }
}
