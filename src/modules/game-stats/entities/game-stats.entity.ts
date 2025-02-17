import {
    Column,
    Entity,
    EntityManager,
    ObjectId,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { GameStatsDTO } from '../dtos/game-stats.dto'
import { AppDataSource } from '../../../database/connection'
import { plainToInstance } from 'class-transformer'

@Entity()
export class GameStats extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    statsDate: Date

    @Column()
    totalCreatedUsers: number

    @Column()
    totalActiveUsers: number

    static async createGameStats(
        data: GameStatsDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(GameStatsDTO, data, {
            excludeExtraneousValues: true,
        })

        return await manager.save(
            GameStats.create({
                ...createFields,
            })
        )
    }
}
