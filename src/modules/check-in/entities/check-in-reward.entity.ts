import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'

@Entity()
export class CheckInReward extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    checkInRewardId: number

    @Column()
    dayStreak: number

    @Column()
    rewardCode: string

    @Column()
    rewardValue: number
}
