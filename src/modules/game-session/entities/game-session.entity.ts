import { Column, Entity, EntityManager, ObjectIdColumn } from 'typeorm'
import { ObjectId } from 'bson'
import { AppBaseEntity } from '../../../base/base.entity'
import { User } from '../../user/entities/user.entity'
import { Errors } from '../../../utils/error'
import { GameSessionCreateReqDTO } from '../dtos/game-session-create-req.dto'

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
        return true
    }
}
