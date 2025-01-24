import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class CheckInRewardDTO extends BaseReqDTO {
    @Expose()
    checkInRewardId: number

    @Expose()
    dayStreak: number

    @Expose()
    rewardCode: string

    @Expose()
    rewardValue: number
}
