import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { plainToInstance } from 'class-transformer'
import { CheckInRewardDTO } from '../dtos/check-in-reward.dto'

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

    static async getReward(dayStreak: number) {
        const res = CheckInReward.findOneBy({
            dayStreak,
        })

        if (res) {
            const reward = plainToInstance(CheckInRewardDTO, res, {
                excludeExtraneousValues: true,
            })
            return reward
        }
    }
}
