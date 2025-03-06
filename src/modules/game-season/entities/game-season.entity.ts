import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { getNowUtc } from '../../../utils'
import { AppDataSource } from '../../../database/connection'
import { Errors } from '../../../utils/error'
import { plainToInstance } from 'class-transformer'
import { GameSeasonDTO } from '../dtos/game-season.dto'

@Entity()
export class GameSeason {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    seasonId: string

    @Column()
    totalPool: Number

    @Column()
    startDate: Date

    @Column()
    endDate: Date

    static async getGameSeason(dateTime: Date) {
        const gameSeason = await AppDataSource.getMongoRepository(
            GameSeason
        ).findOne({
            where: { endDate: { $gte: new Date(dateTime) } },
        })

        if (!gameSeason) {
            throw Errors.GameSeasonNotFound
        }

        return plainToInstance(GameSeasonDTO, gameSeason, {
            excludeExtraneousValues: true,
        })
    }
}
