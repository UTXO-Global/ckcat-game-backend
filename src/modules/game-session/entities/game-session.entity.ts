import { Column, Entity, EntityManager, ObjectIdColumn } from 'typeorm'
import { ObjectId } from 'bson'
import { AppBaseEntity } from '../../../base/base.entity'
import { User } from '../../user/entities/user.entity'
import { Errors } from '../../../utils/error'
import { GameSessionCreateReqDTO } from '../dtos/game-session-create-req.dto'
import { GameStats } from '../../game-stats/entities/game-stats.entity'
import { getNowUtc } from '../../../utils'
import { AppDataSource } from '../../../database/connection'

@Entity()
export class GameSession extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    duration: number

    static async createGameSession(
        data: GameSessionCreateReqDTO,
        manager: EntityManager
    ) {
        const { duration, userId } = data

        const gameSession = await GameSession.save({
            userId,
            duration,
        })

        const user = await User.findOne({
            where: {
                id: userId,
            },
        })

        if (!user) {
            throw Errors.UserNotFound
        }

        user.lastLogin = gameSession.createdAt
        user.totalLaunch += 1
        user.totalPlayingTime += duration

        await User.updateUser(user, manager)

        // Handle stats active users
        const now = getNowUtc()
        const statsDate = new Date(now)
        statsDate.setUTCHours(0, 0, 0, 0)

        const endOfDay = new Date(now)
        endOfDay.setUTCHours(23, 59, 59, 999)

        let gameStats = await manager.findOne(GameStats, {
            where: { statsDate },
        })
        const repos = AppDataSource.getMongoRepository(GameSession)

        const existingSession = await repos.findOne({
            where: {
                userId,
                createdAt: {
                    $gte: statsDate,
                    $lt: endOfDay,
                },
            },
        })

        if (!gameStats) {
            gameStats = await GameStats.createGameStats(
                {
                    statsDate,
                    totalCreatedUsers: 0,
                    totalActiveUsers: 1,
                },
                manager
            )
        } else if (!existingSession) {
            gameStats.totalActiveUsers += 1
            await manager.save(gameStats)
        }

        return true
    }
}
