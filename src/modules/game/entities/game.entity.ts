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
import { GameDTO } from '../dtos/game.dto'

@Entity()
export class Game extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    data: string

    static async createGame(
        data: GameDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(GameDTO, data, {
            excludeExtraneousValues: true,
        })

        const userId = data.userId;

        const res = await Game.findOne({
            where: {
                userId: userId,
            },
        })

        if (!res) {
            return await manager.save(
                Game.create({
                    ...createFields,
                })
            )
        }

        if (data.data !== res.data) {
            await manager.update(Game, { userId: userId }, { data: data.data })
            return await Game.findOne({
                where: {
                    userId: userId,
                },
            })
        }
        
        return res;
    }

    static async getGame(userId: string) {
        return await Game.findOne({
            where: {
                userId: userId,
            },
        })
    }
}
