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

    @Column()
    isActive: boolean

    static async getGameSeason() {
        const now = getNowUtc()

        const gameSeason = await AppDataSource.getMongoRepository(
            GameSeason
        ).findOne({ where: { isActive: true } })

        if (!gameSeason) {
            throw Errors.GameSeasonNotFound
        }

        return plainToInstance(GameSeasonDTO, gameSeason, {
            excludeExtraneousValues: true,
        })
    }
}
