import { Column, Entity, EntityManager, ObjectIdColumn } from 'typeorm'
import { ObjectId } from 'bson'
import { AppBaseEntity } from '../../../base/base.entity'
import { AppDataSource } from '../../../database/connection'
import { UserDTO } from '../dtos/user.dto'
import { plainToInstance } from 'class-transformer'
import { Errors } from '../../../utils/error'
import { GemsDTO } from '../../gems/dtos/gems.dto'
import { getNowUtc } from '../../../utils'
import { GameStats } from '../../game-stats/entities/game-stats.entity'

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

        // Lấy ngày hiện tại
        const now = getNowUtc()
        const statsDate = new Date(now)
        statsDate.setUTCHours(0, 0, 0, 0)

        // Kiểm tra xem đã có GameStats của ngày chưa
        let gameStats = await manager.findOne(GameStats, {
            where: { statsDate },
        })

        if (!gameStats) {
            gameStats = await GameStats.createGameStats(
                {
                    statsDate,
                    totalCreatedUsers: 1,
                    totalActiveUsers: 0,
                },
                manager
            )
        } else {
            gameStats.totalCreatedUsers += 1
            await manager.save(gameStats)
        }

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
}
