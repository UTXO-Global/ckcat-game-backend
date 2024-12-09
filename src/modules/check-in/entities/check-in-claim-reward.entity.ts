import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'

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
}
