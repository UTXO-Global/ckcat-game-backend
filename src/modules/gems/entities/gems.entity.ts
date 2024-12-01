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
import { GemsDTO } from '../dtos/gems.dto'

@Entity()
export class Gems extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    type: string

    @Column()
    gems: number

    static async createGems(
        data: GemsDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(GemsDTO, data, {
            excludeExtraneousValues: true,
        })

        return await manager.save(
            Gems.create({
                ...createFields,
            })
        )
    }
}
