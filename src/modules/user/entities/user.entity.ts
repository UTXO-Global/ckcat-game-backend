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
import { profile } from 'winston'
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
            9
        )

        // Lấy thông tin người dùng và leaderboard entries
        const [user, attributes, leaderBoardEntries] = await Promise.all([
            this.getUser(userId),
            UserGameAttributes.getUserGameAttributes(userId),
            Promise.all(
                ids.map(async (id) => {
                    const user = await this.getUser(id)
                    const attributes =
                        await UserGameAttributes.getUserGameAttributes(id)

                    if (user) {
                        return {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            username: user.username,
                            bossKill: attributes?.amountBossKill || 0,
                            soul: attributes?.soul || 0,
                            catHighest: attributes?.catHighest || 0,
                            duration: user?.totalPlayingTime || 0,
                        }
                    }
                    return null
                })
            ),
        ])

        // Sắp xếp leaderboard dựa trên money giảm dần, nếu bằng nhau thì so bomb giảm dần
        const sortedLeaderBoard = leaderBoardEntries
            .filter((entry) => entry !== null)
            .sort((a, b) => {
                if (b.bossKill !== a.bossKill) {
                    return b.bossKill - a.bossKill // Sắp xếp theo money giảm dần
                }
                return a.duration - b.duration // Nếu money bằng nhau, sắp xếp bomb giảm dần
            })
            .map((entry, index) => ({ ...entry, rank: index + 1 })) // Cập nhật rank

        // Tìm rank chính xác của user trong bảng xếp hạng
        const userRank =
            sortedLeaderBoard.findIndex(
                (entry) => entry.username === user.username
            ) + 1

        const userEntry = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            bossKill: attributes.amountBossKill,
            soul: attributes.soul,
            catHighest: attributes.catHighest,
            duration: user.totalPlayingTime,
            rank: userRank,
        }

        return {
            user: userEntry,
            leaderBoard: sortedLeaderBoard,
        }
    }
}
