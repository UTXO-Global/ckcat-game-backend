import {
    Column,
    Entity,
    EntityManager,
    ObjectId,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { CheckInClaimRewardDTO } from '../dtos/check-in-claim-reward.dto'
import { AppDataSource } from '../../../database/connection'
import { plainToInstance } from 'class-transformer'

@Entity()
export class CheckInClaimReward extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    checkInId: string

    @Column()
    rewardCode: string

    @Column()
    rewardValue: number

    static async createCheckInClaimReward(
        data: CheckInClaimRewardDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(CheckInClaimRewardDTO, data, {
            excludeExtraneousValues: true,
        })

        return await manager.save(
            CheckInClaimReward.create({
                ...createFields,
            })
        )
    }
}
