import {
    Column,
    Entity,
    EntityManager,
    ObjectId,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { AppDataSource } from '../../../database/connection'
import { plainToInstance } from 'class-transformer'
import { GameLogHistoryDTO } from '../dtos/game-log-history.dto'

@Entity()
export class GameLogHistory extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    data: string

    static async createGameLogHistory(
        data: GameLogHistoryDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(GameLogHistoryDTO, data, {
            excludeExtraneousValues: true,
        })

        return await manager.save(
            GameLogHistory.create({
                ...createFields,
            })
        )
    }
}
